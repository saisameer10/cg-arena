# CG Arena

A self-hosted, CodinGame-style bot arena. Write a bot in the browser (or any editor), run it against a boss AI or against your own previous version, and step through a full-information replay with your bot's debug output turn by turn.

```
npm start            # http://localhost:3000
node cli.js tron my_bot.py boss:bronze --games 20      # batch win-rate testing
```

No npm dependencies. Needs Node 18+. Bots can be Python, JavaScript, Java or C++; languages are detected at startup and listed in the server's console output.

| Language | Needs | Windows install |
|---|---|---|
| Python 3 | `python` on PATH | `winget install Python.Python.3.12` |
| JavaScript | nothing (uses Node) | – |
| Java | a JDK (found via `JAVA_HOME`, PATH, or the usual `C:\Program Files\...\jdk-*` folders) | `winget install Microsoft.OpenJDK.21` |
| C++ | `g++` on PATH | `winget install MSYS2.MSYS2` then `pacman -S mingw-w64-ucrt-x86_64-gcc`, or install MinGW-w64 |

## Daily workflow: write, run, iterate

1. `npm start`, open http://localhost:3000.
2. Pick the game and language. The editor loads the starter code; your edits autosave in the browser per game and language. **Reset code** brings the starter back.
3. Set **Player 0 = My code**, **Player 1 = a boss** (or the reverse to play second, or *My code* in both slots to play yourself). Pick a seed to replay the same map.
4. **▶ Play** (Ctrl+Enter). The match streams live. Scrub the slider to any turn and read the three tabs: your bot's stderr (**Console**), the exact lines sent and received (**Input / Output**), and the referee's log (**Game log**). An illegal order or timeout ends the game with the reason.
5. Keep your bots as files too: anything in `my-bots/` is git-ignored, and the CLI runs files directly, so you can edit in your own IDE and batch-test:

```
node cli.js ocean-of-code my-bots/sub.java boss:silver --games 20 --seed 100
```

The **Time ×** box multiplies the per-turn limit while debugging (set it back to 1 before trusting a result).

## Where opponents come from (so there is always someone to fight)

CodinGame's own boss bots are not public, so the arena draws opponents from four sources:

1. **Built-in bosses** (`games/<game>/bosses/`): hand-written heuristic bots at wood / bronze / silver strength, always available. They are ordinary bots, so you can read and improve them.
2. **Your saved versions**: the **Arena** tab (or `node cli.js submit`) stores a snapshot of your code in `arena/<game>/bots/`. Every snapshot becomes a rated opponent. Run the arena and each version plays the bosses and the other versions, alternating sides, with an Elo leaderboard. This is the self-sustaining supply: the better your bot gets, the stronger the pool it has to beat.
3. **Any bot source you drop in**: a `.js` or `.py` file from a friend or from a public post-mortem repository goes into `games/<game>/bosses/` with one line in `game.json`; a bot in any supported language (Java, C++ too) goes into the pool with `node cli.js submit`, which compiles it on each run.
4. **Bots written on request**: ask for a search-based boss (minimax, beam search, MCTS) for a game and it can be added as a new level.

```
node cli.js submit ocean-of-code my-bots/sub.java --name "v3 tracker"
node cli.js arena ocean-of-code my-bots/sub_v4.java --opponents all --games 6 --league wood1
node cli.js pool ocean-of-code                         # leaderboard
node cli.js ocean-of-code my-bots/sub_v4.java pool:<id> --games 4   # watchable match vs a saved version
```

Unsaved code is measured but not rated; saved versions and bosses move on the Elo ladder (K = 32). The pool lives in `arena/` and is committed with the repo, so your history travels with it.

## Giving a new challenge

Fill in [`challenges/TEMPLATE.md`](challenges/TEMPLATE.md) and read [`docs/ADDING_A_CHALLENGE.md`](docs/ADDING_A_CHALLENGE.md). Short version: paste the statement **as text** from the CodinGame IDE, with the Game Protocol tables kept exact, add the starter code, say which league rules apply, and link the official referee repo if there is one. PDFs and screenshots are a fallback, not the preferred route.

## How it works

```
 browser IDE (web/)                server (server/index.js)              bot processes
 ┌────────────────────┐   POST /api/match   ┌──────────────────────┐   stdin/stdout   ┌──────────┐
 │ Monaco editor      │ ──────────────────► │ engine/match.js      │ ◄──────────────► │ your bot │
 │ statement          │   NDJSON stream of  │  referee loop        │                  └──────────┘
 │ replay viewer      │ ◄────────────────── │  timeouts, DQ        │ ◄──────────────► ┌──────────┐
 │ console / IO tabs  │   start/frame/end   │ games/<id>/referee   │                  │ boss bot │
 └────────────────────┘                     └──────────────────────┘                  └──────────┘
```

