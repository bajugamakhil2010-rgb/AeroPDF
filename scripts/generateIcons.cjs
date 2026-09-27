const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Draw black and white PDF icon:
      // Rounded border or card
      const nx = x / width;
      const ny = y / height;

      // Outer margin
      const inCard = nx >= 0.2 && nx <= 0.8 && ny >= 0.15 && ny <= 0.85;
      const inLine1 = nx >= 0.3 && nx <= 0.7 && ny >= 0.32 && ny <= 0.36;
      const inLine2 = nx >= 0.3 && nx <= 0.7 && ny >= 0.44 && ny <= 0.48;
      const inLine3 = nx >= 0.3 && nx <= 0.55 && ny >= 0.56 && ny <= 0.60;
      const inBadge = nx >= 0.3 && nx <= 0.5 && ny >= 0.68 && ny <= 0.76;

      if (inBadge || inLine1 || inLine2 || inLine3) {
        rawData[pxOffset] = 255; // R
        rawData[pxOffset + 1] = 255; // G
        rawData[pxOffset + 2] = 255; // B
        rawData[pxOffset + 3] = 255; // A
      } else if (inCard) {
        rawData[pxOffset] = 24; // dark gray
        rawData[pxOffset + 1] = 24;
        rawData[pxOffset + 2] = 27;
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = 0; // Pure black
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180));
console.log('Successfully generated all PWA icons!');
