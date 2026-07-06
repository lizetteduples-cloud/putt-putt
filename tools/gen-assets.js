/* Generates app icon + splash source images for @capacitor/assets.
   Pure Node (zlib only) — draws the Putt-Putt! art: bright mint→blue gradient,
   white golf ball, gold flag, white sparkles. Run: node tools/gen-assets.js */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

/* ---------- minimal PNG encoder ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- tiny scene renderer (signed-distance shapes) ---------- */
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const lerp = (a, b, t) => a + (b - a) * t;
const cov = d => Math.max(0, Math.min(1, 0.5 - d)); // coverage from signed distance (px)

function circle(x, y, cx, cy, r) { return Math.hypot(x - cx, y - cy) - r; }
function capsule(x, y, x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + dx * t), y - (y1 + dy * t)) - r;
}
function triangle(x, y, ax, ay, bx, by, cx2, cy2) { // negative inside (approx dist via edges)
  const e = (px, py, qx, qy) => {
    const ex = qx - px, ey = qy - py;
    const t = Math.max(0, Math.min(1, ((x - px) * ex + (y - py) * ey) / (ex * ex + ey * ey)));
    return Math.hypot(x - (px + ex * t), y - (py + ey * t));
  };
  const s = (px, py, qx, qy) => (qx - px) * (y - py) - (qy - py) * (x - px);
  const s1 = s(ax, ay, bx, by), s2 = s(bx, by, cx2, cy2), s3 = s(cx2, cy2, ax, ay);
  const inside = (s1 <= 0 && s2 <= 0 && s3 <= 0) || (s1 >= 0 && s2 >= 0 && s3 >= 0);
  const d = Math.min(e(ax, ay, bx, by), e(bx, by, cx2, cy2), e(cx2, cy2, ax, ay));
  return inside ? -d : d;
}
function star(x, y, cx, cy, r) { // 4-point sparkle (astroid)
  const dx = Math.abs(x - cx) / r, dy = Math.abs(y - cy) / r;
  return (Math.pow(dx, 2 / 3) + Math.pow(dy, 2 / 3) - 1) * r * 0.5;
}

/* opts: {bg:'icon'|'splash'|'splashDark'|null, art:true|false, artScale, artCx, artCy} */
function render(S, opts) {
  const px = new Buffer.alloc(S * S * 4);
  const g1 = { icon: hex('#3ddc97'), splash: hex('#c9f0ff'), splashDark: hex('#0e2a40') }[opts.bg];
  const g2 = { icon: hex('#1982c4'), splash: hex('#dff7d8'), splashDark: hex('#123a2a') }[opts.bg];
  const WHITE = hex('#ffffff'), GOLD = hex('#ffc832'), DIMPLE = hex('#dbe9f2'), POLE = hex('#ffffff');
  const a = opts.artScale || 1, ox = (opts.artCx ?? 0.5) - 0.5 * a, oy = (opts.artCy ?? 0.5) - 0.5 * a;
  // art coordinates in unit space, mapped through scale+offset
  const M = u => (u * a) * S, MX = u => (ox + u * a) * S, MY = u => (oy + u * a) * S;
  // dimple grid precomputed (unit coords inside ball at 0.42,0.70 r 0.17)
  const dimples = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const dxu = 0.42 + i * 0.062 + (j % 2 ? 0.031 : 0), dyu = 0.70 + j * 0.062;
    if (Math.hypot(dxu - 0.42, dyu - 0.70) < 0.135) dimples.push([dxu, dyu]);
  }
  const SS = 2; // 2x2 subsamples
  for (let yy = 0; yy < S; yy++) {
    for (let xx = 0; xx < S; xx++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = xx + (sx + 0.5) / SS, y = yy + (sy + 0.5) / SS;
        let r, g, b, al;
        if (opts.bg) {
          const t = (x + y) / (2 * S);
          r = lerp(g1[0], g2[0], t); g = lerp(g1[1], g2[1], t); b = lerp(g1[2], g2[2], t); al = 1;
        } else { r = g = b = 0; al = 0; }
        if (opts.art) {
          const blend = (col, c) => { if (c > 0) { r = lerp(r, col[0], c); g = lerp(g, col[1], c); b = lerp(b, col[2], c); al = al + (1 - al) * c; } };
          // flag (gold triangle, waving left of pole top)
          blend(GOLD, cov(triangle(x, y, MX(0.58), MY(0.175), MX(0.58), MY(0.40), MX(0.26), MY(0.2875))));
          // pole (white capsule, tip planted behind the ball)
          blend(POLE, cov(capsule(x, y, MX(0.58), MY(0.16), MX(0.58), MY(0.66), M(0.018))));
          // ball (white circle) + dimples
          const dBall = circle(x, y, MX(0.42), MY(0.70), M(0.17));
          blend(WHITE, cov(dBall));
          if (dBall < -M(0.01)) for (const [du, dv] of dimples) blend(DIMPLE, cov(circle(x, y, MX(du), MY(dv), M(0.016))));
          // sparkles
          blend(WHITE, cov(star(x, y, MX(0.22), MY(0.26), M(0.062))));
          blend(WHITE, cov(star(x, y, MX(0.82), MY(0.52), M(0.048))));
          blend(WHITE, cov(star(x, y, MX(0.66), MY(0.88), M(0.042))));
        }
        R += r; G += g; B += b; A += al;
      }
      const n = SS * SS, o = (yy * S + xx) * 4;
      px[o] = Math.round(R / n); px[o + 1] = Math.round(G / n); px[o + 2] = Math.round(B / n);
      px[o + 3] = Math.round((A / n) * 255);
    }
  }
  return px;
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });
const save = (name, S, opts) => {
  fs.writeFileSync(path.join(outDir, name), encodePNG(S, S, render(S, opts)));
  console.log('wrote assets/' + name);
};
save('icon-only.png', 1024, { bg: 'icon', art: true });
save('play-icon-512.png', 512, { bg: 'icon', art: true }); // Play Store hi-res icon
save('icon-background.png', 1024, { bg: 'icon', art: false });
save('icon-foreground.png', 1024, { bg: null, art: true, artScale: 0.66 });
save('splash.png', 2732, { bg: 'splash', art: true, artScale: 0.28 });
save('splash-dark.png', 2732, { bg: 'splashDark', art: true, artScale: 0.28 });
console.log('done');
