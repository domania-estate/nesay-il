// Общая агрегация статистики платформы — используется и кабинетом владельца
// (полный доступ), и панелью менеджеров (агрегаты без личных данных клиентов).
// "Доход" на этом этапе — это ₪100, списываемые при публикации каждого
// объявления (реальной оплаты картой в проекте пока нет, см. LISTING_PUBLISH_COST
// в routes/listings.js) — считаем по количеству созданных объявлений в периоде,
// а не по таблице payments (та хранит только самостоятельно задекларированные
// пополнения баланса, это другое).
const db = require('../../config/db');

const LISTING_PUBLISH_COST = 100;

function dateRangeClause(column, from, to, paramsOffset) {
  const clauses = [];
  const params = [];
  let p = paramsOffset;
  if (from) { clauses.push(`${column} >= $${p++}`); params.push(from); }
  if (to) { clauses.push(`${column} <= $${p++}`); params.push(to); }
  return { clause: clauses.length ? clauses.join(' AND ') : '1=1', params, nextParam: p };
}

async function getOverviewStats({ from, to } = {}) {
  const usersRange = dateRangeClause('created_at', from, to, 1);
  const totalUsers = await db.query(`SELECT COUNT(*) AS cnt FROM users WHERE ${usersRange.clause}`, usersRange.params);

  const realtorsRange = dateRangeClause('created_at', from, to, 1);
  const realtors = await db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'agent' AND ${realtorsRange.clause}`, realtorsRange.params);

  const clientsRange = dateRangeClause('created_at', from, to, 1);
  const clients = await db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role IN ('owner', 'buyer') AND ${clientsRange.clause}`, clientsRange.params);

  const agenciesRange = dateRangeClause('created_at', from, to, 1);
  const agencies = await db.query(`SELECT COUNT(*) AS cnt FROM agencies WHERE ${agenciesRange.clause}`, agenciesRange.params);

  const listingsRange = dateRangeClause('created_at', from, to, 1);
  const byType = await db.query(
    `SELECT property_type, COUNT(*) AS cnt FROM listings WHERE ${listingsRange.clause} GROUP BY property_type`,
    listingsRange.params
  );

  const totalListingsRes = await db.query(`SELECT COUNT(*) AS cnt FROM listings WHERE ${listingsRange.clause}`, listingsRange.params);

  const soldRange = dateRangeClause('sold_at', from, to, 1);
  const sold = await db.query(`SELECT COUNT(*) AS cnt FROM listings WHERE sold_at IS NOT NULL AND ${soldRange.clause}`, soldRange.params);

  const revenueRange = dateRangeClause('created_at', from, to, 1);
  const revenueListings = await db.query(`SELECT COUNT(*) AS cnt FROM listings WHERE ${revenueRange.clause}`, revenueRange.params);
  const revenue = parseInt(revenueListings.rows[0].cnt, 10) * LISTING_PUBLISH_COST;

  const propertiesByType = {};
  for (const row of byType.rows) propertiesByType[row.property_type] = parseInt(row.cnt, 10);

  return {
    totalUsers: parseInt(totalUsers.rows[0].cnt, 10),
    realtors: parseInt(realtors.rows[0].cnt, 10),
    clients: parseInt(clients.rows[0].cnt, 10),
    agencies: parseInt(agencies.rows[0].cnt, 10),
    totalListings: parseInt(totalListingsRes.rows[0].cnt, 10),
    propertiesByType,
    listingsSold: parseInt(sold.rows[0].cnt, 10),
    revenue,
  };
}

// Готовые периоды для быстрых вкладок — месяц/3 месяца/полгода/год/всё время.
async function getSoldByPeriods() {
  const periods = [
    { key: 'month', interval: '1 month' },
    { key: '3months', interval: '3 months' },
    { key: '6months', interval: '6 months' },
    { key: 'year', interval: '1 year' },
  ];
  const result = {};
  for (const p of periods) {
    const res = await db.query(`SELECT COUNT(*) AS cnt FROM listings WHERE sold_at IS NOT NULL AND sold_at >= NOW() - INTERVAL '${p.interval}'`);
    result[p.key] = parseInt(res.rows[0].cnt, 10);
  }
  const allTime = await db.query(`SELECT COUNT(*) AS cnt FROM listings WHERE sold_at IS NOT NULL`);
  result.allTime = parseInt(allTime.rows[0].cnt, 10);
  return result;
}

