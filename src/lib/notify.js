// Небольшой помощник для создания системных уведомлений (та же таблица
// notifications, что и для поздравления с днём рождения, см.
// lib/birthdayBonus.js) — используется при подтверждении/отклонении
// документа модератором или владельцем.
const db = require('../../config/db');

async function notify(userId, type, title, body, creditsAwarded = null) {
  await db.query(
    'INSERT INTO notifications (user_id, type, title, body, credits_awarded) VALUES ($1, $2, $3, $4, $5)',
    [userId, type, JSON.stringify(title), JSON.stringify(body), creditsAwarded]
  );
}

const DOC_VERIFIED_TITLE = { ru: 'Документ подтверждён', en: 'Document verified', he: 'המסמך אושר', uk: 'Документ підтверджено' };
const DOC_VERIFIED_BODY = {
  ru: 'Ваш документ проверен и подтверждён. Хорошего дня от команды Domania!',
  en: 'Your document has been reviewed and verified. Have a great day from the Domania team!',
  he: 'המסמך שלכם נבדק ואושר. יום נעים מצוות Domania!',
  uk: 'Ваш документ перевірено та підтверджено. Гарного дня від команди Domania!',
};

function docRejectedBody(comment) {
  const suffix = comment ? `: ${comment}` : '.';
  return {
    ru: `Ваш документ отклонён${suffix} Загрузите фото ещё раз в разделе «Верификация».`,
    en: `Your document was rejected${suffix} Please upload it again in the Verification section.`,
    he: `המסמך שלכם נדחה${suffix} העלו את התמונה שוב בסעיף "אימות".`,
    uk: `Ваш документ відхилено${suffix} Завантажте фото ще раз у розділі «Верифікація».`,
  };
}

const DOC_REJECTED_TITLE = { ru: 'Документ отклонён', en: 'Document rejected', he: 'המסמך נדחה', uk: 'Документ відхилено' };

module.exports = { notify, DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY, DOC_REJECTED_TITLE, docRejectedBody };
