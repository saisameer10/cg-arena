# cg-arena

Self-hosted CodinGame-style platform: the user writes bots (mostly Java), plays them against bosses or test cases in a web IDE (`npm start`, http://localhost:3000) or the CLI, and gets a review of their mistakes. Zero npm dependencies; Node 18+.

## Layout

- `server/index.js` HTTP server (binds 127.0.0.1; same-site guard on API POSTs). `server/engine/match.js` match loop, timeouts, boot grace, compile cache, review hook, `summarizePatterns`. `server/runner/` bot processes and language commands. `server/arena.js` saved versions + Elo.
- `games/<id>/` one challenge each; kinds: **multi** (referee + bosses + leagues), **solo** (referee with `playerCount: 1` + `tests/*.json` + `generator.js`), **io** (`"type": "io"` + `tests/*.in|.out`, generic `games/io-referee.js`). `games/index.js` loads them.
- `cli.js` everything from the command line (matches, solo tests, arena, `fetch <url>`, `replay <url>`). Run `node cli.js` for usage.
- `tools/cg-replay.js` imports CodinGame replays through public services (no login), re-simulates Ocean of Code games with our referee and prints statistics and the review; downloads are cached in `challenges/raw/replays/` (git-ignored). Also behind `POST /api/replay/import` and the Arena tab.
- `challenges/` hand-off notes per challenge; `challenges/raw/` original statements fetched for local use (git-ignored; never commit them).
- `my-bots/` the user's bot files (git-ignored).

## Skills

- Adding a challenge from a link, PDF, images or text: `.claude/skills/add-challenge/SKILL.md`.
- Improving the user's bot (reviews, patterns, replays, screenshots, videos): `.claude/skills/coach-bot/SKILL.md`.

## Rules for changes

- Game rules must match CodinGame: port the official referee when public; otherwise record every decision in `challenges/<id>.md`.
- `statement.md` is written in our own words; the original statement is only stored in `challenges/raw/`.
- Every referee implements `review()` with stable `code` values.
- Verify with real runs (`node cli.js ...`) before claiming something works; keep existing game results unchanged when refactoring (compare CLI output before/after).

## Machine notes (Windows)

- JDK 21 at `D:\tools\jdk-21` (found through the user's `JAVA_HOME`); Python 3.12 as `python`; no g++ and no ffmpeg unless installed since.
- Windows rejects child-process working directories over ~260 characters; the engine keeps run folders short (`.runs/`).
- Scratch files go to `E:\cg-tmp\`, not into the repo.
- Never use port 3000 for experiments (the user's server); use `PORT=3105` and stop it afterwards.
