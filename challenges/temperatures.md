# Challenge: Temperatures (classic)

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/temperatures>
- Kind: io (CodinGame type `CODE`, easy). The reference example for classic puzzles: no referee code, only `game.json` with `"type": "io"` and test files.

## Statement

Original saved locally with `node cli.js fetch temperatures` (`challenges/raw/temperatures.html`, not committed). Summary: `games/temperatures/statement.md`.

## Decisions

- The program receives the whole input, then end of file (stdin is closed), as on CodinGame; programs reading until EOF work.
- Output lines are compared after trimming trailing spaces; the first differing line is reported.
- Time limit 2000 ms per test (`timeLimitMs` in `game.json`).

## Tests

8 test files written for this arena (`games/temperatures/tests/`): simple, only negatives, tie between −5 and 5 in a list, only the tie, no temperature (empty second line), a single value, extremes, 300 values. Expected outputs computed by a reference solution.
