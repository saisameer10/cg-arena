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

## Late afternoon of 2026-11-18: four more submissions and what each showed

All times IST. A submission plays its ranking games in parallel; figures are from the game logs
(`tools/arena.py`, `tools/mimcmp.py`, `tools/allcmp.py`, `tools/tiebreak.py`).

| Time | Submission | File | Games read | First / second / last | Mean rank | Catches | Lost | Rating seen |
|---|---|---|---|---|---|---|---|---|
| 16:02 | 41747326 | `vhybrid4.java` (mimic copy A with 4 units, v10 otherwise) | 66 | 23 / 20 / 23 | 2.00 | 3.03 | 2.92 | 19.5 at 52 % |
| 16:44 | 41748059 | `vlive_41748059.java` (v10 + "better ability usage" + early aggression by team size; sent from another session) | 145 | 52 / 48 / 45 | 1.95 | 2.59 | 2.30 | 20.4 at 64 % |
| 17:43 | 41748858 | `vuser1_m4.java` (that code + three user rules, mimic copy A with 4 units) | 60 | 21 / 17 / 22 | 2.02 | 2.75 | 2.32 | 18.0 at 54 % |
| 17:55 | 41749025 | `vlive_41748059.java` again (put back before the window closed, on the user's choice) | - | - | - | - | - | 18.5 at 90 % |

The same file scored 20.4 in its first run and 18.5 in its second: one run's rating carries about two points of
noise (other games, a field that got harder through the day). A version cannot be judged on one rating.

### By team size, afternoon field (mean rank, games)

| Version | 3 | 4 | 5 | 6 | All |
|---|---|---|---|---|---|
| v10 code (inside the hybrid) | 2.08 (13) | 2.44 (9, morning) | 2.22 (27) | 1.87 (15) | 2.09 |
| Mimic copy A (alone and inside the hybrid) | 1.78 (9) | 1.68 (19) | 1.50 (4) | 2.50 (4) | 1.78 |
| `vlive_41748059` (first run, 145 games) | 1.85 (39) | 1.93 (40) | 2.00 (33) | 2.06 (33) | 1.95 |
| `vuser1_m4` | 2.00 (19) | 2.00 (12, mimic) | 1.94 (16) | 2.15 (13) | 2.02 |

Paired on the same 12 four-unit battles of the hybrid: mimic copy A (arena) 1.58, v10 (replay) 2.00; v10 above
in 1, below in 6. On 11 of them copy C scored 1.73 against copy A's 1.55 (above in 4, below in 4).

### The three user rules (`vuser1.java`, switches `F_SMOKE_ON_PRED`, `F_NET_CAREFUL`, `F_USER_AGGRO`)

Arena, `vuser1_m4` (60 games) against `vlive_41748059` (145 games):

| Rule | Measured | Before | After |
|---|---|---|---|
| Smoke centred on the predator | units lost while held by a net, share of losses | 47 % | 32 % |
| | units lost by turn 10, share of losses | 19 % | 12 % |
| | units lost beyond radius 6500, share of losses | 18 % | 32 % |
| Attack nets only when sure, with a finisher within 1600, no team mate on the flight line | nets that hit prey | 31 % | 22 % |
| | nets thrown by turn 5 | 24 % | 14 % |
| | catches made on netted prey, share of catches | 36 % | 22 % |
| Pressing mode until the first catch (3 and 4 units) and while not ahead of the predator | catches of free prey with a dash, share of catches | 20 % | 33 % |
| | catches by turn 10 per game | 0.54 | 0.58 |
| All together | mean rank | 1.95 | 2.02 |
| | non-wins lost on the tie-break | 15 % | 26 % |

Reading: the net rule is the loss (it removes the early close nets that make first catches); the smoke rule
protects held units and the opening but drives units to the wall; the pressing mode did what it was meant to.
Not separated by a test: the three rules went in together, in a different hour from the comparison run.

### Tie-breaks (`tools/tiebreak.py`, 53 places lost in four runs)

- 25 to 32 % of our places below first are lost with the same number of catches as the team just above; every
  one was decided by the first catch.
- Their first catch came on about turn 4 to 6, ours on about turn 15 to 18 (later by a median of 8 to 11 turns);
  in 40 of the 53 we had no catch by turn 10.
- By team size (`vlive_41748059`, first run): 10 of 39 three-unit games, 7 of 40 four-unit games, 4 of 33
  five-unit games, 2 of 33 six-unit games.
- The team above was our prey team in 33 (its first catch was a unit of the third team) and our predator team in
  20 (its first catch was one of ours, by turn 6 in half of them).

### The state that decides a game (v10's 37 arena games; v5 agrees)

| State at turn 15 | Games | First / second / last | Mean rank |
|---|---|---|---|
| At least one catch of ours | 24 | 15 / 5 / 4 | 1.54 |
| No catch yet (0.4 units lost by then) | 13 | 3 / 3 / 7 | 2.31 |

### Other results of the afternoon

- Net hits on prey that did not become a catch (`tools/netfail.py`, 39 debug replays of v10, 70 hits, 18 wasted):
  nearest unit of ours ran from a predator it could not see 7, was held by a net itself 6, lost sight of the held
  unit 4, was caught on the way 1.
- Chase engine (`vchase.java`, two-ply search with the exact movement rule) against the three mimics, 240 local
  games: v10 1.83, flight search 1.97, forced-catch test 1.80, both 1.96. The flight search is worse.
- Bots by team size on the local referee, 240 maps per size: no version separated at any size (largest gap 0.26,
  between two identical programs). The local referee cannot choose a bot per team size.
- Sprites (`SECRET_FOREST_SPRITE`): no effect on the power pool, the dash cooldown or the fatigue in 51 debug games.

## Night of 2026-11-18: two battles looked at move by move (`tools/recon.py`)

The contest was paused (no test games, so no replays). `tools/recon.py <game.json> <seat> <from> <to>` rebuilds the
unit positions of a plain arena log from the commands and the referee's position reports (dash from, power at,
catch at); median error 0 to 1, 90 % within 600. Trees are not known to it.

