[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rebahan149/best-cooking-game-20261125-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rebahan149/best-cooking-game-20261125-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Sizzle & Stack — a two-minute diner rush

An original cooking game built for the make.fun bounty [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137). You run a tiny diner counter through one 120-second shift: read the order board, grill patties and eggs golden, stack each dish layer-for-layer in ticket order, and serve before the customer's patience bar empties. Reach 300 coins before the clock dies — three walk-outs end the day early.

## How to play

Serve the game folder with any static server (or `node serve.ts` from this repo) and open `game/index.html` in desktop Chrome. No build step, no network requests.

- **Order board** (top): each ticket shows the dish, its exact layer stack, its price, and a draining patience bar.
- **Counter bins**: click a bin — or press its key **1–8** — to add an ingredient. Patties and eggs go onto the **grill** instead.
- **Grill**: two slots with a cook meter. Click a slot when the item is in the golden window to move it, cooked, onto your stack. Too soon is raw; too late is burnt and goes in the bin.
- **Your stack**: layers pile on the plate in the order you add them. A serve only rings up when the stack matches a ticket exactly, grilled layers cooked.
- **Serve** with the SERVE button or **Enter/Space**. **Backspace** bins the plate and starts over. **P** pauses.
- Serving fast earns a patience bonus; consecutive serves build a **combo multiplier** up to ×5. A wrong serve or a walk-out resets the combo.
- Five dishes unlock as you serve more: Classic Stack, Garden Stack, Sunrise Stack, Crispy Melt, and the Double Decker. Later in the shift the board holds more tickets, patience runs shorter, and orders arrive faster.

## Layout of this entry

- `main.ts` — the handover program: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/` — the playable game as static files (`index.html` plus ES modules under `game/src/`: config, random, world, render, shots, main). All art is flat vector shapes drawn on canvas; there are no external assets.
- `screenshots/` — three real renders of the game (`?shot=start|play|end&seed=1`): the title, a mid-rush shift with three tickets up and a stack one layer from done, and a won shift's results.
- `shots.json` — the screenshot scenes those renders came from.
- `serve.ts` — a tiny local static server for play-testing.

## License

MIT — see `LICENSE`.
