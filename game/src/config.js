// Sizzle & Stack — every tuning number, colour and recipe in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second at any display rate. */
export const STEP = 1 / 60;

/** A shift lasts this long; reach the coin target before it ends to win the day. */
export const SHIFT = { seconds: 120, coinTarget: 300 };

export const STARS_START = 3;

/**
 * Ingredients. `grill: true` items start raw and must spend time on the grill:
 * raw until cookTime, perfect until burnTime, burnt after that. A burnt item
 * can only be trashed. `layer` is the drawn height of one slice on the plate.
 */
export const INGREDIENTS = {
  bunBottom: { name: 'Bun Base', key: '1', color: '#e0a458', dark: '#b97f36', layer: 16, price: 0 },
  patty:     { name: 'Patty',    key: '2', color: '#8a4b2a', dark: '#5f3018', layer: 18, grill: true, cookTime: 3.0, burnTime: 6.5 },
  cheese:    { name: 'Cheese',   key: '3', color: '#f6b73c', dark: '#d19322', layer: 8, price: 0 },
  lettuce:   { name: 'Lettuce',  key: '4', color: '#69b44c', dark: '#478832', layer: 10, price: 0 },
  tomato:    { name: 'Tomato',   key: '5', color: '#e2483d', dark: '#b02a21', layer: 10, price: 0 },
  egg:       { name: 'Egg',      key: '6', color: '#f7e8c9', dark: '#e8a13c', layer: 12, grill: true, cookTime: 2.4, burnTime: 5.4 },
  bacon:     { name: 'Bacon',    key: '7', color: '#b54434', dark: '#7e2a20', layer: 9, price: 0 },
  bunTop:    { name: 'Bun Top',  key: '8', color: '#eda95e', dark: '#c07f38', layer: 20, price: 0 },
};

/** The bins on the counter, left to right (also the keyboard order 1..8). */
export const BIN_ORDER = ['bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'egg', 'bacon', 'bunTop'];

/** Grill slots: patties and eggs cook here side by side. */
export const GRILL_SLOTS = 2;

/**
 * The menu. `stack` is the exact layer order, bottom first. `unlock` is the
 * number of dishes served before this dish can appear on the order board.
 * `price` is the base coins paid for a perfect serve.
 */
export const RECIPES = [
  { id: 'classic', name: 'Classic Stack', price: 40, unlock: 0, stack: ['bunBottom', 'patty', 'cheese', 'bunTop'] },
  { id: 'garden', name: 'Garden Stack', price: 48, unlock: 0, stack: ['bunBottom', 'lettuce', 'tomato', 'patty', 'bunTop'] },
  { id: 'sunrise', name: 'Sunrise Stack', price: 55, unlock: 2, stack: ['bunBottom', 'egg', 'bacon', 'cheese', 'bunTop'] },
  { id: 'blt', name: 'Crispy Melt', price: 58, unlock: 4, stack: ['bunBottom', 'bacon', 'lettuce', 'tomato', 'cheese', 'bunTop'] },
  { id: 'double', name: 'Double Decker', price: 75, unlock: 6, stack: ['bunBottom', 'patty', 'cheese', 'patty', 'cheese', 'bunTop'] },
];

/** Ticket patience (seconds) and spawn pacing, eased by difficulty below. */
export const ORDERS = {
  firstDelay: 0.8,
  spawnStart: 7.0,
  spawnMin: 3.4,
  spawnRamp: 0.045, // seconds shaved off the spawn gap per second of shift
  patienceStart: 55,
  patienceMin: 34,
  patienceRamp: 0.16, // seconds of patience lost per second of shift
  maxStart: 2,
  maxEnd: 4,
  maxRampAfter: 45, // seconds into the shift before a 3rd, then 4th, ticket fits
};

/** Coins: patience bonus is up to this fraction of the price; combo multiplies the total. */
export const SCORING = { patienceBonus: 0.5, comboStep: 0.25, comboMax: 5, wrongServePenalty: 10 };

export const PALETTE = {
  backdrop: '#17120e',
  wall: '#2b1d13',
  wallBand: '#3a2718',
  counter: '#6b4226',
  counterTop: '#8a5a33',
  steel: '#9aa3ab',
  steelDark: '#6e767e',
  grill: '#26262a',
  grillHot: '#3a2c22',
  board: '#f3e5c3',
  boardEdge: '#c9a86a',
  panel: '#241a12',
  panelEdge: '#4a3421',
  text: '#fdf6e9',
  muted: '#c9b18c',
  good: '#69b44c',
  warn: '#f6b73c',
  bad: '#e2483d',
  coin: '#f2c94c',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'sizzle-and-stack.best';
