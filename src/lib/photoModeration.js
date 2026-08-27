// Проверка содержимого фото через Gemini Vision: действительно ли это фото
// недвижимости, и нет ли неприемлемого контента. Как и текстовый AI-поиск —
// модель тут только классифицирует, окончательное решение (что делать с
// объявлением) всегда принимает наш backend/модератор, а не AI напрямую.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    appropriate: { type: 'boolean' },
    category: { type: 'string', enum: ['ok', 'not_property', 'inappropriate', 'ad_or_screenshot'] },
    reason: { type: 'string' },
  },
  required: ['appropriate', 'category'],
};

const PROMPT = `Ты модератор фотографий для сайта объявлений о недвижимости в Израиле (Domania). Определи, подходит ли это фото для объявления о продаже/аренде жилья.

Категории:
- "ok" — обычное фото недвижимости: комната, кухня, санузел, вид из окна, фасад здания, двор, план этажа, подъезд.
- "not_property" — фото не имеет отношения к недвижимости (человек, животное, еда, случайный предмет и т.п.).
- "inappropriate" — неприемлемое содержание (обнажённость, насилие, шок-контент).
- "ad_or_screenshot" — это скриншот текста/переписки/рекламы/логотипа другого сайта, а не фото самой недвижимости.

appropriate = true только для категории "ok". Если false — коротко объясни причину на русском.`;

async function checkPhotoContent(buffer, mimeType) {
  const key = process.env.GEMINI_API_KEY;
  // Если AI не настроен — не блокируем публикацию, просто пропускаем проверку.
  if (!key) return { ok: true };
  try {
    const base64 = buffer.toString('base64');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inlineData: { mimeType, data: base64 } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA, temperature: 0 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Photo moderation AI error:', data.error?.message);
      return { ok: true };
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: true };
    const parsed = JSON.parse(text);
    if (!parsed.appropriate) {
      return { ok: false, reason: `⚠️ Фото не прошло проверку (${parsed.category}): ${parsed.reason || 'не похоже на фото недвижимости'}` };
    }
    return { ok: true };
  } catch (e) {
    console.error('checkPhotoContent error:', e);
    // Сбой AI не должен блокировать публикацию — отправляем на ручную проверку было бы избыточно.
    return { ok: true };
  }
}

module.exports = { checkPhotoContent };
