// Личные уведомления пользователя (сейчас единственный источник —
// поздравление с днём рождения из lib/birthdayBonus.js, но таблица
// общая, чтобы сюда же можно было добавить другие системные уведомления).
const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, type, title, body, credits_awarded, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Notifications list error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false', [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/read-all', requireAuth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = true WHERE user_id = $1 AND read = false', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
