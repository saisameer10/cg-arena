# Version log

Test games through the API, our bot in seat 0 against two copies of the league boss, random maps.
"Lost" = our units caught. Batches are small (7 or 8 games): differences of one game mean nothing.

| Version | Commit | Change | Games | Wins | 2nd | Catches | Lost |
|---|---|---|---|---|---|---|---|
| kit | 362320a | pre-statement kit, input parsing missing | - | - | - | - | - |
| v1 | 357f6e9 | first bot from the statement: candidate scoring, nets, smoke, decoys, ghost scouts, rotation on turn 1 | 7 | 7 | 0 | 30 | 7 |
| v2 | this branch | referee's slide rule in `simMove` (error 1 unit instead of up to 400); five-turn chase; rescue net | 6 | 5 | 1 | 25 | 1 |
| v3 | this branch | nets also at prey that could dodge while one net stays in reserve; units stand still when no prey is left | 8 | 7 | 1 | 34 | 4 |
| v4 | this branch | penalty for moves into ground nobody sees; predators remembered 4 to 8 turns as places to avoid | 8 | 8 | 0 | 36 | 2 |
| v5 | this branch | a held unit keeps its net for the hunter | 8 | 6 | 2 | 35 | 3 |

## What each step was based on

- v1 -> v2. `audit.py` on a debug game: 8 % of the predicted end positions were more than 50 units off, always next
  to a tree. `slidefit.py` compared four models with 638 real moves; "straight to contact, then tangent with the
  projected speed" fits 99 % within 3.4 units. Two units were lost together at radius 7,570 after four turns of
  running straight from two predators: the five-turn chase now sees the wall coming.
- v2 -> v3. A game was lost on the tie-break with two nets unused: prey standing at 1,640 with its dash ready did
  not pass the old net rule. One unit was lost on turn 82 while patrolling after the prey was already wiped out.
- v3 -> v4. Three of four losses: no predator in sight on any of the five turns before the catch (hidden behind
  trees), two of them right after a dash.
- v4 -> v5. A held unit threw its net at prey while the hunter walked in.
- The two second places of v5 are games with 3 units per team: all three prey caught, but later than the other
  hunter caught its three (their catches on turns 2, 2, 8 and 5, 22, 27; ours on 11, 14, 16 and 33, 53, 62).

## Checks that passed
- Turn time: 17 to 46 ms on the first turn (limit 1000), about 1 ms afterwards (limit 50), no turn over 40 ms.
- No error, timeout or invalid command in 42 test games (plus one probe game with a script that only printed its input).
- Local replay of three recorded games: same number of answers as turns, no exception.
