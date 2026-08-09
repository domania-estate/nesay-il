content = open('src/routes/listings.js').read()

old = "module.exports = router;"
new = '''// Получить сохранённые поиски пользователя
router.get('/saved-searches', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, filters, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Сохранить новый поиск
router.post('/saved-searches', requireAuth, async (req, res) => {
  try {
    const { name, filters } = req.body;
    if (!name || !filters) return res.status(400).json({ error: 'Не хватает данных' });
    const result = await db.query(
      'INSERT INTO saved_searches (user_id, name, filters) VALUES ($1, $2, $3) RETURNING id, name, filters, created_at',
      [req.user.id, name, JSON.stringify(filters)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Удалить сохранённый поиск
router.delete('/saved-searches/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
module.exports = router;'''

if old in content:
    content = content.replace(old, new)
    open('src/routes/listings.js', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
