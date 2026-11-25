// A working best-game-01 entry (Node 22, standard library only): the game is this directory's
// game/ folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and the program hands it in. It copies game/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library. A starting point, not a winner: Block Dodger, a
// plain 2D canvas game where a paddle dodges falling blocks and catches coins, with a title screen,
// score, lives and levels, game over and restart, flat colours and no sound. Build your own game
// (any genre, any library you vendor under game/, or none), put your 3 or 4 PNG or JPEG screenshots
// in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Sizzle & Stack hands in a small notes file of its own next to the dossier:
// what the game is, how a shift is scored and which keys drive the kitchen,
// so a reader of the output folder knows the rules without opening the game.
const entryNotes = {
  title: 'Sizzle & Stack — a two-minute diner rush',
  genre: 'cooking / time-management',
  shift_seconds: 120,
  coin_target: 300,
  scoring:
    'Serve a plate that matches a ticket layer for layer: base price plus up to 50% patience bonus, times the combo multiplier (1 + 0.25 per consecutive serve, capped at x5). A wrong serve costs 10 points and breaks the combo.',
  controls: {
    mouse: 'click an ingredient bin, the grill or the plate to work the line',
    keys_1_to_8: 'pick an ingredient bin',
    g: 'take the finished item off the grill',
    enter_or_space: 'serve the plate',
    backspace: 'bin the plate and start over',
    p_or_escape: 'pause',
  },
};
writeFileSync(join(out, 'entry-notes.json'), JSON.stringify(entryNotes, null, 2) + '\n');
