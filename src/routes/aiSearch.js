// AI-поиск на естественном языке. По ТЗ: LLM только превращает текст
// пользователя в структурированные фильтры — сам поиск и ранжирование
// всегда делает наш backend по реальным объявлениям из базы. LLM не
// подставляется в ответ пользователю напрямую и не может "придумать" объект.
const express = require('express');
const db = require('../../config/db');
const { optionalAuth } = require('../middleware/auth');
const { getNearby } = require('../lib/nearbyPlaces');

const router = express.Router();

const MUST_HAVE_KEYS = ['mamad', 'parking', 'balcony', 'pets', 'furnished'];
const PREFERRED_KEYS = ['parking', 'balcony', 'near_school', 'near_park', 'near_transit', 'near_shops'];

// Ключевые слова для критериев, у которых нет отдельной колонки в БД
// (мамад/парковка/балкон) — ищем упоминание в свободном тексте описания
// на всех трёх языках. Это оценочный (best-effort) признак, а не
// гарантированный факт: если продавец не написал об этом в тексте, признак
// не засчитается, даже если по факту мамад в квартире есть.
const TEXT_KEYWORDS = {
  mamad: ['мамад', 'mamad', 'ממ"ד', 'ממד', "ממ׳ד"],
  parking: ['парковк', 'паркинг', 'parking', 'חניה'],
  balcony: ['балкон', 'balcony', 'מרפסת'],
};

function textHasKeyword(description, key) {
  const words = TEXT_KEYWORDS[key];
  if (!words) return false;
  const haystack = [description?.ru, description?.en, description?.he].filter(Boolean).join(' ').toLowerCase();
  return words.some((w) => haystack.includes(w.toLowerCase()));
}

function matchesCriterion(listing, key) {
  switch (key) {
    case 'mamad':
      return textHasKeyword(listing.description, 'mamad');
    case 'parking':
      return textHasKeyword(listing.description, 'parking');
    case 'balcony':
      return textHasKeyword(listing.description, 'balcony');
    case 'pets':
      return listing.pets_allowed === 'yes' || listing.pets_allowed === 'small_dog' || listing.pets_allowed === 'small_cat';
    case 'furnished':
      return listing.furnished === 'full' || listing.furnished === 'partial';
    default:
      return false;
  }
}

// near_* критерии проверяются только по уже накопленному кэшу Places
// (useCacheOnly) — при массовом скоринге десятков объявлений мы не хотим
// сжигать платную квоту Google на каждое из них разом. Если для объекта ещё
// нет кэша (его карточку никто не открывал), критерий просто не засчитывается
// — это осторожная (не завышающая) оценка, а не "не подходит".
async function matchesNearby(listing, key, lang) {
  const catMap = { near_school: 'school', near_park: 'park', near_transit: 'transit', near_shops: 'supermarket' };
  const category = catMap[key];
  if (!category || !Number.isFinite(listing.lat) || !Number.isFinite(listing.lng)) return false;
  const nearby = await getNearby(listing.lat, listing.lng, lang, { useCacheOnly: true });
  return (nearby[category] || []).length > 0;
}

async function resolveCityId(cityName) {
  if (!cityName) return null;
  const cities = await db.query('SELECT id, name FROM cities');
  const q = cityName.trim().toLowerCase();
  const found = cities.rows.find((c) =>
    [c.name?.ru, c.name?.en, c.name?.he].some((n) => n && n.toLowerCase() === q)
  ) || cities.rows.find((c) =>
    [c.name?.ru, c.name?.en, c.name?.he].some((n) => n && (n.toLowerCase().includes(q) || q.includes(n.toLowerCase())))
  );
  return found ? found.id : null;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transaction_type: { type: 'string', enum: ['rent', 'sale'] },
    city: { type: 'string', nullable: true },
    price_max: { type: 'number', nullable: true },
    price_min: { type: 'number', nullable: true },
    rooms_min: { type: 'number', nullable: true },
    must_have: { type: 'array', items: { type: 'string', enum: MUST_HAVE_KEYS } },
    preferred: { type: 'array', items: { type: 'string', enum: PREFERRED_KEYS } },
  },
  required: ['transaction_type', 'must_have', 'preferred'],
};

