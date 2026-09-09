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
const { notify, DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY, DOC_REJECTED_TITLE, docRejectedBody, balanceChangedTitle, balanceChangedBody } = require('../lib/notify');

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

router.get('/revenue-by-month', requireSuperAdmin, async (req, res) => {
  try {
    const data = await stats.getRevenueByMonth();
    res.json(data);
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

// Подтвердить/снять подтверждение личности — то же самое действие, что
// доступно менеджерам на /admin/verification (POST /admin/users/:id/verify),
// но здесь под отдельной авторизацией владельца (requireSuperAdmin), т.к.
// кабинет владельца не использует обычные токены пользователей/модераторов.
router.post('/users/:id/verify', requireSuperAdmin, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET verified = true WHERE id = $1 RETURNING id, verified', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    await notify(req.params.id, 'document_verified', DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY);
    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отклонить документ с комментарием — то же действие, что у менеджеров.
router.post('/users/:id/reject-document', requireSuperAdmin, async (req, res) => {
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

// Список заявок на верификацию — то же самое, что у менеджеров
// (GET /admin/verifications), под авторизацией владельца.
router.get('/verifications', requireSuperAdmin, async (req, res) => {
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

router.post('/users/:id/unverify', requireSuperAdmin, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET verified = false WHERE id = $1 RETURNING id, verified', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, verified: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Чёрный список — то же действие, что у менеджеров (POST /admin/users/:id/block),
// под авторизацией владельца.
router.post('/users/:id/block', requireSuperAdmin, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET blocked = true WHERE id = $1 RETURNING id, blocked', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, blocked: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/users/:id/unblock', requireSuperAdmin, async (req, res) => {
  try {
    const result = await db.query('UPDATE users SET blocked = false WHERE id = $1 RETURNING id, blocked', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json({ success: true, blocked: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Начислить/списать баланс (форс-мажоры, ошибки сервиса) — то же действие,
// что у менеджеров (POST /admin/users/:id/balance).
router.post('/users/:id/balance', requireSuperAdmin, async (req, res) => {
  const { amount } = req.body;
  const delta = parseInt(amount, 10);
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

// Полная карточка объявления вне зависимости от статуса — обычный
// GET /listings/:id отдаёт только активные (см. комментарий там), а
// владельцу нужно уметь открыть и заблокированное/отклонённое/снятое.
router.get('/properties/:id', requireSuperAdmin, async (req, res) => {
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

// Заблокировать/разблокировать объявление — пока доступно только владельцу
// (отдельно от обычной модерации, для явного ручного вмешательства).
// Текущий статус запоминаем в blocked_prior_status, чтобы разблокировка
// вернула объявление туда, откуда его сняли, а не всегда в 'active'.
router.post('/properties/:id/block', requireSuperAdmin, async (req, res) => {
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

router.post('/properties/:id/unblock', requireSuperAdmin, async (req, res) => {
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

module.exports = router;
