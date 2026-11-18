# Gold league: research, strategy and proofs (2026-11-18)

Gold is the top league (no boss above it). Statement and input are identical to Bronze and Silver (checked by diff).
We entered Gold at 11:01 IST with v5. This file is the case for v10 and the plan from here.

## 1. Where we stand

| | Games | First | Second | Last | Mean rank | Catches | by turn 10 | Lost |
|---|---|---|---|---|---|---|---|---|
| v5 in the Gold arena (submission 41742767) | 21 | 43 % | 33 % | 24 % | 1.81 | 3.48 | 0.48 | 1.95 |
| Top 15 Gold teams in their own games (483 games) | 47 to 74 each | 30 to 66 % | | 15 to 33 % | 1.49 to 2.00 | 2.9 to 3.6 | 0.6 to 1.2 | 2.0 to 3.4 |

v5 already plays inside the range of the top 15. It loses fewer units than any of them and catches later than
almost all of them.

## 2. The top Gold teams (483 games fetched 2026-11-18, `tools/topfield.py`)

| Team | n | Rank | Win | Last | Catches | by 10 | Lost | Lost by 10 | First catch | Nets | by turn 3 | Hit prey | Hits -> catch | Nets at predator | Dashes | Smoke (first 5 turns) | Decoys |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ATI x iHot | 47 | 1.49 | 66 % | 15 % | 3.40 | 0.72 | 2.62 | 0.38 | 51 % | 3.2 | 0.2 | 39 % | 70 % | 28 % | 29.6 | 3.9 (1.4) | 4.0 |
| Les Gens Bons | 74 | 1.69 | 50 % | 19 % | 3.45 | 1.07 | 2.96 | 0.82 | 49 % | 4.5 | 2.4 | 44 % | 69 % | 7 % | 18.4 | 2.9 (0.5) | 4.6 |
| Lore | 52 | 1.75 | 46 % | 21 % | 3.48 | 0.96 | 2.71 | 0.62 | 35 % | 4.7 | 1.8 | 33 % | 78 % | 43 % | 33.2 | 0.9 (0.0) | 3.0 |
| RNG | 58 | 1.76 | 43 % | 19 % | 3.31 | 0.69 | 2.98 | 0.86 | 31 % | 4.8 | 1.7 | 37 % | 55 % | 21 % | 40.5 | 3.4 (0.3) | 4.4 |
| SoloLeveling | 50 | 1.76 | 40 % | 16 % | 2.92 | 1.18 | 2.92 | 0.52 | 52 % | 4.3 | 1.9 | 39 % | 60 % | 12 % | 49.8 | 3.9 (1.5) | 3.9 |
| FullStuck | 63 | 1.79 | 41 % | 21 % | 3.48 | 0.84 | 3.25 | 1.14 | 25 % | 3.6 | 0.7 | 50 % | 73 % | 4 % | 33.9 | 3.2 (0.7) | 4.1 |
| Kogaion | 54 | 1.81 | 43 % | 24 % | 3.50 | 0.87 | 3.35 | 0.56 | 37 % | 4.2 | 0.7 | 41 % | 82 % | 15 % | 36.8 | 4.0 (2.1) | 4.1 |
| Agave | 53 | 1.87 | 42 % | 28 % | 3.21 | 0.94 | 2.81 | 0.77 | 43 % | 4.5 | 1.5 | 40 % | 79 % | 18 % | 40.0 | 2.2 (0.2) | 4.4 |
| **us, v5** | 21 | 1.81 | 43 % | 24 % | 3.48 | 0.48 | 1.95 | 0.33 | | 5.2 | | 47 % | 79 % | 27 % | 32.2 | 3.5 | 4.2 |
| **us, v10** (same 21 battles replayed) | 21 | 1.52 | 52 % | 5 % | 3.62 | 1.24 | 2.67 | | | | | | | | | | |

What the table shows:
1. **There is no single winning style.** The leader (ATI x iHot) throws almost no early nets (0.2 by turn 3) and puts
   28 % of its nets on predators; Les Gens Bons throws 2.4 nets in the first three turns and almost none on
   predators. Both are at the top. What they share is below.
2. **Every top team converts net hits**: 55 to 82 % of the hits on prey become a catch. Ours is 79 %: at top level.
3. **Every top team catches early**: 0.7 to 1.2 catches by turn 10. v5 has 0.48 (the lowest in the table), v10 1.24.
4. **The leader is the one that loses least early**: 0.38 units by turn 10; the others 0.5 to 1.1. First catch and no
   early loss was the strongest combination in the 1,408-game study (59 % wins).
5. **Nobody is safe**: every top team loses 2.6 to 3.4 units per game. Survival alone (v5: 1.95) does not win;
   the points come from catches, and a tie goes to the earlier ones.