async function extractFilters(query, lang) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('AI не настроен');
  const systemPrompt = `Ты помощник, который превращает запрос пользователя о поиске недвижимости в Израиле в структурированные фильтры JSON. Запрос может быть на русском, английском или иврите.
Правила:
- transaction_type: "rent" (аренда/снять) или "sale" (продажа/купить). Если не указано явно, определи по контексту (цена в месяц/аренда → rent), иначе rent по умолчанию.
- city: название города НА АНГЛИЙСКОМ (например "Tel Aviv", "Ramat Gan"), даже если пользователь написал по-русски/на иврите. Если город не упомянут — null.
- price_max/price_min: число в шекелях, если упомянуто. Иначе null.
- rooms_min: минимальное число комнат, если упомянуто. Иначе null.
- must_have: список из ["mamad","parking","balcony","pets","furnished"] — то, что пользователь считает ОБЯЗАТЕЛЬНЫМ условием. mamad = мамад/защищённая комната/ממ"ד.
- preferred: список из ["parking","balcony","near_school","near_park","near_transit","near_shops"] — то, что пользователь хочет, но не как жёсткое условие (например "рядом со школой", "хороший транспорт", "недалеко от магазинов", "рядом парк").
Не придумывай значения, которых нет в запросе.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: query }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Gemini error:', res.status, data.error?.message);
    throw new Error(data.error?.message || 'Ошибка AI');
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Пустой ответ AI');
  return JSON.parse(text);
}

router.post('/', optionalAuth, async (req, res) => {
  const { query, filters: providedFilters, lang } = req.body;
  const safeLang = ['ru', 'en', 'he'].includes(lang) ? lang : 'ru';

  // Если фронтенд уже прислал готовые фильтры (пользователь снял/поменял чип
  // после первого AI-запроса) — просто пересчитываем поиск по ним, не тратя
  // повторный вызов AI на один и тот же текст.
  let filters = providedFilters;
  if (!filters) {
    if (!query || !query.trim()) return res.status(400).json({ error: 'Пустой запрос' });
    try {
      filters = await extractFilters(query.trim(), safeLang);
    } catch (e) {
      return res.status(503).json({ error: e.message || 'AI недоступен' });
    }
  }

  try {
    const cityId = await resolveCityId(filters.city);
    const mustHave = filters.must_have || [];
    const preferred = filters.preferred || [];

    // Жёсткие фильтры — как в обычном поиске. Если по ним ничего не нашлось,
    // последовательно ослабляем (сначала комнаты, потом цену, потом город) —
    // и честно говорим пользователю, что это уже не точное совпадение.
    async function runQuery({ withCity, withPrice, withRooms }) {
      const conditions = ["l.status = 'active'", 'l.deal_type = $1'];
      const params = [filters.transaction_type === 'sale' ? 'sale' : 'rent'];
      let p = 2;
      if (withCity && cityId) { conditions.push(`l.city_id = $${p++}`); params.push(cityId); }
      if (withPrice && filters.price_max) { conditions.push(`l.price <= $${p++}`); params.push(filters.price_max); }
      if (withPrice && filters.price_min) { conditions.push(`l.price >= $${p++}`); params.push(filters.price_min); }
      if (withRooms && filters.rooms_min) { conditions.push(`l.rooms >= $${p++}`); params.push(filters.rooms_min); }
      const rows = await db.query(`
        SELECT l.*, c.name AS city_name,
          u.name AS agent_name, u.verified AS agent_verified, u.role AS agent_role, u.avatar_url AS agent_avatar,
          (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS cover_photo,
          (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos,
          (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS fav_count
        FROM listings l JOIN cities c ON c.id = l.city_id JOIN users u ON u.id = l.user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY l.promoted DESC, l.created_at DESC
        LIMIT 200
      `, params);
      return rows.rows;
    }

    let candidates = await runQuery({ withCity: true, withPrice: true, withRooms: true });
    let exact = true;
    if (candidates.length === 0) { candidates = await runQuery({ withCity: true, withPrice: true, withRooms: false }); exact = false; }
    if (candidates.length === 0) { candidates = await runQuery({ withCity: true, withPrice: false, withRooms: false }); exact = false; }
    if (candidates.length === 0) { candidates = await runQuery({ withCity: false, withPrice: false, withRooms: false }); exact = false; }

    const totalFound = candidates.length;

    // Сначала текстовые критерии (дёшево, без внешних вызовов) — берём топ по
    // ним, и только для этого сокращённого списка проверяем near_* через кэш
    // Google Places, чтобы не гонять его по всем сотням объявлений разом.
    const textScored = candidates.map((item) => {
      const matchedMust = mustHave.filter((k) => !k.startsWith('near_') && matchesCriterion(item, k));
      return { item, matchedMustText: matchedMust.length };
    }).sort((a, b) => b.matchedMustText - a.matchedMustText);

    const scoringPool = textScored.slice(0, 30);

    const scored = await Promise.all(scoringPool.map(async ({ item }) => {
      let mustMatched = 0;
      for (const k of mustHave) {
        const ok = k.startsWith('near_') ? await matchesNearby(item, k, safeLang) : matchesCriterion(item, k);
        if (ok) mustMatched++;
      }
      let prefMatched = 0;
      for (const k of preferred) {
        const ok = k.startsWith('near_') ? await matchesNearby(item, k, safeLang) : matchesCriterion(item, k);
        if (ok) prefMatched++;
      }
      const totalCriteria = mustHave.length + preferred.length;
      const matchPercent = totalCriteria > 0
        ? Math.round(((mustMatched + prefMatched) / totalCriteria) * 100)
        : 100;
      return { item, mustMatched, prefMatched, matchPercent, allMustMatched: mustMatched === mustHave.length };
    }));

    scored.sort((a, b) => {
      if (a.allMustMatched !== b.allMustMatched) return a.allMustMatched ? -1 : 1;
      if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
      return (b.item.promoted ? 1 : 0) - (a.item.promoted ? 1 : 0);
    });

    const top = scored.slice(0, 20);
    const highMatchCount = top.filter((s) => s.matchPercent >= 90).length;

    res.json({
      filters,
      exact,
      totalFound,
      highMatchCount,
      results: top.map((s) => ({ ...s.item, match_percent: s.matchPercent })),
    });
  } catch (err) {
    console.error('AI search error:', err);
    res.status(500).json({ error: 'Ошибка поиска' });
  }
});

module.exports = router;
