const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Список всех чатов текущего пользователя
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.listing_id, c.buyer_id, c.seller_id, c.created_at,
        CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END AS other_user_id,
        ou.name AS other_user_name, ou.avatar_url AS other_user_avatar,
        l.address AS listing_address, l.price AS listing_price, l.deal_type AS listing_deal_type,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS listing_photo,
        (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read = false) AS unread_count
      FROM conversations c
      JOIN users ou ON ou.id = (CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END)
      LEFT JOIN listings l ON l.id = c.listing_id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY COALESCE((SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1), c.created_at) DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Conversations fetch error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Начать новый чат по объявлению (или получить уже существующий)
router.post('/start', requireAuth, async (req, res) => {
  const { listing_id } = req.body;
  if (!listing_id) return res.status(400).json({ error: 'listing_id обязателен' });
  try {
    const listingResult = await db.query('SELECT user_id FROM listings WHERE id = $1', [listing_id]);
    if (listingResult.rows.length === 0) return res.status(404).json({ error: 'Объявление не найдено' });
    const sellerId = listingResult.rows[0].user_id;
    const buyerId = req.user.id;

    const existing = await db.query(
      'SELECT id FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3',
      [listing_id, buyerId, sellerId]
    );
    if (existing.rows.length > 0) {
      return res.json({ conversation_id: existing.rows[0].id, is_own_listing: sellerId === buyerId });
    }

    const created = await db.query(
      'INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING id',
      [listing_id, buyerId, sellerId]
    );
    res.json({ conversation_id: created.rows[0].id, is_own_listing: sellerId === buyerId });
  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сообщения конкретного чата
router.get('/conversations/:id', requireAuth, async (req, res) => {
  try {
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [req.params.id]);
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Чат не найден' });
    const c = conv.rows[0];
    if (c.buyer_id !== req.user.id && c.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа к этому чату' });
    }
    const messages = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    await db.query(
      'UPDATE messages SET read = true WHERE conversation_id = $1 AND sender_id != $2 AND read = false',
      [req.params.id, req.user.id]
    );
    res.json({ conversation: c, messages: messages.rows });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправить сообщение
router.post('/conversations/:id/send', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Пустое сообщение' });
  try {
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [req.params.id]);
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Чат не найден' });
    const c = conv.rows[0];
    if (c.buyer_id !== req.user.id && c.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа к этому чату' });
    }
    const msg = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, text, read) VALUES ($1, $2, $3, false) RETURNING *',
      [req.params.id, req.user.id, text.trim()]
    );
    res.json(msg.rows[0]);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Количество непрочитанных сообщений (для бейджа)
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) AS count FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.buyer_id = $1 OR c.seller_id = $1) AND m.sender_id != $1 AND m.read = false
    `, [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
