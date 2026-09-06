const db = require('../../config/db');

// Локальный индекс улиц Израиля (см. src/scripts/seedStreets.js) — нужен
// потому что у Google Places/Nominatim кириллическая или "разговорная"
// запись есть только у полутора десятков самых известных улиц (см.
// KNOWN_STREET_NAMES в src/index.js). Для остальных десятков тысяч улиц
// приходится держать собственную таблицу с триграммным нечётким поиском:
// пользователь может опечататься или транслитерировать по-своему, а
// similarity() всё равно найдёт ближайшее совпадение.
//
// ensureStreetsSchema() создаёт только схему (таблицу/индексы) — дёшево и
// идемпотентно, можно звать при каждом старте сервера, как ensureXSchema
// для остальных таблиц. Само наполнение таблицы (долгий обход Overpass API)
// НЕ делается тут и не должно вызываться на каждом деплое — это отдельный
// одноразовый скрипт src/scripts/seedStreets.js, запускается вручную.
async function ensureStreetsSchema() {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await db.query(`
      CREATE TABLE IF NOT EXISTS streets (
        id SERIAL PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_he TEXT,
        name_ru TEXT,
        city_id INTEGER REFERENCES cities(id),
        city_raw TEXT,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        UNIQUE (name_en, city_id)
      )
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS streets_name_en_trgm_idx
      ON streets USING GIN (name_en gin_trgm_ops)
    `);
  } catch (err) {
    console.error('ensureStreetsSchema error:', err.message);
  }
}

// Нечёткий поиск по локальному индексу — используется как дополнительный
// источник кандидатов в /api/places-autocomplete и /api/geocode, когда
// Google/Nominatim не находят маленькую/малоизвестную улицу.
// threshold и limit подобраны эмпирически: 0.25 достаточно низко, чтобы
// прощать опечатки/иную транслитерацию, но не настолько, чтобы подсовывать
// случайные совпадения по паре букв.
async function findStreetsFuzzy(query, { threshold = 0.25, limit = 8 } = {}) {
  if (!query || !query.trim()) return [];
  try {
    const result = await db.query(
      `SELECT s.id, s.name_en, s.name_he, s.lat, s.lng, s.city_id, s.city_raw,
              c.name->>'en' AS city_en, c.name->>'ru' AS city_ru, c.name->>'he' AS city_he,
              similarity(s.name_en, $1) AS sim
       FROM streets s
       LEFT JOIN cities c ON c.id = s.city_id
       WHERE similarity(s.name_en, $1) > $2
       ORDER BY sim DESC
       LIMIT $3`,
      [query, threshold, limit]
    );
    return result.rows;
  } catch (err) {
    console.error('findStreetsFuzzy error:', err.message);
    return [];
  }
}

module.exports = { ensureStreetsSchema, findStreetsFuzzy };
