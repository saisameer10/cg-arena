# CG Arena

A self-hosted, CodinGame-style platform that runs on your own computer. Give it a CodinGame challenge (a link, a PDF, screenshots or text), write your bot in the browser or in any editor, and play it the way CodinGame does:

- **Multiplayer games**: battle 1 vs 1 against bosses or your own saved versions, in leagues, with an Elo arena.
- **Solo puzzles**: run every test case plus unlimited generated levels, like CodinGame's hidden validators.
- **Classic puzzles**: input/output tests, with the first wrong line pointed out.

After every game a **Review** names the decisions that cost it: the turn, the move, and what would have worked. Batches of games or tests show **patterns**, the same mistake coming back across games. You can import **CodinGame replays** of your own games or of top players and study them with the same viewer, statistics and review.

New challenges are added from a link or a PDF through a **generic pipeline**. It scaffolds the challenge for its kind, generates tests from a reference solution, and runs the same end-to-end validation for every puzzle. Claude Code writes only what is specific to the puzzle (its rules, bosses or solution), so the platform grows with whatever you practise next.

## Contents

1. [Quick start](#quick-start)
2. [Challenge kinds](#challenge-kinds)
3. [Challenges included](#challenges-included)
4. [The web IDE](#the-web-ide)
5. [Command line](#command-line)
6. [Opponents: bosses, your versions, the arena](#opponents-bosses-your-versions-the-arena)
7. [Review and patterns](#review-and-patterns)
8. [Learning from CodinGame replays, screenshots and videos](#learning-from-codingame-replays-screenshots-and-videos)
9. [Adding a new challenge](#adding-a-new-challenge)
10. [Coaching your bot with Claude Code](#coaching-your-bot-with-claude-code)
11. [How it works](#how-it-works)
12. [Project layout](#project-layout)
13. [Adding a game by hand](#adding-a-game-by-hand)
14. [Troubleshooting](#troubleshooting)
15. [Limits and roadmap](#limits-and-roadmap)

## Quick start

Requirements: [Node.js](https://nodejs.org) 18 or newer. No npm packages are needed. Bots can be Python, JavaScript, Java or C++; the languages found on your PC are printed when the server starts.

| Language | Needs | Windows install |
|---|---|---|
| JavaScript | nothing (uses Node) | – |
| Python 3 | `python` (or `python3`) on PATH | `winget install Python.Python.3.12` |
| Java | a JDK, found via `JAVA_HOME`, PATH, or the usual `C:\Program Files\...\jdk-*` folders | `winget install Microsoft.OpenJDK.21` |
| C++ | `g++` on PATH | `winget install MSYS2.MSYS2`, then `pacman -S mingw-w64-ucrt-x86_64-gcc` |

Start it:

```bash
git clone https://github.com/saisameer10/cg-arena.git
cd cg-arena
npm start
```

On Windows you can also double-click **`start-arena.bat`**: it starts the server in its own window and opens http://localhost:3000. Close that window to stop the server.

First game in two minutes: pick **Ocean of Code**, language **Java**, Player 1 **Boss Wood**, press **▶ Play**. Then open the **Review** tab.

## Challenge kinds

| Kind | CodinGame type | Your opponent | Example here |
|---|---|---|---|
| **multi** | Bot programming (`ARENA`) | bosses (wood / bronze / silver), your saved versions, the Elo arena | `ocean-of-code`, `tron` |
| **solo** | Interactive puzzle (`SOLO`), optimization (`OPTIM`) | designed test levels plus random levels from a generator, each proven solvable | `the-bridge-episode-2` |
| **io** | Classic puzzle (`CODE`), Clash of Code | test input/output files | `temperatures` |

`node cli.js fetch <link>` tells you which kind a CodinGame challenge is.

## Challenges included

| Id | Kind | Rules | Opponents / tests |
|---|---|---|---|
| `ocean-of-code` | multi | Port of the official referee ([CodinGameCommunity/ocean-of-code](https://github.com/CodinGameCommunity/ocean-of-code)): leagues Wood 2 / Wood 1 / Bronze+, validation order, error messages, the 1000-frame cap, and the map generator (`java.util.Random` port, so a CodinGame seed gives the same map). CodinGame replays re-simulate here with identical results. | bosses wood / bronze / silver |
| `tron` | multi | Implemented from the Tron Battle statement. | bosses wood (random) / bronze (flood fill) / silver (Voronoi) |
| `the-bridge-episode-2` | solo | Implemented from the statement; the UP/DOWN rule was checked against the official diagram and by an independent re-implementation (1.1 million moves, no difference). | 10 levels + random levels; solver-based review |
| `tic-tac-toe` | multi | Port of the official referee ([CodinGame/game-ultimate-tictactoe](https://github.com/CodinGame/game-ultimate-tictactoe)), leagues Wood (3×3) and Bronze+ (ultimate 9×9). Added from the link alone by the pipeline. | bosses wood / bronze / silver |
| `shadows-of-the-knight-episode-1` | solo | Implemented from the statement plus evidence from CodinGame's public replays (exact messages, the moving bombs of the last test). Added from the link alone by the pipeline. | 17 levels + random levels |
| `temperatures` | io | Classic puzzle. | designed tests + generated tests |
| `horse-racing-duals` | io | Classic puzzle; its review recognises typical wrong programs (unsorted neighbours, text sort, loop bounds, O(N²) timeouts). Added from the link alone by the pipeline. | 15 tests + random tests |
| `unary` | io | Classic puzzle, added end to end with the generic pipeline: `new` → solution + input generator → `make-tests` → `validate`. | 2 statement examples + 12 generated tests |

Each challenge has notes in `challenges/<id>.md`: sources, every rule decision, and what differs from CodinGame. `node cli.js validate all` checks every challenge with the same generic battery; all are "ready".

## The web IDE

Open http://localhost:3000.

**Top bar**
- **Game** and **Language**. The editor loads the starter code and autosaves your edits in the browser per challenge and language. **Reset code** restores the starter.
- Multiplayer: **Player 0 / Player 1**, each *My code*, a boss, or one of your saved versions. Choose **League** where the challenge has leagues.
- Solo and classic: **Test case**, one of the tests or *Random level* (it uses the Seed box).
- **Seed**: the same seed gives the same map. **Time ×** multiplies the time limits while debugging; set it back to 1 before trusting a result.
- **▶ Play** (Ctrl+Enter) runs the game live. **Stop** ends it, and the server stops the bots at once.

**Left panel**: the **original CodinGame statement**, once fetched with `node cli.js fetch`, or our notes. Switch between them with the buttons at the top.

**Right panel**: the viewer with turn controls (first, previous, play, next, slider, speed) and a status line. Below it are these tabs:

| Tab | Shows |
|---|---|
| Console (P0/P1) | your stderr for the selected turn and the turns before it, labelled with your own turn number; warnings for extra stdout lines |
| Input / Output | the exact lines sent to each bot and its answer, with the time it took |
| Game log | the referee's log up to the selected turn |
| Review | the review of the game, with **go to turn** buttons |
| Tests (solo/classic) | **Run all tests** (+ random levels), a pass/fail table (click a row to replay it), **patterns across tests**, and **your saved versions** with their scores |
| Arena (multiplayer) | save versions, run the arena, results per opponent, **patterns in your losses**, the Elo leaderboard, and **Import replay** for CodinGame replays |

## Command line

Run `node cli.js` for the list of challenges and commands. A bot is a source file (`.py`, `.js`, `.java`, `.cpp`), `boss:<id>`, or `pool:<id>` for a saved version.

**Multiplayer**
```bash
node cli.js ocean-of-code my-bots/Sub.java boss:silver --games 20 --league wood1     # batch: win rate, review of the last game, patterns
node cli.js ocean-of-code my-bots/Sub.java boss:bronze --games 5 --review all         # review of every game
node cli.js ocean-of-code my-bots/New.java my-bots/Old.java --games 20 --seed 100      # compare two versions on the same maps
node cli.js tron my-bots/bot.py boss:bronze --replay E:/tmp/games.json                 # save the full games as JSON
```

**Saved versions and arena**
```bash
node cli.js submit ocean-of-code my-bots/Sub.java --name "v3 tracker"   # save a version (any challenge kind)
node cli.js pool ocean-of-code                                          # leaderboard (solo: versions with test scores)
node cli.js arena ocean-of-code my-bots/Sub.java --opponents all --games 6 --league wood1
```

**Solo and classic puzzles**
```bash
node cli.js the-bridge-episode-2 x --test list                           # list the tests
node cli.js the-bridge-episode-2 my-bots/Bridge.java --test all --random 20
node cli.js the-bridge-episode-2 my-bots/Bridge.java --test 3            # one test, by number, id or random:<seed>
node cli.js temperatures my-bots/Temps.py
```
Solo runs exit with code 3 when a test fails, so they fit in scripts.

**New challenges (generic pipeline)**
```bash
node cli.js new https://www.codingame.com/training/easy/unary      # fetch the statement + scaffold games/<id>/ for its kind
node cli.js new my-puzzle --kind solo --title "My Puzzle"          # from a PDF or images: scaffold offline
node cli.js make-tests unary --count 12                            # solo/io: tests from generator.js + the reference solution
node cli.js validate unary                                         # generic end-to-end validation ("ready" = no FAIL)
node cli.js validate all --quick                                   # every challenge, faster
node cli.js selftest all                                           # optional challenge-specific assertions
```

**CodinGame**
```bash
node cli.js fetch https://www.codingame.com/ide/puzzle/the-bridge-episode-2       # original statement, saved locally
node cli.js replay https://www.codingame.com/replay/914095550 --turns key          # import a replay
node cli.js replay battles <codingame name> --losses --fetch 5                     # a player's latest losses, summed
node cli.js replay top 20                                                          # top players of the challenge
```

**Common options**: `--seed S` (integers up to 20 digits; game *g* of a batch uses seed + *g*), `--league id`, `--timeout-mult X`, `--games N`.

## Opponents: bosses, your versions, the arena

CodinGame's own boss bots are not public, so opponents come from:

1. **Built-in bosses** (`games/<game>/bosses/`). They are written for this repository at wood, bronze and silver strength, are legal in every league, and have a verified strength ladder. They are ordinary bots you can read.
2. **Your logic, saved as versions.** **Save current code as a version** in the Arena or Tests tab, or `node cli.js submit`, stores a snapshot in `arena/<game>/`.
   - In multiplayer games every version becomes a rated opponent. **Run arena** plays your code against the bosses and your versions, alternating sides, and updates the Elo ratings (K = 32). Unsaved code is measured but not rated. The better your bot gets, the stronger the pool it has to beat.
   - In solo puzzles each version keeps its last full-suite score, and **open in editor** brings it back.
3. **Any bot you drop in**: a friend's bot or one from a public post-mortem, via `node cli.js submit` (any language) or as a new boss level.
4. **Solo puzzles** are judged by their test suite and generated levels. Every level is proven solvable by a reference solver, which also powers the review. Spoiler files are marked as such.

## Review and patterns

Every game ends with a review: a short ranked list of `{ turn, kind, code, message }`. The kind is ✘ mistake, ! warning or · tip. **Go to turn** jumps the viewer to the moment it happened.

| Challenge | What the review finds (codes) |
|---|---|
| all games (engine) | disqualifications explained with the turn and a concrete hint (`timeout`, `crashed`, `invalid-output`, `disqualified`), turns using over 70 % of the time limit (`slow-turn`), extra stdout lines that CodinGame would read as answers (`extra-output`) |
| The Bridge | the first command after which the level could no longer be won, and the commands that would still have won (`decisive-<command>-into-hole` / `-dead-end`); a pass with fewer bikes or many more turns than needed (`fewer-survivors`, `slow-plan`); a loss that was decided earlier than it looks (`lost-earlier-than-it-looks`) |
| Tron | moves into a much smaller region than the best alternative (`smaller-region`), the death cause (`death-wall`, `death-own-trail`, `death-opponent-trail`, `death-timeout`, `death-invalid`), board cut-offs (`cut-off`), poor filling of your own region (`poor-fill`) |
| Ocean of Code | self-damage, forced and voluntary surfaces, orders skipped and the SURFACE fallback, torpedo misses, the biggest hit taken, charged but unused devices, wasted charges, disqualification with the failing order (`self-damage`, `forced-surface`, `voluntary-surface`, `skipped-order`, `surface-fallback`, `torpedo-misses`, `big-damage-taken`, `unused-charges`, `wasted-charges`, `disqualified`, ...) |
| classic puzzles | the first wrong line with expected and actual text, and whether only spacing or case differs (`wrong-line`, `spacing-only`, `case-only`) |

**Patterns** group the same code across many games: CLI batches (`--games N`), `arena`, `--test all`, and the Tests and Arena panels. A pattern reads like this: `decisive-speed-dead-end: 5/10 tests`, or `unused-charges: 3/3 games, e.g. You charged TORPEDO 48 times but never used it`. Per-game summary items are left out of patterns.

## Learning from CodinGame replays, screenshots and videos

**Replays** are the best evidence after your own local games. They come through CodinGame's public services, with no login and nothing sent about you.

- `node cli.js replay <replay link or id>` downloads a game and saves it to `challenges/raw/replays/` (not committed).
  - For Ocean of Code it re-simulates the game with our referee and checks the result against CodinGame's in five ways: the map, the frames, every position, the damage and the final scores.
  - It then prints a per-turn table (orders, true positions, lives, how many cells the opponent could still be in), per-player statistics (torpedoes fired, hit and missed, mines, sonar, silence, surfaces, damage taken by cause) and our review.
- `node cli.js replay battles <name> --losses --fetch 5` sums statistics and recurring review codes over a player's latest losses. Use your own CodinGame name, or a top player's name to compare. `node cli.js replay top 20` lists the leaders.
- In the web IDE, the **Arena tab → Import replay** loads a CodinGame game into the viewer, with the console, statistics and review, like a local game.
- Other games show the raw orders of each turn. Public replays never contain other players' debug output.

**Screenshots and PDFs** are read by Claude Code directly, diagrams included. **Videos** need [ffmpeg](https://ffmpeg.org) (`winget install Gyan.FFmpeg`) so frames can be extracted and read. Without it, send screenshots.

## Adding a new challenge

Open Claude Code in this folder and give it the challenge in any form: "add the challenge &lt;link&gt;", or a PDF or screenshots. It follows `.claude/skills/add-challenge/SKILL.md`, where everything except the puzzle's own rules is generic:

1. **`node cli.js new <link>`** fetches the original statement (no login) and classifies it from CodinGame's own type: multi, solo or io. It then scaffolds `games/<id>/` with every file the platform needs: config, statement page, starters in four languages, referee skeleton, bosses or solution and generator, and notes. The challenge is loadable and playable at once, using the generic viewer. For a PDF or images, `--kind` scaffolds offline.
2. **The puzzle-specific part**:
   - io: a reference solution and an input generator;
   - solo: the referee, a solution and a level generator;
   - multi: the referee and the boss levels.

   When CodinGame published the official referee it is ported exactly. Otherwise the rules come from the statement and from public replays, and every decision goes into `challenges/<id>.md`.
3. **`node cli.js make-tests <id>`** generates tests. For classic puzzles the reference solution computes the expected outputs; for solo puzzles only levels the solution passes are kept, which proves they are solvable.
4. **`node cli.js validate <id>`** runs the same generic battery on any challenge:
   - structure;
   - referee contract for every league and test;
   - starters in every installed language;
   - misbehaving bots (never answers, garbage, crash) that must lose with an explanation;
   - boss legality and strength ladder (multi), or the reference solution passing every test and generated level (solo/io);
   - determinism, the review format, and the optional selftest.
5. **Document, commit, push.**

What each input gives, and what helps most, is in [`docs/ADDING_A_CHALLENGE.md`](docs/ADDING_A_CHALLENGE.md). The pipeline was tested by giving fresh agents nothing but a link (Tic-Tac-Toe, Shadows of the Knight, Horse-racing Duals) and end to end with the generic commands (Unary).

## Coaching your bot with Claude Code

Ask Claude Code in this folder why your bot loses or how to improve it. It follows `.claude/skills/coach-bot/SKILL.md`:

1. Collect evidence: arena or test runs with patterns, CodinGame replays of your losses and of top players, and the screenshots or videos you share.
2. Map each recurring pattern to the lines of your code that cause it.
3. Write the improved version next to yours, without overwriting your file.
4. Prove the gain with a before/after run on the same seeds or tests, and save both versions to the arena so the ladder shows the progress.

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

- **Protocol** is exactly CodinGame's. The referee writes input lines to the bot's stdin, the bot prints its answer to stdout, and stderr goes to the console. A CodinGame bot runs here unchanged, and vice versa. Classic puzzles get the whole input followed by end of file.
- **Timing.** Each turn is limited to the challenge's CodinGame limit. The first turn also gets an allowance for starting Java, Python or Node (5 s, times the Time × multiplier), because CodinGame does not charge start-up to the bot either. The review warns about turns over 70 % of the limit, since CodinGame's servers may be slower than your PC.
- **Bosses** get 4 times the turn limit (`CG_ARENA_BOSS_TIME_MULT`): they are reference opponents, and a busy PC must not make them lose on time. Your code always runs at CodinGame's limits.
- **Referees** (`games/<id>/referee.js`, or the generic `games/io-referee.js`) own the rules, the frames and the review. The engine records every frame, so you can scrub back and forth. A challenge without its own `viewer.js` is shown by the generic text viewer (`games/generic-viewer.js`).
- **Compiled bots** (Java, C++) are built once per source and cached in `.runs/cache/`, so a 10-test suite compiles once.
- **Security.** The server runs your code, so it listens on `127.0.0.1` only, refuses cross-site requests, and stops a match when the browser disconnects. Bots are not sandboxed: use it on your own machine.

## Project layout

```
cli.js                     command line (matches, tests, arena, fetch, replay)
start-arena.bat            Windows launcher
server/index.js            HTTP server and API
server/engine/match.js     match loop, timeouts, compile cache, review hook, patterns
server/runner/             bot processes and language commands (JDK discovery)
server/arena.js            saved versions, Elo, arena runs
games/index.js             challenge registry (multi / solo / io)
games/base.js              referee contract
games/io-referee.js        generic referee for classic puzzles (+ io-viewer.js)
games/generic-viewer.js    text viewer for challenges without their own viewer
games/java-random.js       java.util.Random port (CodinGame map generators)
games/<id>/                one challenge: game.json, referee.js, viewer.js, statement.md, starters/, bosses/ or tests/,
                           generator.js, solution/ (spoiler), selftest.js (optional)
tools/scaffold.js          node cli.js new: a new challenge's files for its kind
tools/make-tests.js        node cli.js make-tests: tests from a generator + the reference solution
tools/validate.js          node cli.js validate: the generic end-to-end validation
tools/cg-replay.js         CodinGame replay import
web/                       the IDE (index.html, app.js)
challenges/<id>.md         sources and rule decisions per challenge
challenges/raw/            original statements and replays fetched for local use (not committed)
arena/<id>/                your saved versions and ratings
my-bots/                   your own bot files (not committed)
.claude/skills/            add-challenge and coach-bot procedures for Claude Code
CLAUDE.md                  architecture notes for Claude Code
```

## Adding a game by hand

`node cli.js new <id> --kind io|solo|multi` creates all of this with TODO markers; the contract is:

1. Create `games/<id>/` with `game.json`, `statement.md`, `viewer.js` and `starters/`. Then add, depending on the kind:
   - multi: `referee.js` and `bosses/`;
   - solo: `referee.js`, `tests/*.json` and `generator.js`;
   - io: `"type": "io"` in `game.json` and `tests/*.in|.out`.
2. `referee.js` exports a class extending `games/base.js` `Referee` with `static meta = { playerCount, firstTurnTimeout, turnTimeout, maxTurns, viewer }` and these methods:
   - `getStaticInfo()`: sent once to the viewer (map, sizes);
   - `getInitInput(p)`;
   - `getActors()`: the players acting this engine turn (all alive players in simultaneous games, one in alternating games);
   - `getTurnInput(p)` and `outputLines(p)` (lines read back, default 1);
   - `applyOutput(p, lines)`: throw `GameError` for an illegal action;
   - `onDisqualify(p, reason)`, `endTurn()`, `isGameOver()`, `getFrame()`;
   - `getResult()` → `{ scores, winner }` (solo: also `passed` and `message`);
   - `review()` → `[{ turn, player, kind, code, message }]`.

   The constructor receives `{ seed, playerCount, league, testCase }`. `league` is an id from `game.json`'s optional `leagues: [{ id, name, default }]`. `testCase` is the data of a solo test.
3. `viewer.js` registers `window.CGViewers[<viewer id>] = { render(ctx, w, h, static, frame, info), hud(...) }`.
4. Restart the server. The challenge appears in the dropdown and in `node cli.js`.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Java is missing from the language list | No JDK found. Install one (`winget install Microsoft.OpenJDK.21`) or set `JAVA_HOME`, then restart the server. The server prints which JDK it uses. |
| `timeout` on turn 1 when the PC is busy | Starting a JVM or Python can take seconds under load. Close heavy programs, or raise **Time ×** while debugging. `CG_ARENA_BOOT_GRACE_MS` changes the start-up allowance. |
| `port 3000 is already in use` | Another arena is running. Close it, or use another port: `set PORT=3001 && npm start` (cmd), `$env:PORT=3001; npm start` (PowerShell), `PORT=3001 npm start` (bash). |
| The editor is a plain text box | The Monaco editor could not be downloaded (offline). Everything still works; Tab inserts 4 spaces. |
| `You are not authorised to view replay N` | That CodinGame replay is private. Use one of your own games or a public one. |
| Windows path errors when running bots | Keep the project in a short path. Run folders live in `.runs/` (or set `CG_ARENA_WORK`). |

## Limits and roadmap

- **Bosses** are written for this arena. Beating our silver boss is a strong signal, not a CodinGame promotion.
- **Test maps** of solo and classic puzzles are our own. CodinGame's validators are hidden anyway, and every level here is proven solvable.
- **Rules** are exact when CodinGame published the referee. Otherwise the decisions are written down in `challenges/<id>.md`.
- Not done yet:
  - sandboxing bots for a shared server;
  - wrapping official Java referees directly (SDK runner and Maven) instead of porting them;
  - 3 to 4 player games in the UI (the engine supports them);
  - full replay re-simulation for games other than Ocean of Code.
