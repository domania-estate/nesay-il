// Тексты модерации фото раньше всегда были на русском, независимо от языка
// интерфейса пользователя (сайт/приложение поддерживают ru/en/he/uk) —
// продавец, у которого выбран английский или иврит, всё равно видел
// русские сообщения об ошибках. Здесь — переводы конкретных сообщений,
// которые реально доходят до пользователя при загрузке фото.
const SUPPORTED = ['ru', 'en', 'he', 'uk'];

function safeLang(lang) {
  return SUPPORTED.includes(lang) ? lang : 'ru';
}

const T = {
  minPhotos: {
    ru: (n) => `Добавьте минимум ${n} фотографии`,
    en: (n) => `Add at least ${n} photos`,
    he: (n) => `הוסיפו לפחות ${n} תמונות`,
    uk: (n) => `Додайте мінімум ${n} фотографії`,
  },
  lowRes: {
    ru: (i) => `Фото №${i} слишком низкого качества (маленькое разрешение) — загрузите фото лучше`,
    en: (i) => `Photo #${i} is too low quality (small resolution) — please upload a better photo`,
    he: (i) => `תמונה מס' ${i} באיכות נמוכה מדי (רזולוציה קטנה) — העלו תמונה טובה יותר`,
    uk: (i) => `Фото №${i} занадто низької якості (маленька роздільна здатність) — завантажте фото краще`,
  },
  corrupted: {
    ru: (i) => `Не удалось обработать фото №${i} — файл повреждён`,
    en: (i) => `Could not process photo #${i} — the file is corrupted`,
    he: (i) => `לא ניתן היה לעבד את תמונה מס' ${i} — הקובץ פגום`,
    uk: (i) => `Не вдалося обробити фото №${i} — файл пошкоджено`,
  },
  duplicateInBatch: {
    ru: (i, j) => `Фото №${i} и №${j} — это одно и то же фото, добавьте разные фотографии`,
    en: (i, j) => `Photo #${i} and #${j} are the same photo — please add different photos`,
    he: (i, j) => `תמונה מס' ${i} ומס' ${j} הן אותה תמונה — הוסיפו תמונות שונות`,
    uk: (i, j) => `Фото №${i} і №${j} — це одне й те саме фото, додайте різні фотографії`,
  },
  ruleViolationWarning: {
    ru: (reasons) => `Ваше объявление не будет опубликовано: ${reasons}. Это предупреждение — у вас есть ещё одна попытка. При повторном нарушении объявление будет удалено навсегда, а стоимость публикации не возвращается.`,
    en: (reasons) => `Your listing will not be published: ${reasons}. This is a warning — you have one more attempt. If this happens again, the listing will be permanently deleted and the publish fee will not be refunded.`,
    he: (reasons) => `המודעה שלכם לא תפורסם: ${reasons}. זוהי אזהרה — יש לכם עוד ניסיון אחד. אם זה יקרה שוב, המודעה תימחק לצמיתות ועלות הפרסום לא תוחזר.`,
    uk: (reasons) => `Ваше оголошення не буде опубліковано: ${reasons}. Це попередження — у вас є ще одна спроба. При повторному порушенні оголошення буде видалено назавжди, а вартість публікації не повертається.`,
  },
  ruleViolationFinal: {
    ru: () => 'Объявление удалено навсегда — повторное нарушение правил публикации фото. Стоимость публикации не возвращается.',
    en: () => 'The listing has been permanently deleted — repeated violation of the photo publishing rules. The publish fee will not be refunded.',
    he: () => 'המודעה נמחקה לצמיתות — הפרת חוזרת של כללי פרסום התמונות. עלות הפרסום לא תוחזר.',
    uk: () => 'Оголошення видалено назавжди — повторне порушення правил публікації фото. Вартість публікації не повертається.',
  },
  alreadyDead: {
    ru: () => 'Это объявление уже заблокировано и больше не может быть опубликовано. Создайте новое объявление.',
    en: () => 'This listing is already blocked and can no longer be published. Please create a new listing.',
    he: () => 'המודעה הזו כבר חסומה ולא ניתן לפרסם אותה יותר. צרו מודעה חדשה.',
    uk: () => 'Це оголошення вже заблоковано і більше не може бути опубліковано. Створіть нове оголошення.',
  },
  noPhotos: {
    ru: () => 'Нет фото',
    en: () => 'No photos',
    he: () => 'אין תמונות',
    uk: () => 'Немає фото',
  },
  notFound: {
    ru: () => 'Не найдено',
    en: () => 'Not found',
    he: () => 'לא נמצא',
    uk: () => 'Не знайдено',
  },
  genericUploadError: {
    ru: () => 'Ошибка загрузки фото',
    en: () => 'Error uploading photos',
    he: () => 'שגיאה בהעלאת התמונות',
    uk: () => 'Помилка завантаження фото',
  },
  photoContentWrapper: {
    ru: (cat, reason) => `⚠️ Фото не прошло проверку (${cat}): ${reason}`,
    en: (cat, reason) => `⚠️ Photo failed review (${cat}): ${reason}`,
    he: (cat, reason) => `⚠️ התמונה לא עברה בדיקה (${cat}): ${reason}`,
    uk: (cat, reason) => `⚠️ Фото не пройшло перевірку (${cat}): ${reason}`,
  },
  duplicateAcrossListings: {
    ru: (n) => `⚠️ Похожие фотографии обнаружены в ${n} других объявлениях`,
    en: (n) => `⚠️ Similar photos were found in ${n} other listings`,
    he: (n) => `⚠️ נמצאו תמונות דומות ב-${n} מודעות אחרות`,
    uk: (n) => `⚠️ Схожі фотографії знайдено в ${n} інших оголошеннях`,
  },
};

const PHOTO_CATEGORY_LABELS = {
  not_property: { ru: 'не по теме', en: 'not property-related', he: 'לא קשור לנדל"ן', uk: 'не по темі' },
  inappropriate: { ru: 'неприемлемо', en: 'inappropriate', he: 'לא הולם', uk: 'неприйнятно' },
  ad_or_screenshot: { ru: 'реклама/скриншот', en: 'ad/screenshot', he: 'פרסומת/צילום מסך', uk: 'реклама/скриншот' },
};

function categoryLabel(category, lang) {
  const l = safeLang(lang);
  const entry = PHOTO_CATEGORY_LABELS[category];
  if (!entry) return category;
  return entry[l] || entry.ru;
}

function t(key, lang, ...args) {
  const l = safeLang(lang);
  const entry = T[key];
  if (!entry) return '';
  const fn = entry[l] || entry.ru;
  return fn(...args);
}

module.exports = { t, safeLang, SUPPORTED, categoryLabel };
