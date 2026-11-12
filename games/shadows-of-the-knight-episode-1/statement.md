# Shadows of the Knight - Episode 1

Solo puzzle ([CodinGame page](https://www.codingame.com/ide/puzzle/shadows-of-the-knight-episode-1)). Rules summarised in our own words; the full original statement is shown when you have fetched it with `node cli.js fetch shadows-of-the-knight-episode-1`.

Batman is on one window of a building that is a grid of **W × H** windows; (0,0) is the **top-left** window, X grows to the right and Y grows **downwards**. The bombs are in one hidden window. Before every jump a device tells you in which direction the bombs are, seen from Batman's current window. Each turn you name the window Batman jumps to. Land on the bombs' window within **N jumps** to win.

## The device

| Hint | Bombs are… |
|---|---|
| `U` | above (smaller Y, same X) |
| `UR` | above and to the right (smaller Y, larger X) |
| `R` | to the right (same Y, larger X) |
| `DR` | below and to the right (larger Y, larger X) |
| `D` | below (larger Y, same X) |
| `DL` | below and to the left (larger Y, smaller X) |
| `L` | to the left (same Y, smaller X) |
| `UL` | above and to the left (smaller Y, smaller X) |

The vertical letter (U/D) only compares Y and the horizontal letter (L/R) only compares X: no `R` and no `L` means the bombs are exactly in Batman's column; no `U` and no `D`, exactly in his row. So all hints together always leave a rectangle of possible windows.

## Rules

- Every line you print is one jump, to any window of the building (also one you were on before; it still costs a jump).
- Landing on the bombs' window wins at once. After the N-th jump without finding them, you lose.
- A window outside the building (X < 0, X ≥ W, Y < 0, Y ≥ H), a badly formatted line or no answer within 150 ms loses at once.
- In some tests the bombs' position changes from one run to the next, and in one kind of test (marked "moving bombs" here) they even move after every jump, always to a window that agrees with every hint given so far. A search that only trusts the hints works in both cases.

## Protocol

**Initialization input**
1. `W H`: width and height of the building, in windows
2. `N`: number of jumps you have before the bombs go off
3. `X0 Y0`: Batman's starting window

**Input for one game turn**
1. `bombDir`: the hint, one of `U`, `UR`, `R`, `DR`, `D`, `DL`, `L`, `UL`

**Output for one game turn**: one line `X Y`, two integers separated by a single space: the window Batman jumps to.

**Constraints**: 1 ≤ W ≤ 10000, 1 ≤ H ≤ 10000, 2 ≤ N ≤ 100, 0 ≤ X, X0 < W, 0 ≤ Y, Y0 < H, 150 ms per turn.

## Example

Building 10 × 10, 6 jumps, Batman on (2,5). The device says `UR`: the bombs have a smaller Y and a larger X, so they are in X 3..9, Y 0..4. Batman jumps to `5 4`. The device says `R`: same row (Y = 4), larger X: X 6..9. Batman jumps to `7 4` and lands on the bombs.

## Tests here vs on CodinGame

The levels in this arena are our own designs plus generated ones. Each one gives at least as many jumps as the worst case of a perfect search needs, so a correct search always passes, whatever the bomb position or seed. Several are tight on purpose (no jump to spare), like CodinGame's harder tests, where one wasted jump or an off-by-one bound fails. **Random level** with any seed gives unlimited extra practice; the **Seed** box also moves the bombs of the tests marked "placed by the seed" and "moving bombs".

The viewer shows the windows the hints still allow (amber), every jump, and the bombs (red, for debugging only: your program never sees them). After a run the **Review** names the jump that made the level impossible to win for sure, which axis it got wrong (an uneven cut, a window already ruled out, going against the hint, moving along an axis that was already known) and the jump that would have kept the win.
