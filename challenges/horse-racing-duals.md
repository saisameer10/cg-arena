# Challenge: Horse-racing Duals (classic)

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/horse-racing-duals>
- CodinGame type: `CODE`, easy (classic input/output puzzle). Arena kind: **io** (`"type": "io"` in game.json; listed as kind `solo`, type `io`, like every io game). Rules of the generic `games/io-referee.js`, plus a puzzle-specific review.
- Official referee source: none (classic puzzles have no referee; the checker compares output with hidden validators, which are not public; forum moderators say they cannot see them either).
- Players: 1. One "turn": the whole input, then end of file, then one output line.

## Statement

Original saved locally with `node cli.js fetch https://www.codingame.com/ide/puzzle/horse-racing-duals` (`challenges/raw/horse-racing-duals.html` and `.json`, not committed). Summary in our own words: `games/horse-racing-duals/statement.md`.

Rules in short: N horse strengths, print the smallest difference between two different horses (0 when two strengths are equal).

## Protocol (exact)

### Input
| Line | Content |
|---|---|
| 1 | `N` |
| 2..N+1 | one integer `Pi` per line |

### Output
| Line | Content |
|---|---|
| 1 | `D`, an integer ≥ 0 |

### Limits
- 1 < N < 100000, 0 < Pi ≤ 10000000.
- Time limit: `timeLimitMs: 2000` per test (same as Temperatures). CodinGame publishes no time limit for classic puzzles. The engine adds its start-up grace (`BOOT_GRACE_MS`, 5000 ms by default, times the time multiplier) to the first (here: only) turn, so the effective budget is about 7000 ms including interpreter/JVM start; the slow-turn warning flags any run over 70 % of 2000 ms.
- Victory: the first output line, trailing spaces trimmed, must equal the expected line. Extra output lines after it are ignored (the engine warns about them).

## Files

| Path | What |
|---|---|
| `games/horse-racing-duals/game.json` | name, `"type": "io"`, url, `timeLimitMs`, tests, starters. |
| `games/horse-racing-duals/referee.js` | subclass of the generic io referee (`makeIoReferee`) that only adds `review()`. |
| `games/horse-racing-duals/generator.js` | `generate(seed)` → `{ name, input, expected }`: random levels from 6 profiles (a few horses, any order, twins far apart, closest pair at an end, mixed digit counts, many horses up to N = 99,999). The expected answer is computed inside (spoiler). |
| `games/horse-racing-duals/tests/NN-name.in/.out` | 15 designed tests (below). |
| `games/horse-racing-duals/starters/` | `bot.py`, `bot.js`, `Player.java` (contains `class Solution`, as on CodinGame), `bot.cpp`: read N and N lines, print `answer`. |
| `games/horse-racing-duals/solution/` | **SPOILER** reference solutions (`solution.py`, `Solution.java`) to re-run the validation: `node cli.js horse-racing-duals games/horse-racing-duals/solution/solution.py --test all --random 20`. |
| viewer | none of its own: the shared `games/io-viewer.js` (meta.viewer `io`). |

## Decisions

- **Puzzle-specific review.** `referee.js` extends `makeIoReferee(...)` from `games/io-referee.js` (same rules, messages, io viewer and `closeInputAfterTurn`) and only overrides `review()`; `games/index.js` loads it for io games when present. Delete it to get the generic "line 1: expected X, found Y" review back.
- **Random levels for an io game.** `generator.js` is loaded for any kind; for io it returns the io test shape `{ input, expected }`, so `--random N` and the IDE's "Random level" work like CodinGame's hidden validators.
- **Tests are our own data**, built by a seeded script (scratch, not committed) and `.out` files produced by a separate reference solution (Python), cross-checked with JS and Java references on every test and with an O(N²) brute force on every test with N ≤ 2000. The large tests are additionally correct by construction (one gap of 37 among gaps ≥ 38; one twin pair).
- **Test themes follow CodinGame's known test/validator names** (from the forum: "Simple case", "Horses in any order", "Many horses", "Horses in disorder", "Shorter difference on the first/last 2 horses"); the data is ours. Test 1 is the statement's example. CodinGame's "Many horses" is reported on the forum as ~100,000 values; ours has N = 99,999.
- **Java class name.** CodinGame's classic puzzles use `class Solution`; the runner accepts `Solution` or `Player` (`server/runner/languages.js`), so the Java starter uses `class Solution` and code pasted from CodinGame runs unchanged. Caution: the runner picks the class by a regex over the whole source, comments included, so a comment containing the words "class Player" makes it run `Player` (the starter's comments avoid that).