Second run of the live code (submission 41749025, `vlive_41748059.java`): 128 games, 38 / 43 / 47, mean rank 2.07
(first run of the same file: 1.95 over 145 games).

**Battle 924819818 (4 units, we scored 0), turn 18 and 19.**
- Unit 9 dashed towards the wall on turn 18 because the hunt goal is a lead point: the prey's last movement
  carried on for up to 4 turns (`decide`, the `for (int i = 0; i < 3; i++)` lead loop). The prey had been running
  along the wall towards us; it reversed the same turn. A dash straight at it would have ended about 870 away, the
  lead dash ended 1,120 away.
- Turn 19: unit 9 threw a net at the prey's expected place 930 away ("sure" because within 1,400, although the prey
  had its dash). The prey dashed aside, the net flew on to its full 2,000 and held our own unit 11, which stood
  1,750 away on the same line at radius 7,180. `friendOnLine` checks team mates only up to the expected place of
  the prey; `net()` aims at the full range.
- Unit 10 ran from predators it could not see (tag LFLEE) between radius 5,500 and 6,440 for six turns, was held
  by a net on turn 23 and caught on turn 30. The flee point only costs beyond radius 6,300.
- Nets on our own units are rare: 3 of 1,233 nets in the two runs, one of the three units was caught.

**Battle 924518587 (3 units, third with 1 catch), turns 87 to 96.**
- State: we 1 catch (turn 60), prey team 2, predator team 1 (turn 7). One predator alive, two prey alive, both
  chasing that predator, which was chasing our unit 8. Our unit 6 stood behind this line, 1,650 to 2,300 from both
  prey, the predator 2,250 away and moving away from it.
- Unit 6 went forward while the predator was beyond 2,500 and back when it came inside (tags HUNT, HUNT, FLEE,
  LFLEE, LFLEE, HUNT) until the game ended. In `eval` the prey pulls with weight 1 per unit of distance (2 only
  within 1,500), a predator within 2,500 pushes with 1 per unit plus the chase forecast (1.5 per unit): a predator
  standing behind the prey always wins, whatever it is doing and whatever the score is.
- A loss could not cost a place (the predator team was already above us); one catch was worth second place, two
  were worth first. No net: beyond 1,400 with the prey moving across the line a net needs a second one in reserve.

**How often one catch decides.** In 49 of 183 games not won (both runs) one more catch would have passed the team
just above; in 34 of the 49 we ended with two or more units alive, in 32 we made no catch after turn 80.

Not built yet: (1) friends checked along the whole flight of a net, (2) when the predator team is already above us
late in the game, the soft terms against predators are scaled down and the last net may go at any prey in range,
(3) the behind-or-level pressing rule of `vuser1.java` (`F_USER_AGGRO`), which did raise dash catches in the arena.

## Night of 2026-11-18: the wall and bad movements over the 273 games of the live code

Tools: `tools/wallmove.py`, `tools/pingpong.py` (plain arena logs, positions rebuilt as in `recon.py`),
`tools/ppcause.py` (causes, from 21 debug games of v10, which has the same movement code and the same rate).

**The wall.** Only the last 600 before the wall is dangerous, and it is for every team.

| Radius | Ours: share of time | share of losses | losses per 100 unit-turns | Other teams: losses per 100 unit-turns |
|---|---|---|---|---|
| 0 to 4000 | 37 % | 34 % | 0.74 | 1.15 |
| 4000 to 5500 | 29 % | 25 % | 0.70 | 0.94 |
| 5500 to 6500 | 22 % | 21 % | 0.78 | 0.76 |
| 6500 to 7200 | 8 % | 7 % | 0.68 | 0.82 |
| 7200 to the wall | 4 % | 15 % | 2.85 | 2.43 |
| all | | | 0.82 | 1.06 |

