const express = require('express');
const db = require('../../config/db');
const { requireAuth, optionalAuth, requireModerator } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const { notifyMatchingSearches } = require('../lib/pushNotify');
const { notify, LISTING_APPROVED_TITLE, listingApprovedBody, LISTING_REJECTED_TITLE, listingRejectedBody } = require('../lib/notify');
const { computeDHash, hammingDistance } = require('../lib/imageHash');
const { checkDuplicatePhotos, checkDuplicateAddress, checkRepeatedPhone, checkListingVelocity, DHASH_MATCH_THRESHOLD } = require('../lib/fraudChecks');
const Jimp = require('jimp');

// Меньше этого разрешения фото считается слишком низкого качества для
// публикации (мутные/огромно сжатые превью, скриншоты из мессенджеров и т.п.).
const MIN_PHOTO_WIDTH = 600;
const MIN_PHOTO_HEIGHT = 400;
const MIN_PHOTOS_REQUIRED = 4;
const { checkPhotoContent } = require('../lib/photoModeration');
const { addWatermark } = require('../lib/watermark');
const { fileReport, REPORT_REASONS } = require('../lib/listingReports');
const { rateLimitMiddleware } = require('../lib/rateLimit');
const { t: mt, safeLang } = require('../lib/moderationI18n');

const router = express.Router();

