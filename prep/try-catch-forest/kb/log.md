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

Replays of real Silver battles (same opponents, seats and map as the arena game; `tools/rerun.sh`), first 16 battles
of submission 41742214 by game id, so not selected by result:

| | First | Second | Last | Mean rank | Catches | by turn 10 | by 20 | Lost |
|---|---|---|---|---|---|---|---|---|
| v5 in the arena | 10 | 4 | 2 | 1.50 | 3.81 | 0.56 | 1.44 | 1.38 |
| v8 replaying the same battles | 10 | 6 | 0 | 1.38 | 3.75 | 0.62 | 1.75 | 1.31 |

Better rank in 3 battles, worse in 3, same in 10. Control: v5 replaying 8 of its own battles gave the identical result
in 8 of 8, so replays are exact and the opponents are deterministic. v8 is level with v5 or slightly ahead against
the Silver field; 16 games cannot say more.

Local referee, 120 games (20 maps x 6 seat orders): mean rank v1 1.88, v5 1.98, v8 2.13. Against our own bots the
newer versions are not better. Ablation of every change over 1,920 local games: see the table at the end of this file.

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

## Ablation on the local referee (2026-11-18, 1,920 games)

v9 is v8 with a switch on every change. Each pool: v9 and four variants with one switch off, 8 maps x 60 seat
orders = 480 games, 288 games per version. Mean rank: lower is better; one standard error is about 0.05.

| Variant (one thing switched off) | Mean rank | v9 in the same pool | What it says |
|---|---|---|---|
| no smoke at all | 2.35 | 1.97 | smoke is the most valuable single tool (lost 2.82 units per game against 2.29) |
| smoke ahead of ourselves instead of past the hunter | **1.75** | 1.97 | the old placement is better: the change of v6 was wrong |
| no unseen-ground penalty | **1.81** | 2.00 | the penalty costs more catches than it saves units |
| no avoidance of old predator positions | **1.91** | 2.03 | slightly harmful |
| no search map (ring patrol) | 2.14 | 1.97 | the map helps |
| no approach dash | 2.08 | 1.97 | early dashes towards prey help |
| no stale-predator model | 2.07 | 2.00 | helps a little |
| no ways-out count | 2.05 | 2.00 | helps a little |
| no dash budget rule | 2.01 | 1.97 | neutral |
| no five-turn chase | 1.96 | 2.03 | neutral on rank (but 2.73 units lost against 2.24) |
| no wide nets | 2.05 | 2.03 | neutral |
| no decoys | 2.02 | 2.03 | neutral here (our own bots do not net much at range) |
| no separation | 1.98 | 2.00 | neutral |
| no hiding when the prey is gone | 1.97 | 1.97 | neutral |
| no soft distance to predators | 1.99 | 1.97 | neutral |
| **v5** (in the last pool) | **1.69** | 1.97 | v5 beats v9 clearly |

Reading:
- The arena label "42 % of lost units were inside our own smoke" was a correlation. Units throw smoke when they are
  in danger, so units in smoke die more often than others; that does not mean the smoke killed them. Taking the
  smoke away, or moving it onto the hunter, makes things worse. The real fault was the freeze (a unit standing still
  in the cloud), and that came from the unseen-ground penalty.
- v9 lost to v5 because of two changes (smoke placement, and it kept the unseen-ground penalty), not because the
  other ideas are bad: the map, the approach dash, the stale-predator model and the ways-out count each help.

## v10 (2026-11-18): the version for Gold

v10 = v9 with `F_SMOKE`, `F_HIDDEN` and `F_OLDPRED` off (the three changes the ablation found harmful).

| Test | v5 | v10 |
|---|---|---|
| Local referee, 480 games (v5 against four variants: cA = v10 with old-predator avoidance, cB = v10, cC = v10 without separation, cD = v10 without the chase lookahead) | 2.16 | cA 1.95, cB 1.96, cC 1.94, cD 1.97 |
| All 21 Gold arena battles replayed: first / second / last | 9 / 7 / 5 | 11 / 9 / 1 |
| ... mean rank | 1.81 | 1.52 |
| ... catches per game, by turn 10, by turn 20 | 3.48, 0.48, 1.29 | 3.62, 1.24, 2.00 |
| ... units lost per game | 1.95 | 2.67 |
| ... better / worse / same rank per battle | | 7 / 3 / 11 |
| Turn time on CodinGame (1,926 turns) | | median 0.8 ms, worst 25 ms |