- With a predator within 2,500: 7.6 losses per 100 turns in the last strip, 1.7 to 2.4 everywhere else.
- Losses beyond 6,500: 138 of 655 (21 %). 83 % of those units were free (inside: 53 %), 59 % had moved outward by
  800 or more in the last six turns, the last order was FLEE (a predator in sight) in 114.
- Our units enter the last strip 3.0 times per game. Entering in flight from a predator within 1,500: 232 times,
  42 % caught within 8 turns. Entering while hunting or searching with no predator within 3,600: 220 times, none caught.
- Flight steps that start between 6,500 and 7,200: outward 21 % caught within 6 turns, along the wall 10 %,
  inward 15 %. From 5,500 to 6,500: outward 13 %, others 9 to 10 %. Outward dashes that end beyond 6,500: 267, 18 %.
- Games with two or more wall losses: 25, mean rank 2.24 (none: 170 games, 1.98).
- We lose fewer units per unit-turn than the other teams everywhere inside 5,500: the bot is the more careful one.

**Steps that undo the step before (back on the spot of two turns ago).** Ours 7 % of steps, other teams 4 %
(same method); 18 per game. v5-to-live share the code and the rate (v10: 7 %).
- By tags: hunt then hunt 34 %, flee then flee 14 %, hunt then flee 13 %, flee then hunt 12 %, search 11 %.
- Causes (300 cases in 21 debug games): a predator between 2,500 and 3,700 of the straight step 47 % (the chase
  forecast acts up to 3,600 with 1.5 per unit, the prey pulls with 1); the target changes to another prey 16 %;
  the way round a tree changes side 15 %; the goal point of the same target jumps (lead point, or the unit has
  reached a remembered place and nothing is there) 13 %; not explained 7 %.
- A hunt given up by turning round with the nearest predator beyond 2,000 and prey within 2,200: 149 times
  (0.55 per game), 96 of them in the first 20 turns.
- Not a problem: steps deflected by a tree or the wall (6 % of steps, no more losses after them than after any
  step), standing still (237 steps in 273 games).

## Night of 2026-11-18: the ring at 3,600 (`tools/gen/mkreach.py`, `tools/reachcheck.py`)

Another session found that with a predator 2,500 to 3,600 away our units back off from prey that better teams go
after, and named the five-turn chase forecast (`rollout` in `eval`) as the cause. Checked here and found to be
right but incomplete.

**The mechanism.** `if (nearestTh < 3600) { ... sc += 1.5 * Math.min(rm, 2600); ... }` is a bonus of 0 to 3,900
that exists only within 3,600 of a predator; a step that ends beyond 3,600 gets nothing. The same line is in v10,
the live code and every candidate built on it. v10 re-run on 21 of its debug games (2,733 hunting or searching
decisions with a predator known):
- 43 % of the chosen steps end 3,400 to 3,600 from the nearest known predator;
- when the straight step to the goal would end beyond 3,600, the unit stays inside in 99 of 106 cases;
- units that start 3,600 to 4,200 away step into the zone in 185 of 435 cases.
- The forecast walks the unit on in the same direction for five turns, so a step toward prey on the predator's
  side is scored as walking into the predator (minus 30,000).
- In the arena logs the ring is only a small bump (the predator moves after our step, and positions are estimates).

**Two switches** (`tools/gen/mkreach.py <base> <out> [nocliff] [reach] [netline]`, works on every live-family file):
`nocliff` scores the forecast as a penalty from its cap, so nothing is gained by standing near a predator;
`reach` counts the forecast, the net-line term and the wall term only for predators within 2,500 while the unit
hunts prey in sight within 2,600. `reach` without `nocliff` would move the ring to just inside 2,500 of a predator.

Live code and variants on the inputs of the same 21 real games (`tools/reachcheck.py`):

| Bot | Steps toward prey in sight, predator 2,500 to 3,600 away | Same, no predator within 3,600 | Steps ending 3,400 to 3,600 from a predator |
|---|---|---|---|
| live code | 57 of 126 (45 %) | 79 % | 42 % |
| + nocliff (`vlive_nocliff.java`) | 52 of 126 (41 %) | 80 % | 10 % |
| + nocliff + reach (`vlive_ring.java`) | 95 of 127 (75 %) | 83 % | 10 % |

With `nocliff` alone the units park just outside 3,600 instead of just inside (42 % of steps end at 3,600 to 3,800).

Local pools, 360 games each, the same maps, against the imitations of the leader and of Les Gens Bons
(`tools/poolstats.py`; the local referee cannot rank gaps of this size, the pools are a crash check):

| Bot | Mean rank | Catches | after turn 30 | Lost | Back-and-forth | Errors |
|---|---|---|---|---|---|---|
| live code | 2.05 | 2.84 | 1.36 | 2.42 | 8.4 % | 0 |
| + nocliff | 1.98 | 3.00 | 1.44 | 2.38 | 8.2 % | 0 |
| + nocliff + reach | 2.03 | 2.92 | 1.43 | 2.41 | 8.2 % | 0 |
| + nocliff + reach + netline | 2.04 | 2.94 | 1.46 | 2.43 | 8.1 % | 0 |

