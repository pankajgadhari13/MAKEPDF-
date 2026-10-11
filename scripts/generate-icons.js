import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to generate valid uncompressed PNG buffer using pure Node
function createPng(width, height, isMaskable = false) {
  // RGBA buffer
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;
  const innerRadius = width * 0.36;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full bleed #ff5722 orange background with inner dark circle
        if (dist <= innerRadius) {
          // Dark center
          rawData[pxOffset] = 15;     // R
          rawData[pxOffset + 1] = 15; // G
          rawData[pxOffset + 2] = 20; // B
          rawData[pxOffset + 3] = 255;
        } else {
          // Vibrant Orange background
          rawData[pxOffset] = 255;    // R
          rawData[pxOffset + 1] = 107;// G
          rawData[pxOffset + 2] = 0;  // B
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Dark background with orange gradient/circle & border
        if (dist <= radius) {
          if (dist >= radius - (width * 0.05)) {
            // Orange outer ring
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 107;
            rawData[pxOffset + 2] = 0;
            rawData[pxOffset + 3] = 255;
          } else if (dist <= innerRadius) {
            // Orange core
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 87;
            rawData[pxOffset + 2] = 34;
            rawData[pxOffset + 3] = 255;
          } else {
            // Dark interior
            rawData[pxOffset] = 18;
            rawData[pxOffset + 1] = 18;
            rawData[pxOffset + 2] = 26;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          // Background #0a0a0e
          rawData[pxOffset] = 10;
          rawData[pxOffset + 1] = 10;
          rawData[pxOffset + 2] = 14;
          rawData[pxOffset + 3] = 255;
        }
      }
    }
  }

  // PNG chunks
  const compressed = zlib.deflateSync(rawData);

  // CRC32 helper
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Write files
console.log('Generating PWA icons in public directory...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

// SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0a0a0e"/>
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="#ff6b00" stroke-width="12" stroke-opacity="0.6"/>
  <path d="M160 130 H310 L380 200 V380 H160 Z" fill="#161622" stroke="#ff5722" stroke-width="16" stroke-linejoin="round"/>
  <path d="M310 130 V200 H380" fill="none" stroke="#ff851a" stroke-width="16" stroke-linejoin="round"/>
  <text x="256" y="315" font-family="Space Grotesk, Arial, sans-serif" font-size="76" font-weight="900" fill="#ffffff" text-anchor="middle">MAKE</text>
  <text x="256" y="360" font-family="Space Grotesk, Arial, sans-serif" font-size="44" font-weight="900" fill="#ff6b00" text-anchor="middle">PDF</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('Successfully generated all PWA icons!');
