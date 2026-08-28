// Pixel-art dialogue scene -> raw RGB24 on stdout for ffmpeg.
// usage: node scene.js [full|short] > frames
// World is drawn at 256x144 and nearest-upscaled 5x to 1280x720 so pixels stay crisp.
// Speech bubbles + Thai text composite at full res (text rasters come from render-text.ps1).

const fs = require('fs');
const path = require('path');

const VARIANT = process.argv[2] === 'short' ? 'short' : 'full';
const OW = 256, OH = 144, SCALE = 5;
const W = OW * SCALE, H = OH * SCALE;
const FPS = 30;

// ---------------------------------------------------------------- text assets
const TDIR = path.join(__dirname, 'text');
const TIDX = JSON.parse(fs.readFileSync(path.join(TDIR, 'index.json'), 'utf8'));
const TEXT = {};
for (const t of TIDX) {
  TEXT[t.id] = { w: t.w, h: t.h, stride: t.stride, buf: fs.readFileSync(path.join(TDIR, t.id + '.bin')) };
}

// ---------------------------------------------------------------- palette
const C = {
  wall:    [0x14, 0x17, 0x1e],
  wallLo:  [0x0f, 0x11, 0x17],
  floor:   [0x0a, 0x0c, 0x10],
  deskTop: [0x2a, 0x22, 0x1e],
  deskLo:  [0x1a, 0x15, 0x12],
  outline: [0x07, 0x08, 0x0a],
  accent:  [0xe2, 0x79, 0x5a],
  accentD: [0x8a, 0x42, 0x2c],
  user:    [0x6b, 0x7d, 0x94],
  userD:   [0x3c, 0x48, 0x59],
  skinP:   [0xd9, 0xa2, 0x73],
  skinU:   [0xc9, 0x9a, 0x70],
  hair:    [0x17, 0x12, 0x0e],
  screen:  [0xff, 0x9a, 0x6a],
  ink:     [0xf2, 0xec, 0xe6],
  bubbleBg:[0x15, 0x1a, 0x22],
};

let seed = 20260827;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

// ---------------------------------------------------------------- buffers
const world = new Uint8Array(OW * OH * 3);
const out = Buffer.alloc(W * H * 3);

function wset(x, y, c, a) {
  x |= 0; y |= 0;
  if (x < 0 || y < 0 || x >= OW || y >= OH) return;
  const i = (y * OW + x) * 3;
  if (a === undefined || a >= 1) { world[i] = c[0]; world[i + 1] = c[1]; world[i + 2] = c[2]; return; }
  if (a <= 0) return;
  world[i] += (c[0] - world[i]) * a;
  world[i + 1] += (c[1] - world[i + 1]) * a;
  world[i + 2] += (c[2] - world[i + 2]) * a;
}
function wrect(x, y, w, h, c, a) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) wset(x + i, y + j, c, a);
}
// filled rect with a 1px dark outline (the pixel-art staple)
function wrectO(x, y, w, h, c) {
  wrect(x - 1, y - 1, w + 2, h + 2, C.outline);
  wrect(x, y, w, h, c);
}

