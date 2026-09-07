const jwt = require('jsonwebtoken');
const db = require('../../config/db');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нужна авторизация' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); } catch (_) {}
  }
  next();
}

// Требует, чтобы пользователь был модератором (проверяем свежее значение в БД, а не из токена)
async function requireModerator(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нужна авторизация' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
  try {
    const result = await db.query('SELECT is_moderator FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length || !result.rows[0].is_moderator) {
      return res.status(403).json({ error: 'Доступ только для модераторов' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка проверки прав' });
  }
}

// Кабинет владельца — совсем отдельная авторизация от обычных пользователей
// сайта (своя таблица super_admins, свой логин), токен явно помечен
// { superAdmin: true }, и мы ещё раз проверяем по базе, что такой аккаунт
// всё ещё существует (можно отозвать доступ, удалив строку).
async function requireSuperAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нужна авторизация' });
  }
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
  if (!payload.superAdmin) return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const result = await db.query('SELECT id FROM super_admins WHERE id = $1', [payload.id]);
    if (!result.rows.length) return res.status(403).json({ error: 'Доступ запрещён' });
    req.superAdmin = payload;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка проверки прав' });
  }
}

module.exports = { requireAuth, optionalAuth, requireModerator, requireSuperAdmin };
