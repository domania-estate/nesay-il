const express = require('express');
const db = require('../../config/db');
const { requireModerator } = require('../middleware/auth');
const { enrichDemoListings } = require('../lib/enrichListings');

const router = express.Router();

// Разовое наполнение демо-объявлений без фото: качественные фото с
// водяным знаком + более полное описание. Идемпотентно — трогает только
// объявления, у которых ещё вообще нет ни одного фото.
router.post('/enrich-demo-listings', requireModerator, async (req, res) => {
  try {
    const result = await enrichDemoListings();
    res.json(result);
  } catch (err) {
    console.error('Enrich demo listings error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Список всех пользователей со статистикой (для CRM модераторов)
router.get('/users', requireModerator, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id, u.name, u.surname, u.email, u.phone, u.role, u.verified, u.is_moderator, u.blocked,
        u.credits, u.created_at,
        (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status != 'removed') AS listings_count,
        (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'pending_review') AS pending_count,
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
    res.json({ success: true, credits: result.rows[0].credits });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