// ---------------------------------------------------------------- characters
// feet at (x, y); ~44 tall. seated poses hide legs behind the desk.
function drawChar(x, y, o) {
  const shirt = o.shirt, shirtD = o.shirtD, skin = o.skin;
  const t = o.t || 0;
  const bob = o.bob ? Math.round(Math.sin(t * o.bobRate) * 1) : 0;
  const yy = y + bob;

  if (!o.seated) {
    // contact shadow so the character is planted on the floor
    wrect(x - 9, yy - 1, 18, 2, [0x05, 0x06, 0x08], 0.55);
    wrect(x - 11, yy, 22, 1, [0x05, 0x06, 0x08], 0.3);
    // legs
    const step = o.walk ? Math.round(Math.sin(t * 14) * 2) : 0;
    wrectO(x - 5, yy - 14 + Math.abs(step), 4, 14 - Math.abs(step), o.pants || shirtD);
    wrectO(x + 1, yy - 14 + Math.abs(-step), 4, 14 - Math.abs(step), o.pants || shirtD);
  }
  // torso
  wrectO(x - 7, yy - 30, 14, 17, shirt);
  // arms
  const ar = o.armRaise || 0;
  wrectO(x - 10, yy - 29 - ar, 3, 13, shirtD);
  wrectO(x + 7, yy - 29 - (o.armRaise2 !== undefined ? o.armRaise2 : ar), 3, 13, shirtD);
  // hands
  wset(x - 9, yy - 17 - ar, skin); wset(x - 8, yy - 17 - ar, skin);
  wset(x + 8, yy - 17 - ar, skin); wset(x + 9, yy - 17 - ar, skin);
  // neck
  wrect(x - 2, yy - 32, 4, 3, skin);
  // head
  wrectO(x - 6, yy - 44, 12, 13, skin);
  // hair
  wrect(x - 6, yy - 45, 12, 4, C.hair);
  wrect(x - 7, yy - 44, 1, 5, C.hair);
  wrect(x + 6, yy - 44, 1, 5, C.hair);
  // eyes
  const ey = yy - 38;
  if (o.tired) {
    wrect(x - 4, ey, 3, 1, C.outline);
    wrect(x + 2, ey, 3, 1, C.outline);
    wrect(x - 4, ey + 2, 3, 1, [0x9a, 0x74, 0x58]);
    wrect(x + 2, ey + 2, 3, 1, [0x9a, 0x74, 0x58]);
  } else if (o.blink) {
    wrect(x - 4, ey + 1, 3, 1, C.outline);
    wrect(x + 2, ey + 1, 3, 1, C.outline);
  } else {
    wrect(x - 4, ey, 2, 2, C.outline);
    wrect(x + 3, ey, 2, 2, C.outline);
  }
  // mouth
  if (o.talk) wrect(x - 1, yy - 34, 3, 2, C.outline);
  else wrect(x - 1, yy - 34, 3, 1, C.outline);
}

// ---------------------------------------------------------------- set dressing
function drawRoom(t, monitorLit) {
  // wall + floor
  wrect(0, 0, OW, 118, C.wall);
  for (let y = 0; y < 118; y++) wrect(0, y, OW, 1, C.wall, 1 - y / 260);
  wrect(0, 118, OW, OH - 118, C.floor);
  wrect(0, 118, OW, 1, [0x1c, 0x20, 0x28]);

  // window with warm light
  wrectO(150, 26, 58, 44, [0x10, 0x14, 0x1c]);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    wrect(153 + i * 28, 29 + j * 21, 25, 18, [0x2c, 0x1e, 0x1a]);
    wrect(153 + i * 28, 29 + j * 21, 25, 9, [0x38, 0x24, 0x1e]);
  }
  wrect(178, 26, 2, 44, C.outline);
  wrect(150, 47, 58, 2, C.outline);

  // clock: round face, hands sweep with the beat
  const ccx = 44, ccy = 36, cr = 6;
  for (let dy = -cr; dy <= cr; dy++) for (let dx = -cr; dx <= cr; dx++) {
    const d = Math.hypot(dx, dy);
    if (d <= cr) wset(ccx + dx, ccy + dy, d > cr - 1.2 ? [0x50, 0x56, 0x62] : [0x1d, 0x21, 0x2a]);
  }
  for (let m = 0; m < 4; m++) {
    wset(ccx + Math.round(Math.cos(m * Math.PI / 2) * (cr - 2)), ccy + Math.round(Math.sin(m * Math.PI / 2) * (cr - 2)), [0x4a, 0x50, 0x5c]);
  }
  const ha = t * 0.5, ma = t * 2.4;
  for (let r = 1; r <= 3; r++) wset(ccx + Math.round(Math.cos(ha) * r), ccy + Math.round(Math.sin(ha) * r), [0x8a, 0x90, 0x9c]);
  for (let r = 1; r <= 4; r++) wset(ccx + Math.round(Math.cos(ma) * r), ccy + Math.round(Math.sin(ma) * r), [0x6a, 0x70, 0x7c]);
  wset(ccx, ccy, C.accent);

  // poster
  wrectO(218, 30, 24, 30, [0x1a, 0x1e, 0x26]);
  wrect(221, 34, 18, 2, C.accentD);
  wrect(221, 39, 12, 2, [0x3a, 0x40, 0x4c]);
  wrect(221, 44, 15, 2, [0x3a, 0x40, 0x4c]);

  // desk (legs start at the underside of the top, not floating below it)
  wrect(31, 110, 6, 28, C.deskLo);
  wrect(107, 110, 6, 28, C.deskLo);
  wrect(31, 136, 6, 2, C.outline);
  wrect(107, 136, 6, 2, C.outline);
  wrectO(26, 104, 92, 6, C.deskTop);
  wrect(26, 110, 92, 3, C.deskLo);

  // monitor
  wrectO(84, 78, 30, 24, [0x1b, 0x1f, 0x28]);
  const flick = monitorLit ? 0.82 + 0.18 * Math.sin(t * 21) : 0.25;
  wrect(87, 81, 24, 18, [C.screen[0] * flick, C.screen[1] * flick, C.screen[2] * flick]);
  for (let r = 0; r < 5; r++) {
    const lw = 4 + ((r * 7) % 14);
    wrect(89, 83 + r * 3, lw, 1, [0x2a, 0x14, 0x0e]);
  }
  wrect(96, 102, 6, 3, [0x1b, 0x1f, 0x28]);
  wrect(92, 105, 14, 2, [0x24, 0x28, 0x32]);
  // monitor glow spill
  for (let g = 1; g < 10; g++) {
    const a = 0.05 * (1 - g / 10) * (monitorLit ? 1 : 0.25);
    wrect(84 - g, 78 - g, 30 + g * 2, 24 + g * 2, C.accent, a);
  }
  // keyboard
  wrectO(52, 100, 22, 4, [0x22, 0x26, 0x30]);
}