// Русские подписи удобств — только для читаемого промпта Gemini, не для UI
// (UI сам переводит через i18n). Gemini прекрасно понимает и смешанный текст,
// но так факты передаются однозначно, без риска что "bars" примут за "бары".
const AMENITY_LABELS_RU = {
  mamad: 'мамад (защищённая комната)', elevator: 'лифт', parking: 'парковка', balcony: 'балкон',
  airConditioner: 'кондиционер', bars: 'решётки на окнах', accessible: 'доступ для инвалидов', storage: 'кладовка',
  dishwasher: 'посудомоечная машина', oven: 'духовка', stove: 'плита', washingMachine: 'стиральная машина',
  dryer: 'сушильная машина', vacuum: 'пылесос',
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Получить все объявления
router.get('/', optionalAuth, async (req, res) => {
  const { deal_type, city_id, sort = 'new', page = 1, limit = 50 } = req.query;
  const conditions = ["l.status = 'active'"];
  const params = [];
  let p = 1;
  if (deal_type) { conditions.push(`l.deal_type = $${p++}`); params.push(deal_type); }
  if (city_id)   { conditions.push(`l.city_id = $${p++}`);   params.push(parseInt(city_id)); }
  const where = conditions.join(' AND ');
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const orderBy = sort === 'price_asc' ? 'l.promoted DESC, l.price ASC'
                : sort === 'price_desc' ? 'l.promoted DESC, l.price DESC'
                : 'l.promoted DESC, l.created_at DESC';
  try {
    const rows = await db.query(`
      SELECT l.*, c.name AS city_name,
        u.name AS agent_name, u.verified AS agent_verified, u.role AS agent_role, u.avatar_url AS agent_avatar,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS cover_photo,
        (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos,
        (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS fav_count,
        (SELECT json_agg(json_build_object('price', price, 'recordedAt', recorded_at) ORDER BY recorded_at) FROM listing_price_history WHERE listing_id = l.id) AS price_history
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      JOIN users  u ON u.id = l.user_id
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT $${p++} OFFSET $${p++}
    `, [...params, parseInt(limit), offset]);
    res.json({ listings: rows.rows, total: rows.rows.length });
  } catch (err) {
    console.error('Listings fetch error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Мои объявления
router.get('/my/all', requireAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, c.name AS city_name,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS cover_photo,
        (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos,
        (SELECT json_agg(json_build_object('id', id, 'url', url) ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS photos_detailed,
        (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS fav_count,
        (SELECT json_agg(json_build_object('price', price, 'recordedAt', recorded_at) ORDER BY recorded_at) FROM listing_price_history WHERE listing_id = l.id) AS price_history
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      WHERE l.user_id = $1 AND l.status != 'removed'
      ORDER BY l.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка адреса через Nominatim — существует ли такая точка в Израиле
async function verifyAddress(lat, lng) {
  try {
    if (!lat || !lng) return { ok: false, reason: 'Координаты не указаны' };
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NesayIL/1.0' } });
    const data = await res.json();
    if (!data || data.error) return { ok: false, reason: 'Адрес не найден на карте' };
    const cc = data.address && data.address.country_code;
    if (cc !== 'il') return { ok: false, reason: 'Адрес находится не в Израиле' };
    return { ok: true };
  } catch (e) {
    // Если геокодер недоступен — не блокируем публикацию, а отправляем на ручную проверку
    return { ok: false, reason: 'Не удалось проверить адрес автоматически' };
  }
}

// Проверка цены — не занижена ли относительно похожих объявлений в этом городе
async function verifyPrice(cityId, dealType, price, rooms) {
  try {
    const result = await db.query(`
      SELECT AVG(price) as avg_price, COUNT(*) as cnt
      FROM listings
      WHERE city_id = $1 AND deal_type = $2 AND status = 'active'
        AND rooms BETWEEN $3 - 1 AND $3 + 1
    `, [cityId, dealType, parseFloat(rooms) || 1]);
    const row = result.rows[0];
    const avg = parseFloat(row.avg_price);
    const cnt = parseInt(row.cnt);
    // Недостаточно данных для сравнения — не блокируем
    if (!avg || cnt < 3) return { ok: true };
    if (price < avg * 0.5) {
      return { ok: false, reason: `Цена (₪${price}) значительно ниже средней по району (₪${Math.round(avg)})` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: true };
  }
}

// Создать объявление
router.post('/', requireAuth, async (req, res) => {
  const { deal_type, property_type, city_id, street, house_number, lat, lng, price, rooms, sqm, floor, total_floors, description, condition, furnished, pets_allowed, seller_type, utilities, sale_reason, amenities, commission_percent } = req.body;
  if (req.user.role === 'buyer') return res.status(403).json({ error: 'Покупатели не могут публиковать' });

  // Полная карточка объявления обязательна — без неё покупатель не может
  // адекватно оценить объект (см. решение сделать все ключевые поля
  // обязательными при публикации).
  const missing = [];
  if (!deal_type) missing.push('тип сделки');
  if (!city_id) missing.push('город');
  if (!street || !String(street).trim()) missing.push('улица');
  if (!price) missing.push('цена');
  if (!rooms) missing.push('количество комнат');
  if (!sqm) missing.push('площадь');
  if (!floor) missing.push('этаж');
  if (!total_floors) missing.push('этажей в доме');
  if (!condition) missing.push('состояние ремонта');
  if (!furnished) missing.push('мебель');
  if (!pets_allowed) missing.push('животные');
  if (!description || !String(description.ru || '').trim()) missing.push('описание');
  if (missing.length) return res.status(400).json({ error: `Заполните обязательные поля: ${missing.join(', ')}` });

  try {
    const userResult = await db.query('SELECT credits, verified FROM users WHERE id = $1', [req.user.id]);
    const credits = userResult.rows[0]?.credits || 0;
    if (credits < 100) return res.status(402).json({ error: 'Недостаточно средств. Минимум ₪100 для публикации' });

    // Автомодерация: проверяем адрес, цену и признаки фейкового объявления
    // (тот же адрес у чужого аккаунта, тот же телефон на другом аккаунте).
    // Проверку одинаковых фото делаем отдельно, при загрузке фото — на этом
    // шаге их ещё нет.
    const userRow = await db.query('SELECT phone FROM users WHERE id = $1', [req.user.id]);
    const addrCheck = await verifyAddress(lat, lng);
    const priceCheck = await verifyPrice(parseInt(city_id) || 1, deal_type, parseInt(price), rooms);
    const dupAddressCheck = await checkDuplicateAddress(null, req.user.id, parseInt(city_id) || 1, street, house_number, parseFloat(lat), parseFloat(lng));
    const phoneCheck = await checkRepeatedPhone(req.user.id, userRow.rows[0]?.phone);
    const velocityCheck = await checkListingVelocity(req.user.id);
    const reasons = [];
    if (!addrCheck.ok) reasons.push(addrCheck.reason);
    if (!priceCheck.ok) reasons.push(priceCheck.reason);
    if (!dupAddressCheck.ok) reasons.push(dupAddressCheck.reason);
    if (!phoneCheck.ok) reasons.push(phoneCheck.reason);
    if (!velocityCheck.ok) reasons.push(velocityCheck.reason);
    const status = reasons.length ? 'pending_review' : 'active';
    const moderationReason = reasons.length ? reasons.join('; ') : null;

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`
        INSERT INTO listings (user_id, city_id, deal_type, property_type, street, house_number, floor, total_floors, lat, lng, price, rooms, sqm, description, status, moderation_reason, condition, furnished, pets_allowed, seller_type, utilities, sale_reason, amenities, commission_percent)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        RETURNING *
      `, [
        req.user.id, parseInt(city_id) || 1, deal_type, property_type || 'apartment',
        street || null, house_number || null,
        parseInt(floor), parseInt(total_floors),
        parseFloat(lat) || null, parseFloat(lng) || null,
        parseInt(price), parseFloat(rooms) || 1,
        sqm ? parseInt(sqm) : null,
        JSON.stringify(description || {}),
        status, moderationReason,
        condition || null, furnished || null, pets_allowed || null, seller_type || null,
        JSON.stringify(utilities || {}), sale_reason || null, JSON.stringify(amenities || {}),
        commission_percent != null && commission_percent !== '' ? parseFloat(commission_percent) : null
      ]);
      // Снимаем 100 шекелей за публикацию
      await client.query('UPDATE users SET credits = credits - 100 WHERE id = $1', [req.user.id]);
      // Первая точка в истории цены — чтобы отсчёт "цена снижена на X%" был от даты публикации
      await client.query('INSERT INTO listing_price_history (listing_id, price, recorded_at) VALUES ($1, $2, $3)', [
        result.rows[0].id, result.rows[0].price, result.rows[0].created_at,
      ]);
      await client.query('COMMIT');
      console.log('✅ Listing created:', result.rows[0].id, 'status:', status);
      if (status === 'active') notifyMatchingSearches(result.rows[0]);
      res.status(201).json({ ...result.rows[0], pending: status === 'pending_review' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

// Помощь ИИ в составлении описания — продавец пишет пару предложений своими
// словами, Gemini переписывает грамотнее и структурированнее, опираясь
// только на реальные факты (удобства/расположение/тип сделки), ничего не
// выдумывая. Платный вызов Gemini — поэтому requireAuth + отдельный лимит
// частоты, как у остальных AI-эндпоинтов.
const generateDescriptionLimiter = rateLimitMiddleware({ limit: 15, windowSeconds: 60, message: 'Слишком много запросов к ИИ, попробуйте через минуту' });
router.post('/generate-description', requireAuth, generateDescriptionLimiter, async (req, res) => {
  const { draft, dealType, propertyType, rooms, sqm, city, street, amenities, lang } = req.body;
  if (!draft || !String(draft).trim()) return res.status(400).json({ error: 'Напишите черновик описания' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI не настроен' });

  const amenityList = Object.entries(amenities || {}).filter(([, v]) => v).map(([k]) => AMENITY_LABELS_RU[k] || k);
  const facts = [
    dealType === 'sale' ? 'продажа' : 'аренда',
    propertyType === 'house' ? 'дом' : propertyType === 'commercial' ? 'коммерческое помещение' : 'квартира',
    rooms ? `${rooms} комнат` : null,
    sqm ? `${sqm} м²` : null,
    city ? `город: ${city}` : null,
    street ? `улица: ${street}` : null,
    amenityList.length ? `удобства: ${amenityList.join(', ')}` : null,
  ].filter(Boolean).join('; ');

  const targetLang = ['ru', 'en', 'he'].includes(lang) ? lang : 'ru';
  const langName = { ru: 'русском', en: 'английском', he: 'иврите' }[targetLang];

  const systemPrompt = `Ты помощник по составлению объявлений о недвижимости в Израиле. Тебе дают черновик от продавца своими словами и список реальных фактов об объекте. Перепиши черновик в грамотное, структурированное, привлекательное описание на ${langName} языке (2-5 предложений). Используй ТОЛЬКО факты из черновика и списка — ничего не выдумывай и не добавляй характеристик, которых там нет. Не используй markdown и списки, только связный текст.`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: `Черновик продавца: "${String(draft).trim()}"\nФакты об объекте: ${facts}` }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Gemini error:', r.status, data.error?.message);
      return res.status(503).json({ error: 'AI недоступен' });
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(503).json({ error: 'Пустой ответ AI' });
    res.json({ description: text.trim() });
  } catch (err) {
    console.error('Generate description error:', err);
    res.status(500).json({ error: 'Ошибка AI' });
  }
});

// Если фото не проходят проверку — объявление уже существует (создано
// отдельным запросом до фото) и не должно оставаться активным без единой
// настоящей фотографии. Первая неудача даёт шанс исправиться: переводим на
// ручную проверку, продавец может дозагрузить нормальные фото — если они
// пройдут, объявление само вернётся в активные (см. success-ветку ниже).
// Но если и ВТОРАЯ попытка тоже не проходит — значит просто ждать третьего
// шанса нет смысла, объявление блокируется (status = 'rejected') и дальше
// уже требует ручного разбора модератором, а не бесконечных попыток.
async function flagListingForPhotoReview(listingId, reason, { alreadyPrefixed = false } = {}) {
  try {
    const combinedReason = alreadyPrefixed ? reason : `Фото не прошли проверку: ${reason}`;
    const result = await db.query(`
      UPDATE listings
      SET photo_review_attempts = photo_review_attempts + 1,
          moderation_reason = CASE WHEN moderation_reason IS NULL THEN $2 ELSE moderation_reason || '; ' || $2 END
      WHERE id = $1 AND status IN ('active', 'pending_review')
      RETURNING photo_review_attempts
    `, [listingId, combinedReason]);
    // Если WHERE не сработал — объявление уже не активно и не на проверке
    // (уже заблокировано/удалено раньше). Явно сообщаем об этом наверх,
    // а не молча ничего не делаем — иначе продавец продолжает "пытаться
    // исправить" объявление, которое на самом деле уже мертво.
    if (!result.rows.length) return { isFinal: false, alreadyDead: true };
    const attempts = result.rows[0].photo_review_attempts;
    if (attempts >= 2) {
      await db.query(`
        UPDATE listings
        SET status = 'rejected',
            moderation_reason = moderation_reason || '; Объявление заблокировано: фото не прошли проверку повторно'
        WHERE id = $1
      `, [listingId]);
      return { isFinal: true, alreadyDead: false };
    }
    await db.query(`UPDATE listings SET status = 'pending_review' WHERE id = $1`, [listingId]);
    return { isFinal: false, alreadyDead: false };
  } catch (e) {
    console.error('flagListingForPhotoReview error:', e);
    return { isFinal: false, alreadyDead: false };
  }
}

// Отдельная, более строгая ветка — не для честных технических накладок
// (дубль внутри своей же загрузки, маленькое разрешение), а для настоящего
// нарушения правил: фото не по теме/неприемлемое содержимое (ИИ-проверка)
// или чужое переиспользованное фото (дубль с другим продавцом). Тут только
// одно предупреждение — при повторном нарушении объявление удаляется
// навсегда, а деньги за публикацию не возвращаются (как и раньше, возврат
// нигде не реализован — здесь просто явно доносим это до продавца).
async function flagRuleViolation(listingId, reason) {
  try {
    const result = await db.query(`
      UPDATE listings
      SET rule_violation_count = rule_violation_count + 1,
          moderation_reason = CASE WHEN moderation_reason IS NULL THEN $2 ELSE moderation_reason || '; ' || $2 END
      WHERE id = $1 AND status IN ('active', 'pending_review')
      RETURNING rule_violation_count
    `, [listingId, reason]);
    if (!result.rows.length) return { isFinal: false, alreadyDead: true };
    const count = result.rows[0].rule_violation_count;
    if (count >= 2) {
      await db.query(`
        UPDATE listings
        SET status = 'rejected',
            moderation_reason = moderation_reason || '; Объявление удалено навсегда: повторное нарушение правил публикации фото. Стоимость публикации не возвращается.'
        WHERE id = $1
      `, [listingId]);
      return { isFinal: true, alreadyDead: false };
    }
    await db.query(`UPDATE listings SET status = 'pending_review' WHERE id = $1`, [listingId]);
    return { isFinal: false, alreadyDead: false };
  } catch (e) {
    console.error('flagRuleViolation error:', e);
    return { isFinal: false, alreadyDead: false };
  }
}

// Собирает тело ответа для отказа по фото — раньше в ответе не было
// признака, что это уже вторая (последняя) попытка или что объявление
// вообще уже заблокировано, поэтому приложение молча показывало ту же
// самую ошибку из раза в раз, а список объявлений не обновлялся и
// продавец не видел, что объявление на самом деле уже мертво.
function buildPhotoFailureBody(msg, flagResult, lang) {
  if (flagResult?.alreadyDead) {
    return { error: mt('alreadyDead', lang), alreadyDead: true };
  }
  return { error: msg, finalStrike: !!flagResult?.isFinal };
}

// Загрузить фото
router.post('/:id/photos', requireAuth, async (req, res) => {
  const { photos } = req.body;
  const lang = safeLang(req.body.lang);
  if (!photos || !photos.length) return res.status(400).json({ error: mt('noPhotos', lang) });
  const check = await db.query('SELECT id FROM listings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  if (!check.rows.length) return res.status(404).json({ error: mt('notFound', lang) });

  try {
    // Если у объявления уже есть фото (добавляем ещё, а не публикуем впервые),
    // продолжаем нумерацию после текущего максимума — иначе новые фото
    // перезаписали бы порядок/обложку существующих (sort_order с нуля).
    const maxOrderRes = await db.query('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM listing_photos WHERE listing_id = $1', [req.params.id]);
    const startOrder = maxOrderRes.rows[0].max_order + 1;

    // Минимум 4 фото требуем только при первой РЕАЛЬНОЙ загрузке от
    // пользователя — специально считаем без учёта фото, добавленных
    // автоматическим наполнением демо-объявлений (enrichListings.js,
    // URL содержит "/enriched_"): если объявление ещё не имеет ни одного
    // фото от самого продавца, требование остаётся в силе, даже если
    // "startOrder" уже не 0 из-за подставленных стоковых фото.
    const realPhotosRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM listing_photos WHERE listing_id = $1 AND url NOT LIKE '%/enriched_%'`,
      [req.params.id]
    );
    const hasRealPhotos = parseInt(realPhotosRes.rows[0].cnt, 10) > 0;
    if (!hasRealPhotos && photos.length < MIN_PHOTOS_REQUIRED) {
      const msg = mt('minPhotos', lang, MIN_PHOTOS_REQUIRED);
      const flagResult = await flagListingForPhotoReview(req.params.id, msg);
      return res.status(400).json(buildPhotoFailureBody(msg, flagResult, lang));
    }

    // Декодируем все фото заранее — нужно посчитать хэши и разрешение
    // ДО загрузки в Storage, чтобы иметь возможность полностью отклонить
    // запрос (400), а не только пометить объявление на модерацию.
    const decoded = [];
    for (let i = 0; i < photos.length; i++) {
      const base64 = photos[i];
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches) continue;
      decoded.push({ index: i, mimeType: matches[1], buffer: Buffer.from(matches[2], 'base64') });
    }

    // Разрешение — слишком маленькое фото (скриншот, мутное превью и т.п.)
    // отклоняем сразу с указанием, какое именно фото не подходит.
    for (const item of decoded) {
      try {
        const image = await Jimp.read(item.buffer);
        if (image.bitmap.width < MIN_PHOTO_WIDTH || image.bitmap.height < MIN_PHOTO_HEIGHT) {
          const msg = mt('lowRes', lang, item.index + 1);
          const flagResult = !hasRealPhotos ? await flagListingForPhotoReview(req.params.id, msg) : null;
          return res.status(400).json(buildPhotoFailureBody(msg, flagResult, lang));
        }
      } catch (e) {
        const msg = mt('corrupted', lang, item.index + 1);
        const flagResult = !hasRealPhotos ? await flagListingForPhotoReview(req.params.id, msg) : null;
        return res.status(400).json(buildPhotoFailureBody(msg, flagResult, lang));
      }
    }

    // Дубли внутри этой же загрузки — одно и то же фото, добавленное
    // дважды/трижды. Отдельно от checkDuplicatePhotos ниже — та проверка
    // сравнивает только с ДРУГИМИ объявлениями, а не внутри одного набора.
    const batchHashes = await Promise.all(decoded.map((item) => computeDHash(item.buffer).catch(() => null)));
    for (let i = 0; i < batchHashes.length; i++) {
      if (!batchHashes[i]) continue;
      for (let j = i + 1; j < batchHashes.length; j++) {
        if (!batchHashes[j]) continue;
        if (hammingDistance(batchHashes[i], batchHashes[j]) <= DHASH_MATCH_THRESHOLD) {
          const msg = mt('duplicateInBatch', lang, decoded[i].index + 1, decoded[j].index + 1);
          const flagResult = !hasRealPhotos ? await flagListingForPhotoReview(req.params.id, msg) : null;
          return res.status(400).json(buildPhotoFailureBody(msg, flagResult, lang));
        }
      }
    }

    // Раньше каждое фото обрабатывалось (водяной знак → загрузка в Storage →
    // хэш → запись в базу) ПОСЛЕДОВАТЕЛЬНО одно за другим — на 4 фото это
    // легко растягивалось на десятки секунд и мобильное приложение получало
    // "Сервер недоступен" по таймауту, хотя запрос на самом деле просто ещё
    // выполнялся. Фото независимы друг от друга (разные имена файлов за
    // счёт индекса i), поэтому обрабатываем их все параллельно.
    const processed = await Promise.all(photos.map(async (base64, i) => {
      const sortOrder = startOrder + i;
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches) return null;
      const mimeType = matches[1];
      const original = Buffer.from(matches[2], 'base64');

      // Водяной знак накладываем сразу при загрузке — дальше everywhere
      // (хэш для проверки дублей, показ в объявлении) работает уже с этой,
      // финальной версией фото. Если наложение не удалось (битый файл и
      // т.п.) — загружаем оригинал, не блокируем публикацию из-за этого.
      let data = original;
      try { data = await addWatermark(original); } catch (e) { console.error('Watermark error:', e); }

      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const fileName = `${req.params.id}/${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage.from('photos').upload(fileName, data, { contentType: mimeType, upsert: true });
      if (error) { console.error('Upload error:', error); return null; }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);

      // Перцептивный хэш считаем по ОРИГИНАЛУ, а не по фото с водяным знаком —
      // у всех фото на платформе один и тот же центральный водяной знак
      // DOMANIA, и если хэшировать финальную версию, разные снимки после
      // наложения становятся визуально похожи друг на друга для dHash,
      // и проверка дублей начинает ложно срабатывать почти на любом фото.
      // Не блокируем загрузку, если хэш не посчитался (повреждённый файл
      // и т.п.), просто не участвует в проверке дублей.
      let phash = null;
      try { phash = await computeDHash(original); } catch (e) { console.error('dHash error:', e); }

      await db.query('INSERT INTO listing_photos (listing_id, url, sort_order, phash) VALUES ($1, $2, $3, $4)', [req.params.id, urlData.publicUrl, sortOrder, phash]);

      return { url: urlData.publicUrl, phash, data, mimeType };
    }));

    const successful = processed.filter(Boolean);
    const urls = successful.map((p) => p.url);
    const hashes = successful.filter((p) => p.phash).map((p) => p.phash);
    // Проверку содержимого (не скриншот/не по теме/неприемлемо) — тоже
    // параллельно по всем фото.
    const contentChecks = successful.map((p) => checkPhotoContent(p.data, p.mimeType, lang));

    // Похожие фото у другого продавца/этого же продавца — переводим
    // объявление на ручную проверку, даже если оно уже было опубликовано.
    const dupPhotoCheck = await checkDuplicatePhotos(req.params.id, hashes, lang);
    const contentResults = await Promise.all(contentChecks);
    const contentReasons = contentResults.filter((r) => !r.ok).map((r) => r.reason);

    const allReasons = [];
    if (!dupPhotoCheck.ok) allReasons.push(dupPhotoCheck.reason);
    allReasons.push(...contentReasons);

    let ruleViolation = null;
    if (allReasons.length > 0) {
      // Настоящее нарушение правил (фото не по теме/неприемлемо, чужое
      // переиспользованное фото) — не честная техническая накладка, поэтому
      // строже: одно предупреждение, при повторе — объявление удаляется
      // навсегда, без возврата денег за публикацию.
      const combined = allReasons.join('; ');
      ruleViolation = await flagRuleViolation(req.params.id, combined);
    } else {
      // Даём продавцу шанс исправить фото самому: если объявление стояло на
      // проверке из-за отклонённых фото (photo_review_attempts > 0 —
      // проставляется автоматической проверкой, а не решением модератора по
      // другой причине вроде подозрительной цены/дублей адреса) и сейчас
      // загрузка прошла без нареканий — возвращаем объявление в активные
      // сами, не заставляя ждать модератора за то, что человек уже исправил.
      const current = await db.query('SELECT status, photo_review_attempts FROM listings WHERE id = $1', [req.params.id]);
      const row = current.rows[0];
      if (row?.status === 'pending_review' && row.photo_review_attempts > 0) {
        // Сбрасываем оба счётчика — раз в этот раз фото прошли полностью
        // чисто, это уже не тот же самый "провал", от которого зависит
        // блокировка (ни техническая, ни по нарушению правил).
        await db.query(
          "UPDATE listings SET status = 'active', moderation_reason = NULL, photo_review_attempts = 0, rule_violation_count = 0 WHERE id = $1",
          [req.params.id]
        );
      }
    }

    if (ruleViolation?.isFinal) {
      return res.status(400).json({
        error: mt('ruleViolationFinal', lang),
        ruleViolation: true,
        finalStrike: true,
      });
    }
    if (allReasons.length > 0) {
      return res.status(400).json({
        error: mt('ruleViolationWarning', lang, allReasons.join('; ')),
        ruleViolation: true,
        finalStrike: false,
      });
    }

    res.json({ urls, flagged: false });
  } catch (err) {
    res.status(500).json({ error: mt('genericUploadError', lang) });
  }
});

// Удалить одно фото объявления
router.delete('/:id/photos/:photoId', requireAuth, async (req, res) => {
  try {
    const owns = await db.query('SELECT id FROM listings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!owns.rows.length) return res.status(404).json({ error: 'Не найдено' });

    const photo = await db.query('SELECT url FROM listing_photos WHERE id = $1 AND listing_id = $2', [req.params.photoId, req.params.id]);
    if (!photo.rows.length) return res.status(404).json({ error: 'Фото не найдено' });

    await db.query('DELETE FROM listing_photos WHERE id = $1', [req.params.photoId]);

    const path = photo.rows[0].url.split('/photos/')[1];
    if (path) await supabase.storage.from('photos').remove([path]).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить ВСЕ фото объявления разом — нужно приложению для "исправить фото"
// на объявлении, отправленном на проверку: раньше повторная загрузка просто
// добавляла новые фото поверх старых (в том числе бракованных из прошлых
// неудачных попыток), они копились и раздували запрос. Теперь сначала
// чистим, потом загружаем заново с нуля.
router.delete('/:id/photos', requireAuth, async (req, res) => {
  try {
    const owns = await db.query('SELECT id FROM listings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!owns.rows.length) return res.status(404).json({ error: 'Не найдено' });

    const photos = await db.query('SELECT url FROM listing_photos WHERE listing_id = $1', [req.params.id]);
    await db.query('DELETE FROM listing_photos WHERE listing_id = $1', [req.params.id]);

    const paths = photos.rows.map((p) => p.url.split('/photos/')[1]).filter(Boolean);
    if (paths.length) await supabase.storage.from('photos').remove(paths).catch(() => {});

    res.json({ success: true, removed: photos.rows.length });
  } catch (err) {
    console.error('Delete all photos error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Увеличить просмотры
router.post('/:id/view', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE listings SET views = views + 1 WHERE id = $1 RETURNING views',
      [req.params.id]
    );
    res.json({ views: result.rows[0]?.views || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Лайк / снять лайк
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const { listId } = req.body || {};
    const existing = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length) {
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user.id, req.params.id]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: false, count: parseInt(count.rows[0].count) });
    } else {
      await db.query('INSERT INTO favorites (user_id, listing_id, list_id) VALUES ($1, $2, $3)', [req.user.id, req.params.id, listId || null]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: true, count: parseInt(count.rows[0].count) });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Переместить объект в другую подборку
router.post('/:id/favorite/move', requireAuth, async (req, res) => {
  try {
    const { listId } = req.body || {};
    await db.query('UPDATE favorites SET list_id=$1 WHERE user_id=$2 AND listing_id=$3', [listId || null, req.user.id, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Получить подборки пользователя со счётчиками
router.get('/favorite-lists', requireAuth, async (req, res) => {
  try {
    const lists = await db.query(
      `SELECT fl.id, fl.name,
        (SELECT COUNT(*) FROM favorites f WHERE f.list_id = fl.id) AS count
       FROM favorite_lists fl WHERE fl.user_id = $1 ORDER BY fl.created_at ASC`,
      [req.user.id]
    );
    const defaultCount = await db.query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND list_id IS NULL',
      [req.user.id]
    );
    res.json({
      default: { count: parseInt(defaultCount.rows[0].count) },
      lists: lists.rows.map(r => ({ id: r.id, name: r.name, count: parseInt(r.count) }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Создать подборку
router.post('/favorite-lists', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Укажите название' });
    const result = await db.query(
      'INSERT INTO favorite_lists (user_id, name) VALUES ($1, $2) RETURNING id, name',
      [req.user.id, name.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Удалить подборку
router.delete('/favorite-lists/:listId', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM favorite_lists WHERE id = $1 AND user_id = $2', [req.params.listId, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Мои избранные объекты (id + подборка)
router.get('/favorites/mine', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT listing_id, list_id FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Свайп в ленте рекомендаций: like — то же самое, что лайк (добавляет в
// избранное), dislike — просто больше не показывать это объявление в
// подборке. Оба направления пишутся в listing_swipes — это и есть
// "история предпочтений", по которой строится подбор похожих объектов.
router.post('/:id/swipe', requireAuth, async (req, res) => {
  const { direction } = req.body;
  if (direction !== 'like' && direction !== 'dislike') return res.status(400).json({ error: 'Некорректное направление' });
  try {
    await db.query(
      `INSERT INTO listing_swipes (user_id, listing_id, direction) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, listing_id) DO UPDATE SET direction = $3, created_at = NOW()`,
      [req.user.id, req.params.id, direction]
    );
    if (direction === 'like') {
      await db.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Swipe error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подбор похожих объявлений на основе того, что пользователь лайкнул в
// свайп-ленте. Простая честная эвристика (не LLM): сравниваем реальные
// признаки понравившихся объявлений (тип сделки, тип недвижимости, город,
// средняя цена, среднее число комнат) с каждым ещё не просмотренным
// активным объявлением и считаем, сколько признаков совпадает. Если
// лайков ещё нет — просто новые объявления (честный холодный старт, без
// выдуманной персонализации).
router.get('/recommended', requireAuth, async (req, res) => {
  try {
    const likedRows = await db.query(`
      SELECT l.deal_type, l.property_type, l.city_id, l.price, l.rooms
      FROM listing_swipes s JOIN listings l ON l.id = s.listing_id
      WHERE s.user_id = $1 AND s.direction = 'like'
    `, [req.user.id]);

    const candidates = await db.query(`
      SELECT l.*, c.name AS city_name,
        u.name AS agent_name, u.verified AS agent_verified, u.role AS agent_role, u.avatar_url AS agent_avatar,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS cover_photo,
        (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos,
        (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS fav_count,
        (SELECT json_agg(json_build_object('price', price, 'recordedAt', recorded_at) ORDER BY recorded_at) FROM listing_price_history WHERE listing_id = l.id) AS price_history
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      JOIN users  u ON u.id = l.user_id
      WHERE l.status = 'active' AND l.user_id != $1
        AND l.id NOT IN (SELECT listing_id FROM listing_swipes WHERE user_id = $1)
      ORDER BY l.created_at DESC
      LIMIT 300
    `, [req.user.id]);

    if (!likedRows.rows.length) {
      return res.json({ listings: candidates.rows.slice(0, 50), personalized: false });
    }

    const liked = likedRows.rows;
    const mode = (arr) => {
      const counts = {};
      arr.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    };
    const preferredDealType = mode(liked.map((l) => l.deal_type));
    const preferredPropertyType = mode(liked.map((l) => l.property_type));
    const preferredCityId = mode(liked.map((l) => String(l.city_id)));
    const avgPrice = liked.reduce((s, l) => s + l.price, 0) / liked.length;
    const avgRooms = liked.reduce((s, l) => s + parseFloat(l.rooms), 0) / liked.length;

    const scored = candidates.rows.map((item) => {
      let score = 0;
      if (item.deal_type === preferredDealType) score += 3;
      if (item.property_type === preferredPropertyType) score += 2;
      if (String(item.city_id) === preferredCityId) score += 2;
      if (avgPrice > 0) score += Math.max(0, 1 - Math.abs(item.price - avgPrice) / avgPrice) * 2;
      if (avgRooms > 0) score += Math.max(0, 1 - Math.abs(parseFloat(item.rooms) - avgRooms) / avgRooms) * 1;
      return { ...item, match_score: Math.round(score * 10) };
    });
    scored.sort((a, b) => b.match_score - a.match_score);

    res.json({ listings: scored.slice(0, 50), personalized: true });
  } catch (err) {
    console.error('Recommended error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменить цену и/или причину продажи уже опубликованного объявления.
// Каждое реальное изменение цены пишется в listing_price_history — на её
// основе строится история цены и статистика снижений на детальной странице.
router.put('/:id', requireAuth, async (req, res) => {
  const { price, sale_reason, description, amenities, commission_percent } = req.body;
  if (description !== undefined && !String(description?.ru || '').trim()) {
    return res.status(400).json({ error: 'Описание не может быть пустым' });
  }
  try {
    const current = await db.query('SELECT price, user_id, created_at FROM listings WHERE id = $1', [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ error: 'Не найдено' });
    if (current.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Это не ваше объявление' });

    const newPrice = price !== undefined ? parseInt(price) : current.rows[0].price;
    if (price !== undefined && (!Number.isFinite(newPrice) || newPrice <= 0)) {
      return res.status(400).json({ error: 'Некорректная цена' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE listings SET price = $1, sale_reason = COALESCE($2, sale_reason), description = COALESCE($3, description), amenities = COALESCE($4, amenities), commission_percent = COALESCE($5, commission_percent), updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
        [newPrice, sale_reason ?? null, description ? JSON.stringify(description) : null, amenities ? JSON.stringify(amenities) : null, commission_percent != null && commission_percent !== '' ? parseFloat(commission_percent) : null, req.params.id, req.user.id]
      );
      if (newPrice !== current.rows[0].price) {
        // Старые объявления (созданные до этой фичи) не имеют стартовой точки
        // истории — без неё "история" из одного изменения не имеет смысла.
        // Добавляем её задним числом (дата публикации, старая цена).
        const existingHistory = await client.query('SELECT 1 FROM listing_price_history WHERE listing_id = $1 LIMIT 1', [req.params.id]);
        if (!existingHistory.rows.length) {
          await client.query('INSERT INTO listing_price_history (listing_id, price, recorded_at) VALUES ($1, $2, $3)', [
            req.params.id, current.rows[0].price, current.rows[0].created_at,
          ]);
        }
        await client.query('INSERT INTO listing_price_history (listing_id, price) VALUES ($1, $2)', [req.params.id, newPrice]);
      }
      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить объявление
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE listings SET status = 'removed' WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Продвинуть
router.post('/:id/boost', requireAuth, async (req, res) => {
  try {
    await db.query(`UPDATE listings SET promoted = true, promo_until = NOW() + INTERVAL '24 hours' WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отметить объявление как продано/сдано — нужно для статистики "объявлений
// продано за период" в панелях владельца/менеджеров, до этого такой отметки
// в проекте не было вообще. Снимаем с публикации (status='removed'), но
// оставляем sold_at — отличает "нашли покупателя" от просто "удалил".
router.post('/:id/mark-sold', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE listings SET status = 'removed', sold_at = NOW() WHERE id = $1 AND user_id = $2 AND sold_at IS NULL RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══ МОДЕРАЦИЯ ═══
// Список объявлений на проверке
router.get('/moderation/pending', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, c.name AS city_name, u.name AS agent_name, u.email AS agent_email
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      JOIN users u ON u.id = l.user_id
      WHERE l.status = 'pending_review'
      ORDER BY l.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Одобрить объявление
router.post('/:id/approve', requireModerator, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE listings SET status = 'active', moderation_reason = NULL WHERE id = $1 AND status = 'pending_review' RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    notifyMatchingSearches(result.rows[0]);
    const listing = result.rows[0];
    const address = [listing.street, listing.house_number].filter(Boolean).join(' ');
    notify(listing.user_id, 'listing_approved', LISTING_APPROVED_TITLE, listingApprovedBody(address));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отклонить объявление
router.post('/:id/reject', requireModerator, async (req, res) => {
  const { reason } = req.body;
  try {
    // Отдельный статус от "removed" — "removed" значит, что объявление
    // удалил сам продавец, а "rejected" — что модератор его не пропустил
    // (продавец должен это видеть отдельно, не как будто сам его снял).
    const result = await db.query(
      "UPDATE listings SET status = 'rejected', moderation_reason = $2 WHERE id = $1 AND status = 'pending_review' RETURNING id, user_id, street, house_number",
      [req.params.id, reason || 'Отклонено модератором']
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    const listing = result.rows[0];
    const address = [listing.street, listing.house_number].filter(Boolean).join(' ');
    notify(listing.user_id, 'listing_rejected', LISTING_REJECTED_TITLE, listingRejectedBody(address, reason));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Пожаловаться на объявление — один пользователь может пожаловаться на
// конкретное объявление только один раз (UNIQUE в БД гасит повторы), а при
// накоплении REPORT_THRESHOLD жалоб объявление само уходит на модерацию
// и пропадает из публичного поиска (см. lib/listingReports.js).
router.post('/:id/report', requireAuth, async (req, res) => {
  const { reason } = req.body;
  if (!REPORT_REASONS.includes(reason)) return res.status(400).json({ error: 'Укажите причину жалобы' });
  try {
    const check = await db.query('SELECT id FROM listings WHERE id = $1', [req.params.id]);
    if (!check.rows.length) return res.status(404).json({ error: 'Не найдено' });
    const { added, flagged } = await fileReport(req.params.id, req.user.id, reason);
    res.json({ success: true, alreadyReported: !added, flagged });
  } catch (err) {
    console.error('Report listing error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сохранённые поиски пользователя
router.get('/saved-searches', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, filters, enabled, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Сохранить новый поиск
router.post('/saved-searches', requireAuth, async (req, res) => {
  try {
    const { name, filters } = req.body;
    if (!name || !filters) return res.status(400).json({ error: 'Не хватает данных' });
    const result = await db.query(
      'INSERT INTO saved_searches (user_id, name, filters) VALUES ($1, $2, $3) RETURNING id, name, filters, enabled, created_at',
      [req.user.id, name, JSON.stringify(filters)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Включить/выключить сохранённый поиск (пауза без удаления)
router.patch('/saved-searches/:id', requireAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    const result = await db.query(
      'UPDATE saved_searches SET enabled = $1 WHERE id = $2 AND user_id = $3 RETURNING id, enabled',
      [!!enabled, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Удалить сохранённый поиск
router.delete('/saved-searches/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Зарегистрировать push-токен устройства (вызывается при каждом запуске
// приложения — ON CONFLICT просто обновляет владельца, если токен уже
// был привязан к другому аккаунту на этом же устройстве)
router.post('/push-tokens', requireAuth, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'Нет токена' });
    await db.query(
      'INSERT INTO push_tokens (user_id, token, platform) VALUES ($1, $2, $3) ' +
      'ON CONFLICT (token) DO UPDATE SET user_id = $1, platform = $3',
      [req.user.id, token, platform || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Одно объявление по ID — нужен для прямой ссылки на сайте (мобильное
// приложение до сих пор просто ищет объект в уже загруженном общем списке,
// но для веба это не годится: нужна страница, которая открывается напрямую).
// Регистрируем строго ПОСЛЕ всех однословных GET-роутов выше (/recommended,
// /saved-searches, /favorite-lists и т.д.) — иначе этот маршрут перехватил
// бы их, приняв, например, "recommended" за :id.
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, c.name AS city_name,
        u.name AS agent_name, u.verified AS agent_verified, u.role AS agent_role, u.avatar_url AS agent_avatar,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS cover_photo,
        (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos,
        (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS fav_count,
        (SELECT json_agg(json_build_object('price', price, 'recordedAt', recorded_at) ORDER BY recorded_at) FROM listing_price_history WHERE listing_id = l.id) AS price_history
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      JOIN users  u ON u.id = l.user_id
      WHERE l.id = $1 AND l.status = 'active'
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Объявление не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
