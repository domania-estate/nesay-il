// Полупрозрачный водяной знак "Domania" в правом нижнем углу — накладывается
// на каждое фото, которое загружает пользователь (сайт и приложение идут
// через один и тот же backend-эндпоинт, так что один код обслуживает оба).
const Jimp = require('jimp');

async function addWatermark(buffer) {
  const image = await Jimp.read(buffer);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const label = 'Domania';
  const textWidth = Jimp.measureText(font, label);
  const pad = 14;
  const plateW = textWidth + pad * 2;
  const plateH = 34;
  const margin = 12;

  // Полупрозрачная тёмная плашка под текстом — знак виден на любом фоне
  // (светлом и тёмном фото), но не перекрывает саму фотографию целиком.
  const plate = new Jimp(plateW, plateH, 0x00000080);
  image.composite(plate, w - plateW - margin, h - plateH - margin);
  image.print(font, w - textWidth - pad - margin, h - plateH - margin + 8, label);

  const mime = image.getMIME();
  return image.getBufferAsync(mime === Jimp.MIME_PNG ? Jimp.MIME_PNG : Jimp.MIME_JPEG);
}

module.exports = { addWatermark };