function drawCoffee(x, y, steam, t) {
  wrectO(x, y, 9, 10, [0x33, 0x39, 0x44]);
  wrect(x + 1, y + 1, 7, 2, [0x4a, 0x2c, 0x1c]);
  wrect(x + 9, y + 3, 2, 4, [0x33, 0x39, 0x44]);
  if (steam) {
    for (let s = 0; s < 3; s++) {
      const ph = t * 2 + s * 1.3;
      const sy = y - 2 - ((ph * 3) % 10);
      const sx = x + 2 + s * 3 + Math.round(Math.sin(ph * 2) * 1);
      wset(sx, sy, [0x8a, 0x92, 0xa0], 0.35);
    }
  }
}

// notification / phone-call beat
function drawPing(x, y, t, k) {
  const pop = Math.min(1, k * 4);
  const s = 0.6 + 0.4 * pop + 0.08 * Math.sin(t * 18);
  const w = Math.round(11 * s), h = Math.round(19 * s);
  const px0 = x - (w >> 1), py0 = y - (h >> 1);
  wrectO(px0, py0, w, h, [0x1e, 0x22, 0x2c]);
  wrect(px0 + 2, py0 + 1, w - 4, 1, [0x4a, 0x50, 0x5c]);        // earpiece
  wrect(px0 + 1, py0 + 3, w - 2, h - 6, C.accent, 0.9);          // lit screen
  wrect(px0 + 2, py0 + 4, w - 4, 1, [0xff, 0xc4, 0xa4], 0.7);
  wrect(px0 + (w >> 1) - 1, py0 + h - 2, 2, 1, [0x4a, 0x50, 0x5c]); // home button
  // ring arcs
  const ring = (Math.sin(t * 16) + 1) / 2;
  for (let a = 0; a < 3; a++) {
    const rr = 8 + a * 4 + ring * 3;
    const al = 0.5 * (1 - a / 3) * pop;
    for (let d = -35; d <= 35; d += 5) {
      const rad = d * Math.PI / 180;
      wset(x - Math.round(Math.cos(rad) * rr), y + Math.round(Math.sin(rad) * rr), C.accent, al);
      wset(x + Math.round(Math.cos(rad) * rr), y + Math.round(Math.sin(rad) * rr), C.accent, al);
    }
  }
}

