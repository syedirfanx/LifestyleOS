const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = buf.subarray(4, 8 + len);
  const crc = crc32(toCrc);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function encodePNG(width, height, pixelFn) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const stride = 1 + width * 4;
  const rawScanlines = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawScanlines[rowOffset] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawScanlines[pixelOffset] = r;
      rawScanlines[pixelOffset + 1] = g;
      rawScanlines[pixelOffset + 2] = b;
      rawScanlines[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Draw Lifestyle OS icon
function renderLifestyleIcon(x, y, width, height, isMaskable = false) {
  // Normalize coordinates to 0..1
  const u = x / width;
  const v = y / height;

  // Background gradient: dark navy/slate (#090d16 -> #0f172a -> #1e293b)
  const bgR = Math.round(9 + (30 - 9) * ((u + v) / 2));
  const bgG = Math.round(13 + (41 - 13) * ((u + v) / 2));
  const bgB = Math.round(22 + (59 - 22) * ((u + v) / 2));

  // Determine scale and center
  const scale = isMaskable ? 0.72 : 0.88; // safe zone padding for maskable
  const cx = 0.5;
  const cy = 0.5;

  // Shift coordinates relative to center
  const nx = (u - cx) / scale + 0.5;
  const ny = (v - cy) / scale + 0.5;

  // Check rounded corner background for non-maskable
  if (!isMaskable) {
    const cornerR = 0.22;
    const dx = Math.max(0, Math.abs(u - 0.5) - (0.5 - cornerR));
    const dy = Math.max(0, Math.abs(v - 0.5) - (0.5 - cornerR));
    if (Math.hypot(dx, dy) > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside rounded squircle
    }
  }

  // Subtle circular ambient glow in center
  const distCenter = Math.hypot(nx - 0.5, ny - 0.5);
  let r = bgR;
  let g = bgG;
  let b = bgB;
  let a = 255;

  if (distCenter < 0.45) {
    const glow = (1 - distCenter / 0.45) * 0.18;
    r = Math.round(r * (1 - glow) + 37 * glow);
    g = Math.round(g * (1 - glow) + 99 * glow);
    b = Math.round(b * (1 - glow) + 235 * glow);
  }

  // Draw Stylized Geometric 'L' and Node
  // L vertical bar: nx in [0.32, 0.42], ny in [0.26, 0.74] with rounded caps
  // L horizontal base: nx in [0.32, 0.68], ny in [0.64, 0.74] with rounded caps
  // Node circle: center at (0.68, 0.38), radius = 0.065

  // Distance to vertical bar
  const vertMinX = 0.32, vertMaxX = 0.42;
  const vertMinY = 0.26, vertMaxY = 0.74;
  const vertCorner = 0.05;
  const vdx = Math.max(0, Math.abs(nx - (vertMinX + vertMaxX)/2) - (vertMaxX - vertMinX)/2 + vertCorner);
  const vdy = Math.max(0, Math.abs(ny - (vertMinY + vertMaxY)/2) - (vertMaxY - vertMinY)/2 + vertCorner);
  const distVert = Math.hypot(vdx, vdy);

  // Distance to horizontal bar
  const horizMinX = 0.32, horizMaxX = 0.68;
  const horizMinY = 0.64, horizMaxY = 0.74;
  const horizCorner = 0.05;
  const hdx = Math.max(0, Math.abs(nx - (horizMinX + horizMaxX)/2) - (horizMaxX - horizMinX)/2 + horizCorner);
  const hdy = Math.max(0, Math.abs(ny - (horizMinY + horizMaxY)/2) - (horizMaxY - horizMinY)/2 + horizCorner);
  const distHoriz = Math.hypot(hdx, hdy);

  // Distance to accent node
  const distNode = Math.hypot(nx - 0.68, ny - 0.38);

  const inL = (distVert <= vertCorner) || (distHoriz <= horizCorner);

  if (inL) {
    // Vibrant Blue Gradient (#3b82f6 -> #1d4ed8)
    const factor = (ny - 0.26) / (0.74 - 0.26);
    r = Math.round(59 * (1 - factor) + 29 * factor);
    g = Math.round(130 * (1 - factor) + 78 * factor);
    b = Math.round(246 * (1 - factor) + 216 * factor);
    return [r, g, b, 255];
  }

  // Draw node (emerald accent)
  if (distNode <= 0.065) {
    if (distNode <= 0.028) {
      // White inner core
      return [255, 255, 255, 255];
    }
    // Emerald ring (#10b981)
    return [16, 185, 129, 255];
  }

  return [r, g, b, a];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  encodePNG(192, 192, (x, y, w, h) => renderLifestyleIcon(x, y, w, h, false))
);

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  encodePNG(512, 512, (x, y, w, h) => renderLifestyleIcon(x, y, w, h, false))
);

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  encodePNG(512, 512, (x, y, w, h) => renderLifestyleIcon(x, y, w, h, true))
);

console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  encodePNG(180, 180, (x, y, w, h) => renderLifestyleIcon(x, y, w, h, false))
);

console.log('Icons successfully generated!');
