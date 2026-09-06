#!/usr/bin/env node
// Одноразовый скрипт наполнения таблицы streets (schema — см.
// src/lib/streets.js) данными OpenStreetMap через Overpass API. НЕ
// вызывается автоматически при старте сервера — точечный обход всех
// городов Израиля занимает минуты и может упереться в лимиты Overpass,
// такое нельзя гонять на каждый деплой.
//
// Запуск:
//   node src/scripts/seedStreets.js --test        — только первые 4 города,
//                                                    для проверки на глаз
//   node src/scripts/seedStreets.js                — все города из таблицы cities
//   node src/scripts/seedStreets.js --start=20     — продолжить с 20-го города
//                                                    (если прошлый запуск прервался)
//
// Каждый прогон идемпотентен: улицы вставляются с ON CONFLICT DO NOTHING по
// (name_en, city_id), повторный запуск просто не добавит дублей.

require('dotenv').config();
const db = require('../../config/db');
const { ensureStreetsSchema } = require('../lib/streets');

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const USER_AGENT = 'NesayIL-StreetSeed/1.0 (contact: novostitiktik@gmail.com)';
const RADIUS_M = 7000;
const HIGHWAY_TYPES = '^(residential|primary|secondary|tertiary|unclassified|living_street|trunk)$';
const DELAY_BETWEEN_REQUESTS_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(lat, lng, radius) {
  return `
    [out:json][timeout:60];
    way(around:${radius},${lat},${lng})[highway~"${HIGHWAY_TYPES}"][name];
    out center tags;
  `;
}

async function overpassFetch(query, attempt = 0) {
  const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let r;
  try {
    r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
  } catch (err) {
    if (attempt < 3) {
      await sleep(3000 * (attempt + 1));
      return overpassFetch(query, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!r.ok) {
    if (attempt < 3) {
      await sleep(3000 * (attempt + 1));
      return overpassFetch(query, attempt + 1);
    }
    throw new Error(`Overpass HTTP ${r.status}`);
  }
  return r.json();
}

// Прямой транслитерации ивритского/арабского названия на латиницу не
// существует осмысленной (это не фонетическая система вроде кириллицы) —
// если у OSM нет тега name:en, лучше пропустить улицу, чем выдумать
// английское имя, которое никто никогда не наберёт.
function pickNameEn(tags) {
  return tags['name:en'] || null;
}

async function loadCities() {
  const result = await db.query("SELECT id, name->>'en' AS en, lat, lng FROM cities ORDER BY id");
  return result.rows;
}

async function seedCity(city, stats) {
  const query = buildQuery(city.lat, city.lng, RADIUS_M);
  let data;
  try {
    data = await overpassFetch(query);
  } catch (err) {
    console.error(`  ✗ ${city.en}: Overpass error — ${err.message}`);
    stats.errors.push(city.en);
    return;
  }
  const elements = data.elements || [];
  // Один и тот же участок улицы в OSM почти всегда разбит на несколько
  // way — схлопываем по (name_en) ещё до записи в базу, чтобы не гонять
  // отдельный round-trip к БД на каждый сегмент (медленно — see below) и
  // чтобы UNIQUE(name_en, city_id) не спотыкался на дублях внутри одного
  // batch INSERT. Оставляем координаты первого встреченного сегмента.
  let skippedNoNameEn = 0;
  const byName = new Map();
  for (const el of elements) {
    const tags = el.tags || {};
    const nameEn = pickNameEn(tags);
    if (!nameEn) { skippedNoNameEn++; continue; }
    if (byName.has(nameEn)) continue;
    byName.set(nameEn, {
      nameEn,
      nameHe: tags['name:he'] || tags.name || null,
      nameRu: tags['name:ru'] || null,
      lat: el.center?.lat ?? null,
      lng: el.center?.lon ?? null,
      cityRaw: tags['addr:city'] || city.en,
    });
  }

  // Пакетная вставка вместо запроса на каждую улицу — на удалённой БД
  // (Supabase/Railway) один round-trip стоит ~300-400мс, а улиц на город
  // может быть несколько сотен: без батчинга один крупный город обходился
  // бы минутами. CHUNK_SIZE=200 держит SQL-запрос разумного размера.
  const rows = [...byName.values()];
  const CHUNK_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const values = [];
    const params = [];
    chunk.forEach((r, idx) => {
      const base = idx * 7;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`);
      params.push(r.nameEn, r.nameHe, r.nameRu, city.id, r.cityRaw, r.lat, r.lng);
    });
    try {
      const res = await db.query(
        `INSERT INTO streets (name_en, name_he, name_ru, city_id, city_raw, lat, lng)
         VALUES ${values.join(', ')}
         ON CONFLICT (name_en, city_id) DO NOTHING
         RETURNING id`,
        params
      );
      inserted += res.rows.length;
    } catch (err) {
      console.error(`  ✗ batch insert error (${city.en}, chunk ${i}): ${err.message}`);
    }
  }
  console.log(`  ${city.en}: ${elements.length} ways, ${rows.length} unique names, +${inserted} new streets (${skippedNoNameEn} segments skipped — no name:en)`);
  stats.totalWays += elements.length;
  stats.totalInserted += inserted;
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const startArg = args.find((a) => a.startsWith('--start='));
  const startIdx = startArg ? parseInt(startArg.split('=')[1], 10) : 0;

  await ensureStreetsSchema();

  let cities = await loadCities();
  if (isTest) cities = cities.slice(0, 4);
  else cities = cities.slice(startIdx);

  console.log(`Seeding streets for ${cities.length} cities (radius ${RADIUS_M}m)${isTest ? ' [TEST MODE]' : ''}...`);

  const stats = { totalWays: 0, totalInserted: 0, errors: [] };
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    console.log(`[${startIdx + i + 1}/${startIdx + cities.length}] ${city.en} (${city.lat}, ${city.lng})`);
    await seedCity(city, stats);
    if (i < cities.length - 1) await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  console.log('---');
  console.log(`Done. Total OSM ways seen: ${stats.totalWays}, new streets inserted: ${stats.totalInserted}`);
  if (stats.errors.length) console.log(`Cities with errors (retry with --start): ${stats.errors.join(', ')}`);

  const countRes = await db.query('SELECT COUNT(*) FROM streets');
  console.log(`streets table now has ${countRes.rows[0].count} rows total.`);

  await db.pool.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
