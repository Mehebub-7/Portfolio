'use strict';
/**
 * Minimal intrinsic-size reader for PNG, JPEG and WebP.
 * Used at build time so <img> tags carry real width/height and the browser
 * can reserve the right box (no layout shift) even though several icons in
 * Assets/ are actually WebP files saved with a .png extension.
 */
const fs = require('fs');

function png(b) {
  if (b.length < 24 || b.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function jpeg(b) {
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) { o++; continue; }
    const marker = b[o + 1];
    // SOF0-SOF15, excluding DHT(c4), JPG(c8) and DAC(cc)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: b.readUInt16BE(o + 5), width: b.readUInt16BE(o + 7) };
    }
    o += 2 + b.readUInt16BE(o + 2);
  }
  return null;
}

function webp(b) {
  const fourcc = b.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') {
    return {
      width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
      height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
    };
  }
  if (fourcc === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

function imageSize(file) {
  const b = fs.readFileSync(file);
  let d = null;
  if (b.length > 8 && b.readUInt32BE(0) === 0x89504e47) d = png(b);
  else if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) d = jpeg(b);
  else if (b.length > 16 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') d = webp(b);
  if (!d || !d.width || !d.height) throw new Error('Could not read image size: ' + file);
  return d;
}

module.exports = { imageSize };
