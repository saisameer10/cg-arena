# The Bridge - Episode 2

Solo puzzle ([CodinGame page](https://www.codingame.com/ide/puzzle/the-bridge-episode-2)). Rules summarised in our own words; the full original statement is shown when you have fetched it with `node cli.js fetch the-bridge-episode-2`.

You steer 1 to 4 motorbikes along a 4-lane road full of holes. All bikes obey the same command each turn and always share the same X position and speed. Get at least **V** bikes past the end of the road within **50 turns**.

## Commands (one per turn)

| Command | Effect |
|---|---|
| `SPEED` | speed + 1, then move |
| `SLOW` | speed − 1 (at speed 0 it stays 0), then move |
| `WAIT` | move at the current speed |
| `JUMP` | move at the current speed, flying over everything except the landing cell |
| `UP` / `DOWN` | move forward and change lane (lane 0 is the top). If any running bike would hit the guard rail, no bike changes lane that turn (they go straight); lost bikes do not block |

Each turn the bikes advance by their speed. A bike falls into a hole (and is lost) when:

- **straight move** (SPEED, SLOW, WAIT): any cell after its start up to and including its landing cell is a hole;
- **JUMP**: its landing cell is a hole;
- **UP/DOWN**: a hole lies on its current lane from X+1 to X+S−1, or on its new lane from X+1 to X+S (the "black zone" of the original statement). At speed 0 the bike only steps sideways, and it falls if that cell is a hole (the original statement does not cover this case; this arena treats it like any landing cell).

Cells beyond the end of the road are safe. You win when the remaining bikes reach X ≥ road length with at least V of them. You lose when fewer than V remain, or after 50 turns.

## Protocol

**Initialization input**
1. `M`: number of bikes (1 to 4)
2. `V`: minimum number of bikes that must cross
3. 4 lines: the lanes, top to bottom; `.` safe, `0` hole

**Each turn input**
1. `S`: current speed
2. `M` lines `X Y A`: position of each bike and `A` = 1 if it is still running, 0 if it was lost (a lost bike stays where it fell)

**Each turn output**: one of `SPEED`, `SLOW`, `JUMP`, `WAIT`, `UP`, `DOWN`.

**Constraints**: bikes start at X = 0; 0 ≤ S < 50; 1 ≤ V ≤ M ≤ 4; X < 500; 150 ms per turn.

## Tests here vs on CodinGame

The levels in this arena are our own designs plus generated ones, each checked by a solver so it can be passed. They follow the same rules as CodinGame's tests but are different maps, exactly like CodinGame's hidden validators differ from its visible tests. Use **Random level** with any seed for unlimited extra practice.

After a failed run the **Review** names the first turn whose command made the level impossible, and which commands would still have won from there.
