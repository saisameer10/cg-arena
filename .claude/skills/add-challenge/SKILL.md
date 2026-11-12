---
name: add-challenge
description: Turn a CodinGame link, a PDF, screenshots or pasted text of a challenge into a playable cg-arena game (referee, viewer, starters, bosses or test cases, mistake review), validated end to end. Use whenever the user gives a puzzle/game link, a PDF or images of a statement, or asks to add a challenge.
---

# Add a challenge to cg-arena

Goal: the user gives a link (or PDF / screenshots / text) and ends up with a challenge they can play in the IDE at http://localhost:3000 and from `cli.js`, exactly like on CodinGame: same input/output protocol and rules, an opponent (bosses for multiplayer, test cases for solo), and a review that names their mistakes. Work in this repository; read `CLAUDE.md` first.

## 1. Get the statement

| Input | Do |
|---|---|
| CodinGame link or puzzle id | `node cli.js fetch <url>`: saves the original statement to `challenges/raw/<id>.html` (git-ignored) and prints CodinGame's type. Read the `.html`. No login needed. |
| PDF | Read it with the Read tool (`pages` for long files). Copy it to `challenges/raw/<id>/` (git-ignored). |
| Screenshots / photos | Read each image. Transcribe the protocol tables carefully; ask for a sharper image of any unreadable number. |
| Video | Needs ffmpeg (`ffmpeg -version`). If present: `ffmpeg -i in.mp4 -vf fps=1 challenges/raw/<id>/frame-%03d.png`, then read frames. If absent, tell the user (`winget install Gyan.FFmpeg`) and ask for screenshots or replay links instead. |
| Pasted text | Use it as is. |

The id is the CodinGame prettyId (the last URL segment), e.g. `the-bridge-episode-2`. Without a link, choose a short kebab-case id.

## 2. Classify

| CodinGame type (fetch output) | Arena kind | Copy the structure of |
|---|---|---|
| `ARENA` / level `multi` (bot programming) | **multi**: 2+ players, bosses, leagues, arena | `games/ocean-of-code/` (ported official referee) or `games/tron/` |
| `SOLO` (interactive puzzle with turns) | **solo**: referee + test levels + generator | `games/the-bridge-episode-2/` |
| `OPTIM` (optimization, scored) | **solo** with a score in `getResult().scores` | `games/the-bridge-episode-2/` |
| `CODE`, `CODEGOLF`, Clash of Code (read input once, print the answer) | **io**: test files only, no referee | `games/temperatures/` |

## 3. Find the official rules source

Check the statement's "Expert Rules" section and search GitHub for `codingame <name> referee` (organisations `CodinGame`, `CodinGameCommunity`). If the referee is public, **port it**: same validation order, same error messages, same map generator (use `games/java-random.js` for `java.util.Random`), same turn and frame counting (the SDK's `setMaxTurns` frame cap counts executed actions). `games/ocean-of-code/referee.js` is the worked example. If it is not public, implement from the statement and write every ambiguity and the choice you made into `challenges/<id>.md`.

## 4. Build `games/<id>/`

