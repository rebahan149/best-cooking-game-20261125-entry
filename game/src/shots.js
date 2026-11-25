// The screenshot scenes behind ?shot=start|play|end. Each one arranges a real
// shift with the world's own rules and state — the same tickets, grill and
// plate the player uses — so the frame is what the game really looks like,
// and the same seed always gives the same frame.
import { RECIPES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function recipe(id) {
  return RECIPES.find((entry) => entry.id === id);
}

/** Mid-rush tableau: three tickets up, a Classic one layer from done, an egg ready on the grill. */
function stagePlay(world) {
  const state = world.state;
  world.reset();
  state.elapsed = 46;
  state.timeLeft = 74;
  state.coins = 172;
  state.score = 236;
  state.served = 4;
  state.combo = 2;
  state.bestCombo = 3;
  world.spawnTicket(recipe('classic'), 0.82);
  world.spawnTicket(recipe('sunrise'), 0.55);
  world.spawnTicket(recipe('garden'), 0.34);
  state.plate = [
    { id: 'bunBottom', done: null },
    { id: 'patty', done: 'cooked' },
    { id: 'cheese', done: null },
  ];
  state.grill[0] = { id: 'patty', t: 1.7, readyPinged: false };
  state.grill[1] = { id: 'egg', t: 3.1, readyPinged: true };
  state.floaters = [{ text: '+58', color: '#f2c94c', x: 880, y: 430, t: 0.35 }];
  return { screen: SCREEN_PLAY, best: 0 };
}

/** The end of a good day: target beaten, board still warm. */
function stageEnd(world) {
  const state = world.state;
  world.reset();
  state.elapsed = 120;
  state.timeLeft = 0;
  state.coins = 342;
  state.score = 486;
  state.served = 9;
  state.missed = 1;
  state.stars = 2;
  state.bestCombo = 5;
  state.over = true;
  state.won = true;
  world.spawnTicket(recipe('double'), 0.6);
  state.plate = [
    { id: 'bunBottom', done: null },
    { id: 'patty', done: 'cooked' },
  ];
  return { screen: SCREEN_OVER, best: 486 };
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  if (name === 'play') return stagePlay(world);
  if (name === 'end') return stageEnd(world);
  world.reset();
  world.spawnTicket(recipe('classic'), 0.9);
  world.spawnTicket(recipe('garden'), 0.65);
  world.state.plate = [
    { id: 'bunBottom', done: null },
    { id: 'patty', done: 'cooked' },
    { id: 'cheese', done: null },
  ];
  return { screen: SCREEN_TITLE, best: 0 };
}
