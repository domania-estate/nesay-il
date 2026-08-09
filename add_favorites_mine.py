content = open('src/routes/listings.js').read()
old = """// Удалить подборку
router.delete('/favorite-lists/:listId', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM favorite_lists WHERE id = $1 AND user_id = $2', [req.params.listId, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});"""
new = old + """
// Мои избранные объекты (id + подборка)
router.get('/favorites/mine', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT listing_id, list_id FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});"""
if old in content:
    content = content.replace(old, new)
    open('src/routes/listings.js', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
