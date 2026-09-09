const express = require('express');
const db = require('../../config/db');
const { requireModerator } = require('../middleware/auth');
const { enrichDemoListings, backfillListingDetails } = require('../lib/enrichListings');
const platformStats = require('../lib/platformStats');
const { notify, DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY, DOC_REJECTED_TITLE, docRejectedBody, balanceChangedTitle, balanceChangedBody } = require('../lib/notify');

const router = express.Router();

// Разовое наполнение демо-объявлений без фото: качественные фото с
// водяным знаком + более полное описание. Идемпотентно — трогает только
// объявления, у которых ещё вообще нет ни одного фото. ?force=1 — сначала
// удаляет уже сгенерированные нами фото (например, чтобы переснять их с
// новым дизайном водяного знака) и создаёт заново.
router.post('/enrich-demo-listings', requireModerator, async (req, res) => {
  try {
    const result = await enrichDemoListings({ force: req.query.force === '1' });
    res.json(result);
  } catch (err) {
    console.error('Enrich demo listings error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Заполняет недостающие этаж/этажность/ремонт/мебель/животные у уже
// существующих объявлений — для тех, что были созданы до того, как эти
// поля стали обязательными при публикации.
router.post('/backfill-listing-details', requireModerator, async (req, res) => {
  try {
    const result = await backfillListingDetails();
    res.json(result);
  } catch (err) {
    console.error('Backfill listing details error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Список всех пользователей со статистикой (для CRM модераторов).
// revenue_generated — по ₪100 за каждое когда-либо созданное объявление
// (та же логика дохода платформы, что и в lib/platformStats.js), а не
// total_deposited (это отдельная сущность — самостоятельно задекларированные
// пополнения баланса через payments, реальной оплаты картой в проекте нет).
router.get('/users', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id, u.name, u.surname, u.email, u.phone, u.role, u.verified, u.is_moderator, u.blocked,
        u.credits, u.birth_date, u.id_document_url, u.created_at,
        (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status != 'removed') AS listings_count,
        (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'pending_review') AS pending_count,
        (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) * 100 AS revenue_generated,
        (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) AS referrals_count,
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.user_id = u.id AND p.status = 'completed'), 0) / 100.0 AS total_deposited
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Общая сводная статистика платформы
router.get('/stats', requireModerator, async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const listingsCount = await db.query("SELECT COUNT(*) FROM listings WHERE status != 'removed'");
    const pendingCount = await db.query("SELECT COUNT(*) FROM listings WHERE status = 'pending_review'");
    const totalRevenue = await db.query("SELECT COALESCE(SUM(amount),0)/100.0 AS total FROM payments WHERE status = 'completed'");
    res.json({
      users: parseInt(usersCount.rows[0].count),
      listings: parseInt(listingsCount.rows[0].count),
      pending: parseInt(pendingCount.rows[0].count),
      revenue: parseFloat(totalRevenue.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Объявления конкретного пользователя (просмотр деталей из CRM)
router.get('/users/:id/listings', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, c.name AS city_name
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      WHERE l.user_id = $1 AND l.status != 'removed'
      ORDER BY l.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Заблокировать / разблокировать пользователя
router.post('/users/:id/block', requireModerator, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET blocked = true WHERE id = $1 RETURNING id, blocked', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, blocked: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
router.post('/users/:id/unblock', requireModerator, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET blocked = false WHERE id = $1 RETURNING id, blocked', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, blocked: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Исправить дату рождения — единственный способ её изменить после
// регистрации (обычный /auth/profile её больше не перезаписывает,
// см. комментарий там), чтобы никто не мог переставлять её каждый
// месяц ради поздравительных 50₪.
router.put('/users/:id/birth-date', requireModerator, async (req, res) => {
  const { birthDate } = req.body;
  if (!birthDate) return res.status(400).json({ error: 'Укажите дату' });
  try {
    const result = await db.query('UPDATE users SET birth_date = $1 WHERE id = $2 RETURNING id, birth_date', [birthDate, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, birth_date: result.rows[0].birth_date });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменить баланс пользователя (плюс или минус)
router.post('/users/:id/balance', requireModerator, async (req, res) => {
  const { amount } = req.body;
  const delta = parseInt(amount);
  if (!delta) return res.status(400).json({ error: 'Укажите сумму' });
  try {
    const result = await db.query(
      'UPDATE users SET credits = GREATEST(0, credits + $1) WHERE id = $2 RETURNING id, credits',
      [delta, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    notify(req.params.id, 'balance_changed', balanceChangedTitle(delta), balanceChangedBody(delta), delta);
    res.json({ success: true, credits: result.rows[0].credits });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка документов, удостоверяющих личность (теудат зеут/загранпаспорт),
// загруженных через PUT /auth/id-document. Список разбит на два по полю
// verified — ожидающие проверки (документ есть, ещё не подтверждён) и уже
// подтверждённые (для справки/аудита, у кого что было принято).
router.get('/verifications', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, surname, email, phone, role, verified, id_document_url, birth_date, short_id, created_at
      FROM users
      WHERE id_document_url IS NOT NULL
      ORDER BY verified ASC, created_at DESC
    `);
    res.json({
      pending: result.rows.filter((u) => !u.verified),
      verified: result.rows.filter((u) => u.verified),
    });
  } catch (err) {
    console.error('Verifications list error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/users/:id/verify', requireModerator, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET verified = true WHERE id = $1 RETURNING id, verified', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    await notify(req.params.id, 'document_verified', DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY);
    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отклонить документ с комментарием — очищает id_document_url (чтобы
// пользователь мог загрузить фото заново, а не остался в подвешенном
// состоянии) и кладёт уведомление с причиной прямо в звонок/список
// уведомлений в приложении.
router.post('/users/:id/reject-document', requireModerator, async (req, res) => {
  const { comment } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET verified = false, id_document_url = NULL WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    await notify(req.params.id, 'document_rejected', DOC_REJECTED_TITLE, docRejectedBody(comment));
    res.json({ success: true });
  } catch (err) {
    console.error('Reject document error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/users/:id/unverify', requireModerator, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET verified = false WHERE id = $1 RETURNING id, verified', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, verified: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Полный список объектов с фильтрами — то же самое, что у владельца
// (stats.getProperties), теперь доступно и менеджерам для управления.
router.get('/properties', requireModerator, async (req, res) => {
  try {
    const { type, status } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const data = await platformStats.getProperties({ type, status, limit, offset });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/properties/:id', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, c.name AS city_name,
        u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
        (SELECT json_agg(url ORDER BY sort_order) FROM listing_photos WHERE listing_id = l.id) AS all_photos
      FROM listings l
      JOIN cities c ON c.id = l.city_id
      JOIN users u ON u.id = l.user_id
      WHERE l.id = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Property detail error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Заблокировать/разблокировать объект — то же действие, что раньше было
// только у владельца (super-admin), теперь доступно и менеджерам.
router.post('/properties/:id/block', requireModerator, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE listings SET blocked_prior_status = status, status = 'blocked'
       WHERE id = $1 AND status != 'blocked' RETURNING id`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено или уже заблокировано' });
    res.json({ success: true, status: 'blocked' });
  } catch (err) {
    console.error('Block listing error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/properties/:id/unblock', requireModerator, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE listings SET status = COALESCE(blocked_prior_status, 'active'), blocked_prior_status = NULL
       WHERE id = $1 AND status = 'blocked' RETURNING id, status`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено или не заблокировано' });
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) {
    console.error('Unblock listing error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Расширенная статистика для панели менеджеров — сколько риелторов, клиентов,
// агентств, объектов по типам, продано за период. В отличие от кабинета
// владельца, здесь НЕТ полного списка клиентов с контактами — только счётчики
// (владелец сам просил, чтобы полная база клиентов была только у него одного).
router.get('/platform-stats', requireModerator, async (req, res) => {
  try {
    const { from, to } = req.query;
    const overview = await platformStats.getOverviewStats({ from, to });
    const soldByPeriod = await platformStats.getSoldByPeriods();
    res.json({ ...overview, soldByPeriod });
  } catch (err) {
    console.error('Platform stats error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/revenue-by-month', requireModerator, async (req, res) => {
  try {
    const data = await platformStats.getRevenueByMonth();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
