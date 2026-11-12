# CG Arena

A self-hosted, CodinGame-style platform on your own machine. Give it a CodinGame challenge (a link, a PDF, screenshots or text), write your bot in the browser or any editor, and play it the way CodinGame does:

- **multiplayer games**: battle 1 vs 1 against bosses or your own saved versions, in leagues, with an Elo arena;
- **solo puzzles**: run every test case plus unlimited generated levels, like CodinGame's hidden validators;
- **classic puzzles**: input/output tests with the first wrong line pointed out.

After every game a **Review** names the decisions that cost it (the turn, the move, what would have worked), and batches of games or tests show **patterns**: the same mistake recurring across games.

```
start-arena.bat      # Windows: double-click; or: npm start   ->  http://localhost:3000
node cli.js          # every command, with the list of challenges
```

No npm dependencies. Needs Node 18+. Bots can be Python, JavaScript, Java or C++; languages are detected at startup and listed in the server's console output.

| Language | Needs | Windows install |
|---|---|---|
| Python 3 | `python` (or `python3`) on PATH | `winget install Python.Python.3.12` |
| JavaScript | nothing (uses Node) | – |
| Java | a JDK (found via `JAVA_HOME`, PATH, or the usual `C:\Program Files\...\jdk-*` folders) | `winget install Microsoft.OpenJDK.21` |
| C++ | `g++` on PATH | `winget install MSYS2.MSYS2` then `pacman -S mingw-w64-ucrt-x86_64-gcc`, or install MinGW-w64 |

## Challenge kinds

| Kind | CodinGame type | Your opponent | Example here |
|---|---|---|---|
| **multi** | Bot programming (`ARENA`) | bosses (wood / bronze / silver), your saved versions, the arena | `ocean-of-code`, `tron` |
| **solo** | Interactive puzzle (`SOLO`), optimization (`OPTIM`) | test levels + random levels from a generator, each proven solvable | `the-bridge-episode-2` |
| **io** | Classic puzzle (`CODE`), Clash of Code | test input/output files | `temperatures` |

## Daily workflow: write, run, iterate

1. Start the arena (`start-arena.bat` or `npm start`) and open http://localhost:3000.
2. Pick the challenge and language. The editor loads the starter code; your edits autosave in the browser per challenge and language. **Reset code** brings the starter back. The left panel shows the **original statement** (once fetched) or our notes.
3. Multiplayer: set **Player 0 = My code**, **Player 1 = a boss** (or the reverse to play second, or a saved version). Solo/classic: pick a **Test case** (or *Random level* with any seed).
4. **▶ Play** (Ctrl+Enter). The game streams live. Scrub to any turn and read the tabs: your stderr (**Console**), the exact lines sent and received (**Input / Output**), the referee's log (**Game log**), and the **Review** with *go to turn* buttons. Solo puzzles also have **Tests → Run all tests**, with a pass/fail table and patterns across tests.
5. Keep your bots as files too: anything in `my-bots/` is git-ignored, and the CLI runs files directly:

```
node cli.js ocean-of-code my-bots/sub.java boss:silver --games 20 --seed 100 --league wood1
node cli.js the-bridge-episode-2 my-bots/Bridge.java --test all --random 20
node cli.js temperatures my-bots/Temps.java
```

The **Time ×** box (`--timeout-mult`) multiplies the per-turn limit while debugging; set it back to 1 before trusting a result. The first turn gets an extra boot allowance for starting Java/Python, which CodinGame does not charge to you either.

## Opponents: bosses, your logic, the arena

CodinGame's own boss bots are not public, so opponents come from:

1. **Built-in bosses** (`games/<game>/bosses/`): written for this repo at wood / bronze / silver strength, legal in every league, with a verified strength ladder. They are ordinary bots you can read.
2. **Your logic, saved as versions**: the **Arena** tab (or `node cli.js submit`) stores a snapshot of your code in `arena/<game>/`. Every version becomes a rated opponent; **Run arena** plays your code against the bosses and your versions, alternating sides, with an Elo leaderboard and the patterns in your losses. The better your bot gets, the stronger the pool it has to beat.
3. **Any bot you drop in**: a friend's bot or one from a public post-mortem, via `node cli.js submit` (any language) or as a new boss level.
4. **Solo puzzles**: the opponent is the test suite plus generated levels; each level is proven solvable by a reference solver, which also powers the review (spoiler files are marked as such).

```
node cli.js submit ocean-of-code my-bots/sub.java --name "v3 tracker"
node cli.js arena ocean-of-code my-bots/sub_v4.java --opponents all --games 6 --league wood1
node cli.js pool ocean-of-code                         # leaderboard
node cli.js ocean-of-code my-bots/sub_v4.java pool:<id> --games 4   # watchable match vs a saved version
```

## Review and patterns (improving your logic)

Every referee implements a review. Examples: The Bridge replays your commands through its solver and names the first command after which the level could no longer be won, with the commands that would still have won. Tron compares the area your move left you with the best alternative. Ocean of Code reports self-damage, forced surfaces, skipped orders and wasted devices. The engine adds timing risks (turns over 70 % of the limit) and stray stdout lines for every game.

