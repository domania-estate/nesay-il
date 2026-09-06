const db = require('../../config/db');

// express-rate-limit считает запросы в памяти процесса — на Railway бэкенд
// крутится в нескольких репликах за балансировщиком, и у каждой реплики
// свой независимый счётчик, так что реальный лимит оказывается в разы
// слабее заданного (проверено вживую: запросы округляются по репликам).
// Тут вместо этого общий счётчик в Postgres — он один на все реплики,
// потому что все реплики стучатся в одну и ту же базу.
async function ensureRateLimitSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT NOT NULL,
        window_start TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (key, window_start)
      )
    `);
  } catch (err) {
    console.error('ensureRateLimitSchema error:', err.message);
  }
}

// Атомарный upsert — INSERT ... ON CONFLICT в Postgres сам гарантирует, что
// параллельные запросы с разных реплик не потеряют инкремент друг друга.
async function incrementAndCheck(key, windowSeconds) {
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const result = await db.query(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [key, windowStart]
  );
  // Изредка подчищаем старые окна — не на каждый запрос, чтобы не грузить
  // базу лишний раз, но чтобы таблица не росла бесконечно.
  if (Math.random() < 0.01) {
    db.query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour'`).catch(() => {});
  }
  return result.rows[0].count;
}

function rateLimitMiddleware({ limit, windowSeconds = 60, message }) {
  return async (req, res, next) => {
    try {
      const key = `${req.path}:${req.ip}`;
      const count = await incrementAndCheck(key, windowSeconds);
      if (count > limit) {
        return res.status(429).json({ error: message || 'Слишком много запросов, попробуйте через минуту' });
      }
      next();
    } catch (err) {
      console.error('Rate limit error:', err);
      // Если база временно недоступна — не блокируем запрос из-за этого,
      // ограничение частоты не должно ронять саму функцию.
      next();
    }
  };
}

module.exports = { ensureRateLimitSchema, rateLimitMiddleware };
