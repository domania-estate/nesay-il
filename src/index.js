require('dotenv').config();
const express = require('express');
const path    = require('path');

const app = express();
// За реальным IP клиента, а не адресом прокси Railway — нужно для
// анти-фрод проверок реферальной программы (см. lib/referralGuard.js).
app.set('trust proxy', 1);

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
app.use('/api/ai-search', require('./routes/aiSearch'));

app.get('/api/cities', async (req, res) => {
  try {
    const db = require('../config/db');
    const result = await db.query('SELECT id, name, lat, lng FROM cities ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Один раз при старте докатываем список городов до полного официального
// перечня городов Израиля (раньше в базе было только 15).
require('./lib/seedCities').seedIsraeliCities();
require('./lib/referralGuard').ensureReferralGuardSchema();

// Резервный геокодер на OpenStreetMap/Nominatim — не требует ключа и
// биллинга, используется, если Google Maps не настроен или ответил ошибкой
// (та же схема уже применяется в routes/listings.js для verifyAddress).
const NOMINATIM_HEADERS = { 'User-Agent': 'NesayIL/1.0 (contact: novostitiktik@gmail.com)' };

// Языки интерфейса сайта — те же 4, что в lib/i18n.ts на фронтенде.
const GEOCODE_SUPPORTED_LANGS = ['ru', 'en', 'he', 'uk'];
function safeGeocodeLang(lang) {
  return GEOCODE_SUPPORTED_LANGS.includes(lang) ? lang : 'ru';
}

function pickNominatimCity(addr) {
  return addr.city || addr.town || addr.village || addr.residential || addr.suburb || '';
}

// У Google/Nominatim кириллическая запись есть только у крупных/известных
// улиц — большинство местных названий в Израиле проиндексированы лишь на
// иврите и латинице. Если пользователь печатает по-русски (например
// "Ха-Гашмонаим"), прямой поиск не находит ничего. Пробуем транслитерацию
// на латиницу как запасной вариант — двумя способами, потому что в
// разговорном русском Израиля и "х", и "г" часто передают ивритское "ה"/"ח"
// (например "Герцль"/"Херцль" для Herzl).
const CYRILLIC_RE = /[Ѐ-ӿ]/;
const TRANSLIT_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya', і: 'i', ї: 'yi', є: 'ye', ґ: 'g',
};

function transliterate(text, overrides = {}) {
  const map = { ...TRANSLIT_MAP, ...overrides };
  return text
    .toLowerCase()
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('');
}

// Улицы, названные в честь исторических деятелей, есть почти в каждом
// израильском городе — но их устоявшаяся английская запись часто вообще не
// выводится побуквенной транслитерацией (Вейцман → Weizmann, а не Veytsman:
// "В" здесь передаёт немецкое "W", что никакое фонетическое правило само
// не восстановит). Держим короткий словарь самых частых имён.
const KNOWN_STREET_NAMES = [
  [/вейцман/gi, 'Weizmann'],
  [/жаботинск/gi, 'Jabotinsk'],
  [/ротшильд/gi, 'Rothschild'],
  [/бялик/gi, 'Bialik'],
  [/черниховск/gi, 'Chernichovsk'],
  [/бен[- ]?иегуда/gi, 'Ben Yehuda'],
  [/бен[- ]?гурион/gi, 'Ben Gurion'],
  [/усышкин/gi, 'Ussishkin'],
  [/герцл[ья]|херцл[ья]/gi, 'Herzl'],
  [/алленби/gi, 'Allenby'],
  [/дизенгоф/gi, 'Dizengoff'],
];

function applyKnownStreetNames(text) {
  let result = text;
  let changed = false;
  for (const [pattern, replacement] of KNOWN_STREET_NAMES) {
    if (pattern.test(result)) { result = result.replace(pattern, replacement); changed = true; }
  }
  return changed ? result : null;
}

function transliterationCandidates(text) {
  if (!CYRILLIC_RE.test(text)) return [];
  const candidates = [];
  const known = applyKnownStreetNames(text);
  if (known) candidates.push(transliterate(known));
  // "ц" тоже неоднозначен — ивритское "צ" в устоявшейся английской записи
  // израильских улиц почти всегда "tz" (Havatzelet), а не научное "ts".
  candidates.push(transliterate(text, { х: 'h', г: 'h', ц: 'tz' }));
  candidates.push(transliterate(text, { х: 'h', г: 'h' }));
  candidates.push(transliterate(text));
  return [...new Set(candidates)];
}

async function nominatimSearch(query, limit = 5, lang = 'ru') {
  const params = new URLSearchParams({
    q: query, format: 'jsonv2', addressdetails: '1', countrycodes: 'il', 'accept-language': lang, limit: String(limit),
  });
  const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: NOMINATIM_HEADERS });
  const data = await r.json();
  return (data || []).map((item) => ({
    street: item.address?.road || '',
    houseNumber: item.address?.house_number || '',
    city: pickNominatimCity(item.address || {}),
    formatted: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

async function nominatimReverse(lat, lng, lang = 'ru') {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'jsonv2', 'accept-language': lang });
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { headers: NOMINATIM_HEADERS });
  const data = await r.json();
  if (!data || data.error) return null;
  const addr = data.address || {};
  return {
    street: addr.road || '',
    houseNumber: addr.house_number || '',
    city: pickNominatimCity(addr),
    formatted: data.display_name || '',
  };
}

async function googleGeocode(address, lang, key) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:IL&language=${lang}&key=${key}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.status === 'OK' && data.results?.length) {
    return data.results.map(item => {
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
  }
  if (data.status !== 'ZERO_RESULTS') {
    console.log('🔍 Google geocode вернул:', data.status, data.error_message || '(без сообщения)', 'для', address);
  }
  return null;
}

// Геокодирование адреса — пробуем Google Maps (точнее, но платный и требует
// настроенного ключа), при отсутствии ключа или ошибке — Nominatim (бесплатно).
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Укажите адрес' });
  const lang = safeGeocodeLang(req.query.lang);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  // См. places-autocomplete — кириллической записи мелких улиц часто нет
  // ни у Google, ни у Nominatim, пробуем транслитерацию на латиницу.
  const candidates = [q, ...transliterationCandidates(q)];
  try {
    if (key) {
      for (const candidate of candidates) {
        const results = await googleGeocode(candidate, lang, key);
        if (results) return res.json({ results });
      }
    }
    for (const candidate of candidates) {
      const results = await nominatimSearch(candidate, 5, lang);
      if (results.length) return res.json({ results });
    }
    res.json({ results: [] });
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Ошибка геокодирования' });
  }
});

