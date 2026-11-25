// A tiny seeded random generator (mulberry32): the same seed always deals the
// same shift, which is what makes the screenshot scenes reproducible.

export function createRandom(seed) {
  let state = seed >>> 0;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** Integer in [0, n). */
    int(n) {
      return Math.floor(next() * n);
    },
    /** Pick one item from a non-empty array. */
    pick(items) {
      return items[Math.floor(next() * items.length)];
    },
  };
}
