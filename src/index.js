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

// Геокодирование адреса — пробуем Google Maps (точнее, но платный и требует
// настроенного ключа), при отсутствии ключа или ошибке — Nominatim (бесплатно).
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Укажите адрес' });
  const lang = safeGeocodeLang(req.query.lang);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  try {
    if (key) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&components=country:IL&language=${lang}&key=${key}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status === 'OK' && data.results?.length) {
        const results = data.results.map(item => {
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
        return res.json({ results });
      }
      console.log('🔍 Google geocode вернул:', data.status, data.error_message || '(без сообщения)', '— пробуем Nominatim');
    }
    const results = await nominatimSearch(q, 5, lang);
    res.json({ results });
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Ошибка геокодирования' });
  }
});

// Подсказки адресов при вводе — используются в форме публикации объявления,
// чтобы не заставлять пользователя печатать точный адрес вручную.
// Google Places Autocomplete, если ключ настроен, иначе Nominatim search.
app.get('/api/places-autocomplete', async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).trim().length < 3) return res.json({ predictions: [] });
  const lang = safeGeocodeLang(req.query.lang);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  try {
    if (key) {
      const params = new URLSearchParams({ input: q, components: 'country:il', language: lang, types: 'address', key });
      const r = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
      const data = await r.json();
      if (data.status === 'OK' && data.predictions?.length) {
        const predictions = data.predictions.map((p) => ({ description: p.description, placeId: p.place_id }));
        return res.json({ predictions });
      }
      if (data.status !== 'ZERO_RESULTS') {
        console.log('🔍 Google autocomplete вернул:', data.status, data.error_message || '(без сообщения)', '— пробуем Nominatim');
      }
    }
    const found = await nominatimSearch(`${q}, Israel`, 6, lang);
    const predictions = found.map((item, i) => ({
      description: item.formatted,
      placeId: `nominatim-${i}-${item.lat}-${item.lng}`,
      lat: item.lat,
      lng: item.lng,
      street: item.street,
      houseNumber: item.houseNumber,
      city: item.city,
    }));
    res.json({ predictions });
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
