// Sizzle & Stack — the shift itself: tickets, grill, plate, coins and stars.
// Pure logic with no DOM in it, advanced in fixed steps by main.js and staged
// directly by shots.js, so a Node test can play a whole shift headlessly.
import { GRILL_SLOTS, INGREDIENTS, ORDERS, RECIPES, SCORING, SHIFT, STARS_START } from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_MISSED = 2;
export const EVENT_OVER = 4;
export const EVENT_WRONG = 8;
export const EVENT_READY = 16;

const PLATE_MAX = 8;
/** Where floaters appear, in field coordinates (the plate and the board). */
const PLATE_POINT = { x: 880, y: 430 };
const BOARD_POINT = { x: 330, y: 120 };

export function createWorld(random) {
  const state = {
    timeLeft: SHIFT.seconds,
    elapsed: 0,
    coins: 0,
    score: 0,
    served: 0,
    missed: 0,
    stars: STARS_START,
    combo: 0,
    bestCombo: 0,
    tickets: [],
    plate: [],
    grill: new Array(GRILL_SLOTS).fill(null),
    floaters: [],
    message: '',
    messageT: 0,
    over: false,
    won: false,
    nextTicketId: 1,
    spawnIn: ORDERS.firstDelay,
  };

  function say(text, seconds = 2.2) {
    state.message = text;
    state.messageT = seconds;
  }

  function float(text, color, point) {
    state.floaters.push({ text, color, x: point.x, y: point.y, t: 0 });
  }

  function maxTickets() {
    if (state.elapsed < ORDERS.maxRampAfter) return ORDERS.maxStart;
    if (state.elapsed < ORDERS.maxRampAfter + 40) return 3;
    return ORDERS.maxEnd;
  }

  function patienceFor() {
    return Math.max(ORDERS.patienceMin, ORDERS.patienceStart - ORDERS.patienceRamp * state.elapsed);
  }

  function spawnGap() {
    return Math.max(ORDERS.spawnMin, ORDERS.spawnStart - ORDERS.spawnRamp * state.elapsed);
  }

  /** Add a ticket for `recipe` (a RECIPES entry); patienceFrac trims its clock for staged scenes. */
  function spawnTicket(recipe, patienceFrac = 1) {
    const full = patienceFor();
    state.tickets.push({ id: state.nextTicketId, recipe, patience: full * patienceFrac, patienceMax: full });
    state.nextTicketId += 1;
  }

  function spawnRandom() {
    const open = RECIPES.filter((recipe) => state.served >= recipe.unlock);
    spawnTicket(random.pick(open));
  }

  function reset() {
    state.timeLeft = SHIFT.seconds;
    state.elapsed = 0;
    state.coins = 0;
    state.score = 0;
    state.served = 0;
    state.missed = 0;
    state.stars = STARS_START;
    state.combo = 0;
    state.bestCombo = 0;
    state.tickets = [];
    state.plate = [];
    state.grill = new Array(GRILL_SLOTS).fill(null);
    state.floaters = [];
    state.message = '';
    state.messageT = 0;
    state.over = false;
    state.won = false;
    state.nextTicketId = 1;
    state.spawnIn = ORDERS.firstDelay;
  }

  /** Doneness of a grill item after `t` seconds: 'raw', 'cooked' or 'burnt'. */
  function doneness(id, t) {
    const spec = INGREDIENTS[id];
    if (t < spec.cookTime) return 'raw';
    if (t <= spec.burnTime) return 'cooked';
    return 'burnt';
  }

  /** Click a counter bin: cold items go on the plate, grill items go on the grill. */
  function addFromBin(id) {
    if (state.over) return;
    const spec = INGREDIENTS[id];
    if (!spec) return;
    if (spec.grill) {
      const slot = state.grill.indexOf(null);
      if (slot === -1) {
        say('The grill is full!');
        return;
      }
      state.grill[slot] = { id, t: 0, readyPinged: false };
      return;
    }
    if (state.plate.length >= PLATE_MAX) {
      say('That plate is full — serve it or bin it.');
      return;
    }
    state.plate.push({ id, done: null });
  }

  /** Click a grill slot: a cooked item moves to the plate, a burnt one is binned. */
  function takeGrill(slot) {
    if (state.over) return;
    const item = state.grill[slot];
    if (!item) return;
    const done = doneness(item.id, item.t);
    if (done === 'raw') {
      say('Still cooking…');
      return;
    }
    state.grill[slot] = null;
    if (done === 'burnt') {
      float('Burnt!', '#e2483d', PLATE_POINT);
      say('Burnt — into the bin it goes.');
      return;
    }
    if (state.plate.length >= PLATE_MAX) {
      say('That plate is full — serve it or bin it.');
      state.grill[slot] = item;
      return;
    }
    state.plate.push({ id: item.id, done: 'cooked' });
  }

  function trashPlate() {
    if (state.over) return;
    if (state.plate.length === 0) return;
    state.plate = [];
    say('Plate cleared.');
  }

  /** Does the plate exactly match this recipe, layer for layer, grill items cooked? */
  function matches(plate, recipe) {
    if (plate.length !== recipe.stack.length) return false;
    for (let i = 0; i < plate.length; i += 1) {
      if (plate[i].id !== recipe.stack[i]) return false;
      if (INGREDIENTS[plate[i].id].grill && plate[i].done !== 'cooked') return false;
    }
    return true;
  }

  /** Serve the plate: the first ticket it matches exactly is rung up. */
  function serve() {
    if (state.over) return 0;
    if (state.plate.length === 0) {
      say('Build a stack first!');
      return 0;
    }
    const index = state.tickets.findIndex((ticket) => matches(state.plate, ticket.recipe));
    if (index === -1) {
      state.combo = 0;
      state.score = Math.max(0, state.score - SCORING.wrongServePenalty);
      say('No ticket matches that stack!');
      return EVENT_WRONG;
    }
    const ticket = state.tickets[index];
    const fresh = ticket.patience / ticket.patienceMax;
    const multiplier = Math.min(1 + SCORING.comboStep * state.combo, SCORING.comboMax);
    const earned = Math.round(ticket.recipe.price * (1 + SCORING.patienceBonus * fresh) * multiplier);
    state.coins += earned;
    state.score += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.tickets.splice(index, 1);
    state.plate = [];
    float(`+${earned}`, '#f2c94c', PLATE_POINT);
    if (state.combo >= 3) float(`Combo x${multiplier.toFixed(2).replace(/\.?0+$/, '')}`, '#69b44c', { x: PLATE_POINT.x, y: PLATE_POINT.y - 34 });
    return EVENT_SERVED;
  }

  function endShift(won) {
    state.over = true;
    state.won = won;
  }

  function step(dt) {
    if (state.over) return 0;
    let events = 0;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.messageT > 0) state.messageT -= dt;

    // Grill: items cook, then burn. Ping once when one turns perfect.
    for (let slot = 0; slot < GRILL_SLOTS; slot += 1) {
      const item = state.grill[slot];
      if (!item) continue;
      item.t += dt;
      if (!item.readyPinged && doneness(item.id, item.t) === 'cooked') {
        item.readyPinged = true;
        float('Ready!', '#69b44c', { x: 300 + slot * 150, y: 430 });
        events |= EVENT_READY;
      }
    }

    // Tickets: patience drains; an empty bar walks out and costs a star.
    for (let i = state.tickets.length - 1; i >= 0; i -= 1) {
      const ticket = state.tickets[i];
      ticket.patience -= dt;
      if (ticket.patience <= 0) {
        state.tickets.splice(i, 1);
        state.missed += 1;
        state.stars -= 1;
        state.combo = 0;
        float('Walked out!', '#e2483d', BOARD_POINT);
        events |= EVENT_MISSED;
      }
    }

    // New customers arrive while there is room on the board.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      if (state.tickets.length < maxTickets()) spawnRandom();
      state.spawnIn = spawnGap();
    }

    for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
      state.floaters[i].t += dt;
      state.floaters[i].y -= 26 * dt;
      if (state.floaters[i].t > 1.15) state.floaters.splice(i, 1);
    }

    if (state.stars <= 0) {
      endShift(false);
      events |= EVENT_OVER;
    } else if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endShift(state.coins >= SHIFT.coinTarget);
      events |= EVENT_OVER;
    }
    return events;
  }

  return { state, reset, step, addFromBin, takeGrill, trashPlate, serve, spawnTicket, doneness };
}
