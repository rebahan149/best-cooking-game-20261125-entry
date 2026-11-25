// Sizzle & Stack — every pixel: the diner, the board, the grill and the stack,
// drawn as flat vector shapes on one canvas. Also owns the layout, so the
// hit-test main.js uses always matches what is painted.
import { BIN_ORDER, FIELD, FONT, GRILL_SLOTS, INGREDIENTS, PALETTE, SHIFT } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export const LAYOUT = {
  hud: { x: 0, y: 0, w: FIELD.width, h: 52 },
  board: { x: 24, y: 62, w: 1232, h: 172 },
  ticket: { x: 40, y: 76, w: 290, h: 146, gap: 16 },
  bins: { x: 24, y: 248, w: 149, h: 96, gap: 6 },
  grill: { x: 24, y: 462, w: 430, h: 182 },
  grillSlot: { x: 46, y: 516, w: 178, h: 104, gap: 24 },
  plate: { cx: 742, baseY: 636, w: 300 },
  serve: { x: 1012, y: 470, w: 224, h: 78 },
  trash: { x: 1012, y: 562, w: 224, h: 62 },
};

/** What is under a field point: a bin, a grill slot, a button, or nothing. */
export function hitTest(x, y) {
  const b = LAYOUT.bins;
  for (let i = 0; i < BIN_ORDER.length; i += 1) {
    const bx = b.x + i * (b.w + b.gap);
    if (x >= bx && x <= bx + b.w && y >= b.y && y <= b.y + b.h) return { type: 'bin', id: BIN_ORDER[i] };
  }
  const g = LAYOUT.grillSlot;
  for (let slot = 0; slot < GRILL_SLOTS; slot += 1) {
    const gx = g.x + slot * (g.w + g.gap);
    if (x >= gx && x <= gx + g.w && y >= g.y && y <= g.y + g.h) return { type: 'grill', slot };
  }
  const s = LAYOUT.serve;
  if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return { type: 'serve' };
  const t = LAYOUT.trash;
  if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) return { type: 'trash' };
  return null;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = 600) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