6. **Decoys are universal** (3 to 4.6 per game); smoke use differs (0.9 to 4.0).

## 3. Why v5 did not win more, and what the cause really was

From 340 arena games of v1 and v5 (`arena.md`): v5's non-wins are 39 to 58 % "units left on both sides, prey still
alive" and 27 to 39 % tie-breaks. Catches by turn 10: 0.48 to 0.75, against 1.14 for v1.

The cause was found by switching every change off in turn on the local referee (1,920 games, `log.md`):

| Rule | Effect of removing it (mean rank; lower is better) | Verdict |
|---|---|---|
| Unseen-ground penalty | 2.00 -> 1.81 | **harmful**: it holds hunters back, and inside smoke it froze units |
| Smoke thrown past the hunter (v6) | 1.97 -> 1.75 with the old placement | **harmful**: the hunter becomes invisible to us too |
| Avoiding old predator positions | 2.03 -> 1.91 | slightly harmful |
| Smoke at all | 1.97 -> 2.35 without it | **the most valuable tool we have** |
| Search map | 1.97 -> 2.14 without it | helps |
| Early approach dash | 1.97 -> 2.08 without it | helps |
| Stale-predator model, ways-out count | 2.00 -> 2.07, 2.05 without them | help a little |
| Dash budget, wide nets, decoys, separation, hiding, soft distance, chase lookahead | within 0.05 | neutral on rank |

## 4. v10 and its proofs

v10 = v9 with three switches off (unseen-ground penalty, smoke past the hunter, old-predator avoidance), i.e. v5's
safety core plus: search map, early approach dash, stale-predator model, ways-out count, dash budget, separation,
cheaper simulation and time guard.

| Proof | Result |
|---|---|
| Local referee, 480 games, v5 against four v10-like variants | mean rank v5 2.16, variants 1.94 to 1.97 (one standard error 0.05) |
| Replay of **all 21 of our Gold battles** (same opponents, seats, maps; replays are exact: v5 replaying its own battles reproduced 8 of 8 results) | v5: 9 first, 7 second, 5 last, mean rank 1.81. v10: 11 first, 9 second, 1 last, mean rank 1.52. Better in 7 battles, worse in 3, same in 11 |
| Early catches in those 21 battles | by turn 10: 0.48 -> 1.24; by turn 20: 1.29 -> 2.00 |
| Cost | units lost per game 1.95 -> 2.67 (now equal to the top teams, no longer below them) |
| Turn time on CodinGame, 1,926 turns | median 0.8 ms, 99 % under 12 ms, worst 25 ms (limit 50); first turn at most 43 ms (limit 1000) |
| Errors | none in 21 replays and 2,400 local games |

Limits of the proof: 21 battles is a small sample (7 better against 3 worse is not conclusive on its own); the
local referee uses our own bots as opponents. The two tests are independent and point the same way.

## 5. How v10 still loses in Gold (56 losses in the 21 replays, `tools/deathclass.py`)

| Label (a loss can have several) | Share |
|---|---|
| Three or more dashes already spent | 55 % |
| Held by a net | 43 % |
| Inside our own smoke | 29 % (a correlation: threatened units smoke; see section 3) |
| No predator seen in the last 3 turns | 25 % |
| Catcher dashed, our dash on cooldown | 23 % |
| Two or more predators within 1500 | 18 % |
| At the wall | 14 % |

In Gold the net is what kills: 43 % of the lost units were held (it was 13 to 28 % in Bronze and Silver). Next
targets, in this order:
1. not getting netted: leave clear net lines sooner, smoke one turn earlier, decoy as a shield every time a predator
   has a clear line inside 2500;
2. rescue: a net on the hunter that walks at a held unit (the leader puts 28 % of its nets on predators);
3. dash budget in long chases (55 % of the lost units had dashed three times or more).

## 6. Strategy for Gold, as rules with their evidence

| Rule | Evidence |
|---|---|
| Catch early: the first two dashes go into closing in on prey whose start we know | first catch -> 54 % wins (1,408 games); ties decided by the earliest catches; v10 +0.76 catches by turn 10 |
| Net what cannot dodge, then walk in | hit 83 % against 63 %; netted prey with a hunter inside 1200 caught 76 %; our conversion 79 % |
| Never let a net go unused | a game lost on the tie-break with two nets left; wide nets neutral or better |
| Smoke on ourselves when a predator has a clear line inside 2300, and keep moving inside the cloud | no-smoke variant is the worst of all (2.35 against 1.97) |
| Decoy at the predator as a net shield | 15 to 32 % of the enemy nets that hit us hit a decoy |
| Search with a map, not a patrol | prey in sight on 17 of 100 turns with the patrol; map variant +0.17 |
| Keep unseen predators in the model | +0.07 |
| Count the ways out near walls and big trees | +0.05; pocket deaths in the arena |
| Do not penalise unseen ground | removing the penalty +0.19 |
| Judge every change on a fair test | three of our own "improvements" were harmful and only the ablation showed it |

