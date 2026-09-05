const db = require('../../config/db');

// Причины жалобы — фиксированный список, чтобы не собирать произвольный
// текст (проще анализировать модератору и не пускать вставки/спам в поле).
const REPORT_REASONS = ['spam', 'fraud', 'wrong_info', 'inappropriate', 'sold', 'other'];

// Порог, после которого объявление снимается с публичного поиска и уходит
// на ручную проверку — не удаляется сразу, решение всё равно за модератором.
const REPORT_THRESHOLD = 10;

const REASON_LABELS = {
  spam: 'спам/реклама',
  fraud: 'похоже на мошенничество',
  wrong_info: 'неверная информация об объекте',
  inappropriate: 'неприемлемое содержание',
  sold: 'объект уже продан/сдан',
  other: 'другое',
};

async function ensureReportsSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS listing_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (listing_id, user_id)
      )
    `);
  } catch (err) {
    console.error('ensureReportsSchema error:', err.message);
  }
}

// Записывает жалобу (один пользователь — одна жалоба на объявление, повторный
// вызов молча игнорируется через UNIQUE) и переводит объявление на модерацию,
// если по нему набралось REPORT_THRESHOLD жалоб.
// Возвращает { added, totalReports, flagged }.
async function fileReport(listingId, userId, reason) {
  const safeReason = REPORT_REASONS.includes(reason) ? reason : 'other';
  const insertRes = await db.query(
    `INSERT INTO listing_reports (listing_id, user_id, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (listing_id, user_id) DO NOTHING
     RETURNING id`,
    [listingId, userId, safeReason]
  );
  const added = insertRes.rows.length > 0;

  const countRes = await db.query('SELECT COUNT(*)::int AS count FROM listing_reports WHERE listing_id = $1', [listingId]);
  const totalReports = countRes.rows[0].count;

  let flagged = false;
  if (totalReports >= REPORT_THRESHOLD) {
    const reasonsRes = await db.query(
      `SELECT reason, COUNT(*)::int AS count FROM listing_reports WHERE listing_id = $1 GROUP BY reason ORDER BY count DESC`,
      [listingId]
    );
    const breakdown = reasonsRes.rows.map((r) => `${REASON_LABELS[r.reason] || r.reason}: ${r.count}`).join(', ');
    const moderationNote = `⚠️ Жалобы пользователей (${totalReports}): ${breakdown}`;
    const updateRes = await db.query(
      `UPDATE listings
       SET status = 'pending_review',
           moderation_reason = CASE WHEN moderation_reason IS NULL THEN $2 ELSE moderation_reason || '; ' || $2 END
       WHERE id = $1 AND status = 'active'
       RETURNING id`,
      [listingId, moderationNote]
    );
    flagged = updateRes.rows.length > 0;
  }

  return { added, totalReports, flagged };
}

module.exports = { ensureReportsSchema, fileReport, REPORT_REASONS, REPORT_THRESHOLD };