`kb/gold.md` has the reasoning and the profile of the top Gold teams. v11 is v10 with tunable numbers; tuning pools
on the local referee: see below when filled in.

## Tuning of v11's numbers on the local referee (2026-11-18, 2,400 games)

Five pools of 480 games: the base and four variants each. Mean rank, lower is better; one standard error about 0.05.

| Pool | Base | Variants |
|---|---|---|
| Pull towards prey, soft distance to predators | 2.00 | pull x1.5: 1.96; pull x0.7: 1.96; distance x0.5: 1.97; distance x1.5: 2.07 |
| Chase lookahead, two-turn margin, net-line penalty | 1.90 | lookahead x0.5: 2.05; lookahead x2: 2.08; margin x0.5: 1.88; net line x3: 2.09 |
| Dashes | 1.95 | **approach dash with a predator down to 2200 away and for the first three dashes: 1.85**; cheaper flee dash: 2.00; strike reward x3: 2.23; strike reward x0.3: 1.95 |
| Nets | 1.96 | sure distance 1800: 2.02; no reserve and range 2400: 2.06; wider nets at hunters: 2.01; reserve of 3: 1.97 |
| Smoke, decoy, ways out | 1.90 | smoke from 2800: 2.05; smoke from 1800: 2.14; decoy from 2200: 1.95; ways-out weight x2: 1.95 |

Reading: the numbers of v10 sit at or near their best; 19 of 20 variations are level or worse. Smoke timing is
sensitive in both directions (2300 is right). The one gain, a wider approach dash, is being confirmed on fresh seeds
and then on replays of Gold battles before it goes anywhere.

## v10 in the Gold arena

Submitted 2026-11-18 11:40 IST (submission 41743202), replacing v5 (148th of 274, score 16.1, at 30 % of its games).
First 23 games: 11 first, 7 second, 5 last, mean rank 1.74, catches 3.43, lost 2.43; 134th of 300, score 16.9, at 25 %.

## After v10: candidates judged on replays of v10's own Gold battles (2026-11-18)

| Candidate | Battles | v10 in the arena (mean rank, catches, lost) | Candidate | Verdict |
|---|---|---|---|---|
| v12 (rescue nets, decoys for visible predators, wider approach dash) | 26 | 1.81, 3.31, 2.42 | 1.81, 3.27, 2.58 | level, dropped |
| v13 (second hunter aims 800 behind the prey) | 24 | 1.88, 3.25, 2.50 | 2.04, 2.75, 3.08 | worse, dropped (was +0.2 to +0.4 on the local referee) |
| v11 with nets limited to 1600 | 3 | 1.00 | 2.00 | stopped early, undecided |
| v11 with smoke from 1800 instead of 2300 | 36 | 1.83, 3.22, 2.47 | 2.06, 2.72, 2.53 | worse, dropped |
| v11 with nets limited to 1600, second run | 10 | 1.50, 3.60, 2.70 | 2.00, 2.80, 2.70 | stopped: 0 better, 3 worse |
| vs4: always dash onto netted prey, cheap (`F_RUSH`) | 29 | 1.83, 3.31, 2.55 | 1.97, 3.07, 2.62 | not better (better in 4, worse in 8), dropped |
| vs3 (other session): net at prey only when a hunter of ours ends within 1300 | 16 (stopped for the mimic) | 1.75, 2.75, 1.94 | 2.06, 2.31, 2.12 | worse (better in 1, worse in 5), dropped |
| vmimic (mimic of the leader ATI x iHot, copy of 15:08) | first 20 by game id | 1.75, 3.55, 2.55 | 1.90, 3.55, 3.20 | level to slightly worse (better in 7, worse in 8, same in 5); loses more units; net hits converted 73 % of 22 (v10: 74 %); no error, no turn over 30 ms (worst 15 ms) |
| vgo (other session: commit to held prey, cloud memory, hunt first, early dash, ghost plan) | 8 (stopped: clearly worse) | 1.62, 3.88, 2.62 | 2.25, 2.62, 3.25 | clearly worse (better in 0, worse in 4, same in 4), dropped |
| vgo_b (vgo + blind units keep their heading, cloud thrown two thirds of the way to the predator) | first 20 | | | running since 15:43 |

