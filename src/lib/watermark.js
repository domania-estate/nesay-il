// Водяной знак "DOMANIA" по центру фото — крупными буквами, но полупрозрачный,
// чтобы не портить саму фотографию. Накладывается на каждое фото, которое
// пользователь загружает через сайт или приложение (один и тот же
// backend-эндпоинт для обоих).
const Jimp = require('jimp');

const LABEL = 'DOMANIA';
const WATERMARK_OPACITY = 0.16; // подобрано на глаз: заметно, но не мешает смотреть на фото
const WATERMARK_WIDTH_RATIO = 0.62; // ширина надписи относительно ширины фото

async function addWatermark(buffer) {
  const image = await Jimp.read(buffer);
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // Печатаем на отдельном прозрачном холсте самым крупным доступным шрифтом,
  // затем масштабируем текстовый слой под нужную ширину — так буквы остаются
  // крупными независимо от разрешения исходного фото.
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
  const rawTextW = Jimp.measureText(font, LABEL);
  const rawTextH = Jimp.measureTextHeight(font, LABEL, rawTextW);
  const textLayer = new Jimp(rawTextW, rawTextH, 0x00000000);
  textLayer.print(font, 0, 0, LABEL);

  const targetW = Math.round(w * WATERMARK_WIDTH_RATIO);
  const targetH = Math.round(rawTextH * (targetW / rawTextW));
  textLayer.resize(targetW, targetH);
  textLayer.opacity(WATERMARK_OPACITY);

  image.composite(textLayer, Math.round((w - targetW) / 2), Math.round((h - targetH) / 2));

  const mime = image.getMIME();
  return image.getBufferAsync(mime === Jimp.MIME_PNG ? Jimp.MIME_PNG : Jimp.MIME_JPEG);
}

module.exports = { addWatermark };