## Tests

| # | id | N | answer | catches |
|---|---|---|---|---|
| 1 | simple-case | 3 | 1 | the statement example |
| 2 | horses-in-any-order | 8 | 2 | neighbours in input order (25), largest gap |
| 3 | two-horses | 2 | 7 | signed difference (-7) |
| 4 | twins-far-apart | 9 | 0 | duplicates removed (85), input order (177) |
| 5 | closest-on-last-lines | 7 | 2 | last horse not read (500) |
| 6 | closest-on-first-lines | 7 | 2 | first horse not read (500) |
| 7 | closest-at-the-top | 7 | 3 | sorted loop skipping the last pair (4880) |
| 8 | closest-at-the-bottom | 7 | 3 | sorted loop skipping the first pair (2496), text sort (2499) |
| 9 | extreme-strengths | 2 | 9999999 | minimum initialised too small (e.g. 1000000) |
| 10 | text-sort-trap | 6 | 2 | sort as text (8), input order (39) |
| 11 | all-the-same | 5 | 0 | set/dedup leaving one value (crash or wrong) |
| 12 | descending-order | 60 | 613 | signed differences, largest gap |
| 13 | horses-in-disorder | 2000 | 13 | text sort (14), input order (228) |
| 14 | many-horses | 99999 | 37 | O(N²) (timeout), input order (106) |
| 15 | many-horses-twins | 30001 | 0 | duplicates removed / first or last horse not read (21) |

Known collisions (same wrong number from two different mistakes, reported in the message as "the same number also comes from ..."; when the answer is 0, "equal strengths removed" is named first because it is the likeliest): test 1 (example: last horse not read = skipped last pair = largest gap = 3), test 3 (N = 2: signed input-order difference = signed text-sort difference = -7), test 10 (signed input-order = signed text-sort = -989), test 15 (twins on the first and last line). Checked by a script that recomputes every wrong-answer model on every test.

## Review codes (all `mistake`, turn 1)

`empty-answer`, `not-a-number` (including the starter's `answer` placeholder and debug on stdout), `number-format` (`1.0`, `01`), `neighbours-in-input-order`, `sorted-as-text`, `horse-not-read`, `loop-bounds`, `equal-strengths-ignored`, `kept-largest-difference`, `self-comparison`, `negative-difference`, `initial-minimum-too-small`, `not-a-pair-difference`, `missed-closest-pair`, `too-slow` (timeout with N ≥ 3000), `no-answer-in-time` (timeout on a small input), `ended-without-answer` (crash / early exit). Each message names the closest pair (strengths and input line numbers) and the fix. The wrong-answer codes come from recomputing what each typical wrong program would print on the test input and matching it with the printed number (first match in a fixed priority order).

## What differs from CodinGame

- Test and validator data are ours; CodinGame's are hidden.
- Time limit is a choice (2000 ms + 5000 ms start-up grace). On this PC an O(N²) Java solution takes ~41 s on N = 99,999 (fails test 14 with `too-slow`) and ~4.4 s on N = 30,001 (passes test 15, with a slow-turn warning). Python start-up alone measured 1.6–3.7 s through the server on this PC.

## Not verified

- C++ starter: no g++ on this machine, so `bot.cpp` was never compiled or run.
- CodinGame's real time limit and exact validator contents.