// close-up bust for the final beat
function drawCloseup(t) {
  wrect(0, 0, OW, OH, C.wallLo);
  for (let y = 0; y < OH; y++) wrect(0, y, OW, 1, C.wall, 0.4 - y / 500);
  // monitor glow from the left
  for (let g = 0; g < 40; g++) wrect(0, 30 + g, 60 - g, 1, C.accent, 0.05 * (1 - g / 40));

  const cx = 112, base = 144;
  // desk edge behind him, high enough to stay clear of the caption scrim
  wrect(0, 103, OW, 1, C.outline);
  wrect(0, 104, OW, 5, C.deskTop);
  wrect(0, 109, OW, 4, C.deskLo);
  // shoulders, with the corners knocked off so it isn't a flat slab
  // slightly deeper coral here so the face reads before the shirt
  const shirtCU = [0xc2, 0x64, 0x4a];
  wrectO(cx - 44, base - 54, 88, 58, shirtCU);
  wrect(cx - 44, base - 54, 6, 3, C.wallLo);
  wrect(cx + 38, base - 54, 6, 3, C.wallLo);
  wrect(cx - 42, base - 55, 84, 3, C.accentD);
  // collar
  wrect(cx - 12, base - 54, 4, 9, C.accentD);
  wrect(cx + 8, base - 54, 4, 9, C.accentD);
  wrect(cx - 8, base - 52, 16, 2, [0x6d, 0x33, 0x22]);
  // neck
  wrect(cx - 10, base - 58, 20, 14, C.skinP);
  wrect(cx - 10, base - 58, 20, 3, [0xa8, 0x77, 0x52]);
  // head
  wrectO(cx - 28, base - 108, 56, 52, C.skinP);
  // hair
  wrect(cx - 28, base - 112, 56, 14, C.hair);
  wrect(cx - 30, base - 108, 2, 20, C.hair);
  wrect(cx + 28, base - 108, 2, 20, C.hair);
  wrect(cx - 24, base - 100, 14, 3, C.hair);
  // tired eyes: heavy lids + bags
  const ey = base - 86;
  for (const ox of [-16, 6]) {
    wrect(cx + ox, ey, 12, 2, C.outline);            // lid
    wrect(cx + ox + 1, ey + 2, 10, 3, [0x8d, 0x66, 0x4a]); // shadow
    wrect(cx + ox, ey + 6, 12, 1, [0x9e, 0x74, 0x55]);     // bag
    wrect(cx + ox + 2, ey + 8, 8, 1, [0xa8, 0x7d, 0x5c], 0.6);
  }
  // brows
  wrect(cx - 17, ey - 5, 12, 2, C.hair);
  wrect(cx + 5, ey - 5, 12, 2, C.hair);
  // nose + flat mouth
  wrect(cx - 2, ey + 12, 3, 6, [0xbe, 0x8a, 0x62]);
  wrect(cx - 9, ey + 22, 18, 2, C.outline);

  drawCoffee(186, 94, true, t);
  // steam-lit rim
  wrect(cx - 28, base - 108, 2, 52, [0xff, 0xa8, 0x7c], 0.25);
}

// ---------------------------------------------------------------- full-res overlay
function oset(x, y, c, a) {
  x |= 0; y |= 0;
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 3;
  if (a >= 1) { out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; return; }
  out[i] += (c[0] - out[i]) * a;
  out[i + 1] += (c[1] - out[i + 1]) * a;
  out[i + 2] += (c[2] - out[i + 2]) * a;
}
function orect(x, y, w, h, c, a) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) oset(x + i, y + j, c, a);
}

function blitText(id, x, y, col, alpha) {
  const t = TEXT[id];
  if (!t) return;
  for (let j = 0; j < t.h; j++) {
    for (let i = 0; i < t.w; i++) {
      const a = t.buf[j * t.stride + i * 4 + 3] / 255;
      if (a > 0.003) oset(x + i, y + j, col, a * alpha);
    }
  }
}

