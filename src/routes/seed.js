const express = require('express');
const router = express.Router();
const db = require('../../config/db');

const SEED_SECRET = 'domania-seed-2026-secret';

const streets = {
  1: ['Rothschild', 'Ibn Gvirol', 'Dizengoff', 'Herzl', 'Ben Yehuda', 'Allenby'],
  2: ['Herzl', 'Ha-Namal', 'Ha-Atzmaut', 'Jaffa Road'],
  3: ['King George', 'Jaffa', 'Ben Yehuda', 'Emek Refaim'],
};

const conditions = ['new', 'fresh', 'cosmetic', 'needs_repair'];
const furnishedOpts = ['full', 'partial', 'none'];
const petsOpts = ['yes', 'no', 'small_dog', 'small_cat'];
const propTypes = ['apartment', 'apartment', 'apartment', 'house', 'commercial'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(min + Math.random() * (max - min)); }

router.post('/run', async (req, res) => {
  if (req.query.secret !== SEED_SECRET) return res.status(403).json({ error: 'forbidden' });
  try {
    const cities = await db.query('SELECT id, lat, lng FROM cities LIMIT 10');
    if (cities.rows.length === 0) return res.status(400).json({ error: 'no cities found' });

    let user = await db.query("SELECT id FROM users WHERE role IN ('agent','owner') LIMIT 1");
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'no agent/owner user found to attach listings to' });
    }
    const userId = user.rows[0].id;

    const count = parseInt(req.query.count) || 40;
    let created = 0;
    for (let i = 0; i < count; i++) {
      const city = rand(cities.rows);
      const dealType = Math.random() < 0.5 ? 'rent' : 'sale';
      const rooms = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5][randInt(0, 9)];
      const sqm = randInt(35, 180);
      const price = dealType === 'rent' ? randInt(3000, 15000) : randInt(800000, 5000000);
      const floor = randInt(1, 15);
      const totalFloors = floor + randInt(1, 10);
      const propertyType = rand(propTypes);
      const streetList = streets[city.id] || streets[1];
      const street = rand(streetList);
      const houseNum = randInt(1, 200);
      const lat = parseFloat(city.lat) + (Math.random() - 0.5) * 0.03;
      const lng = parseFloat(city.lng) + (Math.random() - 0.5) * 0.03;

      await db.query(`
        INSERT INTO listings (user_id, city_id, deal_type, property_type, street, house_number, lat, lng, price, rooms, sqm, floor, total_floors, description, status, condition, furnished, pets_allowed)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      `, [
        userId, city.id, dealType, propertyType, street, String(houseNum),
        lat, lng, price, rooms, sqm, floor, totalFloors,
        JSON.stringify({ ru: 'Уютное жильё в хорошем районе.', he: 'דירה נחמדה באזור טוב.', en: 'Cozy home in a great area.' }),
        'active', rand(conditions), rand(furnishedOpts), rand(petsOpts)
      ]);
      created++;
    }
    res.json({ ok: true, created });
  } catch (err) {
    console.error('seed error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
