// Перцептивный хэш фотографий (dHash) — для поиска одинаковых/переиспользованных
// фото между разными объявлениями. В отличие от хэша файла (md5/sha), dHash
// устойчив к пересжатию и небольшому изменению размера — то есть находит
// "то же самое фото", даже если его один раз пересохранили с другим качеством.
const Jimp = require('jimp');

// Уменьшаем до 9x8 и сравниваем яркость соседних пикселей по строкам —
// получаем 64 бита (8 строк x 8 сравнений). Стандартный, хорошо изученный
// алгоритм (difference hash), не наша выдумка.
async function computeDHash(buffer) {
  const image = await Jimp.read(buffer);
  image.resize(9, 8).grayscale();
  let bits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
      const right = Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r;
      bits += left < right ? '1' : '0';
    }
  }
  return BigInt('0b' + bits).toString(16).padStart(16, '0');
}

// Число различающихся бит между двумя хэшами (0 = идентичные картинки,
// >20 из 64 — как правило, совсем разные фото).
function hammingDistance(hexA, hexB) {
  try {
    let xor = BigInt('0x' + hexA) ^ BigInt('0x' + hexB);
    let dist = 0;
    while (xor > 0n) {
      dist += Number(xor & 1n);
      xor >>= 1n;
    }
    return dist;
  } catch (e) {
    return 64;
  }
}

module.exports = { computeDHash, hammingDistance };