// bubble: chunky border on the 5px grid so it sits with the pixel art
function bubble(id, cx, bottomY, accent, alpha, tailDir) {
  if (alpha <= 0.002) return;
  const t = TEXT[id];
  const PAD = 20, B = 5;
  const bw = t.w + PAD * 2, bh = t.h + PAD * 2;
  const rise = Math.round((1 - Math.min(1, alpha * 1.6)) * 10);
  const x = Math.round(cx - bw / 2), y = bottomY - bh + rise;

  orect(x - B, y - B, bw + B * 2, bh + B * 2, C.outline, 0.95 * alpha);
  orect(x, y, bw, bh, C.bubbleBg, 0.94 * alpha);
  // accent edge
  orect(x - B, y - B, bw + B * 2, B, accent, 0.9 * alpha);
  orect(x - B, y + bh, bw + B * 2, B, accent, 0.55 * alpha);
  orect(x - B, y - B, B, bh + B * 2, accent, 0.7 * alpha);
  orect(x + bw, y - B, B, bh + B * 2, accent, 0.7 * alpha);
  // tail
  const tx = tailDir > 0 ? x + bw - 34 : x + 20;
  for (let k = 0; k < 5; k++) {
    orect(tx + (tailDir > 0 ? k * 5 : -k * 5), y + bh + B + k * 5, 20 - k * 3, 5, accent, 0.75 * alpha);
  }
  blitText(id, x + PAD, y + PAD, C.ink, alpha);
}

// ---------------------------------------------------------------- timeline
function seq(specs) {
  let tt = 0; const o = {};
  for (const [name, dur] of specs) { o[name] = { a: tt, b: tt + dur }; tt += dur; }
  o.__total = tt;
  return o;
}
const B = VARIANT === 'short' ? seq([
  ['idle', 1.0], ['enter', 1.0], ['u1', 1.8], ['p1', 1.1],
  ['p3', 2.0], ['exit', 1.0], ['ping', 1.7], ['p4', 1.8], ['u3', 1.3],
  ['crowd', 3.0], ['close', 2.7],
]) : seq([
  ['idle', 1.0], ['enter', 1.0], ['u1', 1.8], ['p1', 1.1],
  ['u2', 1.3], ['p2', 1.3], ['p3', 2.0], ['exit', 1.0], ['ping', 1.7],
  ['p4', 1.8], ['u3', 1.3], ['crowd', 3.0], ['close', 2.7],
]);
const TOTAL = B.__total;
const FRAMES = Math.round(TOTAL * FPS);

function at(b) { return B[b] ? (T >= B[b].a && T < B[b].b) : false; }
function prog(b) { const s = B[b]; return s ? Math.max(0, Math.min(1, (T - s.a) / (s.b - s.a))) : 0; }
// bubble alpha with a quick pop-in and a short fade-out
function balpha(b) {
  if (!B[b]) return 0;
  const s = B[b];
  if (T < s.a || T > s.b) return 0;
  const in_ = Math.min(1, (T - s.a) / 0.14);
  const out_ = Math.min(1, (s.b - T) / 0.12);
  return Math.max(0, Math.min(in_, out_));
}

let T = 0;
const PHUM_X = 68, USER_STAND = 168;