Reading: no crash, no more units lost, slightly more catches; the back-and-forth did not fall (the units still
turn at a boundary, now at 3,600 from outside or at 2,500). Not tested on real opponents.

## Morning of 2026-11-19: the ring fix on real opponents (7 battles), v18 variants (`tools/gen/mkv18.py`)

**Paired check 09:00 to 09:10** (`tools/pairfield.py`, folder `pf2`, battle list of 41749025; every bot in seat 0 against the
same two real opponents on the same map). No timeout and no error in any game.

| Bot | Mean rank | First / second / last | Catches | Units lost |
|---|---|---|---|---|
| `vlive_ring` | 1.57 | 5 / 0 / 2 | 2.57 | 2.29 |
| `vlive_combo_ring` | 1.86 | 3 / 2 / 2 | 2.57 | 2.00 |
| live code | 2.00 | 2 / 3 / 2 | 2.86 | 1.43 |
| `vlive_combo` | 2.14 | 2 / 2 / 3 | 2.57 | 2.57 |

- Ring fix on against off, both pairs together (14 games each): 1.71 against 2.07. Combo on against off: 2.00 against 1.79.
- Units lost: more with the fix on the live code (2.29 against 1.43), fewer on combo (2.00 against 2.57).
- Seven battles decide nothing; this is a direction only.
- 43 of the newest battles of 41749025 could not be used: `INVALID_OPPONENT` (those agents are no longer test opponents,
  they resubmitted). `pairfield.py` writes a result file without a game for them; delete those before reading or
  re-running (`pfstats.py` skips them, `pairfield.py` would skip the battle for good).

**A second session reproduced the ring with a controlled test** (one hunter, standing prey, one predator at distance D,
3 units per team all listed, no trees; scratch `ring/probe.py`). Live code and v18 alike: predator 2,600 to 3,000 away,
the hunter gains 81 to 96 of 600 towards prey at right angles to the predator and walks 349 away from prey on the
predator's side; predator 3,200 to 3,800 away, the step ends 3,450 to 3,540 from it (at 3,800 it walks in instead of
dashing straight). With the fix the step goes straight at the prey from 2,600 on, and dashes start at 3,200 instead of 4,000.

