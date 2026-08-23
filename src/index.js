require('dotenv').config();
const express = require('express');
const path    = require('path');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: '10mb' }));

// Раздаём HTML файлы из папки проекта
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));

app.get('/api/cities', async (req, res) => {
  try {
    const db = require('../config/db');
    const result = await db.query('SELECT id, name, lat, lng FROM cities ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Геокодирование адреса через Google Maps API (ключ хранится только на
// сервере, никогда не попадает во фронтенд-код)
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Укажите адрес' });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(503).json({ error: 'Геокодирование не настроено' });
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&components=country:IL&language=ru&key=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.status !== 'OK') {
      console.log('🔍 Google geocode вернул:', data.status, data.error_message || '(без сообщения)');
      return res.json({ results: [] });
    }
    const results = (data.results || []).map(item => {
      const comp = item.address_components || [];
      const get = type => (comp.find(c => c.types.includes(type)) || {}).long_name || '';
      return {
        street: get('route'),
        houseNumber: get('street_number'),
        city: get('locality') || get('administrative_area_level_2'),
        formatted: item.formatted_address,
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng
      };
    });
    res.json({ results });
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Ошибка геокодирования' });
  }
});

// Обратное геокодирование — по координатам определяем название улицы
// (нужно для перетаскиваемого маркера в форме публикации)
app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Укажите координаты' });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(503).json({ error: 'Геокодирование не настроено' });
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ru&key=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.status !== 'OK' || !data.results.length) {
      console.log('🔍 Google reverse-geocode вернул:', data.status, data.error_message || '(без сообщения)');
      return res.json({ result: null });
    }
    const item = data.results[0];
    const comp = item.address_components || [];
    const get = type => (comp.find(c => c.types.includes(type)) || {}).long_name || '';
    res.json({
      result: {
        street: get('route'),
        houseNumber: get('street_number'),
        city: get('locality') || get('administrative_area_level_2'),
        formatted: item.formatted_address
      }
    });
  } catch (err) {
    console.error('Reverse geocode error:', err);
    res.status(500).json({ error: 'Ошибка геокодирования' });
  }
});

// Что рядом с объектом — реальные школы/остановки/магазины поблизости через
// Google Places Nearby Search (тот же ключ, что и для геокодинга). Платный
// API — вызывается только когда пользователь открывает карточку объявления,
// не на каждый рендер списка.
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}

const NEARBY_CATEGORIES = [
  { key: 'school', type: 'school' },
  { key: 'transit', type: 'transit_station' },
  { key: 'supermarket', type: 'supermarket' },
];

// Школы/магазины/остановки не переезжают каждый день — кэшируем ответ
// Google на 30 суток по ячейке ~111м (3 знака после запятой), чтобы не
// тратить платную квоту повторно на объявления по соседству.
const NEARBY_CACHE_TTL_DAYS = 30;

app.get('/api/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Укажите координаты' });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(503).json({ error: 'Places API не настроен' });
  const db = require('../config/db');
  const latKey = Math.round(parseFloat(lat) * 1000) / 1000;
  const lngKey = Math.round(parseFloat(lng) * 1000) / 1000;
  try {
    const results = await Promise.all(NEARBY_CATEGORIES.map(async ({ key: catKey, type }) => {
      const cached = await db.query(
        `SELECT places FROM nearby_cache WHERE lat_key = $1 AND lng_key = $2 AND category = $3 AND updated_at > NOW() - INTERVAL '${NEARBY_CACHE_TTL_DAYS} days'`,
        [latKey, lngKey, catKey]
      );
      if (cached.rows.length) return { category: catKey, places: cached.rows[0].places };

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
          languageCode: 'ru',
          locationRestriction: { circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: 1200 } },
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        console.log(`🔍 Places nearby (${type}) вернул:`, r.status, data.error?.message || '(без сообщения)');
        return { category: catKey, places: [] };
      }
      const places = (data.places || [])
        .map((p) => ({
          name: p.displayName?.text || '',
          distance: haversineMeters(parseFloat(lat), parseFloat(lng), p.location.latitude, p.location.longitude),
        }))
        .sort((a, b) => a.distance - b.distance);

      await db.query(
        `INSERT INTO nearby_cache (lat_key, lng_key, category, places, updated_at) VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (lat_key, lng_key, category) DO UPDATE SET places = $4, updated_at = NOW()`,
        [latKey, lngKey, catKey, JSON.stringify(places)]
      );
      return { category: catKey, places };
    }));
    res.json({ categories: results });
  } catch (err) {
    console.error('Nearby error:', err);
    res.status(500).json({ error: 'Ошибка запроса Places API' });
  }
});

app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'..','Nesay_IL.html')));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Сайт: http://localhost:${PORT}/Nesay_IL.html`);
});