v10's place in Gold: 104th of 357 (score 18.0) when its 37 games ended, 85th of 383 (18.9) an hour later.

Sub-version pools of the battle-autopsy session (14 switches, smoke distance in four pools, bundles vs1 to vs3): see `subversions.md`.

## Submissions in Gold (2026-11-18)

| Time (IST) | Submission | What | By whom | Result |
|---|---|---|---|---|
| 11:03 | 41742767 | v5 | the user's own session | replaced at 30 %: 148th of 274, score 16.1 |
| 11:35 | 41743202 | v10 | this session, on the user's word | 37 games: 104th of 357 (18.0); later 85th of 383 (18.9), then 134th of 407 (19.0) as the league grew |
| 15:41 | 41746943 | mimic of the leader (`vmimic.java`, 15:08 copy, md5 8a9d4df40526, the copy replayed in gold/gm; now `vmimic_a.java`; its author calls it unfinished: turn-1 net instead of smoke in about 40 % of the cases) | the analysis session, on the user's instruction to it | replaced after 25 games at 16 %: 11 first / 6 second / 8 last, mean rank 1.88, units lost 3.3 per game, score 16.5 |
| 16:02 | 41747326 | hybrid (`vhybrid4.java`, md5 ac9e2ec5581e): that mimic copy in games with 4 units per team, v10 in all others | the analysis session, on the user's instruction to it | running |

v10 is no longer live. `versions/v10.java` is the file to resubmit if the mimic's rating ends below v10's 19.0; a
resubmission needs about 40 minutes for its 37 games, so about 17:15 IST is the last sensible moment today.

Control proposed by the analysis session and built here: `versions/v10-placebo.java` = v10 with its 24 search
directions turned by 7.5 degrees (same rules, different trajectories). Every candidate today was compared with v10's
one realised arena result on the same battles; if v10 was lucky in those battles, every candidate of equal strength
looks worse by the same amount. The placebo's score on the same 20 battles is the bar a candidate has to beat.

Two things learnt from these submissions:
- Replays are tied to the current submission. When the mimic replaced v10, 19 of 20 replays of v10's battles were
  refused ("no longer an opponent you can test against"); when the hybrid replaced the mimic, the mimic's battles
  closed in turn. Every resubmission costs the replay base of the version it replaces, and a new placement run.
- Paired replays on the mimic's battles before they closed: only 4 battles had all versions. ATI mimic (arena) 2 / 1 / 1,
  mean rank 1.75, units lost 3.75; v10 2 / 1 / 1, 1.75, 1.75; FullStuck mimic (`vmimic3`) 1 / 0 / 3, 2.50, 3.25;
  Les Gens Bons mimic (`vmimic2`) 0 / 2 / 2, 2.50, 4.25. v10 ranked above vmimic3 in 2 battles and below in 0, above
  vmimic2 in 3 and below in 0. Too few to conclude; direction: v10 level with the ATI mimic with half its losses,
  the other two mimics behind.
- vgo_b never got a valid replay set (1 battle); vgo was clearly worse on 8.

## Hybrid in the arena and the first real-battle gain of the day (16:34 IST)

Hybrid (submission 41747326, `vhybrid4.java`: mimic copy A in 4-unit games, v10 otherwise): 56 games at 46 %,
18 first / 21 second / 17 last, mean rank 1.98, score 18.8, 240th of 429.

The hybrid's 4-unit battles, the same 11 battles replayed with v10 and with mimic copy C:

| Version | First / second / last | Mean rank | Catches | Lost |
|---|---|---|---|---|
| Hybrid = mimic copy A (arena) | 5 / 6 / 0 | 1.55 | 3.64 | 2.18 |
| v10 (replay) | 3 / 6 / 2 | 1.91 | 2.82 | 2.00 |
| Mimic copy C (replay) | 7 / 0 / 4 | 1.73 | 2.82 | 2.27 |

Copy A ranked above v10 in 5 battles and below in 1; copy C above v10 in 6 and below in 3; A and C 4 each.
In 4-unit games the leader mimic is ahead of v10: the first candidate today that beats v10 on real battles.

Tool fault found on the way: `rerun.sh` waited 30 seconds once; slower games then came back without a log and
the next request collided with the game still running. Fixed (it now polls until the game is done).