- `game.json`: `name`, `url`, `type: "io"` for io games, `starters`, `bosses` (multi), `leagues` (multi, if CodinGame has league-gated rules), `tests` (solo/io), `timeLimitMs` (io).
- `referee.js` (multi/solo): class extending `games/base.js` `Referee`. Contract in README "Adding a game". Key points: `static meta = { playerCount, firstTurnTimeout, turnTimeout, maxTurns, viewer }` with CodinGame's real limits; `getActors()` returns one player for alternating games, all for simultaneous; throw `GameError` with CodinGame's wording for anything that loses the game; solo referees get the level in `opts.testCase` and return `{ scores, winner, passed, message }`.
- `review()`: required. Returns `{ turn, player, kind: 'mistake'|'warning'|'tip', code, message }`. Name the decisive mistake with coordinates/numbers and what would have been better. Use a stable kebab-case `code` per kind of finding (patterns group by it). Examples: Bridge (solver + binary search for the first losing command), Tron (flood-fill area of the chosen move vs the best), Ocean (self-damage, forced surfaces, skipped orders).
- `statement.md`: **our own words**: rules summary plus the exact protocol tables (protocols are facts; prose is not ours to copy). Link the CodinGame page. The original stays in `challenges/raw/` and the IDE shows it.
- `viewer.js`: `window.CGViewers[meta.viewer] = { render(ctx, w, h, static, frame, info), hud(static, frame, info) }`. Show what a player needs to debug: positions, last action, health/score, the event of the turn.
- `starters/`: `bot.py`, `bot.js`, `Player.java`, `bot.cpp`. The public service returns no IDE stubs, so write them from the protocol unless the user pastes CodinGame's stub. Read input in exactly the official order and print a legal default action; debug to stderr. They should run a full game without errors. Java: the runner accepts `class Player` (games) and `class Solution` (classic puzzles), public or not.
- multi: `bosses/boss.js` with levels as an argument (`wood`, `bronze`, `silver`, more if useful), each legal in every league and deterministic (seeded RNG). Wood = legal and simple; bronze = one clear idea; silver = uses every rule. Bosses are ordinary bots and may read nothing but stdin.
- solo: `tests/NN-name.json` (designed levels covering each mechanic, then harder generated ones), `generator.js` with `generate(seed)` returning only solvable levels, and a reference solution (spoiler, clearly marked) that passes every test. Prove solvability by search, never by eye.
- io: `"type": "io"` in game.json, `tests/NN-name.in` + `.out` (generate `.out` with a reference solution and cross-check it with a brute force), edge cases (empty input, ties, extremes, the largest N). Optional but recommended:
  - `referee.js` subclassing `makeIoReferee(cfg)` from `games/io-referee.js` that only adds a puzzle-specific `review()`: recompute what typical wrong programs print for the test input and name the matching mistake (example: `games/horse-racing-duals/referee.js`). Design the tests so different common bugs give different wrong answers.
  - `generator.js` with `generate(seed)` returning `{ name, input, expected }` (unlimited random tests like hidden validators).
  - `timeLimitMs`: CodinGame publishes none for classic puzzles; 2000 ms is the convention here. The engine adds a start-up allowance to the only turn, so catch slow algorithms with a test large enough that they take many seconds.
  - Classic puzzles have no public referee: instead look in the puzzle's forum thread for the names of the official tests and validators, and design similar ones.
- Keep a clearly marked reference solution in the repo (`games/<id>/solution/`, header "SPOILER") for solo and io games, so validation can be re-run later.

## 5. Validate (all must pass before saying it is done)

```bash
node cli.js <id> x --test list                                   # solo/io: tests load
node cli.js <id> <reference-solution> --test all --random 20     # solo/io: reference passes everything (--random needs a generator)
node cli.js <id> games/<id>/starters/bot.py --test all            # solo/io: runs cleanly (failing is fine)
node cli.js <id> games/<id>/starters/Player.java boss:wood --games 2   # multi: every starter x language
node cli.js <id> boss:silver boss:bronze --games 10              # multi: silver wins >= 70 %, no disqualification
node cli.js <id> boss:bronze boss:wood --games 10                # multi: bronze wins >= 70 %
```
Also: unit-check each rule with `node -e` against the referee (one assertion per rule and per error message; for io: trailing spaces, extra lines, end of file, every review code), check `review()` names a deliberately bad move or wrong program, start the server on any spare port except 3000 (`PORT=3105 node server/index.js`) and play one game in the browser or via `curl` on `/api/match`. Run every starter language that is installed (`node -e "console.log(require('./server/runner/languages').availableLanguages())"`).

## 6. Document and commit

Write `challenges/<id>.md` from `challenges/TEMPLATE.md`: source links, kind, official referee (or "not public"), every rule decision and ambiguity, what differs from CodinGame (e.g. our own test maps). Add the game to the README games table. Commit with a message naming the challenge, and push if a remote exists.

Report to the user: what was built, how faithful it is (ported vs implemented from the statement), the validation results, and anything not verified.
