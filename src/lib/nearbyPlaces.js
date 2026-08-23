// Общая логика "что рядом" (школы/парки/транспорт/магазины) — используется и
// эндпоинтом /api/nearby (карточка объявления), и AI-поиском (ранжирование
// по критериям "рядом со школой" / "рядом парк" и т.д.). Вынесено в отдельный
// модуль, чтобы не дублировать кэширование и вызов Google Places.
const db = require('../../config/db');

const NEARBY_CATEGORIES = [
  { key: 'school', type: 'school' },
  { key: 'park', type: 'park' },
  { key: 'transit', type: 'transit_station' },
  { key: 'supermarket', type: 'supermarket' },
];

const NEARBY_SUPPORTED_LANGS = ['ru', 'en', 'he'];
const NEARBY_CACHE_TTL_DAYS = 30;
const NEARBY_SEARCH_RADIUS_M = 1200;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}

// Возвращает { school: [...], park: [...], transit: [...], supermarket: [...] }.
// Сначала смотрит в кэш (ячейка ~111м, 30 дней), и только если там пусто —
// идёт в Google Places. useCacheOnly=true (для массового скоринга в AI-поиске)
// вообще не обращается к платному API, только к уже накопленному кэшу —
// чтобы просмотр объявлений в AI-поиске не сжигал квоту по всем найденным сразу.
async function getNearby(lat, lng, lang, { useCacheOnly = false } = {}) {
  const safeLang = NEARBY_SUPPORTED_LANGS.includes(lang) ? lang : 'ru';
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const latKey = Math.round(parseFloat(lat) * 1000) / 1000;
  const lngKey = Math.round(parseFloat(lng) * 1000) / 1000;

  const results = {};
  await Promise.all(NEARBY_CATEGORIES.map(async ({ key: catKey, type }) => {
    const cached = await db.query(
      `SELECT places FROM nearby_cache WHERE lat_key = $1 AND lng_key = $2 AND category = $3 AND lang = $4 AND updated_at > NOW() - INTERVAL '${NEARBY_CACHE_TTL_DAYS} days'`,
      [latKey, lngKey, catKey, safeLang]
    );
    if (cached.rows.length) { results[catKey] = cached.rows[0].places; return; }
    if (useCacheOnly || !key) { results[catKey] = []; return; }

    try {
      const r = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.displayName,places.location',
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: 5,
          languageCode: safeLang,
          locationRestriction: { circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: NEARBY_SEARCH_RADIUS_M } },
        }),
      });
      const data = await r.json();
      if (!r.ok) { results[catKey] = []; return; }
      const places = (data.places || [])
        .map((p) => ({
          name: p.displayName?.text || '',
          distance: haversineMeters(parseFloat(lat), parseFloat(lng), p.location.latitude, p.location.longitude),
          lat: p.location.latitude,
          lng: p.location.longitude,
        }))
        .sort((a, b) => a.distance - b.distance);
      results[catKey] = places;
      await db.query(
        `INSERT INTO nearby_cache (lat_key, lng_key, category, lang, places, updated_at) VALUES ($1,$2,$3,$4,$5,NOW())
         ON CONFLICT (lat_key, lng_key, category, lang) DO UPDATE SET places = $5, updated_at = NOW()`,
        [latKey, lngKey, catKey, safeLang, JSON.stringify(places)]
      );
    } catch (e) {
      results[catKey] = [];
    }
  }));
  return results;
}

module.exports = { getNearby, NEARBY_CATEGORIES, NEARBY_SUPPORTED_LANGS, haversineMeters };
