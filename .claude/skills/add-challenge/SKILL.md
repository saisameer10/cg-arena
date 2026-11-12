---
name: add-challenge
description: Turn a CodinGame link, a PDF, screenshots or pasted text of a challenge into a playable cg-arena challenge (referee, viewer, starters, bosses or tests, review), validated end to end by the generic validator. Use whenever the user gives a puzzle/game link, a PDF or images of a statement, or asks to add a challenge.
---

# Add a challenge to cg-arena

Goal: the user gives a link (or PDF / screenshots / text) and gets a challenge they can play in the IDE (http://localhost:3000) and from `cli.js`, exactly like on CodinGame. Everything except the puzzle's own rules is generic: scaffolding, test generation, validation, review of disqualifications and timing, patterns, arena, versions. Read `CLAUDE.md` first.

## The flow

```bash
node cli.js new <link or id>        # 1. fetch the original statement + scaffold games/<id>/ for its kind
#                                     2. write the puzzle-specific parts (below)
node cli.js make-tests <id>         # 3. solo/io: tests from generator.js + the reference solution
node cli.js validate <id>           # 4. generic end-to-end validation: repeat 2-4 until "ready" (no FAIL)
```
Then commit, push, and report.

## 1. Statement and kind

`node cli.js new <link>` saves the original statement to `challenges/raw/<id>.html` (git-ignored, shown in the IDE) and classifies the challenge from CodinGame's own type: `ARENA` → **multi**, `SOLO`/`OPTIM` → **solo**, `CODE`/`CODEGOLF` → **io** (`--kind` overrides). Without a CodinGame link (a PDF, images, another site): read the material (the Read tool handles PDFs and images), save it to `challenges/raw/<id>/`, and scaffold offline with `node cli.js new <id> --kind io|solo|multi --title "Name" [--url <link>]`. Videos need ffmpeg (`ffmpeg -i v.mp4 -vf fps=1 challenges/raw/<id>/f-%03d.png`); without it, ask for screenshots.

## 2. Write only what is specific to the puzzle

The scaffold marks every place with TODO. Contracts: README "Adding a game by hand".

| Kind | Write | Generic parts that need nothing |
|---|---|---|
| io | `solution/` (reference solution, SPOILER header), `generator.js` → `{ name, input }`, the statement's examples as `tests/01-*.in` | judging, expected outputs (`make-tests`), viewer, starters, review of wrong lines |
| solo | `referee.js` (rules, `getResult()` with `passed`/`message`, `review()`), `solution/`, `generator.js` → level data | test files (`make-tests` keeps only levels the solution passes), generic viewer until a custom one exists |
| multi | `referee.js` (rules, leagues, `review()`), `bosses/boss.js` levels wood / bronze / silver | arena, versions, Elo, patterns, generic viewer until a custom one exists |

Always:
- **Rules exactly as CodinGame.** If the official referee is public (statement's "Expert Rules", GitHub `CodinGame` / `CodinGameCommunity`, search "codingame <name> referee"), port it: validation order, error messages, map generation (`games/java-random.js`), frame counting. Otherwise use the statement plus evidence from public replays (`node cli.js replay <id>` on the puzzle record's `replayIds`) and the forum thread, and write every decision in `challenges/<id>.md`.
- `statement.md` in **our own words** plus the exact protocol (facts). Never commit CodinGame's text.
- Starters read input in exactly the official order and print a legal default; Java may use `class Player` or `class Solution`.
- `review()` names the decisive mistake with a stable kebab-case `code` (patterns group by it). The engine already explains disqualifications, timeouts, crashes, slow turns and extra output.
- Bosses: deterministic, legal in every league; each level must beat the one below.
- Optional: a custom `viewer.js` (positions, last action, score, events); `selftest.js` for rule assertions.

## 3-4. Tests and validation

`node cli.js make-tests <id> --count 10` writes generated tests next to the designed ones. `node cli.js validate <id>` then checks, for any challenge:

- **structure**: files, statement, starters for every installed language, notes;
- **referee contract**: construction for every league and test;
- **starters**: they run cleanly;
- **misbehaving bots**: generic bots that never answer, print garbage or crash must lose with an explanation;
- **opponents**: boss legality in every league and the strength ladder (multi), or the reference solution passing every test and generated levels, with a deterministic generator (solo/io);
- **determinism**, the **review format**, and the optional selftest.

Fix every FAIL; read every WARN.

## 5. Document, commit, report

Fill `challenges/<id>.md` (source, kind, official referee or "not public", rule decisions, what differs from CodinGame). Add a row to the README "Challenges included" table. Commit and push. Tell the user what was built, how faithful it is (ported or from the statement), the `validate` summary, and anything not verified. When working as a delegated agent that owns only `games/<id>/`, leave the README and the commit to the coordinator.
