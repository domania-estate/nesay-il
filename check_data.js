const db = require('./config/db');
(async () => {
  const cities = await db.query('SELECT id, name FROM cities LIMIT 5');
  console.log('CITIES:', JSON.stringify(cities.rows, null, 2));
  const users = await db.query("SELECT id, name, role FROM users WHERE role IN ('agent','owner') LIMIT 5");
  console.log('USERS:', JSON.stringify(users.rows, null, 2));
  process.exit(0);
})();
