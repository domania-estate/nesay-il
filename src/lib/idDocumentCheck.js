// Проверка документа, удостоверяющего личность (теудат зеут/загранпаспорт),
// через Gemini Vision — сверяем имя/фамилию и дату рождения на документе с
// тем, что указано в профиле пользователя. Это только предварительный
// автоматический фильтр против явно чужих/нечитаемых документов — окончательное
// решение всё равно принимает модератор вручную на странице /admin/verification
// (verified остаётся false после успешной загрузки, само по себе фото
// подтверждением не является).
const { t: mt, safeLang } = require('./moderationI18n');

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    isIdDocument: { type: 'boolean' },
    readable: { type: 'boolean' },
    nameMatches: { type: 'boolean' },
    dobMatches: { type: 'boolean' },
  },
  required: ['isIdDocument', 'readable', 'nameMatches', 'dobMatches'],
};

function buildPrompt(fullName, birthDate) {
  return `Ты проверяешь документ, удостоверяющий личность (израильское теудат зеут или загранпаспорт), загруженный пользователем сайта недвижимости Domania для верификации личности.

Данные из профиля пользователя:
- Имя: "${fullName}"
- Дата рождения: "${birthDate || 'не указана'}"

Определи:
1. isIdDocument — это действительно фото удостоверения личности (теудат зеут, загранпаспорт, водительские права с фото и датой рождения)? false, если это случайное фото, скриншот, документ другого типа и т.п.
2. readable — можно ли разобрать текст на документе (имя, дата рождения)? false, если фото слишком тёмное/размытое/обрезанное.
3. nameMatches — совпадает ли (с учётом разумной транслитерации между языками, порядка имя/фамилия, ивритского и латинского написания) имя на документе с именем из профиля? Если readable=false, верни false.
4. dobMatches — совпадает ли дата рождения на документе с указанной? Если дата рождения не указана в профиле или readable=false, верни true (нечего сверять — не блокируем по этой причине).

Будь разумно снисходителен к транслитерации имён (например "Иван Петров" и "Ivan Petrov" — совпадение), но строг к очевидно разным именам или датам.`;
}

// unavailable=true значит, что автоматическая проверка НЕ проводилась (нет
// ключа/Gemini недоступен) — раньше это выглядело как { ok: true }, то есть
// точно так же, как "AI посмотрел и подтвердил, что это документ" — из-за
// чего когда Gemini временно отключили, вообще любое фото (хоть школьный
// табель) молча "проходило" загрузку без единой проверки, что это вообще
// удостоверение личности. Теперь вызывающий код видит разницу и явно
// предупреждает модератора, что документ нужно смотреть особенно внимательно.
async function checkIdDocument(buffer, mimeType, { name, surname, birthDate }, lang = 'ru') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: true, unavailable: true };

  const l = safeLang(lang);
  const fullName = [name, surname].filter(Boolean).join(' ');
  try {
    const base64 = buffer.toString('base64');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(fullName, birthDate) }, { inlineData: { mimeType, data: base64 } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA, temperature: 0 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('ID document check AI error:', data.error?.message);
      return { ok: true, unavailable: true };
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: true, unavailable: true };
    const parsed = JSON.parse(text);

    if (!parsed.isIdDocument) return { ok: false, reason: mt('idDocNotDocument', l) };
    if (!parsed.readable) return { ok: false, reason: mt('idDocUnreadable', l) };
    if (!parsed.nameMatches || !parsed.dobMatches) return { ok: false, reason: mt('idDocMismatch', l) };
    return { ok: true };
  } catch (err) {
    console.error('ID document check error:', err);
    return { ok: true, unavailable: true };
  }
}

module.exports = { checkIdDocument };
