# Challenge: Shadows of the Knight - Episode 1

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/shadows-of-the-knight-episode-1>
- Official referee source: **not public**. This is a 2014 puzzle from before CodinGame's open-source game SDK; nothing under the `CodinGame` / `CodinGameCommunity` GitHub accounts, and the community collection of leaked referees (SpiritusSancti5/codinGame `Referees/`) does not include it. Rules are implemented from the statement, refined with **CodinGame's own public replays of this puzzle** (below).
- Kind: solo (CodinGame type `SOLO`, level medium). One player, 1 to 100 turns (one per jump), 150 ms per turn.
- Players: 1. Turn order: one answer per turn.

## Statement

Original saved locally in `challenges/raw/shadows-of-the-knight-episode-1.html` by `node cli.js fetch` (not committed). Summary in our own words and the exact protocol: `games/shadows-of-the-knight-episode-1/statement.md`.

## Evidence used besides the statement

CodinGame's public puzzle record (`Puzzle/findProgressByPrettyId`) lists 7 `replayIds`. Their frames (`gameResult/findInformationById`, public, no login; downloaded to the scratch folder only, not into the repo) show, per turn, the referee's game log, Batman's window, the hint, the rectangle the viewer draws and the bombs' window. From them:

| What | Seen in the replays |
|---|---|
| Game log wording | `Locate the bombs, save the hostages!`, `Batman is on window (2,4)`, `The bombs are located below and to the right of Batman`, `Batman moved from window (2,4) to window (3,6)`, `Success: you defused the bombs in time. The hostages are safe. You win :)` |
| Jump count | N = 14 and the bombs found on the 14th jump = win (also N = 7 found on the 7th). So all N jumps may be used. |
| Region | The viewer draws exactly the rectangle of windows consistent with every hint (exclusive bounds: Batman's window is never inside). |
| Moving bombs | In the replay with a 9998 x 9998 building and 14 jumps, the bombs' window changes after **every** jump, always inside the previous rectangle and never on the window Batman just jumped to (13 moves, including one where Batman jumped exactly onto the bombs' previous window). In the other 6 replays the bombs never move. Forum posts call the last test "Not there?". |
| Sizes / jumps (replays, maybe validators) | 4x9 N=40, 25x33 N=50, 40x61 N=32, 1x79 N=6 (tower), 50x50 N=6, 101x101 N=7, 9998x9998 N=14 |

