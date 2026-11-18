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

## After the first submission (arena, 2026-11-18)

Arena record (all games, real players):

| Version | League | Games | First | Second | Last | Mean rank | Catches | by turn 10 | Lost |
|---|---|---|---|---|---|---|---|---|---|
| v1 (submission 41741862) | Bronze | 80 | 51 % | 21 % | 28 % | 1.76 | 3.76 | 1.14 | 3.04 |
| v5 (41741950) | Bronze | 197 | 49 % | 30 % | 21 % | 1.73 | 3.14 | 0.75 | 1.99 |
| v5 (41742214, resubmitted after the promotion) | Silver | 63 so far | 48 % | 37 % | 16 % | 1.68 | 3.60 | 0.63 | 2.10 |

v5 was promoted to Silver at 10:16 IST and stood 7th of 68 at 36 % of its Silver games, above the boss (16th).

Candidates built from the arena analysis (none submitted; `arena.md` has the reasons for each change):

| Version | Change | Evidence so far |
|---|---|---|
| v6 | dash only for a catch or when no walk is safe; smoke thrown past the hunter; no stacking; ways-out count; unseen predators keep moving; cheaper simulation and a time guard | 12 worst Bronze games replayed: units lost 45 -> 25. Fresh paired seeds against the top Silver player and the Silver boss, 8 games: level with v5 (22 catches, 9 lost each; v5 2 wins, v6 1) |
| v7 | v6 + the first two dashes may be spent to close in on prey; smaller unseen-ground penalty for hunters | round robin below |
| v8 | v7 + search map instead of the ring patrol | round robin below; replays of Silver battles: see the end of this file |

Round robin, 15 games, three versions in one game (5 seeds x 3 rotations of the seats):

| Version | First | Second | Last | Mean rank | Catches | by turn 10 | Lost |
|---|---|---|---|---|---|---|---|
| v5 | 8 | 6 | 1 | 1.53 | 2.87 | 0.47 | 2.07 |
| v7 | 3 | 6 | 6 | 2.20 | 2.53 | 0.73 | 2.87 |
| v8 | 4 | 3 | 8 | 2.27 | 2.07 | 0.33 | 2.53 |

This test is flawed and must not be read as "v5 beats v7 and v8": rotating the seats of ABC keeps the cycle, so in
all 15 games v5 hunted v7, v7 hunted v8 and v8 hunted v5. A version's catches measure its prey as much as itself.
A fair round robin needs both cycles (ABC, BCA, CAB and ACB, CBA, BAC). What it does say: nothing here shows that
v7 or v8 is stronger than v5, so v5 stays in the arena until a fair test says otherwise.

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