/** One ingredient drawn as a layer of width `w` sitting on baseline `baseY`; returns its height. */
export function drawLayer(ctx, id, done, cx, baseY, w) {
  const spec = INGREDIENTS[id];
  const h = spec.layer * (w / 190);
  const x = cx - w / 2;
  ctx.save();
  if (id === 'bunBottom') {
    ctx.fillStyle = spec.color;
    roundRect(ctx, x, baseY - h, w, h, 6); ctx.fill();
    ctx.fillStyle = spec.dark;
    roundRect(ctx, x, baseY - 4, w, 4, 2); ctx.fill();
  } else if (id === 'bunTop') {
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 2, w / 2, h + 6, 0, Math.PI, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fdf6e9';
    for (const [dx, dy] of [[-0.28, -0.62], [0, -0.8], [0.3, -0.58], [-0.12, -0.4], [0.16, -0.34]]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * w, baseY - 2 + dy * h, 3.4, 2, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = done === 'raw' ? '#d77a6a' : done === 'burnt' ? '#1d1512' : spec.color;
    roundRect(ctx, x + 3, baseY - h, w - 6, h, h / 2); ctx.fill();
    if (done === 'cooked') {
      ctx.strokeStyle = spec.dark; ctx.lineWidth = 2;
      for (const f of [0.3, 0.5, 0.7]) {
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.3, baseY - h + 3 + f * 2);
        ctx.lineTo(cx + w * 0.3, baseY - h + 1 + f * 2);
        ctx.stroke();
      }
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.moveTo(x, baseY - h);
    ctx.lineTo(x + w, baseY - h);
    ctx.lineTo(x + w, baseY - 2);
    ctx.lineTo(x + w * 0.78, baseY - 2);
    ctx.lineTo(x + w * 0.7, baseY + 4);
    ctx.lineTo(x + w * 0.6, baseY - 2);
    ctx.lineTo(x + w * 0.3, baseY - 2);
    ctx.lineTo(x + w * 0.22, baseY + 4);
    ctx.lineTo(x + w * 0.14, baseY - 2);
    ctx.lineTo(x, baseY - 2);
    ctx.closePath(); ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.moveTo(x, baseY - 2);
    for (let i = 0; i <= 8; i += 1) {
      const px = x + (w * i) / 8;
      const py = baseY - 2 - (i % 2 === 0 ? h : h * 0.35);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x + w, baseY - 2);
    ctx.closePath(); ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = spec.color;
    roundRect(ctx, x + 8, baseY - h, w - 16, h, 4); ctx.fill();
    ctx.fillStyle = '#f2826f';
    roundRect(ctx, x + 16, baseY - h + 2, w - 32, h - 4, 3); ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - h / 2, w / 2 - 4, h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6b73c';
    ctx.beginPath();
    ctx.arc(cx, baseY - h / 2, h * 0.52, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'bacon') {
    ctx.strokeStyle = spec.color; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const off of [-h * 0.28, h * 0.3]) {
      ctx.beginPath();
      for (let i = 0; i <= 10; i += 1) {
        const px = x + 6 + ((w - 12) * i) / 10;
        const py = baseY - h / 2 + off + Math.sin(i * 1.4) * 2.4;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
  return h;
}

function drawTicket(ctx, ticket, x, y) {
  const { w, h } = LAYOUT.ticket;
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = PALETTE.boardEdge; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10); ctx.stroke();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.arc(x + w / 2, y + 9, 5, 0, Math.PI * 2); ctx.fill();
  text(ctx, ticket.recipe.name, x + w / 2, y + 34, 21, '#3a2718', 'center', 800);
  // Mini stack, bottom layer first, on a little plate line.
  const miniW = 108;
  let cursor = y + h - 34;
  ctx.fillStyle = PALETTE.steelDark;
  roundRect(ctx, x + w / 2 - miniW / 2 - 12, cursor + 3, miniW + 24, 5, 2); ctx.fill();
  for (const layerId of ticket.recipe.stack) {
    cursor -= drawLayer(ctx, layerId, 'cooked', x + w / 2, cursor, miniW) * 0.92;
  }
  text(ctx, `${ticket.recipe.price}c`, x + 16, y + 34, 17, '#8a6d1f', 'left', 800);
  // Patience bar.
  const frac = Math.max(0, ticket.patience / ticket.patienceMax);
  const barW = w - 28;
  ctx.fillStyle = '#d8c49a';
  roundRect(ctx, x + 14, y + h - 20, barW, 9, 4); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? PALETTE.good : frac > 0.25 ? PALETTE.warn : PALETTE.bad;
  if (frac > 0) { roundRect(ctx, x + 14, y + h - 20, barW * frac, 9, 4); ctx.fill(); }
}

function drawBin(ctx, id, x, y, w, h) {
  const spec = INGREDIENTS[id];
  ctx.fillStyle = '#33241a';
  roundRect(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10); ctx.stroke();
  ctx.fillStyle = '#f7ead2';
  roundRect(ctx, x + 10, y + 10, w - 20, 44, 8); ctx.fill();
  drawLayer(ctx, id, id === 'patty' || id === 'egg' ? 'raw' : null, x + w / 2, y + 46, 86);
  text(ctx, spec.name, x + w / 2, y + 72, 16, PALETTE.text, 'center', 700);
  text(ctx, spec.grill ? `${spec.key} · grill it` : `key ${spec.key}`, x + w / 2, y + 90, 12.5, PALETTE.muted, 'center', 600);
}

function drawGrill(ctx, state, world) {
  const g = LAYOUT.grill;
  ctx.fillStyle = PALETTE.steelDark;
  roundRect(ctx, g.x, g.y, g.w, g.h, 12); ctx.fill();
  ctx.fillStyle = PALETTE.grill;
  roundRect(ctx, g.x + 10, g.y + 34, g.w - 20, g.h - 46, 10); ctx.fill();
  text(ctx, 'GRILL', g.x + 22, g.y + 27, 19, PALETTE.text, 'left', 800);
  text(ctx, 'click when golden — do not let it burn', g.x + 96, g.y + 27, 14, '#e8dcc4', 'left', 600);
  const s = LAYOUT.grillSlot;
  for (let slot = 0; slot < GRILL_SLOTS; slot += 1) {
    const x = s.x + slot * (s.w + s.gap);
    ctx.fillStyle = '#17171a';
    roundRect(ctx, x, s.y, s.w, s.h, 10); ctx.fill();
    ctx.strokeStyle = '#454b52'; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 10, s.y + (s.h * i) / 4);
      ctx.lineTo(x + s.w - 10, s.y + (s.h * i) / 4);
      ctx.stroke();
    }
    const item = state.grill[slot];
    if (!item) {
      text(ctx, 'empty', x + s.w / 2, s.y + s.h / 2 + 5, 14, '#5c646c', 'center', 600);
      continue;
    }
    const done = world.doneness(item.id, item.t);
    drawLayer(ctx, item.id, done, x + s.w / 2, s.y + s.h - 26, 128);
    // Cook meter with a golden window between cookTime and burnTime.
    const spec = INGREDIENTS[item.id];
    const total = spec.burnTime * 1.15;
    const frac = Math.min(1, item.t / total);
    const golden = spec.cookTime / total;
    const burn = spec.burnTime / total;
    const barX = x + 12;
    const barW = s.w - 24;
    ctx.fillStyle = '#3c3f45';
    roundRect(ctx, barX, s.y + s.h - 18, barW, 8, 4); ctx.fill();
    ctx.fillStyle = PALETTE.good;
    roundRect(ctx, barX + barW * golden, s.y + s.h - 18, barW * (burn - golden), 8, 4); ctx.fill();
    ctx.fillStyle = done === 'burnt' ? PALETTE.bad : '#fdf6e9';
    roundRect(ctx, barX, s.y + s.h - 18, Math.max(4, barW * frac), 8, 4); ctx.fill();
    if (done === 'cooked') {
      text(ctx, 'READY!', x + s.w / 2, s.y + 24, 17, PALETTE.good, 'center', 800);
    } else if (done === 'burnt') {
      text(ctx, 'BURNT!', x + s.w / 2, s.y + 24, 17, PALETTE.bad, 'center', 800);
    }
  }
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  text(ctx, 'YOUR STACK', p.cx, 486, 17, PALETTE.muted, 'center', 800);
  ctx.fillStyle = '#e9e2d4';
  ctx.beginPath();
  ctx.ellipse(p.cx, p.baseY, p.w / 2, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cfc4ae';
  ctx.beginPath();
  ctx.ellipse(p.cx, p.baseY - 3, p.w / 2 - 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  let cursor = p.baseY - 8;
  for (const layer of state.plate) {
    cursor -= drawLayer(ctx, layer.id, layer.done, p.cx, cursor, 196);
  }
  if (state.plate.length === 0) {
    text(ctx, 'click ingredients to build', p.cx, p.baseY - 44, 15, '#8d7c62', 'center', 600);
  }
}

function drawButtons(ctx, state) {
  const s = LAYOUT.serve;
  ctx.fillStyle = state.plate.length > 0 ? '#4d8f3a' : '#37512c';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  text(ctx, 'SERVE  ⏎', s.x + s.w / 2, s.y + 48, 27, '#fdf6e9', 'center', 800);
  const t = LAYOUT.trash;
  ctx.fillStyle = '#5a2d24';
  roundRect(ctx, t.x, t.y, t.w, t.h, 12); ctx.fill();
  text(ctx, 'BIN IT  ⌫', t.x + t.w / 2, t.y + 40, 19, '#f0c9c0', 'center', 800);
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#100b07';
  ctx.fillRect(0, 0, FIELD.width, LAYOUT.hud.h);
  text(ctx, 'SIZZLE & STACK', 24, 35, 21, PALETTE.coin, 'left', 800);
  // Shift clock with a draining bar.
  const frac = Math.max(0, state.timeLeft / SHIFT.seconds);
  const clockX = 330;
  ctx.fillStyle = '#3a2c1c';
  roundRect(ctx, clockX, 14, 300, 16, 8); ctx.fill();
  ctx.fillStyle = frac > 0.3 ? PALETTE.good : PALETTE.bad;
  if (frac > 0) { roundRect(ctx, clockX, 14, 300 * frac, 16, 8); ctx.fill(); }
  text(ctx, `${Math.ceil(state.timeLeft)}s`, clockX + 316, 29, 19, PALETTE.text, 'left', 800);
  text(ctx, `Coins ${state.coins} / ${SHIFT.coinTarget}`, 726, 35, 20, PALETTE.coin, 'left', 800);
  text(ctx, `Score ${state.score}`, 1010, 35, 20, PALETTE.text, 'left', 800);
  // Stars.
  for (let i = 0; i < 3; i += 1) {
    const cx = 1176 + i * 34;
    ctx.fillStyle = i < state.stars ? PALETTE.coin : '#4a3a24';
    ctx.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const angle = -Math.PI / 2 + (k * Math.PI) / 5;
      const radius = k % 2 === 0 ? 13 : 5.5;
      const px = cx + Math.cos(angle) * radius;
      const py = 26 + Math.sin(angle) * radius;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
}

function drawScene(ctx, state, world) {
  // Wall, band and counter.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.wallBand;
  ctx.fillRect(0, 236, FIELD.width, 8);
  ctx.fillStyle = PALETTE.counter;
  ctx.fillRect(0, 356, FIELD.width, FIELD.height - 356);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(0, 356, FIELD.width, 10);
  ctx.fillStyle = '#573a20';
  ctx.fillRect(0, 452, FIELD.width, 6);

  drawHud(ctx, state);

  // Order board.
  const b = LAYOUT.board;
  ctx.fillStyle = '#20150d';
  roundRect(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 14); ctx.fill();
  ctx.fillStyle = '#31200f';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
  text(ctx, 'ORDER BOARD', b.x + 18, b.y + 4, 15, PALETTE.muted, 'left', 800);
  if (state.tickets.length === 0) {
    text(ctx, 'Waiting for customers…', FIELD.width / 2, b.y + 100, 22, PALETTE.muted, 'center', 700);
  }
  state.tickets.forEach((ticket, i) => {
    drawTicket(ctx, ticket, LAYOUT.ticket.x + i * (LAYOUT.ticket.w + LAYOUT.ticket.gap), LAYOUT.ticket.y);
  });

  // Counter bins.
  BIN_ORDER.forEach((id, i) => {
    drawBin(ctx, id, LAYOUT.bins.x + i * (LAYOUT.bins.w + LAYOUT.bins.gap), LAYOUT.bins.y, LAYOUT.bins.w, LAYOUT.bins.h);
  });

  drawGrill(ctx, state, world);
  drawPlate(ctx, state);
  drawButtons(ctx, state);

  if (state.combo >= 2) {
    text(ctx, `COMBO x${Math.min(1 + 0.25 * state.combo, 5).toFixed(2).replace(/\.?0+$/, '')}`, LAYOUT.plate.cx, 452, 20, PALETTE.good, 'center', 800);
  }
  if (state.messageT > 0 && state.message) {
    text(ctx, state.message, FIELD.width / 2, 700, 19, PALETTE.warn, 'center', 700);
  } else {
    text(ctx, 'Keys 1–8 pick ingredients · Enter serves · Backspace bins the plate · P pauses', FIELD.width / 2, 700, 14.5, '#9a8465', 'center', 600);
  }

  // Floaters rise and fade.
  for (const floater of state.floaters) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - floater.t / 1.15);
    text(ctx, floater.text, floater.x, floater.y, 24, floater.color, 'center', 800);
    ctx.restore();
  }
}

function drawTitle(ctx, state, world, best) {
  drawScene(ctx, state, world);
  ctx.fillStyle = 'rgba(16, 10, 6, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'SIZZLE & STACK', FIELD.width / 2, 268, 76, PALETTE.coin, 'center', 800);
  text(ctx, 'the two-minute diner rush', FIELD.width / 2, 308, 24, PALETTE.text, 'center', 600);
  text(ctx, 'Read the tickets. Grill the patties golden. Stack it in order. Serve before patience runs out.', FIELD.width / 2, 372, 21, '#e8dcc4', 'center', 600);
  text(ctx, `One shift: ${SHIFT.seconds} seconds · Target: ${SHIFT.coinTarget} coins · Three walk-outs end the day`, FIELD.width / 2, 408, 19, PALETTE.muted, 'center', 600);
  ctx.fillStyle = '#4d8f3a';
  roundRect(ctx, FIELD.width / 2 - 170, 448, 340, 66, 14); ctx.fill();
  text(ctx, 'CLICK OR PRESS ENTER', FIELD.width / 2, 490, 24, '#fdf6e9', 'center', 800);
  if (best > 0) text(ctx, `Best score so far: ${best}`, FIELD.width / 2, 560, 19, PALETTE.coin, 'center', 700);
}

function drawOver(ctx, state, world, best) {
  drawScene(ctx, state, world);
  ctx.fillStyle = 'rgba(16, 10, 6, 0.8)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, state.won ? 'TARGET SMASHED!' : 'END OF SHIFT', FIELD.width / 2, 218, 58, state.won ? PALETTE.good : PALETTE.coin, 'center', 800);
  const lines = [
    `Coins earned: ${state.coins} of ${SHIFT.coinTarget} target`,
    `Dishes served: ${state.served}   ·   Walk-outs: ${state.missed}`,
    `Best combo: x${Math.min(1 + 0.25 * state.bestCombo, 5).toFixed(2).replace(/\.?0+$/, '')}`,
    `Score: ${state.score}   ·   Best: ${Math.max(best, state.score)}`,
  ];
  lines.forEach((line, i) => text(ctx, line, FIELD.width / 2, 292 + i * 42, 24, PALETTE.text, 'center', 700));
  ctx.fillStyle = '#4d8f3a';
  roundRect(ctx, FIELD.width / 2 - 190, 486, 380, 62, 14); ctx.fill();
  text(ctx, 'PRESS ENTER FOR A NEW SHIFT', FIELD.width / 2, 526, 22, '#fdf6e9', 'center', 800);
}

export function createRenderer(canvas, world) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    offsetX = (canvas.width - FIELD.width * scale) / 2;
    offsetY = (canvas.height - FIELD.height * scale) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /** Convert a client (CSS pixel) point to field coordinates. */
  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = (clientX - rect.left) * dpr;
    const py = (clientY - rect.top) * dpr;
    return { x: (px - offsetX) / scale, y: (py - offsetY) / scale };
  }

  function draw(state, screen, best) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    if (screen === SCREEN_TITLE) drawTitle(ctx, state, world, best);
    else if (screen === SCREEN_OVER) drawOver(ctx, state, world, best);
    else {
      drawScene(ctx, state, world);
      if (screen === SCREEN_PAUSED) {
        ctx.fillStyle = 'rgba(16, 10, 6, 0.66)';
        ctx.fillRect(0, 0, FIELD.width, FIELD.height);
        text(ctx, 'PAUSED', FIELD.width / 2, 380, 54, PALETTE.text, 'center', 800);
        text(ctx, 'Press P to keep cooking', FIELD.width / 2, 424, 20, PALETTE.muted, 'center', 600);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  return { draw, toField };
}