// Подсказки адресов при вводе — используются в форме публикации объявления,
// чтобы не заставлять пользователя печатать точный адрес вручную.
// Google Places Autocomplete, если ключ настроен, иначе Nominatim search.
async function googleAutocomplete(input, lang, key) {
  const params = new URLSearchParams({ input, components: 'country:il', language: lang, types: 'address', key });
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
  const data = await r.json();
  if (data.status === 'OK' && data.predictions?.length) {
    return data.predictions.map((p) => ({ description: p.description, placeId: p.place_id }));
  }
  if (data.status !== 'ZERO_RESULTS') {
    console.log('🔍 Google autocomplete вернул:', data.status, data.error_message || '(без сообщения)', 'для', input);
  }
  return null;
}

// Строим варианты запроса: сначала (если известен город из формы) пробуем
// "улица, город" для точности — но если такая связка не находится (у части
// улиц в OSM/Google почему-то не сматчена именно с этим городом, хотя сама
// улица там точно есть), не сдаёмся, а пробуем те же варианты без города:
// лучше показать все городские совпадения по всему Израилю, чем ничего.
function buildQueryAttempts(q, cityHint) {
  const candidates = [q, ...transliterationCandidates(q)];
  const attempts = [];
  if (cityHint) attempts.push(...candidates.map((c) => `${c}, ${cityHint}`));
  attempts.push(...candidates);
  return [...new Set(attempts)];
}

app.get('/api/places-autocomplete', async (req, res) => {
  const { q, cityHint } = req.query;
  if (!q || String(q).trim().length < 3) return res.json({ predictions: [] });
  const lang = safeGeocodeLang(req.query.lang);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const attempts = buildQueryAttempts(q, cityHint);
  try {
    if (key) {
      for (const candidate of attempts) {
        const predictions = await googleAutocomplete(candidate, lang, key);
        if (predictions) return res.json({ predictions });
      }
    }
    for (const candidate of attempts) {
      const found = await nominatimSearch(`${candidate}, Israel`, 6, lang);
      if (found.length) {
        const predictions = found.map((item, i) => ({
          description: item.formatted,
          placeId: `nominatim-${i}-${item.lat}-${item.lng}`,
          lat: item.lat,
          lng: item.lng,
          street: item.street,
          houseNumber: item.houseNumber,
          city: item.city,
        }));
        return res.json({ predictions });
      }
    }
    res.json({ predictions: [] });
  } catch (err) {
    console.error('Places autocomplete error:', err);
    res.status(500).json({ error: 'Ошибка автодополнения' });
  }
});

// Обратное геокодирование — по координатам определяем название улицы
// (нужно для перетаскиваемого маркера в форме публикации)
app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Укажите координаты' });
  const lang = safeGeocodeLang(req.query.lang);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  try {
    if (key) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${lang}&key=${key}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status === 'OK' && data.results?.length) {
        const item = data.results[0];
        const comp = item.address_components || [];
        const get = type => (comp.find(c => c.types.includes(type)) || {}).long_name || '';
        return res.json({
          result: {
            street: get('route'),
            houseNumber: get('street_number'),
            city: get('locality') || get('administrative_area_level_2'),
            formatted: item.formatted_address
          }
        });
      }
      console.log('🔍 Google reverse-geocode вернул:', data.status, data.error_message || '(без сообщения)', '— пробуем Nominatim');
    }
    const result = await nominatimReverse(lat, lng, lang);
    res.json({ result });
  } catch (err) {
    console.error('Reverse geocode error:', err);
    res.status(500).json({ error: 'Ошибка геокодирования' });
  }
});

// Что рядом с объектом — реальные школы/парки/остановки/магазины поблизости
// через Google Places Nearby Search. Логика (кэш+запрос) вынесена в
// src/lib/nearbyPlaces.js — её же использует AI-поиск для ранжирования.
const { getNearby, NEARBY_SUPPORTED_LANGS } = require('./lib/nearbyPlaces');

app.get('/api/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Укажите координаты' });
  if (!process.env.GOOGLE_MAPS_API_KEY) return res.status(503).json({ error: 'Places API не настроен' });
  const lang = NEARBY_SUPPORTED_LANGS.includes(req.query.lang) ? req.query.lang : 'ru';
  try {
    const byCategory = await getNearby(lat, lng, lang);
    const categories = Object.entries(byCategory).map(([category, places]) => ({ category, places }));
    res.json({ categories });
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