for (let f = 0; f < FRAMES; f++) {
  T = f / FPS;
  world.fill(0);

  const closing = at('close');
  // baseline crop: trims dead wall/floor and gives the characters more presence
  let camZoom = 1.18, camX = OW / 2, camY = 78, shake = 0;

  if (closing) {
    // close-up art is composed for the full world frame, so drop the baseline crop
    camZoom = 1; camY = OH / 2;
    drawCloseup(T);
  } else {
    const talking = at('p1') || at('p2') || at('p3') || at('p4');
    drawRoom(T, true);

    // --- Phum, seated behind the desk (drawn before the desk overlay)
    const blink = (Math.floor(T * 1.7) % 5 === 0) && ((T * 1.7) % 1 < 0.16);
    drawChar(PHUM_X, 118, {
      shirt: C.accent, shirtD: C.accentD, skin: C.skinP, seated: true,
      t: T, bob: true, bobRate: 3.4, blink,
      armRaise: at('idle') || at('ping') ? 2 : 0,
      talk: talking && (Math.floor(T * 9) % 2 === 0),
      tired: false,
    });
    // desk re-drawn over his lower half
    wrectO(26, 104, 92, 6, C.deskTop);
    wrect(26, 110, 92, 3, C.deskLo);
    drawCoffee(34, 94, true, T);

    // --- the colleague
    if (at('enter')) {
      const p = prog('enter');
      drawChar(Math.round(250 - (250 - USER_STAND) * (p * p * (3 - 2 * p))), 126,
        { shirt: C.user, shirtD: C.userD, skin: C.skinU, pants: [0x2c, 0x33, 0x40], t: T, walk: true });
    } else if (at('exit')) {
      const p = prog('exit');
      drawChar(Math.round(USER_STAND + (260 - USER_STAND) * (p * p)), 126,
        { shirt: C.user, shirtD: C.userD, skin: C.skinU, pants: [0x2c, 0x33, 0x40], t: T, walk: true });
    } else if (at('u1') || at('p1') || at('u2') || at('p2') || at('p3')) {
      drawChar(USER_STAND, 126, {
        shirt: C.user, shirtD: C.userD, skin: C.skinU, pants: [0x2c, 0x33, 0x40],
        t: T, bob: true, bobRate: 2.6,
        talk: (at('u1') || at('u2')) && (Math.floor(T * 9) % 2 === 0),
        armRaise: at('u1') ? 3 : 0, armRaise2: 0,
      });
    } else if (at('p4') || at('u3')) {
      drawChar(USER_STAND, 126, {
        shirt: C.user, shirtD: C.userD, skin: C.skinU, pants: [0x2c, 0x33, 0x40],
        t: T, bob: true, bobRate: 2.6, talk: at('u3') && (Math.floor(T * 9) % 2 === 0),
      });
    }

    // --- notification / phone beat: push in on Phum
    if (at('ping')) {
      const p = prog('ping');
      camZoom = 1.18 + 0.6 * Math.min(1, p * 2.2);
      camX = PHUM_X + 14; camY = 96;
      drawPing(104, 66, T, p);
      if (p < 0.25) shake = (0.25 - p) * 10;
    }

    // --- overload: colleagues pile in
    if (at('crowd')) {
      const p = prog('crowd');
      const xs = [214, 178, 142, 108, 236];
      for (let i = 0; i < xs.length; i++) {
        const delay = i * 0.11;
        const q = Math.max(0, Math.min(1, (p - delay) * 4));
        if (q <= 0) continue;
        const x = Math.round(260 - (260 - xs[i]) * (q * q * (3 - 2 * q)));
        drawChar(x, 122 + (i % 3) * 4, {
          shirt: i % 2 ? C.user : [0x5a, 0x6b, 0x80], shirtD: C.userD, skin: C.skinU,
          pants: [0x2c, 0x33, 0x40], t: T + i, walk: q < 1, bob: q >= 1, bobRate: 5 + i,
          talk: (Math.floor(T * 11 + i) % 2 === 0), armRaise: (i % 2) ? 4 : 0,
        });
      }
      shake = 1.6 + Math.sin(T * 30) * 0.9;
      camZoom = 1.24;
      // stress streaks in the accent colour
      for (let s = 0; s < 40; s++) {
        const a = rnd(), yy = (rnd() * OH) | 0, xx = (rnd() * OW) | 0;
        if (a < 0.55) wset(xx, yy, C.accent, 0.18 * rnd());
      }
    }
  }

  // ---------------- camera resample (nearest) + 5x upscale ----------------
  const sx = Math.sin(T * 47) * shake, sy = Math.cos(T * 39) * shake;
  for (let y = 0; y < H; y++) {
    const wy0 = (y / SCALE - OH / 2) / camZoom + camY + sy;
    let wy = wy0 | 0; if (wy < 0) wy = 0; else if (wy >= OH) wy = OH - 1;
    const row = wy * OW;
    for (let x = 0; x < W; x++) {
      const wx0 = (x / SCALE - OW / 2) / camZoom + camX + sx;
      let wx = wx0 | 0; if (wx < 0) wx = 0; else if (wx >= OW) wx = OW - 1;
      const si = (row + wx) * 3, di = (y * W + x) * 3;
      out[di] = world[si]; out[di + 1] = world[si + 1]; out[di + 2] = world[si + 2];
    }
  }

  // ---------------- bubbles + Thai text (full res) ----------------
  // world -> screen, so bubbles stay attached through zoom and shake
  const w2sx = (wx) => (wx - camX - sx) * camZoom * SCALE + W / 2;
  const w2sy = (wy) => (wy - camY - sy) * camZoom * SCALE + H / 2;
  const clampX = (v, id) => {
    const half = TEXT[id].w / 2 + 40;
    return Math.max(half + 10, Math.min(W - half - 10, v));
  };
  if (!closing) {
    const UB = w2sy(82) - 24, PB = w2sy(74) - 24;
    bubble('u1', clampX(w2sx(USER_STAND + 14), 'u1'), UB, C.user, balpha('u1'), 1);
    bubble('p1', clampX(w2sx(PHUM_X + 12), 'p1'), PB, C.accent, balpha('p1'), -1);
    if (B.u2) bubble('u2', clampX(w2sx(USER_STAND + 14), 'u2'), UB, C.user, balpha('u2'), 1);
    if (B.p2) bubble('p2', clampX(w2sx(PHUM_X + 12), 'p2'), PB, C.accent, balpha('p2'), -1);
    bubble('p3', clampX(w2sx(PHUM_X + 12), 'p3'), PB, C.accent, balpha('p3'), -1);
    bubble('p4', clampX(w2sx(PHUM_X + 12), 'p4'), PB, C.accent, balpha('p4'), -1);
    bubble('u3', clampX(w2sx(USER_STAND + 14), 'u3'), UB, C.user, balpha('u3'), 1);

    if (at('crowd')) {
      const p = prog('crowd');
      const cb = [
        ['c1', 340, 208, 0.04], ['c2', 690, 168, 0.16], ['c3', 1000, 246, 0.28],
        ['c4', 470, 330, 0.40], ['c5', 860, 352, 0.52], ['c6', 1040, 452, 0.64],
        ['c7', 260, 396, 0.76],
      ];
      for (const [id, bx, by, d] of cb) {
        if (p < d) continue;
        const age = p - d;
        // flicker so the pile-up reads as noise rather than a tidy list
        const fl = 0.55 + 0.45 * Math.sin((T + d * 9) * 26);
        const a = Math.min(1, age * 8) * (0.75 + 0.25 * fl);
        bubble(id, bx, by, id === 'c5' ? C.accent : C.user, a, bx > 640 ? 1 : -1);
      }
    }
  } else {
    const p = prog('close');
    const t = TEXT.final;
    const a = Math.min(1, Math.max(0, (p - 0.28) * 3.2));
    // scrim so the line never fights the coral shoulder behind it
    for (let y = 545; y < H; y++) {
      const s = Math.min(1, (y - 545) / 55) * 0.82 * Math.min(1, a * 1.4);
      orect(0, y, W, 1, [0x04, 0x05, 0x07], s);
    }
    const tx = Math.round(W / 2 - t.w / 2), ty = 604;
    blitText('final', tx, ty, C.ink, a);
    if (a > 0.2) orect(tx, ty + t.h + 12, Math.round(t.w * Math.min(1, (p - 0.3) * 2.4)), 4, C.accent, 0.85);
  }

  // ---------------- grade: vignette + light grain ----------------
  for (let y = 0; y < H; y++) {
    const vy = (y - H / 2) / (H / 2);
    for (let x = 0; x < W; x++) {
      const vx = (x - W / 2) / (W / 2);
      const vig = 1 - 0.38 * (vx * vx + vy * vy);
      const i = (y * W + x) * 3;
      const n = (rnd() - 0.5) * 5;
      out[i] = Math.max(0, Math.min(255, out[i] * vig + n));
      out[i + 1] = Math.max(0, Math.min(255, out[i + 1] * vig + n));
      out[i + 2] = Math.max(0, Math.min(255, out[i + 2] * vig + n));
    }
  }

  // fades: open from black, close to black
  let fade = 1;
  if (T < 0.5) fade = T / 0.5;
  if (T > TOTAL - 0.6) fade = Math.max(0, (TOTAL - T) / 0.6);
  // hard cut flash into the overload beat
  if (B.crowd && T >= B.crowd.a && T < B.crowd.a + 0.09) fade = 1 + (1 - (T - B.crowd.a) / 0.09) * 1.6;
  if (fade !== 1) {
    for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, out[i] * fade));
  }

  process.stdout.write(out);
}
process.stderr.write(`${VARIANT}: ${FRAMES} frames / ${TOTAL.toFixed(2)}s\n`);
