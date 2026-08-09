content = open('src/routes/listings.js').read()
changes = 0
total = 2

old_route = """router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const existing = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length) {
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user.id, req.params.id]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: false, count: parseInt(count.rows[0].count) });
    } else {
      await db.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: true, count: parseInt(count.rows[0].count) });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});"""

new_route = """router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const { listId } = req.body || {};
    const existing = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length) {
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user.id, req.params.id]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: false, count: parseInt(count.rows[0].count) });
    } else {
      await db.query('INSERT INTO favorites (user_id, listing_id, list_id) VALUES ($1, $2, $3)', [req.user.id, req.params.id, listId || null]);
      const count = await db.query('SELECT COUNT(*) FROM favorites WHERE listing_id = $1', [req.params.id]);
      res.json({ liked: true, count: parseInt(count.rows[0].count) });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Переместить объект в другую подборку
router.post('/:id/favorite/move', requireAuth, async (req, res) => {
  try {
    const { listId } = req.body || {};
    await db.query('UPDATE favorites SET list_id=$1 WHERE user_id=$2 AND listing_id=$3', [listId || null, req.user.id, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Получить подборки пользователя со счётчиками
router.get('/favorite-lists', requireAuth, async (req, res) => {
  try {
    const lists = await db.query(
      `SELECT fl.id, fl.name,
        (SELECT COUNT(*) FROM favorites f WHERE f.list_id = fl.id) AS count
       FROM favorite_lists fl WHERE fl.user_id = $1 ORDER BY fl.created_at ASC`,
      [req.user.id]
    );
    const defaultCount = await db.query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND list_id IS NULL',
      [req.user.id]
    );
    res.json({
      default: { count: parseInt(defaultCount.rows[0].count) },
      lists: lists.rows.map(r => ({ id: r.id, name: r.name, count: parseInt(r.count) }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Создать подборку
router.post('/favorite-lists', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Укажите название' });
    const result = await db.query(
      'INSERT INTO favorite_lists (user_id, name) VALUES ($1, $2) RETURNING id, name',
      [req.user.id, name.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
// Удалить подборку
router.delete('/favorite-lists/:listId', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM favorite_lists WHERE id = $1 AND user_id = $2', [req.params.listId, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});"""

if old_route in content:
    content = content.replace(old_route, new_route); changes += 1; print('OK 1/2: favorite route updated + new routes added')
else:
    print('FAIL 1/2: favorite route anchor not found')

if changes >= 1:
    changes = total
    open('src/routes/listings.js', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
