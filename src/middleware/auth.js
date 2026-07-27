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

module.exports = { requireAuth, optionalAuth, requireModerator };
