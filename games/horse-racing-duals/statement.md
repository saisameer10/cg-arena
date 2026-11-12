# Horse-racing Duals (classic puzzle)

Classic input/output puzzle ([CodinGame page](https://www.codingame.com/ide/puzzle/horse-racing-duals)), summarised in our own words. The original statement is under "Original statement" in the IDE once it was saved with `node cli.js fetch https://www.codingame.com/ide/puzzle/horse-racing-duals`.

A race track wants to run duels: races with only two horses. A duel is only interesting when both horses are about equally strong. You get the strength of every horse; print the smallest difference between the strengths of two different horses.

## Protocol

**Input**

| Line | Content |
|---|---|
| 1 | `N`: the number of horses |
| next `N` lines | one integer per line: `Pi`, the strength of horse `i` |

**Output**: one line, the integer `D` (≥ 0): the smallest difference between the strengths of two different horses.

**Constraints**

- 1 < `N` < 100000
- 0 < `Pi` ≤ 10000000
- Strengths are not sorted and two horses may have the same strength (then `D` = 0).

**Example**

| Input | Output |
|---|---|
| `3`<br>`5`<br>`8`<br>`9` | `1` |

## Tests here vs on CodinGame

The 15 test files in `games/horse-racing-duals/tests/` are our own (CodinGame's validators are hidden), and **Random level** in the IDE (or `--random N` in the CLI) generates more, like hidden validators. They cover the cases CodinGame's tests are known for: horses in any order, the closest pair on the first or last lines, the closest pair at the very top or bottom of the sorted strengths, equal strengths, and many horses (N = 99,999, where comparing every pair is too slow).

Your program gets the whole input, then end of file; its first output line is compared with the expected answer. Time limit: 2000 ms per test (plus the arena's start-up grace for the interpreter/JVM). When a test fails, the Review tab names the likely mistake (for example "neighbours in input order", "sorted as text", "skipped the last pair", "too slow") and the two closest horses with their input lines.

**Java**: the class is `Solution`, as on CodinGame (`Player` works too), so code pasted from CodinGame runs unchanged.