**v18** (`versions/v18_dl.java` = the user's v18_final, submitted on the morning of the 19th as 41754675) has the same
forecast bonus (same lines in `eval`). Every lever of the live family applies to it with the same text; only the
net-line term has another anchor (`soft *`). `tools/gen/mkv18.py <base> <out> [ring] [press] [t1] [hnet] [combo]`:

| File | Switches | Local crash check (120 games against mimic_a and mimic2, seed 9100) |
|---|---|---|
| `v18_dl.java` | none | 0 errors, catches 3.03, lost 2.61 |
| `v18_ring.java` | ring (F_NOCLIFF + F_REACH) | 0 errors, catches 3.17, lost 2.33 |
| `v18_combo.java` | press, t1, hnet, combo | 0 errors, catches 3.24, lost 2.30 |
| `v18_combo_ring.java` | all | 0 errors, catches 3.14, lost 2.46 |

The local referee cannot rank them. v18's own rules are untouched (early aggression off, stance, commit, held unit).

**09:19 IST, 2026-11-19: `v18_ring` submitted as 41754850** on the user's word. v18 (41754675) had finished at 20.32, rank 250
of 440 (81 games fetched: 28 / 31 / 22, mean rank 1.93). Paired test at 09:18, the same 6 real battles for every bot
(`pf2`): `v18_ring` 1.17, `vlive_ring` 1.67, old live code 1.83, `vlive_combo_ring` 1.83, `v18_combo` 2.00,
`v18_combo_ring` 2.00, `vlive_combo` 2.00, v18 2.33. Ring fix on against off over the four pairs: 1.67 against 2.04
(24 games each). `v18_ring` lost 3.2 units a game against 2.4 for v18 and caught 3.0 against 2.0 (5 battles).
A full ranking run took about 15 minutes this morning (v18: 20 % at 09:05, 100 % at 09:18).

**09:30 IST: `vgo_b` submitted as 41754969** on the user's word, as an arena test of the vgo style (never in the arena before).
`v18_ring` (41754850) finished at **19.14, rank 291 of 440**; 56 of its games read at 80 %: 21 / 17 / 18, mean rank 1.95,
catches 2.68, units lost 2.02 (v18: 81 games, 1.93, 2.72, 2.37). Same game results as v18, lower rating: the fix shows
no gain in the arena. Paired test at 09:28, 15 shared battles: `v18_ring` 1.80, `v18_combo_ring` 1.93, `v18_combo` 2.07,
v18 2.27; on the 8 newest battles alone `v18_ring` was last of the four (2.38). The lead of 1.17 over the first 6
battles was mostly luck: do not submit on fewer than 15 paired battles again.
New file: `versions/vgo_b_ring.java` (`tools/gen/mkgoring.py`): vgo_b has the same forecast bonus (its own weights);
60 local games without an error, no real game yet.

**09:46 IST: every arena run side by side** (scratch `arenatab.py` over `rows_<submission>.json`; rating = final unless marked).
`vgo_b` was replaced at 56 % by the user's own submission `v18_2` (41755049, 09:37; its source is not in the repo).

| Bot | Rating | Games | Mean rank | 1st / 2nd / 3rd % | Catches | Lost | Catches by turn 10 | No catch | Mean rank with 3 / 4 / 5 / 6 units |
|---|---|---|---|---|---|---|---|---|---|
| old live, 18th run 1 | 20.47 | 145 | 1.95 | 35 / 33 / 31 | 2.59 | 2.30 | 0.54 | 3 % | 1.85 / 1.93 / 2.00 / 2.06 |
| old live, 18th run 2 | 18.99 | 128 | 2.07 | 29 / 33 / 36 | 2.66 | 2.51 | 0.66 | 5 % | 2.09 / 2.06 / 2.06 / 2.08 |
| v18 | 20.32 | 81 | 1.93 | 34 / 38 / 27 | 2.72 | 2.37 | 0.52 | 8 % | 1.86 / 2.17 / 1.79 / 1.82 |
| `v18_ring` | 19.14 | 56 | 1.95 | 37 / 30 / 32 | 2.68 | 2.02 | 0.48 | 5 % | 1.93 / 1.79 / 2.25 / 1.90 |
| `vgo_b` | 16.96 at 56 % | 46 | 2.04 | 34 / 26 / 39 | 3.00 | 2.72 | 0.74 | 6 % | 2.43 / 2.18 / 2.00 / 1.82 |
| `v18_2` | 19.17 at 81 % | 60 | 1.95 | 31 / 41 / 26 | 2.68 | 2.12 | 0.62 | 5 % | 2.18 / 1.80 / 1.94 / 1.83 |

Every run is at a mean rank of 1.93 to 2.07; the ratings spread over 17 to 20.5 at equal game results.
Paired round (Target24, `pf3`, 20 battles of v18's run): `v18_combo_ring` 1.65, v18 1.80, `v18_ring` 2.10, `vgo_b` 2.10;
the four vlive bots are being filled in on the same battles from 09:45.
`pairfield.py` hazard: on 409 `test-game-running` the reply carries the other run's `test_game_id`; the loop then polls
that game and saves it under the wrong bot name. Two runs must never overlap.

**10:01 IST: every paired game of today pooled** (`tools/pfall.py v18 pf2 pf3 pf3_side`, 36 battles; "shared" = battles the
bot and v18 both played, same map and same two real opponents).

| Bot | Games | Mean rank | 1st / 2nd / 3rd | Catches | Lost | Shared with v18 | Bot / v18 there | Better / equal / worse |
|---|---|---|---|---|---|---|---|---|
| `vlive_ring` | 18 | 1.39 | 13 / 3 / 2 | 3.11 | 1.89 | 18 | 1.39 / 2.17 | 11 / 5 / 2 |
| `v18_2_combo_ring` | 11 | 1.45 | 7 / 3 / 1 | 3.18 | 2.18 | 11 | 1.45 / 1.91 | 4 / 6 / 1 |
| `v18_2` | 12 | 1.75 | 5 / 5 / 2 | 2.92 | 1.33 | 12 | 1.75 / 1.92 | 2 / 10 / 0 |
| `vlive_combo_ring` | 18 | 1.78 | 8 / 6 / 4 | 3.00 | 2.06 | 18 | 1.78 / 2.17 | 9 / 5 / 4 |
| `v18_combo_ring` | 32 | 1.81 | 14 / 10 / 8 | 3.00 | 2.41 | 32 | 1.81 / 2.03 | 13 / 12 / 7 |
| old live code | 16 | 1.88 | 5 / 8 / 3 | 2.81 | 1.69 | 14 | 1.86 / 2.29 | 7 / 5 / 2 |
| `v18_ring` | 34 | 1.88 | 16 / 6 / 12 | 2.76 | 2.24 | 34 | 1.88 / 1.97 | 10 / 13 / 11 |
| v18 | 34 | 1.97 | 12 / 11 / 11 | 2.74 | 1.88 | 34 | - | - |
| `vlive_combo` | 14 | 2.00 | 4 / 6 / 4 | 2.71 | 2.36 | 14 | 2.00 / 2.29 | 6 / 6 / 2 |
| `v18_combo` | 7 | 2.00 | 3 / 1 / 3 | 2.14 | 2.57 | 7 | 2.00 / 2.57 | 3 / 4 / 0 |
| `vgo_b` | 20 | 2.10 | 3 / 12 / 5 | 3.10 | 2.75 | 20 | 2.10 / 1.80 | 5 / 7 / 8 |

`vlive_ring` against the old live code on their 14 shared battles: 1.43 against 1.86 (7 / 5 / 2). It led in both sets of
battles (7 of yesterday's list: 1.57; 11 of today's: about 1.3), unlike `v18_ring`, which led the first set and trailed the second.
Arena since 09:37: `v18_2` finished at **20.61, rank 238** (79 games, mean rank 1.86, the best run of the day); the user then
submitted a further version at 09:51 (41755216, saved as `versions/v18_3.java`: v18_2 + `F_ATTACKED`, smoke and decoys only
against a predator that is attacking, + `P_SMOKE_MODE` 3, the cloud right in front of the predator): 19.06 at 87 %,
58 games at 76 %: mean rank 1.97, units lost 2.67.

**10:03 IST: `vlive_ring` submitted as 41755378** on the user's word (first arena run of the old live code with the ring fix).
`v18_3` (41755216) had finished at **18.75, rank 315 of 441**.

**10:18 IST: `v18_2_combo_ring` submitted as 41755573** by the Target-23 session on the user's word ("v18_2_combo_ring ( send to arena )"). It replaces `vlive_ring` (41755378). Paired table at 10:12, 25 shared battles: `vlive_ring` 1.48, `v18_2_combo_ring` 1.64, `v18_2` 1.76.

**10:17 IST: `vlive_ring` finished at 19.78, rank 282 of 441** (82 games: 28 / 34 / 20, mean rank 1.90, catches 2.88, lost 2.22,
catches by turn 10: 0.50). Arena finals of the day: `v18_2` 20.61 (mean rank 1.86), v18 20.32 (1.93), `vlive_ring` 19.78 (1.90),
`v18_ring` 19.14 (1.95), `v18_3` 18.75 (1.96). The mean ranks are within one standard error (about 0.09) of each other.
Paired, 56 battles pooled at 10:19 (`pfall.py v18_2 pf2 pf3 pf3_side pf3_combo pf3_six`), on the 31 battles shared with `v18_2`:
`vlive_ring` 1.52 against 1.77 (better / equal / worse 12 / 13 / 6), `v18_2_combo_ring` 1.58 against 1.77 (11 / 15 / 5).
Paired mean ranks run lower than arena ones (seat 0 in every game); compare them only with each other.

**10:36 IST: `v18_2_combo_ring` (41755573, submitted by the user at 10:18) finished at 23.73, rank 106 of 442**, the best run
of the contest so far by more than three points. 64 games read at 87 %: 28 / 16 / 20, mean rank 1.88, catches 3.05,
lost 2.61; its opponents were stronger than in the earlier runs (mean league rank 163 against 285 for v18_2's run),
which is why the same mean rank gives a much higher rating.
Loss reasons over its first 40 games (`reasons.py` on `tools/whylost.py`): slow start 33 % of places lost (7 games, almost all
with 3 units), predator team caught more 30 %, tie-break 15 %, two hunters lost by turn 20 9 %.
Over the four runs of the day (282 games, scratch `early.py`, `late.py`): we catch first -> mean rank about 1.5, we lose a
unit first -> about 2.3; ahead of the predator team at turn 60 (59 % of games) -> 1.47 and still ahead at the end in
148 of 166; behind (39 %) -> 2.50, one more catch would lift us above it in 24. Units lost by turn 10: held by a net
in 46 to 69 %. Deaths after turn 30: 1.0 to 1.1 a game in every bot, 29 to 50 % beyond radius 6,500.
New switches in `tools/gen/mkv18.py`, built for paired tests only (not submitted): `no3net` (no turn-1 net with 3 units:
`versions/v18_2_cr_n3.java`) and `late` = `F_SCORELATE` (from turn 60, soft threat terms x0.5 for a hunter while the
predator team is ahead of us, x1.5 for a unit without prey in sight while we lead it by one: `versions/v18_2_cr_plus.java`
has both). 90 local games each without an error.

**10:45 IST: what happens after one of our units is netted** (`tools/heldback.py`; scratch `heldd.py`; runs 41755573, 41755049,
41755378, 233 games). Our units are netted 2.4 to 2.6 times a game, two thirds of it by the predator team.
Nets of the predator team (359): the thrower stood within 1,500 in 324 (90 %); 225 of our units were then caught within
six turns, 201 of them by the thrower, 113 on the very next turn.

| What the netted unit does (thrower within 1,500) | Cases | Caught within 6 turns |
|---|---|---|
| nothing | 99 | 94 % |
| smoke | 113 | 52 % |
| net | 64 | 38 % |
| decoy | 48 | 69 % |

- We net back in about one case in five. It is the best answer when it happens.
- "Nothing" is mostly the unit that is caught on the turn after the net, before any answer can work: a predator that
  nets from within about 1,640 (dash 1,200 + contact 440) arrives at once. The defence has to come before the net.
- Units lost while held, per game: v18 0.69, v18_2 0.86, `v18_2_combo_ring` 0.90, old live code 0.98. v18_2's `F_NETSAVE`
  (a free unit keeps its net and escapes with smoke or a decoy) did not lower it; the difference to v18 is within noise.
- Built for the paired test: `versions/v18_2_cr_netback.java` = `v18_2_combo_ring` with `F_NETSAVE` off (a free unit nets
  its hunter within 1,500, as v18). 40 local games without an error. Paired test `pf4` from 10:46 (battles of 41755573):
  `v18_2_combo_ring`, `v18_2_cr_netback`, `v18_2_cr_plus`.

**10:54 IST: decoys and the 3-unit game.** Decoys (scratch `decoys.py`, three runs, 235 games): 4.2 to 4.5 a game; a predator
runs into 75 to 83 % of them, a predator net lands on 3 to 10 %; the unit that deployed one is caught within 6 turns in
14 to 16 % (after smoke: 15 to 18 %). The pool looks like two per unit (most used in a game: 5-6 / 6 / 8-9 / 8-10 with
3 / 4 / 5 / 6 units) and about half is unused at the end (3.0 of 6, 3.3-3.9 of 8, 4.6-5.4 of 10, 5.4-6.0 of 12).
New switches in `mkv18.py`: `netback` (`F_NETSAVE` off) and `decoy` (`F_DECOY_MORE`: a new decoy after 3 turns against a
hunter inside 1,800 and after 5 inside 2,900; was 5 and 8). `versions/v18_2_cr_nd3.java` = `v18_2_combo_ring` + netback +
decoy + no3net; 48 local games without an error. In the paired test `pf4` from 10:54 with the live bot, netback and plus.
3 units: the only change with evidence is no turn-1 net (kb/findings.md 7); the slow first catch there (median turn 24)
is the same for teams at 23.

**10:56 IST: `v18_2_cr_netback` submitted as 41756150** on the user's word. It replaced `v18_2_combo_ring_gangflank` (41755980,
another session's build: gang on netted prey, nets prefer a mate able to finish, second hunter aims beyond the prey), which
stood at 22.31, rank 172, at 38 % and was not finished. Paired `pf4` at 10:54, 10 battles: netback 1.80 (3 better / 7 equal /
0 worse than `v18_2_combo_ring`), `v18_2_cr_plus` 2.00, `v18_2_combo_ring` 2.10.

**11:10 IST: `v18_2_cr_netback` against `v18_2_combo_ring`, arena games and paired games.**

| | `v18_2_cr_netback` (41756150, 64 games at 76 %) | `v18_2_combo_ring` (41755573, 77 games, final) |
|---|---|---|
| Rating | 23.5 at 76 % (24.64 at 56 %) | 23.73, rank 106 |
| Mean rank; first / last | 1.88; 44 % / 31 % | 1.91; 42 % / 32 % |
| Catches / units lost | 3.02 / 2.83 | 2.95 / 2.64 |
| Units lost while held by a net | 0.88 | 1.06 |
| Netted units caught within 6 turns | 37 % | 44 % |
| A unit lost by turn 10 | 56 % of games | 43 % |
| Mean league rank of the opponents | 167 | 143 |
| Places lost: predator team caught more / slow start / tie-break | 34 % / 32 % / 12 % | 36 % / 29 % / 13 % |
| Mean rank with 3 / 4 / 5 / 6 units | 1.86 / 2.21 / 1.75 / 1.75 | 1.88 / 1.75 / 2.18 / 1.83 |

Paired `pf4`, 20 battles of 41755573: `v18_2_cr_plus` 1.90, `v18_2_combo_ring` 1.95, `v18_2_cr_netback` 2.00,
`v18_2_cr_nd3` 2.05 (19). The four are level. `nd3` used no more decoys than the others (4.58 against 4.42 a game):
the waiting time between decoys is not what limits them. Decoys in the two arena runs: 4.2 to 4.3 a game, a predator
runs into 83 to 86 %, the unit that dropped one is caught within 6 turns in 12 to 16 %.
Both arena runs of this family ended near 23.6 against opponents ranked about 150 on average; the earlier family ended at 19 to 20.6.

**11:13 IST: `v18_2_cr_netback` (41756150) finished at 23.12, rank 151 of 443** (77 games read at 85 %: 32 / 20 / 25, mean rank 1.91,
catches 3.04, lost 2.88). `v18_2_combo_ring` had finished at 23.73, rank 106, with the same mean rank (1.91 over 77 games).
Two runs of this family: 23.73 and 23.12.

## Final of 2026-11-19 (11:15 IST): 23.13, rank 150 of 443, with `v18_2_cr_netback` (41756150)

**Every arena run of the day** (rating final unless marked; games = those read from the battle list):

| Time | Bot | Rating | League rank | Games | Mean rank | 1st / 2nd / 3rd % | Catches | Lost |
|---|---|---|---|---|---|---|---|---|
| 09:04 | v18 | 20.32 | 250 | 81 | 1.93 | 34 / 38 / 27 | 2.72 | 2.37 |
| 09:19 | `v18_ring` | 19.14 | 291 | 56 | 1.95 | 37 / 30 / 32 | 2.68 | 2.02 |
| 09:30 | `vgo_b` | 16.96 at 56 % | - | 46 | 2.04 | 34 / 26 / 39 | 3.00 | 2.72 |
| 09:37 | `v18_2` | 20.61 | 238 | 79 | 1.86 | 39 / 35 / 25 | 2.89 | 2.24 |
| 09:51 | `v18_3` | 18.75 | 315 | 76 | 1.96 | 35 / 32 / 31 | 2.70 | 2.61 |
| 10:03 | `vlive_ring` | 19.78 | 282 | 82 | 1.90 | 34 / 41 / 24 | 2.88 | 2.22 |
| 10:18 | `v18_2_combo_ring` | **23.73** | **106** | 76 | 1.92 | 40 / 26 / 32 | 2.95 | 2.63 |
| 10:46 | `v18_2_combo_ring_gangflank` | 22.31 at 38 % | - | 47 | 1.91 | 29 / 48 / 21 | 3.06 | 2.57 |
| 10:56 | `v18_2_cr_netback` (final) | **23.13** | **150** | 93 | 1.98 | 36 / 29 / 34 | 3.05 | 2.88 |

**What moved the rating.** Up to 10:18 every bot ended between 18.75 and 20.61 with a mean rank of 1.86 to 1.96. From
`v18_2_combo_ring` on, three submissions in a row stood at 22.3 to 23.7 with the same mean rank (1.91 to 1.98), against
opponents ranked about 150 on average (before: about 285). The step is the combination v18_2 (net economy) + opening and
dash levers + the ring fix; none of the three alone showed it (v18_2 20.61, `vlive_ring` 19.78, `v18_ring` 19.14).
A higher rating with an unchanged mean rank means the same places were taken against stronger opponents.

**Paired tests (same map, same two real opponents, seat 0), final state.**
- `pf4`, 21 battles of the 23.73 run: `v18_2_combo_ring` 1.95, `v18_2_cr_plus` 1.95, `v18_2_cr_netback` 2.00,
  `v18_2_cr_nd3` 2.10. No variant beat the reference.
- Pooled over 66 battles (`pfall.py v18 pf2 pf3 pf3_side pf3_combo pf3_six`), mean rank over all games of the bot:
  `vlive_ring` 1.55 (49), `v18_2_combo_ring` 1.66 (41), `v18_2` 1.76 (41), `vlive_combo_ring` 1.78 (18),
  `v18_combo_ring` 1.81 (32), old live 1.88 (16), `v18_ring` 1.88 (34), v18 1.97 (34), `vlive_combo` 2.00 (14),
  `v18_combo` 2.05 (19), `vgo_b` 2.10 (20).

**Lessons of the day.**
1. The paired test misled twice on small samples (`v18_ring` 1.17 over 6 battles, then last of four on the next 8; `vlive_ring`
   1.39 over 18, then 19.78 in the arena). Do not act on fewer than 20 to 30 shared battles; even then it ranks bots against
   the opponents of one run only.
2. An arena run took 15 minutes this morning (about 80 games), so the arena itself was the fastest honest test.
3. One run of a bot is worth about plus or minus 0.8; two runs of the same family gave 23.73 and 23.13.
4. The loss split did not change with any version: predator team caught more of ours 34 to 43 %, no catch by turn 15
   24 to 41 %, tie-break 12 to 20 %. Whoever makes the first catch ranks about 1.5, whoever loses a unit first about 2.3.
5. About a third of our lost units fall after a net; 90 % of those nets are thrown from within 1,500 and half of the
   catches come on the very next turn. Netting back is the best answer (caught 38 %, smoke 52 %, decoy 69 %, nothing 94 %),
   but the defence has to come before the net lands.
6. Decoys are bait that works (a predator runs into 75 to 86 %) and half of the pool is unused; shortening the waiting
   time did not raise their use, the trigger (predator within 2,900 with a clear line) is the limit.
7. Not built, with evidence: decoy trigger, defence before the net (distance and line to predators that still hold a net),
   a second dash on turn 3 and two nets on one prey (seen in teams at 23 to 25).

**11:20 IST: `v18_2_combo_ring` resubmitted as 41756511** on the user's word, byte for byte the file of the 23.73 run.
It replaced `v18_2_cr_netback56` (41756463, another session's build, submitted at 11:17), which stood at 19.7, rank 305,
at 29 %. `v18_2_cr_netback` had settled at 23.22, rank 146 (101 games, mean rank 1.97) before it was replaced.
The window closes at 12:00; this run should end at about 11:36.