Each review item has a stable code, so batches show **patterns**: `node cli.js ... --games 20`, `arena`, `--test all` and the UI's Tests/Arena panels list which mistakes recur and how often. Ask Claude Code in this folder to coach your bot (`.claude/skills/coach-bot/SKILL.md`): it runs these, reads your code, uses screenshots, videos or replay links you share, writes an improved version next to yours and proves the gain with a before/after run.

## Giving a new challenge

Open Claude Code in this folder and give it the challenge: a CodinGame **link**, a **PDF**, **screenshots** or the text. It follows `.claude/skills/add-challenge/SKILL.md`: fetches the original statement (`node cli.js fetch <url>`, no login needed), classifies it, ports the official referee when it is public, builds the referee, viewer, starters, bosses or tests and the review, and validates everything with real runs before reporting. See [`docs/ADDING_A_CHALLENGE.md`](docs/ADDING_A_CHALLENGE.md) for what helps and what each input type gives.

## How it works

```
 browser IDE (web/)                server (server/index.js)              bot processes
 ┌────────────────────┐   POST /api/match   ┌──────────────────────┐   stdin/stdout   ┌──────────┐
 │ Monaco editor      │ ──────────────────► │ engine/match.js      │ ◄──────────────► │ your bot │
 │ statement          │   NDJSON stream of  │  referee loop        │                  └──────────┘
 │ replay viewer      │ ◄────────────────── │  timeouts, review    │ ◄──────────────► ┌──────────┐
 │ console/IO/review  │   start/frame/end   │ games/<id>/referee   │                  │ boss bot │
 └────────────────────┘                     └──────────────────────┘                  └──────────┘
```

- **Protocol** is exactly CodinGame's: the referee writes input lines to the bot's stdin, the bot prints its action to stdout, stderr goes to the console panel. A CodinGame bot runs here unchanged, and vice versa.
- **Referee** (`games/<id>/referee.js`, or the generic `games/io-referee.js` for classic puzzles) owns the rules, the frames and the review.
- **Viewer** (`games/<id>/viewer.js`) draws one frame on a canvas; every frame is recorded, so you can scrub back and forth.
- **CLI** runs the same engine headless for batch testing and can dump replays as JSON. Compiled bots are built once per source and cached.
- **Security**: the server runs your code, so it binds to `127.0.0.1` and refuses cross-site requests. Bots are not sandboxed: use it on your own machine.

## Challenges included

| Id | Kind | Faithfulness | Opponents |
|---|---|---|---|
| `ocean-of-code` | multi | port of the official referee ([CodinGameCommunity/ocean-of-code](https://github.com/CodinGameCommunity/ocean-of-code)): leagues, validation order, error messages, map generator (`java.util.Random` port, so CodinGame seeds give the same maps), 1000-frame cap | bosses wood / bronze / silver |
| `tron` | multi | implemented from the statement | bosses wood (random) / bronze (flood fill) / silver (Voronoi) |
| `the-bridge-episode-2` | solo | implemented from the statement, UP/DOWN rule checked against the official diagram | 10 levels + random levels, solver-based review |
| `temperatures` | io | classic puzzle, our own test files | 8 tests |

## Adding a game by hand

1. Create `games/<id>/` with `game.json`, `statement.md`, `viewer.js`, `starters/`, and per kind: `referee.js` + `bosses/` (multi), `referee.js` + `tests/*.json` + `generator.js` (solo), or `"type": "io"` + `tests/*.in|.out` (io).
2. `referee.js` exports a class extending `games/base.js` `Referee` with
   `static meta = { playerCount, firstTurnTimeout, turnTimeout, maxTurns, viewer }` and these methods:
   `getStaticInfo()` (sent once to the viewer: map, sizes), `getInitInput(p)`, `getActors()` (player indexes acting this engine turn: all alive players for simultaneous games, one for alternating games), `getTurnInput(p)`, `outputLines(p)` (lines read back, default 1), `applyOutput(p, lines)` (throw `GameError` for an illegal action), `onDisqualify(p, reason)`, `endTurn()`, `isGameOver()`, `getFrame()`, `getResult()` → `{ scores, winner }` (solo: also `passed`, `message`), and `review()` → `[{ turn, player, kind, code, message }]`.
   The constructor receives `{ seed, playerCount, league, testCase }`; `league` is one of the ids in `game.json`'s optional `leagues: [{ id, name, default }]`, `testCase` is a solo test's data.
3. `viewer.js` registers `window.CGViewers[<viewer id>] = { render(ctx, w, h, static, frame, info), hud(...) }`.
4. Restart the server. The challenge appears in the dropdown and in `node cli.js`.

## Roadmap (not done yet)

- **Sandboxing** for a shared server: run each bot in a container with CPU, memory, network and time limits (`server/runner/languages.js` holds every run command).
- **Wrapping official Java referees** directly (SDK runner + Maven) as an alternative to porting them.
- **3–4 player games**: the engine supports them (`playerCount`); the UI exposes two slots.
