const db = require('../../config/db');

// Официальный список городов Израиля (статус "עיר"), помимо уже
// существовавших изначально 15. Координаты — центр города, из открытых
// геосправочников. Не выдумано: имена/районы сверены со списком городов
// Израиля (Wikipedia: List of cities in Israel).
const CITIES = [
  { en: 'Acre', he: 'עכו', ru: 'Акко', lat: 32.9281, lng: 35.0818 },
  { en: 'Afula', he: 'עפולה', ru: 'Афула', lat: 32.6076, lng: 35.2897 },
  { en: 'Arad', he: 'ערד', ru: 'Арад', lat: 31.2589, lng: 35.2128 },
  { en: 'Arraba', he: 'עראבה', ru: 'Арраба', lat: 32.8494, lng: 35.3389 },
  { en: 'Ashkelon', he: 'אשקלון', ru: 'Ашкелон', lat: 31.6688, lng: 34.5742 },
  { en: 'Baqa al-Gharbiyye', he: 'באקה אל-גרביה', ru: 'Бака-эль-Гарбия', lat: 32.4181, lng: 35.0392 },
  { en: "Be'er Ya'akov", he: 'באר יעקב', ru: 'Беэр-Яаков', lat: 31.9436, lng: 34.8386 },
  { en: 'Beersheba', he: 'באר שבע', ru: 'Беэр-Шева', lat: 31.2530, lng: 34.7915 },
  { en: "Beit She'an", he: 'בית שאן', ru: 'Бейт-Шеан', lat: 32.4969, lng: 35.4967 },
  { en: 'Beit Shemesh', he: 'בית שמש', ru: 'Бейт-Шемеш', lat: 31.7514, lng: 34.9886 },
  { en: 'Bnei Brak', he: 'בני ברק', ru: 'Бней-Брак', lat: 32.0807, lng: 34.8338 },
  { en: 'Dimona', he: 'דימונה', ru: 'Димона', lat: 31.0687, lng: 35.0333 },
  { en: "El'ad", he: 'אלעד', ru: 'Эльад', lat: 32.0537, lng: 34.9506 },
  { en: 'Ganei Tikva', he: 'גני תקווה', ru: 'Ганей-Тиква', lat: 32.0574, lng: 34.8697 },
  { en: "Giv'at Shmuel", he: 'גבעת שמואל', ru: 'Гиват-Шмуэль', lat: 32.0785, lng: 34.8489 },
  { en: 'Givatayim', he: 'גבעתיים', ru: 'Гиватаим', lat: 32.0714, lng: 34.8106 },
  { en: 'Hadera', he: 'חדרה', ru: 'Хадера', lat: 32.4340, lng: 34.9196 },
  { en: 'Harish', he: 'חריש', ru: 'Хариш', lat: 32.4644, lng: 35.0428 },
  { en: 'Hod HaSharon', he: 'הוד השרון', ru: 'Ход-ха-Шарон', lat: 32.1547, lng: 34.8875 },
  { en: 'Kafr Qara', he: 'כפר קרע', ru: 'Кафр-Кара', lat: 32.5011, lng: 34.9931 },
  { en: 'Kafr Qasim', he: 'כפר קאסם', ru: 'Кафр-Касем', lat: 32.1153, lng: 34.9744 },
  { en: 'Karmiel', he: 'כרמיאל', ru: 'Кармиэль', lat: 32.9186, lng: 35.2955 },
  { en: 'Kfar Saba', he: 'כפר סבא', ru: 'Кфар-Саба', lat: 32.1750, lng: 34.9070 },
  { en: 'Kfar Yona', he: 'כפר יונה', ru: 'Кфар-Йона', lat: 32.3172, lng: 34.9339 },
  { en: 'Kiryat Ata', he: 'קריית אתא', ru: 'Кирьят-Ата', lat: 32.8000, lng: 35.1000 },
  { en: 'Kiryat Bialik', he: 'קריית ביאליק', ru: 'Кирьят-Бялик', lat: 32.8339, lng: 35.0819 },
  { en: 'Kiryat Gat', he: 'קריית גת', ru: 'Кирьят-Гат', lat: 31.6100, lng: 34.7642 },
  { en: 'Kiryat Malakhi', he: 'קריית מלאכי', ru: 'Кирьят-Малахи', lat: 31.7297, lng: 34.7469 },
  { en: 'Kiryat Motzkin', he: 'קריית מוצקין', ru: 'Кирьят-Моцкин', lat: 32.8386, lng: 35.0806 },
  { en: 'Kiryat Ono', he: 'קריית אונו', ru: 'Кирьят-Оно', lat: 32.0631, lng: 34.8558 },
  { en: 'Kiryat Shmona', he: 'קריית שמונה', ru: 'Кирьят-Шмона', lat: 33.2075, lng: 35.5697 },
  { en: 'Lod', he: 'לוד', ru: 'Лод', lat: 31.9516, lng: 34.8931 },
  { en: 'Ma\'alot-Tarshiha', he: 'מעלות-תרשיחא', ru: 'Маалот-Таршиха', lat: 33.0169, lng: 35.2733 },
  { en: 'Maghar', he: "מע'אר", ru: 'Магар', lat: 32.8825, lng: 35.4022 },
  { en: 'Migdal HaEmek', he: 'מגדל העמק', ru: 'Мигдаль-ха-Эмек', lat: 32.6742, lng: 35.2417 },
  { en: "Modi'in-Maccabim-Re'ut", he: "מודיעין-מכבים-רעות", ru: 'Модиин-Маккабим-Реут', lat: 31.8969, lng: 35.0106 },
  { en: 'Nahariya', he: 'נהריה', ru: 'Нагария', lat: 33.0058, lng: 35.0925 },
  { en: 'Nazareth', he: 'נצרת', ru: 'Назарет', lat: 32.7021, lng: 35.2978 },
  { en: 'Nesher', he: 'נשר', ru: 'Нешер', lat: 32.7683, lng: 35.0439 },
  { en: 'Ness Ziona', he: 'נס ציונה', ru: 'Нес-Циона', lat: 31.9294, lng: 34.7969 },
  { en: 'Netivot', he: 'נתיבות', ru: 'Нетивот', lat: 31.4222, lng: 34.5892 },
  { en: 'Nof HaGalil', he: 'נוף הגליל', ru: 'Нoф-ха-Галиль', lat: 32.7086, lng: 35.3183 },
  { en: 'Ofakim', he: 'אופקים', ru: 'Офаким', lat: 31.3106, lng: 34.6203 },
  { en: 'Or Akiva', he: 'אור עקיבא', ru: 'Ор-Акива', lat: 32.5083, lng: 34.9169 },
  { en: 'Or Yehuda', he: 'אור יהודה', ru: 'Ор-Иехуда', lat: 32.0333, lng: 34.8500 },
  { en: 'Qalansawe', he: 'קלנסווה', ru: 'Каланшуа', lat: 32.2872, lng: 34.9967 },
  { en: 'Rahat', he: 'רהט', ru: 'Рахат', lat: 31.3925, lng: 34.7539 },
  { en: 'Ramat HaSharon', he: 'רמת השרון', ru: 'Рамат-ха-Шарон', lat: 32.1467, lng: 34.8397 },
  { en: 'Ramla', he: 'רמלה', ru: 'Рамла', lat: 31.9286, lng: 34.8656 },
  { en: 'Rosh HaAyin', he: 'ראש העין', ru: 'Рош-ха-Аин', lat: 32.0956, lng: 34.9569 },
  { en: 'Safed', he: 'צפת', ru: 'Цфат', lat: 32.9646, lng: 35.4960 },
  { en: 'Sakhnin', he: 'סח\'נין', ru: 'Сахнин', lat: 32.8656, lng: 35.2953 },
  { en: 'Sderot', he: 'שדרות', ru: 'Сдерот', lat: 31.5253, lng: 34.5958 },
  { en: 'Shefa-Amr', he: 'שפרעם', ru: 'Шфарам', lat: 32.8058, lng: 35.1697 },
  { en: 'Tamra', he: 'טמרה', ru: 'Тамра', lat: 32.8511, lng: 35.2011 },
  { en: 'Tayibe', he: 'טייבה', ru: 'Тайбе', lat: 32.2667, lng: 35.0011 },
  { en: 'Tiberias', he: 'טבריה', ru: 'Тверия', lat: 32.7940, lng: 35.5312 },
  { en: 'Tira', he: 'טירה', ru: 'Тира', lat: 32.2333, lng: 34.9500 },
  { en: 'Tirat Carmel', he: 'טירת כרמל', ru: 'Тират-Кармель', lat: 32.7622, lng: 34.9736 },
  { en: 'Umm al-Fahm', he: 'אום אל-פחם', ru: 'Умм-эль-Фахм', lat: 32.5169, lng: 35.1517 },
  { en: 'Yavne', he: 'יבנה', ru: 'Явне', lat: 31.8781, lng: 34.7397 },
  { en: 'Yehud-Monosson', he: 'יהוד-מונוסון', ru: 'Иегуд-Моноссон', lat: 32.0333, lng: 34.8886 },
  { en: 'Yokneam Illit', he: 'יקנעם עילית', ru: 'Йокнеам-Иллит', lat: 32.6564, lng: 35.1092 },
];

// Досеиваем недостающие города — идемпотентно, по совпадению английского
// имени, чтобы не задваивать уже существующие 15 городов при перезапуске.
async function seedIsraeliCities() {
  try {
    const existing = await db.query("SELECT name->>'en' AS en FROM cities");
    const have = new Set(existing.rows.map((r) => r.en));
    const missing = CITIES.filter((c) => !have.has(c.en));
    if (missing.length === 0) return;

    for (const c of missing) {
      await db.query(
        'INSERT INTO cities (name, lat, lng) VALUES ($1, $2, $3)',
        [JSON.stringify({ en: c.en, he: c.he, ru: c.ru }), c.lat, c.lng]
      );
    }
    console.log(`✅ Добавлено городов: ${missing.length}`);
  } catch (err) {
    console.error('Seed cities error:', err.message);
  }
}

module.exports = { seedIsraeliCities };