// Точки для графика дохода — по дням, если период короче ~2 месяцев, иначе по месяцам.
async function getRevenueChart({ from, to } = {}) {
  const range = dateRangeClause('created_at', from, to, 1);
  let granularity = 'day';
  if (from && to) {
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    if (days > 70) granularity = 'month';
  }
  const bucket = granularity === 'month' ? "date_trunc('month', created_at)" : "date_trunc('day', created_at)";
  const res = await db.query(
    `SELECT ${bucket} AS bucket, COUNT(*) AS cnt FROM listings WHERE ${range.clause} GROUP BY bucket ORDER BY bucket`,
    range.params
  );
  return res.rows.map((r) => ({ date: r.bucket, revenue: parseInt(r.cnt, 10) * LISTING_PUBLISH_COST, count: parseInt(r.cnt, 10) }));
}

async function getClients({ limit = 50, offset = 0 } = {}) {
  const res = await db.query(
    `SELECT id, name, surname, email, phone, role, credits, verified, blocked, id_document_url, birth_date,
       (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) * 100 AS revenue_generated,
       (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) AS referrals_count,
       created_at
     FROM users u ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = await db.query('SELECT COUNT(*) AS cnt FROM users');
  return { rows: res.rows, total: parseInt(total.rows[0].cnt, 10) };
}

async function getRealtors({ limit = 100, offset = 0 } = {}) {
  const res = await db.query(
    `SELECT u.id, u.name, u.surname, u.email, u.phone, u.verified, u.blocked, u.credits, u.id_document_url, u.birth_date, u.created_at, u.agency_id, a.name AS agency_name,
       (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) AS listings_count,
       (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) * 100 AS revenue_generated,
       (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) AS referrals_count
     FROM users u LEFT JOIN agencies a ON a.id = u.agency_id
     WHERE u.role = 'agent' ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = await db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'agent'`);
  return { rows: res.rows, total: parseInt(total.rows[0].cnt, 10) };
}

async function getAgencies() {
  const res = await db.query(
    `SELECT a.id, a.name, a.phone, a.email, a.license_number, a.created_at,
       (SELECT COUNT(*) FROM users u WHERE u.agency_id = a.id) AS agents_count,
       (SELECT COUNT(*) FROM listings l JOIN users u ON u.id = l.user_id WHERE u.agency_id = a.id) AS listings_count
     FROM agencies a ORDER BY a.created_at DESC`
  );
  return res.rows;
}

async function getProperties({ type, status, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];
  let p = 1;
  if (type) { conditions.push(`l.property_type = $${p++}`); params.push(type); }
  if (status) { conditions.push(`l.status = $${p++}`); params.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);
  const res = await db.query(
    `SELECT l.id, l.street, l.house_number, l.property_type, l.deal_type, l.price, l.status, l.sold_at, l.created_at,
       c.name AS city_name, u.name AS owner_name, u.email AS owner_email
     FROM listings l JOIN cities c ON c.id = l.city_id JOIN users u ON u.id = l.user_id
     ${where}
     ORDER BY l.created_at DESC LIMIT $${p++} OFFSET $${p++}`,
    params
  );
  const countParams = params.slice(0, params.length - 2);
  const totalRes = await db.query(`SELECT COUNT(*) AS cnt FROM listings l ${where}`, countParams);
  return { rows: res.rows, total: parseInt(totalRes.rows[0].cnt, 10) };
}

module.exports = {
  LISTING_PUBLISH_COST,
  getOverviewStats,
  getSoldByPeriods,
  getRevenueChart,
  getClients,
  getRealtors,
  getAgencies,
  getProperties,
};