Forum posts on the puzzle's discussion thread add the other messages: `Failure: you are too late. Joker's bombs exploded. The hostages are dead. You lose :(`, `Failure: invalid input. Expected 'x y' but found 'True'`, `Failure: invalid input. Expected 'Integer' but found 'x'`, an old `expected 'x y'` failure for Go's `Println(x, " ", y)` (three spaces), `Batman moved from window (0,0) to window (0,0)` (jumping in place is a jump), and `Timeout: your program did not provide an input in due time.`. A CodinGame blog post says a jump outside the building makes Batman "die".

## Protocol (exact)

### Initialization input
| Line | Content |
|---|---|
| 1 | `W H` width and height of the building in windows |
| 2 | `N` number of jumps |
| 3 | `X0 Y0` Batman's starting window |

### Input for one game turn
| Line | Content |
|---|---|
| 1 | `bombDir`: `U`, `UR`, `R`, `DR`, `D`, `DL`, `L` or `UL` |

### Output for one game turn
| Line | Content |
|---|---|
| 1 | `X Y` the window to jump to |

### Limits
- Response time: 150 ms per turn (the engine adds its boot allowance to the first turn, as for every game here)
- Max turns: N (2 ≤ N ≤ 100); 1 ≤ W, H ≤ 10000
- Victory: land on the bombs' window within N jumps
- Invalid output, a window outside the building or a timeout: loses at once

## Rule decisions

| Topic | Decision | Basis |
|---|---|---|
| Hint letters | vertical first (`U`/`D` compare Y), then horizontal (`L`/`R` compare X); Y grows downwards | statement list (`UR`, `DL`, ...), example (UR from (2,5) to the bombs at (7,4)) |
| Jump onto the bombs | wins immediately, including on the N-th jump | replays (14 of 14, 7 of 7) |
| Out of jumps | lost right after the N-th jump; log line is CodinGame's | forum quote, replay frame counts |
| Same window again | allowed, costs a jump | forum quote `moved from window (0,0) to window (0,0)` |
| Window outside the building | loses at once. Our message: `Failure: window (x,y) is outside the building (X 0..W-1, Y 0..H-1). Batman fell. You lose :(` | blog ("die"); CodinGame's exact message not found |
| Output format | the line is trimmed, then split on single spaces: not exactly 2 parts → `Failure: invalid input. Expected 'x y' but found '<line>'`; a part that is not an integer (optional sign, 32-bit) → `... Expected 'Integer' but found '<part>'` | forum quotes. Two spaces between the numbers fail (matches the old Go report); **leading/trailing spaces are accepted (assumption)** |
| Moving bombs (`"evasive": true`) | after each jump, before the hint, the bombs move to a uniformly random window of the current rectangle other than Batman's new window (Batman's window only if it is the rectangle's only one) | replay of the 9998 x 9998 test; uniform choice is our assumption (13 samples look uniform, the exact rule is unknown) |
| Bombs "may change from one execution to the other" | `"bomb": "random"`: placed from the run seed (any window but the start) | statement note; which CodinGame tests do this is unknown |
| Start on the bombs | rejected as test data | would make the first input empty |
| Time | 150 ms per turn, first turn too (plus the engine's boot allowance) | statement ("Response time per turn ≤ 150ms", printed twice) |
| Scores | `[1]` pass, `[0]` fail | replays (`scores: [1]`) |

## Tests

`games/shadows-of-the-knight-episode-1/tests/`: 11 designed levels and 6 generated ones (`generator.js` profiles small, medium, line, edge, large, evasive), all our own numbers (CodinGame's test data is not public; the replay sizes above inspired the kinds):

| Test | What it checks |
|---|---|
| 01 many jumps | 6x9 with 30 jumps: anything sensible passes (like CodinGame's first test) |
| 02 fewer jumps | 25x30, 12 jumps, 7 to spare |
| 03 just enough | 40x60, 6 jumps, no spare jump |
| 04 tower | W = 1, H = 100, 7 jumps (tight): one-axis search |
| 05 corridor | H = 1, W = 200, 8 jumps (tight) |
| 06 same column | first hint `D`: X is known at once; moving X loses (tight) |
| 07 corner | bombs in the top-right corner, 7 jumps (tight); fails inclusive (off-by-one) bounds |
| 08 far edge | bombs on the far border, tight; fails inclusive bounds |
| 09 random bombs | bombs placed by the seed, 1 jump to spare against the worst start hint |
| 10 skyscraper | 10000 x 10000, 14 jumps (tight) |
| 11 moving bombs | 9000 x 9500, 14 jumps, bombs move every jump (like CodinGame's last test) |
| 12-17 generated | small, medium, tower/corridor 1x8040, edge 3565x8977, large, moving bombs |

**Solvability is proven, not eyeballed.** The bombs can only be in a rectangle; each axis is a three-outcome search, so the fewest jumps that surely win from a rectangle w x h is `max(ceil(log2(w+1)), ceil(log2(h+1)))` (`rules.need`). This closed form was checked against an exhaustive minimax search over every rectangle up to 12 x 12 (144/144 agree), and the middle jump was checked optimal on 1,000+ sampled rectangles. Every test and every generated level gives N ≥ that worst case for the actual first hint (or the worst first hint when the bombs are random or moving), so a correct search passes whatever the seed. The same argument holds for moving bombs, which can only pick hints a fixed bomb could also have produced.

Seeds: `random:<seed>` levels embed their seed; for tests 09, 11 and 17 the bombs come from the run seed (the UI's Seed box). `node cli.js <id> <bot> --test all` always runs these with seed 1 (the CLI does not pass `--seed` to designed tests).

## Review codes

`referee.review()` knows, for every jump, the rectangle before it, the jumps left `L`, the worst case of that jump over all hints, and the rectangle after the real hint.

| Code | Kind | When |
|---|---|---|
| `decisive-unbalanced-split` | mistake | the first jump after which no search could surely win (rectangle needs more than `L - 1`), and the jump cut an axis unevenly. Names the jump, the rectangle, the cut sizes and the middle that kept the win |
| `decisive-ruled-out-window` | mistake | same, but the jump's X or Y was already excluded by earlier hints (bounds not kept) |
| `decisive-against-hint` | mistake | same, but it moved against (or not along) the last hint on that axis |
| `decisive-left-known-axis` | mistake | same, but X (or Y) was already known exactly and the jump changed it |
| `decisive-same-window` | mistake | same, by jumping to the window Batman was on |
| `lost-earlier-than-it-looks` | tip | the decisive jump came before the last one |
| `wasted-jumps` | tip | jumps that did not reduce the worst case (also on a pass, then "fails with fewer jumps") |
| `stuck-same-window` | tip | 3+ jumps in a row to the same window; says whether it looks like the inclusive-bounds rounding loop or like hints being ignored |
| `lucky-pass` | warning | passed, but a jump made while the win was sure could have lost with another bomb position (names that position range) |
| `level-unsolvable` | warning | the level gives fewer jumps than the worst case (none of ours; CodinGame-like data may) |
| `jumped-outside-building`, `invalid-output`, `timeout`, `disqualified` | mistake | the game ended on an illegal answer |

A loss is only blamed on a jump made while the win was still sure, so optimal play on a not-always-winnable level (like the 1 x 79, 6-jump tower in a CodinGame replay: 77 windows need 7 jumps in the worst case) is never called a mistake.

## Spoiler

`games/shadows-of-the-knight-episode-1/solution/solution.js` (marked SPOILER) is a complete solution: exclusive bounds, jump to the middle. It passes all 17 tests and generated levels; in-process it won 5,314 games (every test, 300 seeds for the seed-dependent ones, 3,000 random levels, 200 per generator profile).

## What differs from CodinGame

- Test maps and bomb positions are ours; CodinGame's visible tests and hidden validators are not public (only the 7 replays).
- The exact out-of-building message, the moving-bombs rule (uniform choice, avoids Batman's window) and the acceptance of leading/trailing spaces are assumptions (see the table).
- The viewer shows the bombs (CodinGame shows them only in its debug mode).
