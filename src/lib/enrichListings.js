// Разовое наполнение демо-объявлений (без ни одного загруженного фото)
// качественными фото с водяным знаком + более полным описанием. Живёт как
// библиотека, а не отдельный скрипт, чтобы запускаться прямо на сервере —
// там гарантированно верный SUPABASE_SERVICE_KEY (в отличие от локальной
// копии .env, которая может быть устаревшей).
const db = require('../../config/db');
const { createClient } = require('@supabase/supabase-js');
const { computeDHash } = require('./imageHash');
const { addWatermark } = require('./watermark');

const PHOTO_POOL = {
  living: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=80',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1600&q=80',
    'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1600&q=80',
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80',
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1600&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80',
  ],
  exterior: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&q=80',
  ],
};

const DESC_TEMPLATES = [
  (l) => `${l.rooms_txt} в ${l.city}, ${l.condition_txt}. ${l.pets_txt} ${l.furnished_txt} Продуманная планировка, светлые комнаты, удобное расположение — рядом магазины, транспорт и вся необходимая инфраструктура.`,
  (l) => `Просторная ${l.rooms_txt.toLowerCase()} расположена в ${l.city}. Состояние: ${l.condition_txt}. ${l.pets_txt} ${l.furnished_txt} Тихий двор, приветливые соседи, развитая инфраструктура района.`,
  (l) => `${l.rooms_txt} — отличный вариант для ${l.deal_txt} в ${l.city}. ${l.condition_txt.charAt(0).toUpperCase() + l.condition_txt.slice(1)}. ${l.furnished_txt} ${l.pets_txt} Хорошая транспортная доступность, рядом парки и учебные заведения.`,
  (l) => `Уютная ${l.rooms_txt.toLowerCase()} в самом центре событий — ${l.city}. ${l.condition_txt.charAt(0).toUpperCase() + l.condition_txt.slice(1)}. ${l.pets_txt} ${l.furnished_txt} Большие окна, много естественного света, приятная атмосфера.`,
];

const CONDITION_TXT = { new: 'новый ремонт, никто не жил', fresh: 'свежий качественный ремонт', cosmetic: 'аккуратный косметический ремонт', needs_repair: 'требует небольшого обновления, но с хорошим потенциалом' };
const FURNISHED_TXT = { full: 'Полностью меблирована и укомплектована техникой.', partial: 'Частично меблирована.', none: 'Без мебели — готова под ваш дизайн.' };
const PETS_TXT = { yes: 'Можно с любыми животными.', small_dog: 'Можно с небольшой собакой.', small_cat: 'Можно с кошкой.', no: 'К сожалению, с животными нельзя.' };

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

async function processListing(supabase, listing, cityName, imageCache) {
  const propertyType = listing.property_type;
  const categories = propertyType === 'house' ? ['exterior', 'living', 'kitchen', 'bedroom'] : ['living', 'kitchen', 'bedroom', 'bathroom'];
  const seed = hashSeed(listing.id);
  const finalUrls = categories.map((cat, i) => seededShuffle(PHOTO_POOL[cat], seed + i)[0]);

  let uploaded = 0;
  for (let i = 0; i < finalUrls.length; i++) {
    const srcUrl = finalUrls[i];
    let rawBuffer = imageCache.get(srcUrl);
    if (!rawBuffer) {
      const res = await fetch(srcUrl);
      rawBuffer = Buffer.from(await res.arrayBuffer());
      imageCache.set(srcUrl, rawBuffer);
    }
    const watermarked = await addWatermark(rawBuffer);
    const fileName = `${listing.id}/enriched_${Date.now()}_${i}.jpg`;
    const { error } = await supabase.storage.from('photos').upload(fileName, watermarked, { contentType: 'image/jpeg', upsert: true });
    if (error) { console.error('Upload error for', listing.id, error.message); continue; }
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
    const phash = await computeDHash(watermarked).catch(() => null);
    await db.query('INSERT INTO listing_photos (listing_id, url, sort_order, phash) VALUES ($1, $2, $3, $4)', [listing.id, urlData.publicUrl, i, phash]);
    uploaded++;
  }

  const roomsNum = parseFloat(listing.rooms);
  const roomsTxt = propertyType === 'house' ? 'Дом' : `${roomsNum}-комнатная квартира`;
  const dealTxt = listing.deal_type === 'rent' ? 'аренды' : 'покупки';
  const description = DESC_TEMPLATES[seed % DESC_TEMPLATES.length]({
    rooms_txt: roomsTxt,
    city: cityName,
    condition_txt: CONDITION_TXT[listing.condition] || 'в хорошем состоянии',
    pets_txt: PETS_TXT[listing.pets_allowed] || '',
    furnished_txt: FURNISHED_TXT[listing.furnished] || '',
    deal_txt: dealTxt,
  }).replace(/\s+/g, ' ').trim();

  // Описание трогаем только если оно ещё шаблонное/пустое — не затираем то,
  // что реально написал продавец.
  await db.query(
    `UPDATE listings SET description = jsonb_set(COALESCE(description, '{}'::jsonb), '{ru}', to_jsonb($2::text))
     WHERE id = $1 AND (description->>'ru' IS NULL OR description->>'ru' = '' OR description->>'ru' = 'Уютное жильё в хорошем районе.')`,
    [listing.id, description]
  );

  return { id: listing.id, street: listing.street, houseNumber: listing.house_number, uploaded, description };
}

async function enrichDemoListings() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { rows } = await db.query(`
    SELECT l.id, l.street, l.house_number, l.property_type, l.deal_type, l.rooms, l.condition, l.pets_allowed, l.furnished, c.name as city_name
    FROM listings l JOIN cities c ON c.id = l.city_id
    WHERE l.status = 'active' AND NOT EXISTS (SELECT 1 FROM listing_photos WHERE listing_id = l.id)
    ORDER BY l.created_at ASC
  `);
  const imageCache = new Map();
  const results = [];
  for (const row of rows) {
    try {
      const r = await processListing(supabase, row, row.city_name.ru || row.city_name.en, imageCache);
      results.push(r);
    } catch (e) {
      console.error('Ошибка для', row.id, e.message);
      results.push({ id: row.id, error: e.message });
    }
  }
  return { total: rows.length, results };
}

module.exports = { enrichDemoListings };
