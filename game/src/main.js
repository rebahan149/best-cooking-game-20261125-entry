// Sizzle & Stack — boot and the one loop: input is read every frame, the world
// advances in fixed 1/60 s steps, and the renderer paints what is there. The
// game moves between four screens: title, play, paused and end of shift.
//
// ?seed=N fixes the ticket pattern. ?shot=start|play|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, INGREDIENTS, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_MISSED, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { createRenderer, hitTest, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas, world);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Shift started. First customers are on their way.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(world.state.won ? `Shift won with ${world.state.coins} coins.` : `Shift over. Score ${world.state.score}.`);
  }

  function togglePause() {
    if (screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function confirm() {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
    else if (screen === SCREEN_PLAY) {
      const events = world.serve();
      if (events & EVENT_WRONG) announce('No ticket matches that stack.');
      else if (events & EVENT_SERVED) announce(`Served. ${world.state.coins} coins.`);
    }
  }

  function actOn(hit) {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY || !hit) return;
    if (hit.type === 'bin') world.addFromBin(hit.id);
    else if (hit.type === 'grill') world.takeGrill(hit.slot);
    else if (hit.type === 'serve') confirm();
    else if (hit.type === 'trash') world.trashPlate();
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = renderer.toField(event.clientX, event.clientY);
    actOn(hitTest(point.x, point.y));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      confirm();
      return;
    }
    if (event.code === 'Backspace' || event.code === 'Delete') {
      event.preventDefault();
      if (screen === SCREEN_PLAY) world.trashPlate();
      return;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') {
      togglePause();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    for (const id of Object.keys(INGREDIENTS)) {
      if (event.key === INGREDIENTS[id].key) {
        world.addFromBin(id);
        return;
      }
    }
    if (event.key === 'g' || event.key === 'G') {
      // Take the first grill slot that is holding something.
      const slot = world.state.grill.findIndex((item) => item !== null);
      if (slot !== -1) world.takeGrill(slot);
    }
  });

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_OVER) endGame();
    else if (events & EVENT_MISSED) announce(`A customer walked out. ${world.state.stars} stars left.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  world.reset();
  announce('Sizzle and Stack. Press Enter or click to start your shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
