// Автоматические проверки на признаки фейковых/мошеннических объявлений.
// Каждая функция возвращает { ok: true } либо { ok: false, reason }, в том
// же формате, что уже используют verifyAddress/verifyPrice в routes/listings.js
// — все причины складываются в общий список moderation_reason.
const db = require('../../config/db');
const { hammingDistance } = require('./imageHash');

// Порог различия для dHash (из 64 бит). Взято с запасом: обычное пересжатие
///ресайз даёт разницу в единицы бит, разные фото — обычно 20+.
const DHASH_MATCH_THRESHOLD = 8;

// Похожие/переиспользованные фото в других объявлениях — признак либо
// скопированного чужого объявления, либо массовой публикации одинаковых
// карточек одним и тем же продавцом.
async function checkDuplicatePhotos(listingId, newHashes) {
  if (!newHashes || newHashes.length === 0) return { ok: true };
  try {
    // Не исключаем объявления того же продавца: одно и то же фото в разных
    // карточках — это либо перепост чужого объявления (другой user_id), либо
    // массовая публикация одинаковых "объявлений" от одного и того же
    // продавца — оба случая одинаково подозрительны и должны попадать
    // на ручную проверку.
    const rows = await db.query(`
      SELECT lp.phash, lp.listing_id
      FROM listing_photos lp
      JOIN listings l ON l.id = lp.listing_id
      WHERE lp.phash IS NOT NULL
        AND lp.listing_id != $1
        AND l.status IN ('active', 'pending_review')
    `, [listingId]);

    const matchedListingIds = new Set();
    for (const hash of newHashes) {
      for (const row of rows.rows) {
        if (hammingDistance(hash, row.phash) <= DHASH_MATCH_THRESHOLD) {
          matchedListingIds.add(row.listing_id);
        }
      }
    }
    if (matchedListingIds.size > 0) {
      return { ok: false, reason: `⚠️ Похожие фотографии обнаружены в ${matchedListingIds.size} других объявлениях`, count: matchedListingIds.size };
    }
    return { ok: true };
  } catch (e) {
    console.error('checkDuplicatePhotos error:', e);
    return { ok: true };
  }
}

// Тот же адрес (или очень близкие координаты), но выставлен другим
// пользователем — либо перепост чужого объявления, либо спор о собственности,
// в любом случае стоит проверить руками.
async function checkDuplicateAddress(listingId, userId, cityId, street, houseNumber, lat, lng) {
  try {
    const conditions = ["l.status IN ('active', 'pending_review')", 'l.user_id != $1', 'l.city_id = $2'];
    const params = [userId, cityId];
    let p = 3;

    if (street && houseNumber) {
      conditions.push(`(lower(l.street) = lower($${p}) AND lower(l.house_number) = lower($${p + 1}))`);
      params.push(street.trim(), houseNumber.trim());
      p += 2;
    } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // ~30 метров по прямой — тот же дом/участок
      conditions.push(`(6371000 * acos(least(1, cos(radians($${p})) * cos(radians(l.lat)) * cos(radians(l.lng) - radians($${p + 1})) + sin(radians($${p})) * sin(radians(l.lat))))) < 30`);
      params.push(lat, lng);
      p += 2;
    } else {
      return { ok: true };
    }
    if (listingId) { conditions.push(`l.id != $${p}`); params.push(listingId); }

    const rows = await db.query(`SELECT id FROM listings l WHERE ${conditions.join(' AND ')} LIMIT 5`, params);
    if (rows.rows.length > 0) {
      return { ok: false, reason: `⚠️ Похожий адрес уже опубликован другим пользователем (${rows.rows.length} объявлений)` };
    }
    return { ok: true };
  } catch (e) {
    console.error('checkDuplicateAddress error:', e);
    return { ok: true };
  }
}

// Один и тот же телефон на нескольких разных аккаунтах — частый признак
// обхода блокировки или массовой публикации от лица "разных" продавцов.
async function checkRepeatedPhone(userId, phone) {
  if (!phone) return { ok: true };
  try {
    const rows = await db.query(
      `SELECT id FROM users WHERE id != $1 AND phone = $2`,
      [userId, phone]
    );
    if (rows.rows.length > 0) {
      return { ok: false, reason: `⚠️ Этот телефон уже используется другим аккаунтом (${rows.rows.length})` };
    }
    return { ok: true };
  } catch (e) {
    console.error('checkRepeatedPhone error:', e);
    return { ok: true };
  }
}

module.exports = { checkDuplicatePhotos, checkDuplicateAddress, checkRepeatedPhone, DHASH_MATCH_THRESHOLD };
