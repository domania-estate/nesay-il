// Кабинет владельца — совсем отдельный вход, не связанный с обычным сайтом
// (своя таблица super_admins, свой JWT с меткой superAdmin:true, проверяется
// в middleware/auth.js requireSuperAdmin). Доступ есть только у одной
// учётной записи, которую мы создали вручную (см. настройку в чате).
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const { requireSuperAdmin } = require('../middleware/auth');
const stats = require('../lib/platformStats');
const { rateLimitMiddleware } = require('../lib/rateLimit');

const router = express.Router();

// Логин — отдельный лимит частоты, чтобы нельзя было перебирать пароль.
const loginLimiter = rateLimitMiddleware({ limit: 10, windowSeconds: 300, message: 'Слишком много попыток входа, попробуйте позже' });

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Укажите email и пароль' });
  try {
    const result = await db.query('SELECT id, email, password_hash FROM super_admins WHERE email = $1', [String(email).toLowerCase().trim()]);
    if (!result.rows.length) return res.status(401).json({ error: 'Неверный email или пароль' });
    const row = result.rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' });
    const token = jwt.sign({ id: row.id, email: row.email, superAdmin: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('Super admin login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/change-password', requireSuperAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Минимум 8 символов' });
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE super_admins SET password_hash = $1 WHERE id = $2', [hash, req.superAdmin.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/stats', requireSuperAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const overview = await stats.getOverviewStats({ from, to });
    const sold = await stats.getSoldByPeriods();
    res.json({ ...overview, soldByPeriod: sold });
  } catch (err) {
    console.error('Super admin stats error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/revenue-chart', requireSuperAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const chart = await stats.getRevenueChart({ from, to });
    res.json({ chart });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients', requireSuperAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const data = await stats.getClients({ limit, offset });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/realtors', requireSuperAdmin, async (req, res) => {
  try {
    const data = await stats.getRealtors({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/agencies', requireSuperAdmin, async (req, res) => {
  try {
    const rows = await stats.getAgencies();
    res.json({ rows });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/properties', requireSuperAdmin, async (req, res) => {
  try {
    const { type, status } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const data = await stats.getProperties({ type, status, limit, offset });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