## 7. v10 in the Gold arena: what really happened

A Gold submission plays 37 ranking games. v10 finished them at 12:20 IST.

| | Games | First | Second | Last | Mean rank | Catches | by turn 10 | by 20 | Lost | Final place |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 (replaced at 30 %) | 32 | 41 % | 34 % | 25 % | 1.84 | 3.44 | 0.44 | 1.28 | 2.22 | 148th of 274, score 16.1 |
| v10 | 37 | 49 % | 22 % | 30 % | 1.81 | 3.27 | 0.70 | 1.73 | 2.51 | **104th of 357, score 18.0** |

- v10 moved us up 44 places and 1.9 points. The top of Gold is at 25.
- It wins more and catches earlier, and it finishes last more often. The replay test (1.52 against 1.81 on v5's 21
  battles) overstated the gain: on its own 37 battles the mean rank is 1.81. A replay comparison on 21 battles has a
  standard error of about 0.15; the arena is the final judge.
- Matchmaking pairs us with teams of our rating: in 69 Gold games we met a top-20 team only 6 times. Our figures look
  like those of the top teams (section 2) because we measure them against the middle of the league.

What v10 does worse than v5 in Gold:

| Measure | v5 | v10 | Reading |
|---|---|---|---|
| Losses with the order tagged HUNT (no known predator within 2500) | 16 % of losses | 35 % | hunters are hit from out of sight: the price of dropping the unseen-ground penalty |
| Nets that hit prey | 47 % | 31 % | nets go out earlier and at worse targets; after turn 30 only 14 nets were left to throw (v5: 37) |
| Net hits on prey turned into a catch | 79 % | 59 % | |
| Nets that hit a predator | 27 % | 33 % | more exposure, more defensive nets |

How our units get netted in Gold (54 times in 21 replayed battles, `tools/netted.py`):

| Situation | Share | Caught within 5 turns |
|---|---|---|
| All | 100 % | 44 % |
| Net thrown by our predator | 63 % | 68 % |
| Net thrown by our prey (their defence) | 37 % | 5 % |
| Thrower within 1400 | 57 % | 61 % |
| A decoy of ours was out that turn | 0 % | - |
| A team mate netted the hunter afterwards | 17 % | 22 % |
| The held unit did nothing afterwards | 48 % | 50 % |

Next candidate (v12, in test): a team mate's net at the hunter of a held unit no longer needs a sure aim; decoys are
kept for predators that are in sight; unseen-ground penalty for dashes only (switch `F_HIDDASH`).

Tuning the numbers gave nothing: 20 variations over 2,400 local games, then the only apparent gain (wider approach
dash) re-run on fresh seeds: 1.99 against 2.03, inside the noise.

## 8. Candidates after v10 (2026-11-18 afternoon)

| Candidate | Change | Local referee (480 games) | Replay of v10's Gold battles | Verdict |
|---|---|---|---|---|
| v12 | rescue net without a sure aim; decoys only against predators in sight; wider approach dash | 1.98 against 2.00 (noise) | 26 battles: mean rank 1.81 against v10's 1.81; better in 6, worse in 6 | no gain, dropped |
| dash-only unseen-ground penalty (`F_HIDDASH`) | | 2.01 against 2.00 | not run | no gain |
| v13: second hunter aims behind the prey (`F_PINCER`) | | running | | |
| nets limited to 1600 (`P_NET_MAX`) | see the table below | not meaningful (our own bots dodge differently) | running | |

v10's nets in the 21 replayed Gold battles, by intended target (`tools/netclass.py`; 109 nets with a visible target):

| Target | Thrown | Hit |
|---|---|---|
| Prey, all | 70 | 54 % |
| Prey that can dash, within 1000 | 18 | 55 % |
| Prey that can dash, 1000 to 1500 | 11 | 72 % |
| Prey with dash on cooldown, 1000 to 1500 | 13 | 53 % |
| Prey with dash on cooldown, 1500 to 2000 | 5 | 20 % |
| Prey with dash on cooldown, beyond 2000 | 9 | 33 % |
| Predator, all | 39 | 58 % |
| Predator, thrown by a held unit of ours | 8 | 75 % |

- Inside 1500 a net at prey hits 55 to 72 %; beyond it 20 to 33 %, even when the prey has no dash. "Dash on cooldown"
  does not make a long net sure in Gold: a walking unit 1800 away has a whole turn to step off the line.
- On the same 21 battles v5 got 1.76 catches per game from nets (45 % hits on prey, 77 % converted), v10 1.38
  (36 %, 72 %): v10 throws earlier and from farther. That is the part of v5 worth getting back.
