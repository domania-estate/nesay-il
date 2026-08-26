const webpush = require('web-push');
const db = require('../../config/db');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:domania.support@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Ray-casting point-in-polygon — тот же алгоритм, что и на клиенте (lib/geo.ts),
// чтобы область подписки на карте совпадала с тем, что человек нарисовал.
function isPointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function matchesSearch(listing, filters) {
  if (filters.dealType && filters.dealType !== listing.deal_type) return false;
  if (filters.priceMin != null && listing.price < filters.priceMin) return false;
  if (filters.priceMax != null && listing.price > filters.priceMax) return false;
  if (filters.roomsMin != null && listing.rooms < filters.roomsMin) return false;
  if (filters.furnished === 'yes' && (!listing.furnished || listing.furnished === 'none')) return false;
  if (filters.furnished === 'no' && listing.furnished !== 'none') return false;
  if (filters.pets === 'allowed' && (!listing.pets_allowed || listing.pets_allowed === 'no')) return false;
  if (filters.pets === 'not_allowed' && listing.pets_allowed !== 'no') return false;
  // "Комиссия" — не отдельное поле в объявлении, а честный признак: объявления
  // от агентов почти всегда с комиссией, от собственников — почти всегда без.
  if (filters.commission === 'without' && listing.sellerRole === 'agent') return false;
  if (filters.commission === 'with' && listing.sellerRole !== 'agent') return false;
  if (filters.polygon && filters.polygon.length >= 3) {
    if (listing.lat == null || listing.lng == null) return false;
    return isPointInPolygon([listing.lng, listing.lat], filters.polygon);
  }
  if (filters.cityId != null && filters.cityId !== listing.city_id) return false;
  return true;
}

// Раздел документации Expo: https://docs.expo.dev/push-notifications/sending-notifications/
async function sendExpoPush(tokens, title, body, data) {
  if (!tokens.length) return;
  const messages = tokens.map((to) => ({ to, sound: 'default', title, body, data }));
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error('Expo push send error:', err.message);
  }
}

// Веб-подписка хранится в той же колонке push_tokens.token, что и Expo-токен —
// просто как JSON-строка {endpoint, keys:{p256dh,auth}} с platform='web',
// поэтому регистрация (POST /listings/push-tokens) не требует отдельного роута.
async function sendWebPush(webTokens, title, body, data) {
  if (!webTokens.length) return;
  const payload = JSON.stringify({ title, body, data });
  await Promise.all(webTokens.map(async (raw) => {
    try {
      const subscription = JSON.parse(raw);
      await webpush.sendNotification(subscription, payload);
    } catch (err) {
      // Истёкшая/отозванная подписка — не страшно, просто пропускаем.
      if (err.statusCode !== 404 && err.statusCode !== 410) {
        console.error('Web push send error:', err.message);
      }
    }
  }));
}

// Находит подписки, которым подходит новый (только что опубликованный/одобренный)
// объект, и рассылает им push. Не уведомляет автора его же подпиской.
async function notifyMatchingSearches(listing) {
  try {
    // saved_searches исторически используется и другой (не нашей) фичей —
    // строки с ключом activeFilters это чужой формат ("сохранить поиск" на
    // экране списка), у него нет ни одного из наших полей фильтра, поэтому
    // matchesSearch посчитал бы его подходящим под ЛЮБОЕ объявление. Явно
    // исключаем такие строки, чтобы не спамить их владельцев.
    const result = await db.query(
      "SELECT ss.user_id, ss.filters, " +
      "array_agg(json_build_object('token', pt.token, 'platform', pt.platform)) AS devices " +
      "FROM saved_searches ss " +
      "JOIN push_tokens pt ON pt.user_id = ss.user_id " +
      "WHERE ss.user_id != $1 AND ss.enabled = true AND NOT (ss.filters ? 'activeFilters') " +
      "GROUP BY ss.user_id, ss.id, ss.filters",
      [listing.user_id]
    );
    const cityRow = await db.query('SELECT name FROM cities WHERE id = $1', [listing.city_id]);
    const cityName = cityRow.rows[0]?.name?.ru || cityRow.rows[0]?.name?.en || '';
    const priceText = `₪${Number(listing.price).toLocaleString('ru-RU')}`;
    const sellerRow = await db.query('SELECT role FROM users WHERE id = $1', [listing.user_id]);
    const listingWithSeller = { ...listing, sellerRole: sellerRow.rows[0]?.role || null };

    const expoTokens = new Set();
    const webTokens = new Set();
    for (const row of result.rows) {
      const filters = row.filters || {};
      if (!matchesSearch(listingWithSeller, filters)) continue;
      (row.devices || []).forEach((d) => {
        if (!d || !d.token) return;
        if (d.platform === 'web') webTokens.add(d.token);
        else expoTokens.add(d.token);
      });
    }
    if (!expoTokens.size && !webTokens.size) return;

    const title = '🔔 Новое объявление';
    const body = `${cityName ? cityName + ' · ' : ''}${priceText} · ${listing.rooms} комн.`.trim();
    await Promise.all([
      sendExpoPush([...expoTokens], title, body, { listingId: listing.id }),
      sendWebPush([...webTokens], title, body, { listingId: listing.id }),
    ]);
    console.log(`Push sent to ${expoTokens.size} app device(s) + ${webTokens.size} web subscriber(s) for listing ${listing.id}`);
  } catch (err) {
    console.error('notifyMatchingSearches error:', err.message);
  }
}

module.exports = { notifyMatchingSearches, matchesSearch, isPointInPolygon };
