// Проверка содержимого фото через Gemini Vision: действительно ли это фото
// недвижимости, и нет ли неприемлемого контента. Как и текстовый AI-поиск —
// модель тут только классифицирует, окончательное решение (что делать с
// объявлением) всегда принимает наш backend/модератор, а не AI напрямую.
const { t: mt, safeLang, categoryLabel } = require('./moderationI18n');

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    appropriate: { type: 'boolean' },
    category: { type: 'string', enum: ['ok', 'not_property', 'inappropriate', 'ad_or_screenshot'] },
    reason: { type: 'string' },
  },
  required: ['appropriate', 'category'],
};

const LANG_NAME = { ru: 'русском', en: 'английском', he: 'иврите', uk: 'украинском' };

function buildPrompt(lang) {
  return `Ты модератор фотографий для сайта объявлений о недвижимости в Израиле (Domania). Определи, подходит ли это фото для объявления о продаже/аренде жилья.

Категории:
- "ok" — обычное фото недвижимости: комната, кухня, санузел, вид из окна, фасад здания, двор, план этажа, подъезд.
- "not_property" — фото не имеет отношения к недвижимости (человек, животное, еда, случайный предмет и т.п.).
- "inappropriate" — неприемлемое содержание (обнажённость, насилие, шок-контент).
- "ad_or_screenshot" — это скриншот текста/переписки/рекламы/логотипа другого сайта, а не фото самой недвижимости.

appropriate = true только для категории "ok". Если false — коротко объясни причину на ${LANG_NAME[lang] || LANG_NAME.ru} языке.`;
}

// Возвращает { ok, unavailable } — unavailable=true означает, что проверка
// СОДЕРЖАНИЯ реально не проводилась (нет ключа, Gemini недоступен/ошибка),
// а не что фото прошло проверку. Раньше оба случая возвращали одинаковый
// { ok: true }, и когда Gemini временно отключили (ограничение по биллингу),
// вообще ЛЮБОЕ фото — фейковое, не по теме, не по адресу — молча проходило
// как "проверено", хотя проверки не было вовсе. Вызывающий код теперь может
// отличить "AI одобрил" от "AI не смог проверить" и отправить объявление на
// ручную модерацию во втором случае, вместо того чтобы полагаться на то, что
// проверка вообще происходила.
async function checkPhotoContent(buffer, mimeType, lang = 'ru') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: true, unavailable: true };
  const l = safeLang(lang);
  try {
    const base64 = buffer.toString('base64');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(l) }, { inlineData: { mimeType, data: base64 } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA, temperature: 0 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Photo moderation AI error:', data.error?.message);
      return { ok: true, unavailable: true };
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: true, unavailable: true };
    const parsed = JSON.parse(text);
    if (!parsed.appropriate) {
      // Gemini уже отвечает "reason" на нужном языке (см. buildPrompt) — метку
      // категории переводим сами, чтобы не зависеть от того, переведёт ли
      // модель и её тоже.
      const catLabel = categoryLabel(parsed.category, l);
      return { ok: false, reason: mt('photoContentWrapper', l, catLabel, parsed.reason || catLabel) };
    }
    return { ok: true };
  } catch (e) {
    console.error('checkPhotoContent error:', e);
    return { ok: true, unavailable: true };
  }
}

module.exports = { checkPhotoContent };
