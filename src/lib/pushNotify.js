const db = require('../../config/db');

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

// Находит подписки, которым подходит новый (только что опубликованный/одобренный)
// объект, и рассылает им push. Не уведомляет автора его же подпиской.
async function notifyMatchingSearches(listing) {
  try {
    const result = await db.query(
      'SELECT ss.user_id, ss.filters, array_agg(pt.token) AS tokens ' +
      'FROM saved_searches ss ' +
      'JOIN push_tokens pt ON pt.user_id = ss.user_id ' +
      'WHERE ss.user_id != $1 ' +
      'GROUP BY ss.user_id, ss.id, ss.filters',
      [listing.user_id]
    );
    const cityRow = await db.query('SELECT name FROM cities WHERE id = $1', [listing.city_id]);
    const cityName = cityRow.rows[0]?.name?.ru || cityRow.rows[0]?.name?.en || '';
    const priceText = `₪${Number(listing.price).toLocaleString('ru-RU')}`;

    const tokensToNotify = new Set();
    for (const row of result.rows) {
      const filters = row.filters || {};
      if (matchesSearch(listing, filters)) {
        (row.tokens || []).filter(Boolean).forEach((t) => tokensToNotify.add(t));
      }
    }
    if (!tokensToNotify.size) return;
    await sendExpoPush(
      [...tokensToNotify],
      '🔔 Новое объявление',
      `${cityName ? cityName + ' · ' : ''}${priceText} · ${listing.rooms} комн.`.trim(),
      { listingId: listing.id }
    );
    console.log(`Push sent to ${tokensToNotify.size} device(s) for listing ${listing.id}`);
  } catch (err) {
    console.error('notifyMatchingSearches error:', err.message);
  }
}

module.exports = { notifyMatchingSearches, matchesSearch, isPointInPolygon };
