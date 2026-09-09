// Небольшой помощник для создания системных уведомлений (та же таблица
// notifications, что и для поздравления с днём рождения, см.
// lib/birthdayBonus.js) — используется при подтверждении/отклонении
// документа модератором или владельцем, при модерации объявлений, начислении
// баланса и т.д. Каждое такое уведомление сразу дублируется push-ом на все
// устройства пользователя (push-текст всегда на русском — так же, как и
// остальные push в проекте, см. lib/pushNotify.js notifyMatchingSearches).
const db = require('../../config/db');
const { sendPushToUser } = require('./pushNotify');

async function notify(userId, type, title, body, creditsAwarded = null) {
  await db.query(
    'INSERT INTO notifications (user_id, type, title, body, credits_awarded) VALUES ($1, $2, $3, $4, $5)',
    [userId, type, JSON.stringify(title), JSON.stringify(body), creditsAwarded]
  );
  const pushTitle = title.ru || Object.values(title)[0];
  const pushBody = body.ru || Object.values(body)[0];
  sendPushToUser(userId, pushTitle, pushBody, { type }).catch((err) => console.error('notify push error:', err.message));
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

const LISTING_APPROVED_TITLE = { ru: 'Объявление одобрено', en: 'Listing approved', he: 'המודעה אושרה', uk: 'Оголошення схвалено' };
function listingApprovedBody(address) {
  const suffix = address ? ` («${address}»)` : '';
  return {
    ru: `Ваше объявление${suffix} прошло проверку и опубликовано.`,
    en: `Your listing${suffix} has passed review and is now live.`,
    he: `המודעה שלכם${suffix} עברה בדיקה ופורסמה.`,
    uk: `Ваше оголошення${suffix} пройшло перевірку та опубліковано.`,
  };
}

const LISTING_REJECTED_TITLE = { ru: 'Объявление отклонено', en: 'Listing rejected', he: 'המודעה נדחתה', uk: 'Оголошення відхилено' };
function listingRejectedBody(address, reason) {
  const suffix = address ? ` («${address}»)` : '';
  const reasonSuffix = reason ? `: ${reason}` : '.';
  return {
    ru: `Ваше объявление${suffix} отклонено модератором${reasonSuffix}`,
    en: `Your listing${suffix} was rejected by a moderator${reasonSuffix}`,
    he: `המודעה שלכם${suffix} נדחתה על ידי המנחה${reasonSuffix}`,
    uk: `Ваше оголошення${suffix} відхилено модератором${reasonSuffix}`,
  };
}

function balanceChangedTitle(delta) {
  const title = delta > 0 ? 'Баланс пополнен' : 'Баланс изменён';
  return { ru: title, en: delta > 0 ? 'Balance credited' : 'Balance updated', he: delta > 0 ? 'היתרה זוכתה' : 'היתרה עודכנה', uk: delta > 0 ? 'Баланс поповнено' : 'Баланс змінено' };
}
function balanceChangedBody(delta) {
  const sign = delta > 0 ? '+' : '';
  return {
    ru: `Команда Domania изменила ваш баланс: ${sign}${delta}₪.`,
    en: `The Domania team adjusted your balance: ${sign}${delta}₪.`,
    he: `צוות Domania עדכן את היתרה שלכם: ${sign}${delta}₪.`,
    uk: `Команда Domania змінила ваш баланс: ${sign}${delta}₪.`,
  };
}

const REFERRAL_BONUS_TITLE = { ru: 'Реферальный бонус начислен', en: 'Referral bonus credited', he: 'בונוס הפניה זוכה', uk: 'Реферальний бонус нараховано' };
function referralBonusReferrerBody(amount) {
  return {
    ru: `По вашей реферальной ссылке зарегистрировался новый пользователь — начислено ${amount}₪.`,
    en: `Someone joined using your referral link — you got ${amount}₪.`,
    he: `מישהו נרשם דרך קישור ההפניה שלכם — קיבלתם ${amount}₪.`,
    uk: `За вашим реферальним посиланням зареєструвався новий користувач — нараховано ${amount}₪.`,
  };
}
function referralBonusReferredBody(amount) {
  return {
    ru: `Спасибо, что зарегистрировались по реферальной ссылке — начислено ${amount}₪ на баланс.`,
    en: `Thanks for signing up via a referral link — you got ${amount}₪.`,
    he: `תודה שנרשמתם דרך קישור הפניה — קיבלתם ${amount}₪.`,
    uk: `Дякуємо, що зареєструвалися за реферальним посиланням — нараховано ${amount}₪.`,
  };
}

module.exports = {
  notify,
  DOC_VERIFIED_TITLE, DOC_VERIFIED_BODY, DOC_REJECTED_TITLE, docRejectedBody,
  LISTING_APPROVED_TITLE, listingApprovedBody, LISTING_REJECTED_TITLE, listingRejectedBody,
  balanceChangedTitle, balanceChangedBody,
  REFERRAL_BONUS_TITLE, referralBonusReferrerBody, referralBonusReferredBody,
};
