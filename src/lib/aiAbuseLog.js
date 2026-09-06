// Лог запросов к AI-поиску, которые сама модель распознала как не связанные
// с поиском недвижимости (спам/бред/оскорбления и т.п.) — каждый такой
// запрос стоит денег (вызов Gemini), но не должен доходить до реальной
// логики поиска по базе. Мы не блокируем аккаунт автоматически (такой
// механики в проекте нет и мы не хотим её выдумывать) — просто честно
// записываем событие, чтобы модератор при необходимости мог посмотреть,
// кто злоупотребляет, и принять решение руками.
const db = require('../../config/db');

async function ensureAiAbuseLogSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_search_abuse_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        ip TEXT,
        query TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  } catch (err) {
    console.error('ensureAiAbuseLogSchema error:', err.message);
  }
}

async function logAiAbuse({ userId, ip, query }) {
  try {
    await db.query(
      'INSERT INTO ai_search_abuse_log (user_id, ip, query) VALUES ($1, $2, $3)',
      [userId || null, ip || null, (query || '').slice(0, 500)]
    );
  } catch (err) {
    console.error('logAiAbuse error:', err.message);
  }
}

module.exports = { ensureAiAbuseLogSchema, logAiAbuse };
