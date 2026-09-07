// Ежедневное поздравление с днём рождения — начисляем 50₪ на баланс.
// Дата рождения устанавливается один раз при регистрации/в профиле и
// дальше не редактируется пользователем (см. PUT /auth/profile), поэтому
// накрутить бонус повторной сменой даты нельзя. Идемпотентность по году
// обеспечивает уникальный индекс (user_id, year) в birthday_bonus_log —
// функцию безопасно вызывать многократно в течение дня.
const db = require('../../config/db');

const BONUS_AMOUNT = 50;

const TITLE = { ru: 'С днём рождения!', en: 'Happy Birthday!', he: 'יום הולדת שמח!', uk: 'З днем народження!' };
const BODY = {
  ru: (amount) => `Команда Domania поздравляет вас с днём рождения и дарит ${amount}₪ на баланс!`,
  en: (amount) => `The Domania team wishes you a happy birthday and gifts you ${amount}₪!`,
  he: (amount) => `צוות Domania מברך אתכם ביום הולדת ומעניק ${amount}₪ ליתרה שלכם!`,
  uk: (amount) => `Команда Domania вітає вас з днем народження і дарує ${amount}₪ на баланс!`,
};

function buildBody(amount) {
  return { ru: BODY.ru(amount), en: BODY.en(amount), he: BODY.he(amount), uk: BODY.uk(amount) };
}

async function processBirthdayBonuses() {
  const year = new Date().getFullYear();
  const candidates = await db.query(
    `SELECT id FROM users
     WHERE birth_date IS NOT NULL
       AND blocked = false
       AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)`
  );

  let credited = 0;
  for (const row of candidates.rows) {
    const log = await db.query(
      'INSERT INTO birthday_bonus_log (user_id, year, amount) VALUES ($1, $2, $3) ON CONFLICT (user_id, year) DO NOTHING RETURNING id',
      [row.id, year, BONUS_AMOUNT]
    );
    if (!log.rows.length) continue; // уже поздравили в этом году

    await db.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [BONUS_AMOUNT, row.id]);
    await db.query(
      'INSERT INTO notifications (user_id, type, title, body, credits_awarded) VALUES ($1, $2, $3, $4, $5)',
      [row.id, 'birthday_bonus', JSON.stringify(TITLE), JSON.stringify(buildBody(BONUS_AMOUNT)), BONUS_AMOUNT]
    );
    credited += 1;
  }
  if (credited > 0) console.log(`Birthday bonuses credited: ${credited}`);
  return { credited };
}

module.exports = { processBirthdayBonuses, BONUS_AMOUNT };