- **Protocol** is exactly CodinGame's: the referee writes input lines to the bot's stdin, the bot prints its action to stdout, stderr goes to the console panel. A CodinGame bot runs here unchanged, and vice versa.
- **Referee** (`games/<id>/referee.js`) owns the rules: inputs, legal actions, scoring, viewer frames. Timeouts and invalid actions eliminate the player with an explicit reason.
- **Bosses** are ordinary bots (`games/<id>/bosses/`). Levels are the same file with an argument.
- **Viewer** (`games/<id>/viewer.js`) draws one frame on a canvas; the engine records every frame, so you can scrub back and forth.
- **CLI** runs the same engine headless for batch testing (like cg-brutaltester) and can dump replays as JSON.

## Games included

| Game | Protocol | Bosses |
|---|---|---|
| `tron` – Tron Battle | 30×20 grid, `UP/DOWN/LEFT/RIGHT` | wood (random), bronze (flood fill), silver (Voronoi) |
| `ocean-of-code` – Ocean of Code | 15×15 map, `MOVE/SURFACE/TORPEDO/SONAR/SILENCE/MINE/TRIGGER` | wood (random patrol), bronze (tracks you, sonar, torpedoes), silver (+ silence, mines) |

Ocean of Code is a port of the official referee ([CodinGameCommunity/ocean-of-code](https://github.com/CodinGameCommunity/ocean-of-code)): same league rules (Wood 2 / Wood 1 / Bronze+ selectable in the UI), same validation order and error messages, same "skip invalid, else SURFACE" behaviour, and the same map generator through a port of `java.util.Random`, so a seed taken from a CodinGame replay gives the same map here. The bosses are this repo's own heuristic bots; CodinGame's boss bots are not public.

## Adding a game

1. Create `games/<id>/` with `game.json`, `referee.js`, `statement.md`, `viewer.js`, `starters/`, `bosses/`.
2. `referee.js` exports a class extending `games/base.js` `Referee` with
   `static meta = { playerCount, firstTurnTimeout, turnTimeout, maxTurns, viewer }` and these methods:
   `getStaticInfo()` (sent once to the viewer: map, sizes), `getInitInput(p)`, `getActors()` (player indexes acting this engine turn: all alive players for simultaneous games, one for alternating games), `getTurnInput(p)`, `outputLines(p)` (lines read back, default 1), `applyOutput(p, lines)` (throw `GameError` for an illegal action), `onDisqualify(p, reason)`, `endTurn()`, `isGameOver()`, `getFrame()`, `getResult()` → `{scores, winner}`.
   The constructor receives `{ seed, playerCount, league }`; `league` is one of the ids in `game.json`'s optional `leagues: [{ id, name, default }]`.
3. `viewer.js` registers `window.CGViewers[<viewer id>] = { render(ctx, w, h, static, frame, info), hud(...) }`.
4. Restart the server. The game appears in the dropdown.

### Porting a real CodinGame puzzle
CodinGame open-sourced its game engine (`codingame-game-engine` on GitHub) and many referees are public (Java): Ocean of Code is `CodinGameCommunity/ocean-of-code`, the official contests live under the `CodinGame` organisation (for example `CodinGame/SpringChallenge2020` is Pac-Man). Two options:

- **Re-implement in JS** (what this repo does): small, fast, one file per game, but rules can drift from the original.
- **Wrap the official Java referee**: add a `java` referee type that launches the SDK runner and converts its JSON replay into frames. Exact fidelity with the original rules and maps. Needs a JDK and Maven.

## Roadmap (not done yet)

- **Sandboxing**: bots are plain local processes. For a shared server, run each bot in a container (Docker/gVisor) with CPU, memory, network and time limits. `server/runner/languages.js` is the single place where run commands live, so swapping `python` for `docker run …` is contained.
- **Accounts, submissions, leaderboard**: store submissions, run round-robin or TrueSkill matches in a worker queue, show a ladder per league, promote on beating the boss. The engine already returns scores/winner per match.
- **More games**: port other CodinGame multiplayer puzzles (Coders Strike Back, Hypersonic, Code of Kutulu, …).
- **Multi-player (3–4 bots)** is supported by the engine (`playerCount` in meta); the UI currently exposes two slots.
