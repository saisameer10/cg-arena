# Autopsy of our own Gold games: what separates wins from non-wins

Try Catch Forest, Gold league, 2026-11-18. Read-only analysis of the arena logs in `E:/cg-tmp/tcf/gold/games`.
Scripts: `E:/cg-tmp/tcf/gold/agent_us/` (`lib.py` parser, `report.py` tables, `extra*.py` deeper looks, `verify_smoke.py`).

## Sample

| | games | first | second | last | wins / non-wins |
|---|---|---|---|---|---|
| v10 (submission 41743202, live) | 46 | 22 (48 %) | 11 | 13 | 22 / 24 |
| v5 (submission 41742767) | 34 | 14 (41 %) | 11 | 9 | 14 / 20 |
| both | 80 | 36 (45 %) | 22 | 22 | 36 / 44 |

- One v10 battle was still running at the last fetch and is left out. The sample is frozen in `agent_us/frozen_ids.json`.
- The battle list the API returns for v5 shrank between fetches (34, then 32, then 29 entries). The games are therefore
  taken from the folder by our agent id (one agent id per submission); all 34 v5 logs are used.
- "Non-win" = second or last. "Both" mixes two versions of the bot and is only used where the two agree.
- **Every per-version number rests on 14 to 24 games per side: weak by the 30-case rule.** Only "both" reaches 36 wins
  and 44 non-wins. About 150 patterns were looked at; with 80 games a few large gaps appear by chance. A finding is
  kept below only when v10 and v5 show it separately in the same direction, or when an exact re-check supports it.
- Tags (read in `versions/v10.java`, line 495): CATCH = certain catch; FLEE = a known predator within 2500 (a state,
  not a behaviour); HUNT = no known predator within 2500 and a prey target (seen or remembered up to 25 turns);
  SEEK = neither; no order = held by a net. "Unaware loss" below = the unit was caught with HUNT, SEEK or CATCH on
  its last order, that is with no predator known within 2500.
- Positions are not in the arena logs (only at events: dash start, net, smoke, decoy, catch). Anything that needs a
  position is measured at those events, or exactly on the 21 debug replays of v10 (`g10/`), which hold the whole input.

## Findings, in order of what they suggest changing

Format: share of wins against share of non-wins, both versions (n 80: 36 wins, 44 non-wins), then v10 and v5 apart.

**1. The game is lost to the prey team, not to the predator team.** The winner of our non-wins was our prey team in
32 of 44 (73 %; v10 17 of 24, v5 15 of 20), our predator team in 12. In 23 of the 32 we never led it. Opponents in the
prey seat finished first in 40 % of our games (32 of 80), in the predator seat 15 % (12 of 80). The prey team takes its
points from the third team, where we cannot defend; what we control is how many of its hunters are left. "Prey team
made its first catch before ours": 36 % of wins, 82 % of non-wins (v10 36 / 83, v5 36 / 80). The prey team won 22 % of
the games in which we had caught one of its units by turn 10 (n 37) and 56 % of the others (n 43); same direction in
both versions (v10 22 % of 23 against 52 % of 23; v5 21 % of 14 against 60 % of 20; a correlation, not an experiment).
When it caught every unit of the third team (18 games) we won none: 0 % of wins, 41 % of non-wins.

**2. The first catch is the best early predictor; early losses predict nothing.** "We made the first catch of the
game": 58 % of wins, 16 % of non-wins (v10 55 / 12, v5 64 / 20); win rate 75 % of 28 with it, 29 % of 52 without.
"A catch and no loss by turn 10": 42 % / 14 % (v10 41 / 21, v5 43 / 5). Our first catch: median turn 8 in wins, 17 in
non-wins; win rate 63 %, 56 %, 53 % for a first catch in turns 1-5, 6-10, 11-15 (n 19, 18, 15), then 29 %, 25 %, 11 %
for 16-20, 21-40, later or never (n 7, 12, 9: weak). Units lost by turn 10 or 20: AUC 0.46 and 0.46; "a unit lost by
turn 10" 31 % / 41 %; "two units lost by turn 20" 19 % / 9 % (the wrong way round for a cause). Best single number at
turn 20: catches minus the best opponent's catches (AUC 0.71; v10 0.69, v5 0.71) and our catches (0.69; 0.68, 0.68).
At turn 10 nothing passes the noise line for v10 alone (largest AUC 0.61).

**3. Hunting time is the same; its yield is half. Search is not the bottleneck in Gold.** Turns 1-20: HUNT share of
living unit-turns 72 % in wins, 70 % in non-wins; SEEK 9 % and 9 %; catches per 100 HUNT unit-turns 3.7 against 2.0
(v10 4.2 / 2.0, v5 2.9 / 1.8). Turns 41-100: 2.7 against 1.2 (v10 2.6 / 0.8), with 56 % of the unit-turns still tagged
HUNT in non-wins. "No catch by turn 20": 11 % / 39 % (v10 14 / 33, v5 7 / 45).

**4. A net on prey thrown from far is half wasted, and v10 does it more.** Net hits on prey that became a catch within
5 turns: thrown from under 1000: 80 % (56 hits); 1000-1500: 64 % (56); over 1500: 50 % (22, weak). v10 from 1000-1500:
48 % of 25 (weak), v5 77 % of 31. "A net of ours held prey from more than 1000 away and no catch followed": 17 % of
wins, 41 % of non-wins (v10 5 / 38, v5 36 / 45: carried by v10). Conversion of all prey hits: v10 82 % in wins (34
hits), 50 % in non-wins (32); v5 68 % / 72 %. When the thrower itself was netted in the next two turns the hit became
a catch 38 % of the time (16 hits, weak; 12 of those nets came from the prey team) against 75 % for a free thrower
(100 hits). 14 % of our nets (53 of 382) are thrown by a unit that cannot move.

**5. The prey team nets our hunters at close range and the hunt dies.** Nets of the prey team that held one of ours:
0.64 per win, 1.16 per non-win (v10 0.68 / 1.08; v5 0.57 / 1.25). After turn 20 it happens in 6 % of
wins and 23 % of non-wins (v10 5 / 21, v5 7 / 25; 12 games, weak). Of 74 such nets, 58 were thrown from under 1000 and
63 hit a unit tagged HUNT; only 3 led to that unit being caught: the cost is the lost prey, not the unit. Our decoys
are sent at predators only (strategy.md, weak point 6).

**6. A predator net in the first five turns.** One of ours held by a net of the predator team by turn 5: 8 % of wins
(3 of 36), 39 % of non-wins (17 of 44); v10 5 / 33, v5 14 / 45. 8 of the 22 units held that early were caught within
5 turns. Held by any enemy net by turn 5: 33 % / 66 %.

**7. Blind inside a cloud: the largest single source of lost units.** 79 of 186 lost units (42 %) were unaware losses;
75 % of them stood inside a cloud (54 % inside our own), against 15 % (8 %) of the positions of unaware units that were
not caught. "A unit lost in turns 21-40 with no known predator within 2500": 6 % of wins (2 of 36), 43 % of non-wins
(19 of 44); v10 9 / 38, v5 0 / 50. By turn 10 the same kind of loss does not separate anything (22 % / 16 %).
Exact re-check on the 21 debug replays of v10 (6,355 unit-turns, 56 losses): a free unit inside a cloud with no
predator in sight is caught 20.8 times per 1000 unit-turns; a free unit in the open with a predator in sight within
2500, 11.5; a free unit in the open with no predator in sight, 0.2 (1 loss in 4,153). 24 of the 56 losses fell on the
14 % of unit-turns spent in a cloud without a predator in sight. The bot drops a predator 3 turns after it last saw
it, a cloud lasts 9 turns and blinds the units inside, so the unit goes back to HUNT while the predator walks in.
Caution: smoke is thrown when a predator is near, so clouds are where predators are; the comparison that holds is
"in the cloud" (20.8) against "predator visible in the open" (11.5), and the local ablation says smoke as a whole helps.

**8. Leads thrown away late to the predator team.** We were first at turn 70 in 40 of 80 games and won 34; of the 6
lost, 5 went to the predator team catching one of ours on turn 72 to 93 (v10 3, v5 2). With game 924184549 (turn 96)
this is 6 of 44 non-wins, 4 of the 24 of v10. Those units had been tagged FLEE for six turns or more with 3 to 7
dashes spent. The leak is general: units lost after turn 40 are 1.06 per win and 0.73 per non-win; 95 % of them (wins)
had spent 3 or more dashes, 66 % had the dash on cooldown, 61 % died at the wall. It only costs the game when the
predator team is one catch behind us.

**9. Tie-breaks are lost on the first catch.** Level on catches with the best opponent in 19 games; we took 9 (47 %;
v10 5 of 10, v5 4 of 9). All 10 lost were decided on catch number 1, ours being 3 to 24 turns later. In 6 of the 10 one
prey unit was still alive with 1 to 5 of ours for 14 to 73 turns after our last catch; but "one prey left, units
alive, 30 turns without a catch" is as common in wins (19 %) as in non-wins (11 %), so the lever is the early catch.

**10. Four units per team: 4 wins in 19 games (21 %)** against 65 %, 50 %, 45 % for 3, 5, 6 units (v10 2 of 12, v5 2
of 7). First catch at median turn 20 against 10 to 13; 50 % of the prey caught against 69 to 82 %. Weak (19 games, one
of four sizes singled out) but present in both versions. Seat: 45 %, 46 %, 44 % wins for seats 0, 1, 2: no effect.

**v10 against v5.** Arena: catches by turn 10 0.74 against 0.44 (+0.30, standard error 0.16), by turn 20 1.65 / 1.24
(+0.42, s.e. 0.30), units lost 2.41 / 2.21, wins 48 % / 41 % (+0.07, s.e. 0.11): the direction of the replay proof
(+0.76 catches by turn 10 on the same 21 battles) with less than half its size, and not beyond two standard errors.
Beyond two standard errors: v10 dashes less (13.8 against 19.7 per game). Net hits on prey per game 1.43 / 2.00
(-0.57, s.e. 0.29); prey hits converted 62 % / 69 %. Profile of the losses: v10 loses 17 of its 22 units lost by
turn 10 unaware (v5 2 of 12); 35 % of v10's lost units were tagged HUNT (v5 23 %); wall 23 % / 19 %; held by a net
31 % / 27 %; inside our own cloud 41 % / 44 %. For v5 the units lost by turn 40 separated wins from non-wins (0.79
against 1.80, AUC 0.27); for v10 they do not (1.50 / 1.50, AUC 0.47): v10's results are decided by catches alone.

## Causes of the 44 non-wins

One group per game (who won, and when the game turned), then overlapping marks.

| group | v10 | v5 | both |
|---|---|---|---|
| 1. Prey team won and we never led it (it caught first; our first catch came a median of 10 turns later) | 10 | 13 | 23 |
| 2. Prey team won after we had led (our hunt stalled while it kept scoring) | 7 | 2 | 9 |
| 3. Predator team won by catching one of ours after turn 70 (lead lost late) | 4 | 2 | 6 |
| 4. Predator team won earlier on our own units | 3 | 3 | 6 |

Marks across the groups: no catch of ours by turn 20: 17 (15 in group 1); level on catches, lost the tie-break: 10;
the winner caught every unit of the third team: 18; two or more prey units left while we still had units: 28;
we were wiped out: 3; two units lost by turn 10 or half the team by turn 20: 2 (and 4 of our wins had it).
The rule-based list (first rule that applies) is in section 3: wiped out 3, early collapse 2, all prey caught but
later 3, level with prey left 6, no catch by turn 20 15, hunt stalled 15.

## Answers to the six questions, short

1. By turn 10, 20, 40: section 1. Wins and non-wins differ in catches, not in losses, nets thrown, dashes, smoke,
   decoys or tag shares (all AUC 0.44 to 0.56 at turn 20). Best early predictors: first catch of the game, catches
   minus best opponent at turn 20, predator net on us by turn 5.
2. By units and seat: section 2. Only the size 4 stands out (weak). No seat effect.
3. Each non-win with its decisive turn and event: section 3, 44 lines; causes above.
4. Strongest teams: of the named teams only ATI x iHot was met (3 games, all v10: we were last, last, first). As our
   predator (2 games) it caught 5 of ours: 2 after a net, 2 unaware hunters on the same turn 5, 1 fleeing unit at the
   wall, all but one by walking in. As our prey (1 game) we caught 5 of its 6 units, 4 by walking in, none after a
   net, and it still took 5 from the third team. Three games: no conclusion. No other named team in 80 games. By leaderboard
   position in the logs: predator in the top 100 in 10 games (26 losses, weak): catcher dashed 46 % against 28 % for
   the rest, decoys took 12 % of the net hits against 25 %, 58 % of our units lost against 49 %; we still won 6 of
   the 10. Prey in the top 100 in 18 games: we caught 72 % of its units, the same as against the rest (72 %), more
   often after a net (45 % against 32 %). Nothing here is beyond noise. The six teams that finished first twice or
   more in our games did it from the prey seat in 11 of their 13 wins.
5. Third player: section 5 and finding 1. 73 % of our non-wins were won by the team that profits from the third
   team, and in 18 of those 32 it caught the whole third team. We can only influence it by catching its units early.
   Our nets on predators do not feed it: 12 % of the predators we held were then caught by the prey team, in wins and
   in non-wins alike (13 of 107).
6. v10 against v5: section 6 and the paragraph above.

## Re-checks made

- Parser against `tools/arena.py` on the 34 v5 games: ranks 14 / 11 / 9, catches 3.38, lost 2.21, nets 5.00, prey
  hits converted 69 %: identical.
- Ranking rule (more catches, then earlier catches) against the official order: 240 pairs of teams, 0 mismatches
  (1 pair fully level); every score lies between 3 x catches and 3 x catches + 2.
- Tag meaning read in the source and tested on the debug replays: 18 of 18 losses tagged HUNT or SEEK had no predator
  in the input within 2500; 21 of 22 tagged FLEE had one.
- Cloud finding: the flag computed from the catch position agrees with the exact unit position in 56 of 56 replay
  losses; hazard rates computed on exact positions (finding 7).
- Decisive turn checked by hand on games 924162613 and 924162616.
- Checked and dropped: "our nets on predators feed the prey team" (12 % in wins and non-wins); "early losses decide"
  (finding 2); "search is the bottleneck" (finding 3); "more smoke, fewer wins" (two or more smokes by turn 20: 58 % of
  wins, 86 % of non-wins in both versions, but the win rate by count is 86, 64, 30, 24, 60 % for 0, 1, 2, 3, 4+
  smokes: not monotonic, and smoke follows threats).
- The size of v10's early-catch gain in the arena (+0.30) is less than half of the replay figure (+0.76).

---

# Full tables


## 0. Sample

| version | n | first | second | last | mean rank | catches | units lost | prey team catches | catches by 10 | lost by 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 46 | 22 (48 %) | 11 (24 %) | 13 (28 %) | 1.80 | 3.26 | 2.41 | 2.85 | 0.74 | 0.48 |
| v5 | 34 | 14 (41 %) | 11 (32 %) | 9 (26 %) | 1.85 | 3.38 | 2.21 | 2.79 | 0.44 | 0.35 |
| both | 80 | 36 (45 %) | 22 (28 %) | 22 (28 %) | 1.82 | 3.31 | 2.33 | 2.83 | 0.61 | 0.42 |

Skipped while loading: [(924206438, 'v10: not finished')]
Games in the folder but no longer in the battle list of the API: [924128364, 924149071, 924155828, 924158080, 924158600]

## 1. Wins against non-wins at turn 10, 20 and 40

Mean per game up to and including the turn. AUC = chance that a random win has a higher value than a random non-win
(0.50 = no information, above = more of it in wins, below = more of it in non-wins). Two standard errors of an AUC
with no real difference: v10 +/- 0.17, v5 +/- 0.20, both +/- 0.13. Values inside 0.50 +/- that are noise. About 55 AUCs are shown per version, so two or three will pass the line by chance.

### By turn 10

| quantity | v10 wins (n 22) | v10 non-wins (n 24) | v10 AUC | v5 wins (n 14) | v5 non-wins (n 20) | v5 AUC | both wins (n 36) | both non-wins (n 44) | both AUC |
|---|---|---|---|---|---|---|---|---|---|
| our catches | 0.91 | 0.58 | 0.59 | 0.71 | 0.25 | 0.71 | 0.83 | 0.43 | 0.64 |
| our units lost | 0.50 | 0.46 | 0.47 | 0.29 | 0.40 | 0.44 | 0.42 | 0.43 | 0.46 |
| catches minus losses | 0.41 | 0.12 | 0.58 | 0.43 | -0.15 | 0.74 | 0.42 | 0.00 | 0.64 |
| catches minus best opponent | -0.27 | -0.62 | 0.57 | 0.00 | -1.15 | 0.88 | -0.17 | -0.86 | 0.70 |
| prey team catches (predator units gone) | 0.91 | 0.96 | 0.50 | 0.50 | 1.35 | 0.23 | 0.75 | 1.14 | 0.39 |
| nets thrown | 2.14 | 2.38 | 0.48 | 1.93 | 1.75 | 0.58 | 2.06 | 2.09 | 0.52 |
| nets that hit prey | 0.68 | 0.79 | 0.48 | 0.79 | 0.55 | 0.60 | 0.72 | 0.68 | 0.53 |
| nets that hit a predator | 0.32 | 0.71 | 0.46 | 0.36 | 0.50 | 0.45 | 0.33 | 0.61 | 0.45 |
| nets that hit a decoy | 0.41 | 0.42 | 0.45 | 0.36 | 0.20 | 0.52 | 0.39 | 0.32 | 0.49 |
| nets that missed (aim or tree) | 0.73 | 0.46 | 0.61 | 0.43 | 0.50 | 0.47 | 0.61 | 0.48 | 0.56 |
| enemy nets that held one of ours | 0.82 | 1.25 | 0.39 | 0.43 | 1.30 | 0.23 | 0.67 | 1.27 | 0.33 |
| dashes by living units | 6.05 | 5.79 | 0.50 | 5.64 | 5.20 | 0.54 | 5.89 | 5.52 | 0.53 |
| dashes per living unit-turn | 0.16 | 0.15 | 0.55 | 0.14 | 0.15 | 0.47 | 0.15 | 0.15 | 0.52 |
| smoke used | 1.55 | 1.83 | 0.45 | 1.29 | 1.45 | 0.44 | 1.44 | 1.66 | 0.45 |
| decoys used | 1.64 | 1.54 | 0.54 | 1.86 | 2.30 | 0.39 | 1.72 | 1.89 | 0.47 |
| share of unit-turns HUNT or CATCH | 0.77 | 0.79 | 0.48 | 0.82 | 0.77 | 0.57 | 0.79 | 0.78 | 0.52 |
| share FLEE | 0.21 | 0.20 | 0.52 | 0.18 | 0.22 | 0.45 | 0.20 | 0.21 | 0.48 |
| share SEEK | 0.03 | 0.01 | 0.53 | 0.00 | 0.01 | 0.47 | 0.02 | 0.01 | 0.51 |

### By turn 20

| quantity | v10 wins (n 22) | v10 non-wins (n 24) | v10 AUC | v5 wins (n 14) | v5 non-wins (n 20) | v5 AUC | both wins (n 36) | both non-wins (n 44) | both AUC |
|---|---|---|---|---|---|---|---|---|---|
| our catches | 2.18 | 1.17 | 0.68 | 1.71 | 0.90 | 0.68 | 2.00 | 1.05 | 0.69 |
| our units lost | 0.95 | 0.75 | 0.55 | 0.43 | 0.85 | 0.33 | 0.75 | 0.80 | 0.46 |
| catches minus losses | 1.23 | 0.42 | 0.65 | 1.29 | 0.05 | 0.78 | 1.25 | 0.25 | 0.70 |
| catches minus best opponent | 0.50 | -0.50 | 0.69 | 0.14 | -1.00 | 0.71 | 0.36 | -0.73 | 0.71 |
| prey team catches (predator units gone) | 1.45 | 1.54 | 0.46 | 1.43 | 1.80 | 0.41 | 1.44 | 1.66 | 0.44 |
| nets thrown | 3.55 | 3.92 | 0.45 | 3.43 | 2.90 | 0.61 | 3.50 | 3.45 | 0.50 |
| nets that hit prey | 1.32 | 1.17 | 0.55 | 1.50 | 0.95 | 0.65 | 1.39 | 1.07 | 0.59 |
| nets that hit a predator | 0.77 | 1.21 | 0.46 | 0.71 | 0.75 | 0.51 | 0.75 | 1.00 | 0.48 |
| nets that hit a decoy | 0.59 | 0.75 | 0.40 | 0.36 | 0.45 | 0.46 | 0.50 | 0.61 | 0.44 |
| nets that missed (aim or tree) | 0.86 | 0.79 | 0.55 | 0.86 | 0.75 | 0.51 | 0.86 | 0.77 | 0.53 |
| enemy nets that held one of ours | 1.27 | 1.42 | 0.46 | 1.00 | 1.75 | 0.30 | 1.17 | 1.57 | 0.39 |
| dashes by living units | 8.64 | 8.75 | 0.49 | 9.71 | 9.35 | 0.54 | 9.06 | 9.02 | 0.51 |
| dashes per living unit-turn | 0.12 | 0.11 | 0.58 | 0.12 | 0.13 | 0.42 | 0.12 | 0.12 | 0.51 |
| smoke used | 2.14 | 2.75 | 0.38 | 2.29 | 2.30 | 0.44 | 2.19 | 2.55 | 0.41 |
| decoys used | 2.27 | 2.50 | 0.48 | 3.14 | 3.05 | 0.53 | 2.61 | 2.75 | 0.48 |
| share of unit-turns HUNT or CATCH | 0.69 | 0.72 | 0.48 | 0.74 | 0.69 | 0.62 | 0.71 | 0.71 | 0.54 |
| share FLEE | 0.18 | 0.20 | 0.46 | 0.18 | 0.21 | 0.41 | 0.18 | 0.20 | 0.43 |
| share SEEK | 0.13 | 0.08 | 0.57 | 0.08 | 0.10 | 0.50 | 0.11 | 0.09 | 0.54 |

### By turn 40

| quantity | v10 wins (n 22) | v10 non-wins (n 24) | v10 AUC | v5 wins (n 14) | v5 non-wins (n 20) | v5 AUC | both wins (n 36) | both non-wins (n 44) | both AUC |
|---|---|---|---|---|---|---|---|---|---|
| our catches | 3.23 | 1.88 | 0.74 | 2.64 | 1.75 | 0.66 | 3.00 | 1.82 | 0.71 |
| our units lost | 1.50 | 1.50 | 0.47 | 0.79 | 1.80 | 0.27 | 1.22 | 1.64 | 0.39 |
| catches minus losses | 1.73 | 0.38 | 0.73 | 1.86 | -0.05 | 0.79 | 1.78 | 0.18 | 0.77 |
| catches minus best opponent | 1.27 | -0.62 | 0.83 | 0.79 | -1.30 | 0.83 | 1.08 | -0.93 | 0.83 |
| prey team catches (predator units gone) | 1.55 | 2.38 | 0.30 | 1.71 | 2.55 | 0.33 | 1.61 | 2.45 | 0.31 |
| nets thrown | 4.32 | 4.62 | 0.45 | 4.57 | 4.15 | 0.54 | 4.42 | 4.41 | 0.48 |
| nets that hit prey | 1.55 | 1.29 | 0.55 | 1.79 | 1.65 | 0.52 | 1.64 | 1.45 | 0.55 |
| nets that hit a predator | 1.18 | 1.38 | 0.51 | 1.36 | 1.00 | 0.60 | 1.25 | 1.20 | 0.54 |
| nets that hit a decoy | 0.59 | 0.83 | 0.37 | 0.43 | 0.55 | 0.49 | 0.53 | 0.70 | 0.43 |
| nets that missed (aim or tree) | 1.00 | 1.12 | 0.47 | 1.00 | 0.95 | 0.47 | 1.00 | 1.05 | 0.48 |
| enemy nets that held one of ours | 1.77 | 1.92 | 0.47 | 1.36 | 2.10 | 0.35 | 1.61 | 2.00 | 0.42 |
| dashes by living units | 10.59 | 10.83 | 0.48 | 14.36 | 13.00 | 0.57 | 12.06 | 11.82 | 0.51 |
| dashes per living unit-turn | 0.08 | 0.07 | 0.65 | 0.09 | 0.10 | 0.40 | 0.09 | 0.09 | 0.55 |
| smoke used | 3.00 | 3.79 | 0.35 | 3.21 | 3.45 | 0.45 | 3.08 | 3.64 | 0.40 |
| decoys used | 3.50 | 3.29 | 0.55 | 4.43 | 4.10 | 0.57 | 3.86 | 3.66 | 0.54 |
| share of unit-turns HUNT or CATCH | 0.59 | 0.62 | 0.50 | 0.53 | 0.57 | 0.40 | 0.57 | 0.60 | 0.46 |
| share FLEE | 0.20 | 0.18 | 0.56 | 0.21 | 0.20 | 0.56 | 0.20 | 0.19 | 0.56 |
| share SEEK | 0.21 | 0.20 | 0.46 | 0.26 | 0.23 | 0.54 | 0.23 | 0.22 | 0.49 |

### Which early quantity predicts the result best

Ranked by distance of the AUC from 0.50, both versions together (n 80); the per-version values are next to it.

| turn | quantity | AUC both | AUC v10 | AUC v5 | same side in both versions |
|---|---|---|---|---|---|
| 40 | catches minus best opponent | 0.83 | 0.83 | 0.83 | yes |
| 40 | catches minus losses | 0.77 | 0.73 | 0.79 | yes |
| 40 | our catches | 0.71 | 0.74 | 0.66 | yes |
| 20 | catches minus best opponent | 0.71 | 0.69 | 0.71 | yes |
| 20 | catches minus losses | 0.70 | 0.65 | 0.78 | yes |
| 10 | catches minus best opponent | 0.70 | 0.57 | 0.88 | yes |
| 40 | prey team catches (predator units gone) | 0.31 | 0.30 | 0.33 | yes |
| 20 | our catches | 0.69 | 0.68 | 0.68 | yes |
| 10 | enemy nets that held one of ours | 0.33 | 0.39 | 0.23 | yes |
| 10 | catches minus losses | 0.64 | 0.58 | 0.74 | yes |
| 10 | our catches | 0.64 | 0.59 | 0.71 | yes |
| 40 | our units lost | 0.39 | 0.47 | 0.27 | yes |
| 10 | prey team catches (predator units gone) | 0.39 | 0.50 | 0.23 | yes |
| 20 | enemy nets that held one of ours | 0.39 | 0.46 | 0.30 | yes |
| 40 | smoke used | 0.40 | 0.35 | 0.45 | yes |
| 20 | nets that hit prey | 0.59 | 0.55 | 0.65 | yes |
| 20 | smoke used | 0.41 | 0.38 | 0.44 | yes |
| 40 | enemy nets that held one of ours | 0.42 | 0.47 | 0.35 | yes |
| 40 | nets that hit a decoy | 0.43 | 0.37 | 0.49 | yes |
| 20 | share FLEE | 0.43 | 0.46 | 0.41 | yes |
| 20 | prey team catches (predator units gone) | 0.44 | 0.46 | 0.41 | yes |
| 20 | nets that hit a decoy | 0.44 | 0.40 | 0.46 | yes |
| 40 | share FLEE | 0.56 | 0.56 | 0.56 | yes |
| 10 | nets that missed (aim or tree) | 0.56 | 0.61 | 0.47 | NO |

### Patterns as shares: "X happens in a % of our wins and b % of our non-wins"

| pattern | v10: wins (n 22) | v10: non-wins (n 24) | v10: win rate with / without | v5: wins (n 14) | v5: non-wins (n 20) | v5: win rate with / without | both: wins (n 36) | both: non-wins (n 44) | both: win rate with / without |
|---|---|---|---|---|---|---|---|---|---|
| at least 1 catch by turn 10 | 59 % (13) | 42 % (10) | 57 % of 23 / 39 % of 23 | 64 % (9) | 25 % (5) | 64 % of 14 / 25 % of 20 | 61 % (22) | 34 % (15) | 59 % of 37 / 33 % of 43 |
| at least 2 catches by turn 10 | 23 % (5) | 17 % (4) | 56 % of 9 / 46 % of 37 | 7 % (1) | 0 % (0) | 100 % of 1 / 39 % of 33 | 17 % (6) | 9 % (4) | 60 % of 10 / 43 % of 70 |
| at least 1 catch by turn 20 | 86 % (19) | 67 % (16) | 54 % of 35 / 27 % of 11 | 93 % (13) | 55 % (11) | 54 % of 24 / 10 % of 10 | 89 % (32) | 61 % (27) | 54 % of 59 / 19 % of 21 |
| at least 2 catches by turn 20 | 55 % (12) | 29 % (7) | 63 % of 19 / 37 % of 27 | 36 % (5) | 30 % (6) | 45 % of 11 / 39 % of 23 | 47 % (17) | 30 % (13) | 57 % of 30 / 38 % of 50 |
| at least half of the prey caught by turn 20 | 45 % (10) | 21 % (5) | 67 % of 15 / 39 % of 31 | 29 % (4) | 10 % (2) | 67 % of 6 / 36 % of 28 | 39 % (14) | 16 % (7) | 67 % of 21 / 37 % of 59 |
| at least half of the prey caught by turn 40 | 82 % (18) | 42 % (10) | 64 % of 28 / 22 % of 18 | 50 % (7) | 30 % (6) | 54 % of 13 / 33 % of 21 | 69 % (25) | 36 % (16) | 61 % of 41 / 28 % of 39 |
| no catch by turn 20 | 14 % (3) | 33 % (8) | 27 % of 11 / 54 % of 35 | 7 % (1) | 45 % (9) | 10 % of 10 / 54 % of 24 | 11 % (4) | 39 % (17) | 19 % of 21 / 54 % of 59 |
| no catch by turn 30 | 5 % (1) | 25 % (6) | 14 % of 7 / 54 % of 39 | 7 % (1) | 30 % (6) | 14 % of 7 / 48 % of 27 | 6 % (2) | 27 % (12) | 14 % of 14 / 52 % of 66 |
| no unit lost by turn 10 | 68 % (15) | 58 % (14) | 52 % of 29 / 41 % of 17 | 71 % (10) | 60 % (12) | 45 % of 22 / 33 % of 12 | 69 % (25) | 59 % (26) | 49 % of 51 / 38 % of 29 |
| at least 1 unit lost by turn 10 | 32 % (7) | 42 % (10) | 41 % of 17 / 52 % of 29 | 29 % (4) | 40 % (8) | 33 % of 12 / 45 % of 22 | 31 % (11) | 41 % (18) | 38 % of 29 / 49 % of 51 |
| at least 2 units lost by turn 10 | 14 % (3) | 4 % (1) | 75 % of 4 / 45 % of 42 | 0 % (0) | 0 % (0) | - of 0 / 41 % of 34 | 8 % (3) | 2 % (1) | 75 % of 4 / 43 % of 76 |
| no unit lost by turn 20 | 36 % (8) | 33 % (8) | 50 % of 16 / 47 % of 30 | 64 % (9) | 30 % (6) | 60 % of 15 / 26 % of 19 | 47 % (17) | 32 % (14) | 55 % of 31 / 39 % of 49 |
| at least 2 units lost by turn 20 | 27 % (6) | 8 % (2) | 75 % of 8 / 42 % of 38 | 7 % (1) | 10 % (2) | 33 % of 3 / 42 % of 31 | 19 % (7) | 9 % (4) | 64 % of 11 / 42 % of 69 |
| at least half of our units lost by turn 20 | 9 % (2) | 0 % (0) | 100 % of 2 / 45 % of 44 | 0 % (0) | 5 % (1) | 0 % of 1 / 42 % of 33 | 6 % (2) | 2 % (1) | 67 % of 3 / 44 % of 77 |
| at least half of our units lost by turn 40 | 18 % (4) | 29 % (7) | 36 % of 11 / 51 % of 35 | 0 % (0) | 45 % (9) | 0 % of 9 / 56 % of 25 | 11 % (4) | 36 % (16) | 20 % of 20 / 53 % of 60 |
| we made the first catch of the game (alone or shared turn) | 55 % (12) | 12 % (3) | 80 % of 15 / 32 % of 31 | 64 % (9) | 20 % (4) | 69 % of 13 / 24 % of 21 | 58 % (21) | 16 % (7) | 75 % of 28 / 29 % of 52 |
| our first catch came before our first loss | 77 % (17) | 38 % (9) | 65 % of 26 / 25 % of 20 | 79 % (11) | 50 % (10) | 52 % of 21 / 23 % of 13 | 78 % (28) | 43 % (19) | 60 % of 47 / 24 % of 33 |
| first catch and no loss by turn 10 | 41 % (9) | 21 % (5) | 64 % of 14 / 41 % of 32 | 43 % (6) | 5 % (1) | 86 % of 7 / 30 % of 27 | 42 % (15) | 14 % (6) | 71 % of 21 / 36 % of 59 |
| ahead of both opponents at turn 10 (ranking rule) | 32 % (7) | 12 % (3) | 70 % of 10 / 42 % of 36 | 43 % (6) | 0 % (0) | 100 % of 6 / 29 % of 28 | 36 % (13) | 7 % (3) | 81 % of 16 / 36 % of 64 |
| ahead of both opponents at turn 20 (ranking rule) | 64 % (14) | 21 % (5) | 74 % of 19 / 30 % of 27 | 57 % (8) | 20 % (4) | 67 % of 12 / 27 % of 22 | 61 % (22) | 20 % (9) | 71 % of 31 / 29 % of 49 |
| ahead of both opponents at turn 40 (ranking rule) | 86 % (19) | 29 % (7) | 73 % of 26 / 15 % of 20 | 79 % (11) | 15 % (3) | 79 % of 14 / 15 % of 20 | 83 % (30) | 23 % (10) | 75 % of 40 / 15 % of 40 |
| more catches than losses at turn 20 | 59 % (13) | 38 % (9) | 59 % of 22 / 38 % of 24 | 79 % (11) | 30 % (6) | 65 % of 17 / 18 % of 17 | 67 % (24) | 34 % (15) | 62 % of 39 / 29 % of 41 |
| more losses than catches at turn 20 | 9 % (2) | 21 % (5) | 29 % of 7 / 51 % of 39 | 0 % (0) | 30 % (6) | 0 % of 6 / 50 % of 28 | 6 % (2) | 25 % (11) | 15 % of 13 / 51 % of 67 |
| a net of ours hit prey by turn 10 | 41 % (9) | 42 % (10) | 47 % of 19 / 48 % of 27 | 64 % (9) | 40 % (8) | 53 % of 17 / 29 % of 17 | 50 % (18) | 41 % (18) | 50 % of 36 / 41 % of 44 |
| a net of ours hit prey by turn 20 | 68 % (15) | 62 % (15) | 50 % of 30 / 44 % of 16 | 93 % (13) | 65 % (13) | 50 % of 26 / 12 % of 8 | 78 % (28) | 64 % (28) | 50 % of 56 / 33 % of 24 |
| a net of ours hit a predator by turn 20 | 45 % (10) | 46 % (11) | 48 % of 21 / 48 % of 25 | 50 % (7) | 50 % (10) | 41 % of 17 / 41 % of 17 | 47 % (17) | 48 % (21) | 45 % of 38 / 45 % of 42 |
| 2 or more nets missed by turn 20 | 18 % (4) | 21 % (5) | 44 % of 9 / 49 % of 37 | 21 % (3) | 20 % (4) | 43 % of 7 / 41 % of 27 | 19 % (7) | 20 % (9) | 44 % of 16 / 45 % of 64 |
| one of ours was held by an enemy net by turn 10 | 64 % (14) | 75 % (18) | 44 % of 32 / 57 % of 14 | 36 % (5) | 80 % (16) | 24 % of 21 / 69 % of 13 | 53 % (19) | 77 % (34) | 36 % of 53 / 63 % of 27 |
| one of ours was held by an enemy net by turn 20 | 73 % (16) | 83 % (20) | 44 % of 36 / 60 % of 10 | 57 % (8) | 90 % (18) | 31 % of 26 / 75 % of 8 | 67 % (24) | 86 % (38) | 39 % of 62 / 67 % of 18 |
| smoke used by turn 10 | 68 % (15) | 88 % (21) | 42 % of 36 / 70 % of 10 | 79 % (11) | 90 % (18) | 38 % of 29 / 60 % of 5 | 72 % (26) | 89 % (39) | 40 % of 65 / 67 % of 15 |
| 2 or more smokes by turn 20 | 55 % (12) | 88 % (21) | 36 % of 33 / 77 % of 13 | 64 % (9) | 85 % (17) | 35 % of 26 / 62 % of 8 | 58 % (21) | 86 % (38) | 36 % of 59 / 71 % of 21 |
| 2 or more decoys by turn 10 | 50 % (11) | 46 % (11) | 50 % of 22 / 46 % of 24 | 50 % (7) | 85 % (17) | 29 % of 24 / 70 % of 10 | 50 % (18) | 64 % (28) | 39 % of 46 / 53 % of 34 |
| FLEE share above 30 % by turn 20 | 5 % (1) | 12 % (3) | 25 % of 4 / 50 % of 42 | 7 % (1) | 10 % (2) | 33 % of 3 / 42 % of 31 | 6 % (2) | 11 % (5) | 29 % of 7 / 47 % of 73 |
| SEEK share above 20 % by turn 20 | 32 % (7) | 21 % (5) | 58 % of 12 / 44 % of 34 | 14 % (2) | 30 % (6) | 25 % of 8 / 46 % of 26 | 25 % (9) | 25 % (11) | 45 % of 20 / 45 % of 60 |
| SEEK share above 30 % by turn 40 | 23 % (5) | 33 % (8) | 38 % of 13 / 52 % of 33 | 43 % (6) | 35 % (7) | 46 % of 13 / 38 % of 21 | 31 % (11) | 34 % (15) | 42 % of 26 / 46 % of 54 |
| more than 0.12 dashes per unit-turn by turn 20 | 45 % (10) | 25 % (6) | 62 % of 16 / 40 % of 30 | 50 % (7) | 60 % (12) | 37 % of 19 / 47 % of 15 | 47 % (17) | 41 % (18) | 49 % of 35 / 42 % of 45 |
| prey team made 2 or more catches by turn 20 | 41 % (9) | 46 % (11) | 45 % of 20 / 50 % of 26 | 50 % (7) | 60 % (12) | 37 % of 19 / 47 % of 15 | 44 % (16) | 52 % (23) | 41 % of 39 / 49 % of 41 |
| prey team made no catch by turn 20 | 23 % (5) | 17 % (4) | 56 % of 9 / 46 % of 37 | 29 % (4) | 5 % (1) | 80 % of 5 / 34 % of 29 | 25 % (9) | 11 % (5) | 64 % of 14 / 41 % of 66 |
| predator team eliminated during the game | 0 % (0) | 42 % (10) | 0 % of 10 / 61 % of 36 | 0 % (0) | 40 % (8) | 0 % of 8 / 54 % of 26 | 0 % (0) | 41 % (18) | 0 % of 18 / 58 % of 62 |
| we caught every prey unit | 55 % (12) | 4 % (1) | 92 % of 13 / 30 % of 33 | 50 % (7) | 10 % (2) | 78 % of 9 / 28 % of 25 | 53 % (19) | 7 % (3) | 86 % of 22 / 29 % of 58 |
| we lost every unit | 14 % (3) | 4 % (1) | 75 % of 4 / 45 % of 42 | 7 % (1) | 10 % (2) | 33 % of 3 / 42 % of 31 | 11 % (4) | 7 % (3) | 57 % of 7 / 44 % of 73 |

## 2. The same split by units per team and by seat

Every cell below 30 games is weak; most cells here are below 10. Read them as descriptions, not as effects.

### By units per team

| version | units per team | n | wins | mean rank | catches | lost | catches by 10 (win / non-win) | by 20 | by 40 | lost by 10 (win / non-win) | by 20 | by 40 | nets on prey by 20 | dashes per unit-turn by 20 | SEEK share by 40 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 3 | 12 | 9 (75 %) | 1.50 | 2.17 | 1.25 | 0.33 / 0.00 | 1.11 / 0.33 | 2.11 / 0.33 | 0.00 / 0.33 | 0.33 / 0.67 | 0.56 / 0.67 | 0.89 / 0.33 | 0.12 / 0.09 | 0.32 / 0.17 |
| v10 | 4 | 12 | 2 (17 %) | 2.42 | 1.83 | 2.08 | 1.00 / 0.40 | 2.00 / 0.70 | 3.50 / 1.00 | 0.50 / 0.40 | 1.00 / 0.60 | 1.50 / 1.20 | 2.00 / 0.80 | 0.14 / 0.11 | 0.24 / 0.20 |
| v10 | 5 | 7 | 4 (57 %) | 1.57 | 4.00 | 3.29 | 1.25 / 1.00 | 2.75 / 1.33 | 4.00 / 2.33 | 0.25 / 0.00 | 1.25 / 1.33 | 2.00 / 2.00 | 1.25 / 0.67 | 0.09 / 0.11 | 0.10 / 0.06 |
| v10 | 6 | 15 | 7 (47 %) | 1.67 | 4.93 | 3.20 | 1.43 / 0.88 | 3.29 / 2.00 | 4.14 / 3.38 | 1.29 / 0.75 | 1.57 / 0.75 | 2.43 / 2.00 | 1.71 / 2.12 | 0.13 / 0.12 | 0.12 / 0.26 |
| v5 | 3 | 5 | 2 (40 %) | 2.00 | 1.80 | 1.60 | 0.50 / 0.33 | 1.00 / 1.00 | 1.50 / 1.00 | 0.00 / 0.33 | 0.00 / 1.00 | 0.00 / 1.67 | 1.00 / 0.67 | 0.09 / 0.12 | 0.52 / 0.24 |
| v5 | 4 | 7 | 2 (29 %) | 2.29 | 2.29 | 1.86 | 0.50 / 0.20 | 1.00 / 0.20 | 1.00 / 0.80 | 0.50 / 0.40 | 0.50 / 0.60 | 0.50 / 1.60 | 1.00 / 0.40 | 0.12 / 0.12 | 0.26 / 0.20 |
| v5 | 5 | 15 | 7 (47 %) | 1.60 | 3.73 | 1.87 | 0.86 / 0.25 | 1.86 / 1.38 | 2.71 / 2.12 | 0.29 / 0.25 | 0.43 / 0.50 | 0.71 / 1.25 | 1.71 / 1.62 | 0.13 / 0.15 | 0.26 / 0.27 |
| v5 | 6 | 7 | 3 (43 %) | 1.86 | 4.86 | 3.71 | 0.67 / 0.25 | 2.33 / 0.75 | 4.33 / 2.75 | 0.33 / 0.75 | 0.67 / 1.75 | 1.67 / 3.25 | 1.67 / 0.50 | 0.13 / 0.12 | 0.09 / 0.21 |
| both | 3 | 17 | 11 (65 %) | 1.65 | 2.06 | 1.35 | 0.36 / 0.17 | 1.09 / 0.67 | 2.00 / 0.67 | 0.00 / 0.33 | 0.27 / 0.83 | 0.45 / 1.17 | 0.91 / 0.50 | 0.11 / 0.11 | 0.36 / 0.21 |
| both | 4 | 19 | 4 (21 %) | 2.37 | 2.00 | 2.00 | 0.75 / 0.33 | 1.50 / 0.53 | 2.25 / 0.93 | 0.50 / 0.40 | 0.75 / 0.60 | 1.00 / 1.33 | 1.50 / 0.67 | 0.13 / 0.11 | 0.25 / 0.20 |
| both | 5 | 22 | 11 (50 %) | 1.59 | 3.82 | 2.32 | 1.00 / 0.45 | 2.18 / 1.36 | 3.18 / 2.18 | 0.27 / 0.18 | 0.73 / 0.73 | 1.18 / 1.45 | 1.55 / 1.36 | 0.12 / 0.14 | 0.20 / 0.21 |
| both | 6 | 22 | 10 (45 %) | 1.73 | 4.91 | 3.36 | 1.20 / 0.67 | 3.00 / 1.58 | 4.20 / 3.17 | 1.00 / 0.75 | 1.30 / 1.08 | 2.20 / 2.42 | 1.70 / 1.58 | 0.13 / 0.12 | 0.11 / 0.24 |

### By seat

| version | seat | n | wins | mean rank | catches | lost | catches by 10 (win / non-win) | by 20 | by 40 | lost by 10 (win / non-win) | by 20 | by 40 | nets on prey by 20 | dashes per unit-turn by 20 | SEEK share by 40 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 0 | 20 | 9 (45 %) | 1.80 | 3.70 | 2.40 | 1.78 / 0.45 | 3.00 / 1.27 | 3.78 / 2.18 | 0.78 / 0.55 | 0.89 / 0.73 | 1.44 / 1.45 | 1.44 / 1.00 | 0.12 / 0.11 | 0.25 / 0.16 |
| v10 | 1 | 15 | 8 (53 %) | 1.73 | 3.27 | 2.53 | 0.25 / 1.00 | 1.88 / 1.14 | 3.12 / 1.57 | 0.38 / 0.57 | 1.00 / 0.71 | 1.75 / 1.43 | 1.38 / 1.43 | 0.13 / 0.12 | 0.13 / 0.25 |
| v10 | 2 | 11 | 5 (45 %) | 1.91 | 2.45 | 2.27 | 0.40 / 0.33 | 1.20 / 1.00 | 2.40 / 1.67 | 0.20 / 0.17 | 1.00 / 0.83 | 1.20 / 1.67 | 1.00 / 1.17 | 0.10 / 0.10 | 0.26 / 0.22 |
| v5 | 0 | 9 | 4 (44 %) | 1.89 | 3.56 | 2.56 | 1.00 / 0.20 | 2.00 / 0.60 | 3.75 / 1.20 | 0.25 / 0.40 | 0.50 / 1.40 | 1.00 / 2.40 | 2.50 / 0.40 | 0.15 / 0.11 | 0.20 / 0.17 |
| v5 | 1 | 11 | 4 (36 %) | 1.91 | 3.64 | 1.55 | 0.50 / 0.14 | 0.75 / 1.00 | 1.50 / 1.86 | 0.50 / 0.29 | 0.50 / 0.43 | 1.00 / 1.14 | 1.00 / 1.14 | 0.12 / 0.14 | 0.30 / 0.25 |
| v5 | 2 | 14 | 6 (43 %) | 1.79 | 3.07 | 2.50 | 0.67 / 0.38 | 2.17 / 1.00 | 2.67 / 2.00 | 0.17 / 0.50 | 0.33 / 0.88 | 0.50 / 2.00 | 1.17 / 1.12 | 0.11 / 0.14 | 0.27 / 0.26 |
| both | 0 | 29 | 13 (45 %) | 1.83 | 3.66 | 2.45 | 1.54 / 0.38 | 2.69 / 1.06 | 3.77 / 1.88 | 0.62 / 0.50 | 0.77 / 0.94 | 1.31 / 1.75 | 1.77 / 0.81 | 0.13 / 0.11 | 0.23 / 0.17 |
| both | 1 | 26 | 12 (46 %) | 1.81 | 3.42 | 2.12 | 0.33 / 0.57 | 1.50 / 1.07 | 2.58 / 1.71 | 0.42 / 0.43 | 0.83 / 0.57 | 1.50 / 1.29 | 1.25 / 1.29 | 0.12 / 0.13 | 0.19 / 0.25 |
| both | 2 | 25 | 11 (44 %) | 1.84 | 2.80 | 2.40 | 0.55 / 0.36 | 1.73 / 1.00 | 2.55 / 1.86 | 0.18 / 0.36 | 0.64 / 0.86 | 0.82 / 1.86 | 1.09 / 1.14 | 0.10 / 0.12 | 0.27 / 0.24 |

### Catch share and loss share by units per team (per unit, so the sizes can be compared)

| version | units | n | prey caught | our units lost | prey caught by 20 | our units lost by 20 | games with all prey caught | games with all units lost | games lost on the tie-break |
|---|---|---|---|---|---|---|---|---|---|
| v10 | 3 | 12 | 72 % | 42 % | 31 % | 14 % | 58 % | 8 % | 0 % |
| v10 | 4 | 12 | 46 % | 52 % | 23 % | 17 % | 8 % | 8 % | 17 % |
| v10 | 5 | 7 | 80 % | 66 % | 43 % | 26 % | 43 % | 29 % | 0 % |
| v10 | 6 | 15 | 82 % | 53 % | 43 % | 19 % | 13 % | 0 % | 20 % |
| v5 | 3 | 5 | 60 % | 53 % | 33 % | 20 % | 20 % | 20 % | 0 % |
| v5 | 4 | 7 | 57 % | 46 % | 11 % | 14 % | 14 % | 0 % | 0 % |
| v5 | 5 | 15 | 75 % | 37 % | 32 % | 9 % | 27 % | 7 % | 27 % |
| v5 | 6 | 7 | 81 % | 62 % | 24 % | 21 % | 43 % | 14 % | 14 % |
| both | 3 | 17 | 69 % | 45 % | 31 % | 16 % | 47 % | 12 % | 0 % |
| both | 4 | 19 | 50 % | 50 % | 18 % | 16 % | 11 % | 5 % | 11 % |
| both | 5 | 22 | 76 % | 46 % | 35 % | 15 % | 32 % | 14 % | 18 % |
| both | 6 | 22 | 82 % | 56 % | 37 % | 20 % | 23 % | 5 % | 18 % |

## 3. Every game not won: the turn and the event that decided it

Decisive turn = the first turn after which the winner stays ahead of us under the ranking rule (more catches, then
earlier catches). It is always a catch by the winner. "Led until" = last turn on which we were ahead of the winner.

| ver | game | units | seat | rank | catches us / prey team / predator team | winner | decisive turn | led until | our catch turns | our loss turns | winner catch turns | left at the end | last 30 turns HUNT / SEEK / FLEE % | event | cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 924162613 | 3 | 1 | 3 | 0 / 3 / 2 | prey Unleash The Leak | 5 | never | - | 57 64 | 5 66 68 | 1 u / 3 prey | 100 / 0 / 0 | winner (our prey, on the third team) made catch 1 of 3 on turn 5; third team wiped out on turn 68 | E. |
| v10 | 924162616 | 6 | 0 | 3 | 5 / 5 / 5 | pred CoreLogic | 90 | 89 | 10 11 13 27 28 | 6 7 25 67 90 | 6 7 25 67 90 | 1 u / 1 prey | 44 / 16 / 40 | winner (our predator, on us) made catch 5 of 5 on turn 90 | B. |
| v10 | 924162618 | 6 | 0 | 2 | 5 / 6 / 1 | prey SAL-GEEK | 5 | never | 11 21 31 46 90 | 5 | 5 21 21 24 42 66 | 5 u / 1 prey | 64 / 36 / 0 | winner (our prey, on the third team) made catch 1 of 6 on turn 5; third team wiped out on turn 66 | F. |
| v10 | 924162621 | 6 | 1 | 2 | 6 / 6 / 2 | prey Code Hashiras | 22 | 21 | 6 7 17 31 57 57 | 3 33 | 3 22 22 23 43 45 | 4 u / 0 prey | 61 / 37 / 2 | winner (our prey, on the third team) made catch 3 of 6 on turn 22; third team wiped out on turn 45 | C. |
| v10 | 924168210 | 4 | 0 | 2 | 3 / 1 / 4 | pred BUZZCODE | 86 | 85 | 8 26 58 | 49 67 85 86 | 49 67 85 86 | 0 u / 1 prey | 16 / 0 / 84 | winner (our predator, on us) made catch 4 of 4 on turn 86; we lost 2 units in turns 83-86; we were wiped out on turn 86 | A. |
| v10 | 924170029 | 6 | 0 | 2 | 4 / 5 / 2 | prey hello | 53 | 52 | 4 6 11 77 | 34 51 | 5 13 15 53 71 | 4 u / 2 prey | 44 / 27 / 29 | winner (our prey, on the third team) made catch 4 of 5 on turn 53 | F. |
| v10 | 924171760 | 4 | 0 | 2 | 3 / 3 / 1 | prey Panchayat | 14 | never | 17 44 86 | 20 | 14 36 55 | 3 u / 1 prey | 93 / 0 / 7 | winner (our prey, on the third team) made catch 1 of 3 on turn 14 | D. |
| v10 | 924173218 | 5 | 0 | 2 | 3 / 5 / 1 | prey The 3 Musketeers | 25 | 24 | 20 22 54 | 19 | 10 25 31 35 52 | 4 u / 2 prey | 7 / 93 / 0 | winner (our prey, on the third team) made catch 2 of 5 on turn 25; third team wiped out on turn 52 | F. |
| v10 | 924173346 | 6 | 2 | 2 | 5 / 3 / 5 | pred SPARTACUS | 93 | 92 | 10 11 13 20 27 | 5 36 37 47 93 | 5 36 37 47 93 | 1 u / 1 prey | 6 / 13 / 81 | winner (our predator, on us) made catch 5 of 5 on turn 93 | D. |
| v10 | 924175479 | 4 | 1 | 3 | 0 / 2 / 3 | pred Felipe’s Haters | 8 | never | - | 8 27 92 | 8 27 92 | 1 u / 4 prey | 50 / 35 / 15 | winner (our predator, on us) made catch 1 of 3 on turn 8 | E. |
| v10 | 924177530 | 3 | 2 | 3 | 0 / 2 / 2 | prey Was Working On Our Machine | 18 | never | - | 20 59 | 18 18 | 1 u / 3 prey | 73 / 27 / 0 | winner (our prey, on the third team) made catch 2 of 2 on turn 18 | E. |
| v10 | 924177559 | 4 | 0 | 3 | 0 / 3 / 2 | prey hello | 17 | never | - | 21 25 | 17 47 80 | 2 u / 4 prey | 57 / 12 / 32 | winner (our prey, on the third team) made catch 1 of 3 on turn 17 | E. |
| v10 | 924178834 | 6 | 0 | 3 | 4 / 5 / 4 | prey 1A26_Bhaukal | 16 | never | 27 35 74 74 | 5 28 41 57 | 16 19 31 59 61 | 2 u / 2 prey | 33 / 0 / 67 | winner (our prey, on the third team) made catch 1 of 5 on turn 16 | E. |
| v10 | 924180323 | 4 | 2 | 3 | 1 / 4 / 1 | prey The 3 Musketeers | 32 | never | 83 | 21 | 32 35 61 62 | 3 u / 3 prey | 100 / 0 / 0 | winner (our prey, on the third team) made catch 1 of 4 on turn 32; third team wiped out on turn 62 | E. |
| v10 | 924183332 | 4 | 1 | 3 | 2 / 2 / 3 | pred Orange You Glad We're Here? | 7 | never | 9 45 | 7 40 51 | 7 40 51 | 1 u / 2 prey | 100 / 0 / 0 | winner (our predator, on us) made catch 1 of 3 on turn 7 | F. |
| v10 | 924183346 | 5 | 2 | 3 | 3 / 5 / 4 | prey ClaudeReviewers | 3 | never | 10 37 66 | 18 18 30 41 | 3 4 25 48 49 | 1 u / 2 prey | 0 / 100 / 0 | winner (our prey, on the third team) made catch 1 of 5 on turn 3; third team wiped out on turn 49 | F. |
| v10 | 924184549 | 4 | 1 | 3 | 2 / 3 / 3 | pred aga | 96 | 95 | 3 10 | 6 57 96 | 6 57 96 | 1 u / 2 prey | 54 / 9 / 38 | winner (our predator, on us) made catch 3 of 3 on turn 96 | F. |
| v10 | 924190003 | 4 | 2 | 2 | 3 / 3 / 1 | prey RoastedTurkishCoffee | 60 | 59 | 19 27 29 | 31 | 3 20 60 | 3 u / 1 prey | 98 / 0 / 2 | winner (our prey, on the third team) made catch 3 of 3 on turn 60 | D. |
| v10 | 924191504 | 3 | 0 | 3 | 1 / 1 / 2 | pred Max Power | 9 | never | 17 | 9 77 | 9 77 | 1 u / 2 prey | 70 / 19 / 11 | winner (our predator, on us) made catch 1 of 2 on turn 9 | F. |
| v10 | 924197070 | 5 | 1 | 2 | 3 / 5 / 2 | prey hello | 36 | 35 | 5 9 23 | 12 23 | 2 6 36 42 99 | 3 u / 2 prey | 68 / 0 / 32 | winner (our prey, on the third team) made catch 3 of 5 on turn 36; third team wiped out on turn 99 | F. |
| v10 | 924199259 | 4 | 0 | 3 | 1 / 3 / 2 | prey Hacktivators | 36 | 35 | 13 | 5 82 | 24 36 59 | 2 u / 3 prey | 64 / 22 / 14 | winner (our prey, on the third team) made catch 2 of 3 on turn 36 | F. |
| v10 | 924200143 | 4 | 2 | 3 | 0 / 4 / 1 | prey BoB the coder | 47 | never | - | 11 | 47 47 81 85 | 3 u / 4 prey | 93 / 0 / 7 | winner (our prey, on the third team) made catch 2 of 4 on turn 47; third team wiped out on turn 85 | E. |
| v10 | 924201276 | 6 | 1 | 2 | 4 / 6 / 1 | prey AI_Said_So | 3 | never | 22 90 92 94 | 27 | 3 3 5 9 9 45 | 5 u / 2 prey | 43 / 57 / 0 | winner (our prey, on the third team) made catch 2 of 6 on turn 3; third team wiped out on turn 45 | E. |
| v10 | 924201411 | 6 | 0 | 2 | 5 / 6 / 3 | prey MindMesh | 54 | 53 | 7 12 21 23 49 | 24 28 36 | 7 8 15 46 54 89 | 3 u / 1 prey | 100 / 0 / 0 | winner (our prey, on the third team) made catch 5 of 6 on turn 54; third team wiped out on turn 89 | F. |
| v5 | 924128349 | 6 | 2 | 2 | 4 / 5 / 3 | prey The ScAm Masters | 82 | 81 | 1 15 23 32 | 7 45 45 | 7 7 55 76 82 | 3 u / 2 prey | 54 / 0 / 46 | winner (our prey, on the third team) made catch 5 of 5 on turn 82 | F. |
| v5 | 924128351 | 6 | 0 | 3 | 4 / 4 / 5 | pred HLV | 16 | 15 | 13 26 46 99 | 14 16 19 29 33 | 14 16 19 29 33 | 1 u / 2 prey | 47 / 0 / 53 | winner (our predator, on us) made catch 2 of 5 on turn 16; we lost 2 units in turns 13-16 | B. |
| v5 | 924128352 | 4 | 1 | 3 | 2 / 4 / 3 | prey CODEFELLAS | 3 | never | 39 94 | 7 21 21 | 3 30 66 70 | 1 u / 2 prey | 100 / 0 / 0 | winner (our prey, on the third team) made catch 1 of 4 on turn 3; third team wiped out on turn 70 | E. |
| v5 | 924128355 | 3 | 2 | 3 | 2 / 3 / 2 | prey The Zero Trust Crew | 16 | never | 18 95 | 12 35 | 16 45 69 | 1 u / 1 prey | 10 / 90 / 0 | winner (our prey, on the third team) made catch 1 of 3 on turn 16; third team wiped out on turn 69 | F. |
| v5 | 924128362 | 6 | 0 | 3 | 3 / 5 / 3 | prey Quantum Quokkas | 32 | never | 36 67 89 | 7 13 23 | 32 39 44 48 93 | 3 u / 3 prey | 63 / 36 / 1 | winner (our prey, on the third team) made catch 1 of 5 on turn 32 | E. |
| v5 | 924128364 | 3 | 0 | 2 | 2 / 1 / 3 | pred 1A26_DROID_NOVA | 72 | 71 | 3 12 | 10 24 72 | 10 24 72 | 0 u / 1 prey | 50 / 0 / 50 | winner (our predator, on us) made catch 3 of 3 on turn 72; we were wiped out on turn 72 | A. |
| v5 | 924129552 | 5 | 2 | 2 | 2 / 1 / 3 | pred Geeks on Leash | 76 | 75 | 11 11 | 19 48 76 | 19 48 76 | 2 u / 3 prey | 26 / 0 / 74 | winner (our predator, on us) made catch 3 of 3 on turn 76 | F. |
| v5 | 924134201 | 5 | 1 | 2 | 5 / 5 / 0 | prey Void.exe | 2 | never | 5 15 16 35 61 | - | 2 6 7 9 28 | 5 u / 0 prey | 53 / 47 / 0 | winner (our prey, on the third team) made catch 1 of 5 on turn 2; third team wiped out on turn 28 | C. |
| v5 | 924139898 | 5 | 1 | 2 | 4 / 5 / 1 | prey Breaking Branch | 8 | never | 13 53 56 95 | 7 | 8 14 21 26 35 | 4 u / 1 prey | 73 / 27 / 0 | winner (our prey, on the third team) made catch 1 of 5 on turn 8; third team wiped out on turn 35 | F. |
| v5 | 924139927 | 5 | 0 | 2 | 3 / 4 / 2 | prey Hackuna Matata | 4 | never | 33 55 80 | 25 70 | 4 18 22 39 | 3 u / 2 prey | 50 / 15 / 35 | winner (our prey, on the third team) made catch 1 of 4 on turn 4 | E. |
| v5 | 924142260 | 5 | 1 | 2 | 5 / 5 / 1 | prey 404: Team Not Found | 8 | never | 12 28 29 58 88 | 15 | 8 8 12 18 23 | 4 u / 0 prey | 47 / 53 / 0 | winner (our prey, on the third team) made catch 2 of 5 on turn 8; third team wiped out on turn 23 | C. |
| v5 | 924142569 | 4 | 1 | 3 | 2 / 4 / 2 | prey Bajrang dal | 11 | never | 50 71 | 38 38 | 11 15 41 63 | 2 u / 2 prey | 3 / 97 / 0 | winner (our prey, on the third team) made catch 1 of 4 on turn 11; third team wiped out on turn 63 | E. |
| v5 | 924146736 | 6 | 2 | 2 | 5 / 2 / 5 | pred OnTheCodeAgain | 40 | 39 | 21 26 27 29 73 | 6 31 31 40 47 | 6 31 31 40 47 | 1 u / 1 prey | 97 / 0 / 3 | winner (our predator, on us) made catch 4 of 5 on turn 40 | D. |
| v5 | 924149071 | 5 | 1 | 2 | 4 / 4 / 0 | prey 1A26_Bhaukal | 39 | 38 | 14 16 22 61 | - | 8 32 39 45 | 5 u / 1 prey | 27 / 41 / 31 | winner (our prey, on the third team) made catch 3 of 4 on turn 39 | D. |
| v5 | 924149518 | 3 | 0 | 3 | 1 / 2 / 1 | prey Zombs | 6 | never | 68 | 20 | 6 28 | 2 u / 2 prey | 50 / 0 / 50 | winner (our prey, on the third team) made catch 1 of 2 on turn 6 | E. |
| v5 | 924152778 | 5 | 2 | 2 | 3 / 3 / 3 | prey The Incompetent Centre | 4 | never | 28 88 98 | 33 35 35 | 4 8 43 | 2 u / 2 prey | 95 / 0 / 5 | winner (our prey, on the third team) made catch 1 of 3 on turn 4 | D. |
| v5 | 924154696 | 4 | 1 | 3 | 2 / 4 / 3 | prey Unleash The Leak | 5 | never | 30 71 | 38 42 49 | 5 10 44 58 | 1 u / 2 prey | 100 / 0 / 0 | winner (our prey, on the third team) made catch 1 of 4 on turn 5; third team wiped out on turn 58 | E. |
| v5 | 924154769 | 5 | 2 | 3 | 2 / 2 / 5 | pred ClaudeReviewers | 23 | 22 | 6 12 | 6 23 23 61 89 | 6 23 23 61 89 | 0 u / 3 prey | 47 / 37 / 16 | winner (our predator, on us) made catch 3 of 5 on turn 23; we lost 2 units in turns 20-23; we were wiped out on turn 89 | A. |
| v5 | 924155828 | 4 | 2 | 2 | 2 / 4 / 1 | prey CodeForLife | 5 | never | 3 76 | 4 | 3 5 40 65 | 3 u / 2 prey | 20 / 80 / 0 | winner (our prey, on the third team) made catch 2 of 4 on turn 5; third team wiped out on turn 65 | F. |
| v5 | 924158600 | 4 | 2 | 3 | 1 / 2 / 1 | prey HLV | 4 | never | 31 | 15 | 4 18 | 3 u / 3 prey | 54 / 19 / 27 | winner (our prey, on the third team) made catch 1 of 2 on turn 4 | E. |

### Causes of non-wins (one primary cause per game, first rule that applies)

| cause | v10 | v5 | both |
|---|---|---|---|
| A. All our units lost before the prey was finished | 1 | 2 | 3 |
| B. Early collapse: 2+ units lost by turn 10 or half the team by turn 20 | 1 | 1 | 2 |
| C. Caught every prey unit, but later than the winner (tie-break) | 1 | 2 | 3 |
| D. Level on catches with prey left: lost the tie-break (one more catch or one earlier catch wins) | 3 | 3 | 6 |
| E. No catch by turn 20, then never caught up | 8 | 7 | 15 |
| F. Hunt stalled: units alive on both sides, fewer catches than the winner | 10 | 5 | 15 |
| total non-wins | 24 | 20 | 44 |

### Causes grouped by who won and when the game turned (the grouping used in the summary)

| group | v10 | v5 | both | ... no catch of ours by turn 20 | ... level on catches (tie-break) | ... we were wiped out | ... winner caught every unit of the third team | ... 2+ prey left and we still had units | games (last 5 digits) |
|---|---|---|---|---|---|---|---|---|---|
| 1. Prey team won and we never led it: it caught first and stayed ahead | 10 | 13 | 23 | 15 | 4 | 0 | 14 | 17 | 62613 62618 71760 77530 77559 78834 80323 83346 00143 01276 28352 28355 28362 34201 39898 39927 42260 42569 49518 52778 54696 55828 58600 |
| 2. Prey team won after we had led: our hunt stalled while it kept scoring | 7 | 2 | 9 | 0 | 3 | 0 | 4 | 5 | 62621 70029 73218 90003 97070 99259 01411 28349 49071 |
| 3. Predator team won by catching our units after turn 70 (lead lost late) | 4 | 2 | 6 | 0 | 2 | 2 | 0 | 2 | 62616 68210 73346 84549 28364 29552 |
| 4. Predator team won earlier: it outscored us on our own units | 3 | 3 | 6 | 2 | 1 | 1 | 0 | 4 | 75479 83332 91504 28351 46736 54769 |

### The same conditions measured in wins too (a cause must be rarer in wins to mean anything)

| pattern | v10: wins (n 22) | v10: non-wins (n 24) | v10: win rate with / without | v5: wins (n 14) | v5: non-wins (n 20) | v5: win rate with / without | both: wins (n 36) | both: non-wins (n 44) | both: win rate with / without |
|---|---|---|---|---|---|---|---|---|---|
| all our units lost | 14 % (3) | 4 % (1) | 75 % of 4 / 45 % of 42 | 7 % (1) | 10 % (2) | 33 % of 3 / 42 % of 31 | 11 % (4) | 7 % (3) | 57 % of 7 / 44 % of 73 |
| 2+ units lost by turn 10 or half the team (2+) by turn 20 | 18 % (4) | 4 % (1) | 80 % of 5 / 44 % of 41 | 0 % (0) | 5 % (1) | 0 % of 1 / 42 % of 33 | 11 % (4) | 5 % (2) | 67 % of 6 / 43 % of 74 |
| no catch by turn 20 | 14 % (3) | 33 % (8) | 27 % of 11 / 54 % of 35 | 7 % (1) | 45 % (9) | 10 % of 10 / 54 % of 24 | 11 % (4) | 39 % (17) | 19 % of 21 / 54 % of 59 |
| our first catch later than the first catch of the best opponent | 45 % (10) | 88 % (21) | 32 % of 31 / 80 % of 15 | 36 % (5) | 80 % (16) | 24 % of 21 / 69 % of 13 | 42 % (15) | 84 % (37) | 29 % of 52 / 75 % of 28 |
| prey units left at the end and at least one of our units alive | 45 % (10) | 92 % (22) | 31 % of 32 / 86 % of 14 | 50 % (7) | 80 % (16) | 30 % of 23 / 64 % of 11 | 47 % (17) | 86 % (38) | 31 % of 55 / 76 % of 25 |
| ... and 2 or more prey units left | 0 % (0) | 67 % (16) | 0 % of 16 / 73 % of 30 | 21 % (3) | 60 % (12) | 20 % of 15 / 58 % of 19 | 8 % (3) | 64 % (28) | 10 % of 31 / 67 % of 49 |
| no catch of ours in the last 40 turns although prey and hunters were left | 27 % (6) | 62 % (15) | 29 % of 21 / 64 % of 25 | 29 % (4) | 15 % (3) | 57 % of 7 / 37 % of 27 | 28 % (10) | 41 % (18) | 36 % of 28 / 50 % of 52 |
| level on catches with the best opponent (tie-break decided our place against it) | 23 % (5) | 21 % (5) | 50 % of 10 / 47 % of 36 | 29 % (4) | 25 % (5) | 44 % of 9 / 40 % of 25 | 25 % (9) | 23 % (10) | 47 % of 19 / 44 % of 61 |
| best opponent was our prey team (its points came from the third team) | 32 % (7) | 71 % (17) | 29 % of 24 / 68 % of 22 | 57 % (8) | 75 % (15) | 35 % of 23 / 55 % of 11 | 42 % (15) | 73 % (32) | 32 % of 47 / 64 % of 33 |
| best opponent was our predator team (its points came from our units) | 64 % (14) | 29 % (7) | 67 % of 21 / 32 % of 25 | 43 % (6) | 25 % (5) | 55 % of 11 / 35 % of 23 | 56 % (20) | 27 % (12) | 62 % of 32 / 33 % of 48 |

### Non-wins by who won and by what stopped our scoring

| version | winner | n | level (tie-break) | short by 1 | short by 2+ | we were wiped out | stalled (both sides alive) | we caught all prey | we never led the winner | mean decisive turn | decided by turn 10 | turn 11-30 | after 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 | our prey team (scores on the third team) | 17 | 3 | 4 | 10 | 0 | 16 | 1 | 10 | 26.24 | 4 | 6 | 7 |
| v10 | our predator team (scores on us) | 7 | 2 | 4 | 1 | 1 | 6 | 0 | 3 | 55.57 | 3 | 0 | 4 |
| v5 | our prey team (scores on the third team) | 15 | 4 | 6 | 5 | 0 | 13 | 2 | 13 | 15.27 | 10 | 2 | 3 |
| v5 | our predator team (scores on us) | 5 | 1 | 3 | 1 | 2 | 3 | 0 | 0 | 45.40 | 0 | 2 | 3 |
| both | our prey team (scores on the third team) | 32 | 7 | 10 | 15 | 0 | 29 | 3 | 23 | 21.09 | 14 | 8 | 10 |
| both | our predator team (scores on us) | 12 | 3 | 7 | 2 | 3 | 9 | 0 | 3 | 51.33 | 3 | 2 | 7 |

## 4. Against the strongest teams

Teams met: 108 over 160 opponent slots; 74 teams were met once, 19 twice, 15 three times or more. A mean rank from 1 to 3 games does not rank a team,
so strength is taken from the leaderboard position stored in each game log (field "rank" of the agent), and the mean rank in our games is shown next to it.

Named top teams met: ATI x iHot (3 games). Not met in any of our games: Les Gens Bons, Lore, RNG, SoloLeveling, FullStuck, Kogaion, Agave.

### Opponents met twice or more, or in the leaderboard top 100 (best leaderboard position first)

| team | leaderboard position | games with us | its mean rank | its wins | as our prey | as our predator | its catches | our mean rank | our wins |
|---|---|---|---|---|---|---|---|---|---|
| Dragons Fight Club | 13 | 1 | 3.00 | 0 | 0 | 1 | 3.00 | 2.00 | 0 |
| The ScAm Masters | 18 | 2 | 2.00 | 1 | 2 | 0 | 4.00 | 1.50 | 1 |
| Zombs | 22 | 1 | 1.00 | 1 | 1 | 0 | 2.00 | 3.00 | 0 |
| CodePistols | 25 | 1 | 2.00 | 0 | 0 | 1 | 4.00 | 1.00 | 1 |
| TokenMaxxers | 36 | 1 | 3.00 | 0 | 1 | 0 | 4.00 | 1.00 | 1 |
| NewPhoneWhoDis | 37 | 1 | 2.00 | 0 | 1 | 0 | 1.00 | 1.00 | 1 |
| Pompoz | 48 | 1 | 2.00 | 0 | 0 | 1 | 4.00 | 1.00 | 1 |
| No more token | 49 | 1 | 3.00 | 0 | 0 | 1 | 1.00 | 1.00 | 1 |
| AI_Said_So | 60 | 2 | 2.00 | 1 | 2 | 0 | 3.50 | 1.50 | 1 |
| hello | 64 | 4 | 1.50 | 3 | 4 | 0 | 3.50 | 2.00 | 1 |
| Golden Path Finders | 65 | 1 | 2.00 | 0 | 0 | 1 | 3.00 | 1.00 | 1 |
| Bitoven | 72 | 1 | 2.00 | 0 | 1 | 0 | 4.00 | 3.00 | 0 |
| RoastedTurkishCoffee | 74 | 1 | 1.00 | 1 | 1 | 0 | 3.00 | 2.00 | 0 |
| CODEFELLAS | 76 | 1 | 1.00 | 1 | 1 | 0 | 4.00 | 3.00 | 0 |
| Coding spree | 81 | 1 | 3.00 | 0 | 1 | 0 | 0.00 | 1.00 | 1 |
| Max Power | 87 | 2 | 1.50 | 1 | 0 | 2 | 2.00 | 3.00 | 0 |
| ∅ NULL | 91 | 2 | 2.50 | 0 | 1 | 1 | 0.50 | 1.00 | 2 |
| Dot Matrix | 94 | 1 | 3.00 | 0 | 1 | 0 | 2.00 | 1.00 | 1 |
| SturdySoldiers | 94 | 1 | 2.00 | 0 | 1 | 0 | 5.00 | 1.00 | 1 |
| Forgers | 100 | 1 | 2.00 | 0 | 0 | 1 | 1.00 | 1.00 | 1 |
| TokenKillers | 102 | 2 | 2.00 | 0 | 0 | 2 | 3.50 | 3.00 | 0 |
| HLV | 124 | 3 | 1.67 | 2 | 2 | 1 | 3.00 | 2.33 | 1 |
| Was Working On Our Machine | 128 | 2 | 1.50 | 1 | 2 | 0 | 2.00 | 2.00 | 1 |
| ATI x iHot | 130 | 3 | 2.00 | 0 | 1 | 2 | 3.33 | 2.33 | 1 |
| ClaudeReviewers | 131 | 4 | 1.75 | 2 | 3 | 1 | 3.75 | 2.00 | 2 |
| Team Avengers | 141 | 3 | 2.33 | 0 | 2 | 1 | 3.00 | 2.00 | 1 |
| The 3 Musketeers | 143 | 2 | 1.00 | 2 | 2 | 0 | 4.50 | 2.50 | 0 |
| Code_Guru's | 143 | 2 | 3.00 | 0 | 0 | 2 | 0.50 | 1.50 | 1 |
| 4NONYM0U5 | 145 | 2 | 2.00 | 0 | 1 | 1 | 2.00 | 1.00 | 2 |
| 404: Team Not Found | 157 | 2 | 2.00 | 1 | 1 | 1 | 4.00 | 2.00 | 0 |
| Bajrang dal | 160 | 4 | 2.00 | 1 | 1 | 3 | 2.00 | 2.00 | 2 |
| Unleash The Leak | 161 | 3 | 1.33 | 2 | 2 | 1 | 3.00 | 3.00 | 0 |
| NoBrAIner | 162 | 2 | 3.00 | 0 | 0 | 2 | 1.50 | 1.50 | 1 |
| The Incompetent Centre | 162 | 3 | 1.67 | 1 | 2 | 1 | 2.67 | 2.00 | 1 |
| OnTheCodeAgain | 164 | 2 | 2.00 | 1 | 1 | 1 | 4.00 | 1.50 | 1 |
| Geeks on Leash | 184 | 2 | 2.00 | 1 | 0 | 2 | 2.00 | 1.50 | 1 |
| Critical Exploit | 184 | 3 | 2.33 | 0 | 0 | 3 | 1.67 | 1.33 | 2 |
| Tiny Coders Again !! | 192 | 3 | 2.67 | 0 | 2 | 1 | 1.00 | 1.33 | 2 |
| AlgorithmAvengers | 205 | 3 | 2.33 | 0 | 2 | 1 | 2.67 | 2.33 | 1 |
| Kebab Injection | 214 | 3 | 2.67 | 0 | 2 | 1 | 0.67 | 1.67 | 2 |
| BoB the coder | 233 | 2 | 2.00 | 1 | 2 | 0 | 2.50 | 2.50 | 0 |
| Binary Beasts | ? | 3 | 2.33 | 0 | 0 | 3 | 3.33 | 2.00 | 1 |
| Stormbreakers | ? | 2 | 2.50 | 0 | 0 | 2 | 2.50 | 1.00 | 2 |
| 1A26_Bhaukal | ? | 2 | 1.00 | 2 | 2 | 0 | 4.50 | 2.50 | 0 |
| ZZZleepy | ? | 2 | 2.00 | 0 | 0 | 2 | 3.00 | 2.00 | 1 |
| Ninja Warriors | ? | 3 | 2.67 | 0 | 3 | 0 | 1.33 | 1.00 | 3 |
| Hacktivators | ? | 3 | 2.00 | 1 | 2 | 1 | 1.67 | 2.67 | 0 |
| copy_paste | ? | 2 | 2.50 | 0 | 2 | 0 | 2.00 | 1.50 | 1 |
| CodeForLife | ? | 2 | 1.50 | 1 | 1 | 1 | 2.50 | 2.50 | 0 |

### How our units were caught: predator in the leaderboard top 100 against the rest

| group | games | units lost | per game | share of our units | median turn | by turn 10 | by turn 20 | netted first (5 turns) | catcher dashed | catcher dashed, free unit | free unit with dash on cooldown | 3+ dashes spent | at the wall (r > 6500) | inside our own smoke | two or more of ours on one turn | tag HUNT | tag FLEE | tag SEEK | enemy nets that held us per game | held -> caught | enemy net hits taken by a decoy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10: predator top 100 (weak) | 7 | 17 | 2.43 | 57 % | 23 | 29 % | 47 % | 35 % | 47 % | 29 % | 24 % | 24 % | 12 % | 47 % | 0 % | 47 % | 35 % | 0 % | 2.43 | 35 % | 11 % |
| v10: predator not top 100 | 39 | 94 | 2.41 | 53 % | 33 | 18 % | 33 % | 30 % | 31 % | 18 % | 19 % | 40 % | 26 % | 40 % | 12 % | 33 % | 36 % | 12 % | 2.08 | 35 % | 26 % |
| v5: predator top 100 (weak) | 3 | 9 | 3.00 | 60 % | 29 | 11 % | 44 % | 22 % | 44 % | 33 % | 22 % | 44 % | 0 % | 44 % | 22 % | 11 % | 11 % | 22 % | 1.33 | 50 % | 20 % |
| v5: predator not top 100 | 31 | 66 | 2.13 | 46 % | 35 | 17 % | 29 % | 27 % | 24 % | 14 % | 23 % | 59 % | 21 % | 44 % | 21 % | 24 % | 33 % | 15 % | 2.03 | 29 % | 23 % |
| both: predator top 100 (weak) | 10 | 26 | 2.60 | 58 % | 23 | 23 % | 46 % | 31 % | 46 % | 31 % | 23 % | 31 % | 8 % | 46 % | 8 % | 35 % | 27 % | 8 % | 2.10 | 38 % | 12 % |
| both: predator not top 100 | 70 | 160 | 2.29 | 49 % | 34 | 18 % | 31 % | 29 % | 28 % | 16 % | 21 % | 48 % | 24 % | 42 % | 16 % | 29 % | 35 % | 13 % | 2.06 | 32 % | 25 % |

### How we caught theirs: prey in the leaderboard top 100 against the rest

| group | games | catches | per game | share of the prey units | median turn | by turn 10 | by turn 20 | catches by turn 10 per game | prey netted first | we dashed | we dashed, free prey | walked into free prey | free prey with dash on cooldown | at the wall | inside the prey's own smoke | nets per game | hit prey | hit predator | hit a decoy | missed | prey hits -> catch |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10: prey top 100 | 12 | 46 | 3.83 | 78 % | 19 | 22 % | 57 % | 0.83 | 41 % | 41 % | 15 % | 43 % | 30 % | 30 % | 17 % | 5.17 | 39 % | 29 % | 13 % | 19 % | 75 % |
| v10: prey not top 100 | 34 | 104 | 3.06 | 69 % | 22 | 23 % | 48 % | 0.71 | 24 % | 34 % | 24 % | 52 % | 40 % | 16 % | 18 % | 4.41 | 28 % | 29 % | 17 % | 26 % | 55 % |
| v5: prey top 100 (weak) | 6 | 16 | 2.67 | 59 % | 46 | 12 % | 25 % | 0.33 | 56 % | 50 % | 19 % | 25 % | 31 % | 6 % | 25 % | 5.50 | 45 % | 24 % | 6 % | 24 % | 53 % |
| v5: prey not top 100 | 28 | 99 | 3.54 | 74 % | 27 | 13 % | 38 % | 0.46 | 39 % | 40 % | 22 % | 38 % | 39 % | 22 % | 16 % | 4.89 | 39 % | 27 % | 12 % | 23 % | 74 % |
| both: prey top 100 | 18 | 62 | 3.44 | 72 % | 22 | 19 % | 48 % | 0.67 | 45 % | 44 % | 16 % | 39 % | 31 % | 24 % | 19 % | 5.28 | 41 % | 27 % | 11 % | 21 % | 67 % |
| both: prey not top 100 | 62 | 203 | 3.27 | 72 % | 24 | 18 % | 43 % | 0.60 | 32 % | 37 % | 23 % | 45 % | 40 % | 19 % | 17 % | 4.63 | 33 % | 28 % | 14 % | 24 % | 65 % |

### Our results by the strength of the two opponents (leaderboard top 100)

| version | games | n | wins | mean rank | catches | lost | catches by 10 | lost by 10 |
|---|---|---|---|---|---|---|---|---|
| v10 | no top-100 opponent | 31 | 14 (45 %) | 1.87 | 3.19 | 2.45 | 0.77 | 0.55 |
| v10 | prey top 100 | 12 | 7 (58 %) | 1.50 | 3.83 | 2.50 | 0.83 | 0.25 |
| v10 | predator top 100 | 7 | 5 (71 %) | 1.57 | 3.29 | 2.43 | 0.57 | 0.71 |
| v5 | no top-100 opponent | 28 | 12 (43 %) | 1.79 | 3.54 | 2.14 | 0.46 | 0.36 |
| v5 | prey top 100 | 6 | 2 (33 %) | 2.17 | 2.67 | 2.50 | 0.33 | 0.33 |
| v5 | predator top 100 | 3 | 1 (33 %) | 2.00 | 3.00 | 3.00 | 0.67 | 0.33 |
| both | no top-100 opponent | 59 | 26 (44 %) | 1.83 | 3.36 | 2.31 | 0.63 | 0.46 |
| both | prey top 100 | 18 | 9 (50 %) | 1.72 | 3.44 | 2.50 | 0.67 | 0.28 |
| both | predator top 100 | 10 | 6 (60 %) | 1.70 | 3.20 | 2.60 | 0.60 | 0.60 |

### Games against the named top teams, one line each

| ver | game | team | role | units | seat | our rank | its rank | catches us / prey / pred | how our units were caught | how we caught |
|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 924162616 | ATI x iHot | our prey | 6 | 0 | 3 | 2 | 5 / 5 / 5 | t6 walk cd  r4333 HUNT; t7 walk cd  r4212 HUNT; t25 walk  r5047 HUNT; t67 walk  r7428 FLEE; t90 walk cd  r7737 FLEE | t10 walk  r3930; t11 dash  r2514; t13 walk  r4366; t27 walk  r3204; t28 walk  r2829 |
| v10 | 924180323 | ATI x iHot | our predator | 4 | 2 | 3 | 2 | 1 / 4 / 1 | t21 walk  r7309 FLEE | t83 walk  r5468 |
| v10 | 924188640 | ATI x iHot | our predator | 6 | 0 | 1 | 2 | 5 / 3 / 4 | t5 walk  r4917 HUNT; t5 walk  r4954 HUNT; t9 netted dash  r4072 FLEE; t25 netted walk  r2529 none | t3 walk  r5894; t6 netted dash  r4327; t14 walk  r1299; t16 netted walk  r3469; t93 dash  r1704 |

## 5. The third player

Cycle: we catch the prey team, the prey team catches our predator team, the predator team catches us.
A winner that is our prey team took its points from the third team; a winner that is our predator team took them from us.

| pattern | v10: wins (n 22) | v10: non-wins (n 24) | v10: win rate with / without | v5: wins (n 14) | v5: non-wins (n 20) | v5: win rate with / without | both: wins (n 36) | both: non-wins (n 44) | both: win rate with / without |
|---|---|---|---|---|---|---|---|---|---|
| predator team lost every unit to the prey team (wiped out) | 0 % (0) | 42 % (10) | 0 % of 10 / 61 % of 36 | 0 % (0) | 40 % (8) | 0 % of 8 / 54 % of 26 | 0 % (0) | 41 % (18) | 0 % of 18 / 58 % of 62 |
| predator team wiped out by turn 30 | 0 % (0) | 0 % (0) | - of 0 / 48 % of 46 | 0 % (0) | 10 % (2) | 0 % of 2 / 44 % of 32 | 0 % (0) | 5 % (2) | 0 % of 2 / 46 % of 78 |
| predator team lost at least half of its units by turn 20 | 18 % (4) | 29 % (7) | 36 % of 11 / 51 % of 35 | 21 % (3) | 35 % (7) | 30 % of 10 / 46 % of 24 | 19 % (7) | 32 % (14) | 33 % of 21 / 49 % of 59 |
| predator team lost no unit by turn 20 | 23 % (5) | 17 % (4) | 56 % of 9 / 46 % of 37 | 29 % (4) | 5 % (1) | 80 % of 5 / 34 % of 29 | 25 % (9) | 11 % (5) | 64 % of 14 / 41 % of 66 |
| prey team made its first catch by turn 5 | 36 % (8) | 42 % (10) | 44 % of 18 / 50 % of 28 | 36 % (5) | 45 % (9) | 36 % of 14 / 45 % of 20 | 36 % (13) | 43 % (19) | 41 % of 32 / 48 % of 48 |
| prey team made its first catch before ours | 36 % (8) | 83 % (20) | 29 % of 28 / 78 % of 18 | 36 % (5) | 80 % (16) | 24 % of 21 / 69 % of 13 | 36 % (13) | 82 % (36) | 27 % of 49 / 74 % of 31 |
| prey team finished with more catches than the predator team | 18 % (4) | 67 % (16) | 20 % of 20 / 69 % of 26 | 36 % (5) | 70 % (14) | 26 % of 19 / 60 % of 15 | 25 % (9) | 68 % (30) | 23 % of 39 / 66 % of 41 |
| prey team finished with at least as many catches as we did | 5 % (1) | 92 % (22) | 4 % of 23 / 91 % of 23 | 21 % (3) | 85 % (17) | 15 % of 20 / 79 % of 14 | 11 % (4) | 89 % (39) | 9 % of 43 / 86 % of 37 |
| we caught at least one prey unit before the prey team made its 2nd catch | 91 % (20) | 58 % (14) | 59 % of 34 / 17 % of 12 | 100 % (14) | 50 % (10) | 58 % of 24 / 0 % of 10 | 94 % (34) | 55 % (24) | 59 % of 58 / 9 % of 22 |
| we caught at least half of the prey team by turn 20 | 45 % (10) | 21 % (5) | 67 % of 15 / 39 % of 31 | 29 % (4) | 10 % (2) | 67 % of 6 / 36 % of 28 | 39 % (14) | 16 % (7) | 67 % of 21 / 37 % of 59 |
| prey team was eliminated by us | 55 % (12) | 4 % (1) | 92 % of 13 / 30 % of 33 | 50 % (7) | 10 % (2) | 78 % of 9 / 28 % of 25 | 53 % (19) | 7 % (3) | 86 % of 22 / 29 % of 58 |

### In the games we did not win: where did the winner get its points

| version | non-wins | winner = our prey team | ... it wiped out the third team | ... by turn 30 | ... third team finished last | ... share of the third team it caught | ... share of its units we caught | ... prey units we had caught before its last catch | winner = our predator team | ... it wiped us out | ... share of our units it caught | ... its units caught by our prey team (mean) | ... our prey team finished last |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 | 24 | 17 (71 %) | 10 | 0 | 9 | 0.90 | 0.50 | 1.88 | 7 (29 %) | 1 | 0.80 | 2.43 | 2 |
| v5 | 20 | 15 (75 %) | 8 | 2 | 8 | 0.87 | 0.61 | 1.47 | 5 (25 %) | 2 | 0.85 | 2.00 | 3 |
| both | 44 | 32 (73 %) | 18 | 2 | 17 | 0.89 | 0.55 | 1.69 | 12 (27 %) | 3 | 0.82 | 2.25 | 5 |

### Does catching prey early hold the prey team down? (all games; a correlation, not an experiment)

| version | games | n | share of the third team caught by the prey team | share of the third team still alive at turn 20 that it caught later | prey team won | we won |
|---|---|---|---|---|---|---|
| v10 | we caught 1+ prey by turn 10 | 23 | 59 % | 34 % | 22 % | 57 % |
| v10 | we caught none by turn 10 | 23 | 67 % | 55 % | 52 % | 39 % |
| v10 | we caught half or more of the prey by turn 20 | 15 | 56 % | 32 % | 13 % | 67 % |
| v10 | we caught less than half by turn 20 | 31 | 66 % | 51 % | 48 % | 39 % |
| v5 | we caught 1+ prey by turn 10 | 14 | 55 % | 25 % | 21 % | 64 % |
| v5 | we caught none by turn 10 | 20 | 62 % | 45 % | 60 % | 25 % |
| v5 | we caught half or more of the prey by turn 20 | 6 | 43 % | 15 % | 17 % | 67 % |
| v5 | we caught less than half by turn 20 | 28 | 63 % | 43 % | 50 % | 36 % |
| both | we caught 1+ prey by turn 10 | 37 | 58 % | 31 % | 22 % | 59 % |
| both | we caught none by turn 10 | 43 | 65 % | 50 % | 56 % | 33 % |
| both | we caught half or more of the prey by turn 20 | 21 | 53 % | 27 % | 14 % | 67 % |
| both | we caught less than half by turn 20 | 59 | 65 % | 47 % | 49 % | 37 % |

### Does the prey team removing our predators protect us? (all games)

| version | games | n | share of our units lost | share of our units alive at turn 20 that were lost later | we won | prey team won | predator team won |
|---|---|---|---|---|---|---|---|
| v10 | predator team lost half or more by turn 20 | 11 | 51 % | 43 % | 36 % | 45 % | 18 % |
| v10 | predator team lost less than half by turn 20 | 35 | 54 % | 42 % | 51 % | 34 % | 14 % |
| v5 | predator team lost half or more by turn 20 | 10 | 43 % | 31 % | 30 % | 60 % | 10 % |
| v5 | predator team lost less than half by turn 20 | 24 | 49 % | 41 % | 46 % | 38 % | 17 % |
| both | predator team lost half or more by turn 20 | 21 | 47 % | 37 % | 33 % | 52 % | 14 % |
| both | predator team lost less than half by turn 20 | 59 | 52 % | 42 % | 49 % | 36 % | 15 % |

## 6. v10 against v5

### Arena games, all sizes and standardised to the same mix of team sizes

| per game | v10 (n 46) | v5 (n 34) | v10 standardised | v5 standardised | difference (raw) | standard error | beyond 2 s.e. |
|---|---|---|---|---|---|---|---|
| win | 0.48 | 0.41 | 0.48 | 0.40 | +0.07 | 0.11 | no |
| last | 0.28 | 0.26 | 0.27 | 0.32 | +0.02 | 0.10 | no |
| mean rank | 1.80 | 1.85 | 1.78 | 1.92 | -0.05 | 0.19 | no |
| catches | 3.26 | 3.38 | 3.35 | 3.29 | -0.12 | 0.36 | no |
| catches / units | 0.70 | 0.70 | 0.71 | 0.69 | -0.00 | 0.06 | no |
| catches by 10 | 0.74 | 0.44 | 0.80 | 0.42 | +0.30 | 0.16 | no |
| catches by 20 | 1.65 | 1.24 | 1.72 | 1.15 | +0.42 | 0.30 | no |
| catches by 40 | 2.52 | 2.12 | 2.62 | 2.06 | +0.40 | 0.35 | no |
| first catch turn (101 if none) | 22.70 | 17.82 | 20.95 | 18.69 | +4.87 | 5.35 | no |
| units lost | 2.41 | 2.21 | 2.54 | 2.32 | +0.21 | 0.33 | no |
| lost / units | 0.52 | 0.47 | 0.54 | 0.50 | +0.05 | 0.06 | no |
| lost by 10 | 0.48 | 0.35 | 0.43 | 0.37 | +0.13 | 0.14 | no |
| lost by 20 | 0.85 | 0.68 | 0.91 | 0.75 | +0.17 | 0.17 | no |
| lost by 40 | 1.50 | 1.38 | 1.58 | 1.50 | +0.12 | 0.26 | no |
| nets thrown | 4.61 | 5.00 | 4.76 | 5.13 | -0.39 | 0.45 | no |
| nets by 10 | 2.26 | 1.82 | 2.35 | 1.65 | +0.44 | 0.37 | no |
| nets on prey | 1.43 | 2.00 | 1.41 | 2.05 | -0.57 | 0.29 | no |
| nets on predators | 1.35 | 1.32 | 1.43 | 1.31 | +0.02 | 0.32 | no |
| nets missed | 1.11 | 1.15 | 1.16 | 1.18 | -0.04 | 0.26 | no |
| nets on a decoy | 0.72 | 0.53 | 0.76 | 0.59 | +0.19 | 0.21 | no |
| dashes by living units | 13.78 | 19.74 | 13.68 | 18.90 | -5.95 | 1.51 | yes |
| dashes by 10 | 5.91 | 5.38 | 5.86 | 4.90 | +0.53 | 0.61 | no |
| dashes per unit-turn by 20 | 0.11 | 0.13 | 0.11 | 0.12 | -0.02 | 0.01 | no |
| smoke | 4.09 | 3.97 | 4.20 | 3.78 | +0.12 | 0.40 | no |
| decoys | 4.35 | 4.62 | 4.48 | 4.51 | -0.27 | 0.44 | no |
| HUNT share by 20 | 0.71 | 0.71 | 0.71 | 0.70 | -0.00 | 0.03 | no |
| FLEE share by 20 | 0.19 | 0.20 | 0.20 | 0.20 | -0.01 | 0.02 | no |
| SEEK share by 20 | 0.10 | 0.09 | 0.09 | 0.10 | +0.01 | 0.03 | no |
| HUNT share whole game | 0.52 | 0.49 | 0.52 | 0.48 | +0.02 | 0.04 | no |
| FLEE share whole game | 0.24 | 0.22 | 0.24 | 0.22 | +0.02 | 0.03 | no |
| SEEK share whole game | 0.24 | 0.29 | 0.24 | 0.29 | -0.04 | 0.03 | no |
| enemy nets that held us | 2.13 | 1.97 | 2.24 | 2.15 | +0.16 | 0.37 | no |
| prey team catches | 2.85 | 2.79 | 2.90 | 2.81 | +0.05 | 0.37 | no |

### Same 21 battles: v5 in the arena against v10 replaying them (same opponents, seats and maps; from `g10/`)

Pairs found: 21.

| per game | v10 replay | v5 arena | paired difference | standard error | beyond 2 s.e. | battles higher with v10 | battles lower with v10 |
|---|---|---|---|---|---|---|---|
| win | 0.52 | 0.43 | +0.10 | 0.14 | no | 5 | 3 |
| last | 0.05 | 0.24 | -0.19 | 0.09 | yes | 0 | 4 |
| mean rank | 1.52 | 1.81 | -0.29 | 0.18 | no | 3 | 7 |
| catches | 3.62 | 3.48 | +0.14 | 0.24 | no | 9 | 7 |
| catches / units | 0.78 | 0.73 | +0.05 | 0.05 | no | 9 | 7 |
| catches by 10 | 1.24 | 0.48 | +0.76 | 0.24 | yes | 11 | 1 |
| catches by 20 | 2.00 | 1.29 | +0.71 | 0.29 | yes | 10 | 2 |
| catches by 40 | 3.05 | 2.14 | +0.90 | 0.25 | yes | 14 | 2 |
| first catch turn (101 if none) | 8.62 | 14.95 | -6.33 | 2.39 | yes | 2 | 10 |
| units lost | 2.67 | 1.95 | +0.71 | 0.39 | no | 10 | 6 |
| lost / units | 0.55 | 0.43 | +0.13 | 0.09 | no | 10 | 6 |
| lost by 10 | 0.38 | 0.33 | +0.05 | 0.16 | no | 4 | 4 |
| lost by 20 | 0.81 | 0.71 | +0.10 | 0.28 | no | 6 | 4 |
| lost by 40 | 1.62 | 1.33 | +0.29 | 0.33 | no | 9 | 6 |
| nets thrown | 5.19 | 5.05 | +0.14 | 0.13 | no | 3 | 1 |
| nets by 10 | 2.29 | 1.57 | +0.71 | 0.39 | no | 12 | 4 |
| nets on prey | 1.90 | 2.29 | -0.38 | 0.28 | no | 4 | 11 |
| nets on predators | 1.14 | 1.52 | -0.38 | 0.33 | no | 7 | 10 |
| nets missed | 1.43 | 0.81 | +0.62 | 0.29 | yes | 10 | 4 |
| nets on a decoy | 0.71 | 0.43 | +0.29 | 0.22 | no | 7 | 3 |
| dashes by living units | 16.43 | 20.19 | -3.76 | 1.19 | yes | 5 | 13 |
| dashes by 10 | 6.57 | 5.43 | +1.14 | 0.64 | no | 13 | 6 |
| dashes per unit-turn by 20 | 0.12 | 0.13 | -0.00 | 0.01 | no | 12 | 9 |
| smoke | 3.48 | 3.48 | +0.00 | 0.17 | no | 4 | 5 |
| decoys | 3.95 | 4.19 | -0.24 | 0.28 | no | 2 | 3 |
| HUNT share by 20 | 0.71 | 0.70 | +0.01 | 0.03 | no | 11 | 10 |
| FLEE share by 20 | 0.17 | 0.18 | -0.00 | 0.02 | no | 11 | 9 |
| SEEK share by 20 | 0.12 | 0.12 | -0.01 | 0.03 | no | 8 | 9 |
| HUNT share whole game | 0.56 | 0.49 | +0.06 | 0.04 | no | 13 | 8 |
| FLEE share whole game | 0.23 | 0.20 | +0.02 | 0.04 | no | 12 | 9 |
| SEEK share whole game | 0.22 | 0.30 | -0.08 | 0.04 | yes | 4 | 17 |
| enemy nets that held us | 2.57 | 1.52 | +1.05 | 0.49 | yes | 14 | 3 |
| prey team catches | 2.43 | 2.90 | -0.48 | 0.38 | no | 7 | 9 |

### Where and how our units die

| group | games | units lost | per game | share of our units | median turn | by turn 10 | by turn 20 | netted first (5 turns) | catcher dashed | catcher dashed, free unit | free unit with dash on cooldown | 3+ dashes spent | at the wall (r > 6500) | inside our own smoke | two or more of ours on one turn | tag HUNT | tag FLEE | tag SEEK | enemy nets that held us per game | held -> caught | enemy net hits taken by a decoy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 arena | 46 | 111 | 2.41 | 53 % | 28 | 20 % | 35 % | 31 % | 33 % | 20 % | 20 % | 38 % | 23 % | 41 % | 10 % | 35 % | 36 % | 10 % | 2.13 | 35 % | 24 % |
| v10 arena, wins | 22 | 54 | 2.45 | 56 % | 27 | 20 % | 39 % | 33 % | 35 % | 24 % | 24 % | 43 % | 31 % | 39 % | 17 % | 30 % | 44 % | 6 % | 1.95 | 42 % | 23 % |
| v10 arena, non-wins | 24 | 57 | 2.38 | 51 % | 30 | 19 % | 32 % | 28 % | 32 % | 16 % | 16 % | 33 % | 16 % | 44 % | 4 % | 40 % | 28 % | 14 % | 2.29 | 29 % | 25 % |
| v5 arena | 34 | 75 | 2.21 | 47 % | 33 | 16 % | 31 % | 27 % | 27 % | 16 % | 23 % | 57 % | 19 % | 44 % | 21 % | 23 % | 31 % | 16 % | 1.97 | 30 % | 23 % |
| v5 arena, wins (weak) | 14 | 28 | 2.00 | 42 % | 48 | 14 % | 21 % | 21 % | 32 % | 25 % | 39 % | 75 % | 39 % | 25 % | 14 % | 14 % | 54 % | 7 % | 1.36 | 32 % | 24 % |
| v5 arena, non-wins | 20 | 47 | 2.35 | 51 % | 25 | 17 % | 36 % | 30 % | 23 % | 11 % | 13 % | 47 % | 6 % | 55 % | 26 % | 28 % | 17 % | 21 % | 2.40 | 29 % | 23 % |
| v10 replay of 21 v5 battles | 21 | 56 | 2.67 | 57 % | 31 | 14 % | 30 % | 43 % | 34 % | 20 % | 25 % | 55 % | 14 % | 29 % | 18 % | 27 % | 39 % | 5 % | 2.57 | 44 % | 13 % |
| v10 replay of 21 v5 battles, wins (weak) | 11 | 26 | 2.36 | 53 % | 32 | 12 % | 31 % | 35 % | 23 % | 12 % | 23 % | 54 % | 23 % | 42 % | 15 % | 31 % | 31 % | 0 % | 2.27 | 36 % | 19 % |
| v10 replay of 21 v5 battles, non-wins | 10 | 30 | 3.00 | 60 % | 31 | 17 % | 30 % | 50 % | 43 % | 27 % | 27 % | 57 % | 7 % | 17 % | 20 % | 23 % | 47 % | 10 % | 2.90 | 52 % | 6 % |
| v5 arena, the same 21 battles | 21 | 41 | 1.95 | 41 % | 25 | 17 % | 37 % | 29 % | 32 % | 22 % | 20 % | 49 % | 20 % | 44 % | 15 % | 20 % | 29 % | 15 % | 1.52 | 38 % | 20 % |
| v5 arena, the same 21 battles, wins (weak) | 9 | 13 | 1.44 | 31 % | 42 | 15 % | 23 % | 23 % | 38 % | 38 % | 38 % | 69 % | 46 % | 38 % | 0 % | 8 % | 62 % | 8 % | 1.11 | 30 % | 23 % |
| v5 arena, the same 21 battles, non-wins (weak) | 12 | 28 | 2.33 | 49 % | 23 | 18 % | 43 % | 32 % | 29 % | 14 % | 11 % | 39 % | 7 % | 46 % | 21 % | 25 % | 14 % | 18 % | 1.83 | 41 % | 19 % |

### Loss timing and place, shares of the lost units

| set | losses | turn 1-5 | 6-10 | 11-20 | 21-40 | 41-70 | 71-100 | r < 2500 | 2500-5000 | 5000-6500 | > 6500 (wall) | held by a predator net | held by a prey net | held by our own net |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 arena | 111 | 7 % | 13 % | 15 % | 27 % | 24 % | 14 % | 13 % | 41 % | 23 % | 23 % | 30 % | 1 % | 0 % |
| v5 arena | 75 | 1 % | 15 % | 15 % | 32 % | 21 % | 16 % | 8 % | 41 % | 32 % | 19 % | 24 % | 3 % | 0 % |
| v10 replay of 21 v5 battles | 56 | 2 % | 12 % | 16 % | 30 % | 25 % | 14 % | 9 % | 45 % | 32 % | 14 % | 41 % | 2 % | 0 % |
| v5 arena, the same 21 battles | 41 | 0 % | 17 % | 20 % | 32 % | 20 % | 12 % | 10 % | 32 % | 39 % | 20 % | 24 % | 5 % | 0 % |

### How we catch

| group | games | catches | per game | share of the prey units | median turn | by turn 10 | by turn 20 | catches by turn 10 per game | prey netted first | we dashed | we dashed, free prey | walked into free prey | free prey with dash on cooldown | at the wall | inside the prey's own smoke | nets per game | hit prey | hit predator | hit a decoy | missed | prey hits -> catch |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v10 arena | 46 | 150 | 3.26 | 72 % | 20 | 23 % | 51 % | 0.74 | 29 % | 36 % | 21 % | 49 % | 37 % | 21 % | 18 % | 4.61 | 31 % | 29 % | 16 % | 24 % | 62 % |
| v10 arena, wins | 22 | 87 | 3.95 | 90 % | 18 | 23 % | 55 % | 0.91 | 33 % | 28 % | 14 % | 53 % | 33 % | 20 % | 22 % | 4.36 | 35 % | 28 % | 14 % | 23 % | 79 % |
| v10 arena, non-wins | 24 | 63 | 2.62 | 56 % | 22 | 22 % | 44 % | 0.58 | 24 % | 48 % | 32 % | 44 % | 43 % | 22 % | 13 % | 4.83 | 28 % | 30 % | 17 % | 25 % | 44 % |
| v5 arena | 34 | 115 | 3.38 | 72 % | 28 | 13 % | 37 % | 0.44 | 42 % | 42 % | 22 % | 37 % | 38 % | 20 % | 17 % | 5.00 | 40 % | 26 % | 11 % | 23 % | 69 % |
| v5 arena, wins | 14 | 57 | 4.07 | 85 % | 24 | 18 % | 42 % | 0.71 | 33 % | 42 % | 28 % | 39 % | 51 % | 19 % | 19 % | 5.00 | 40 % | 30 % | 10 % | 20 % | 68 % |
| v5 arena, non-wins | 20 | 58 | 2.90 | 62 % | 31 | 9 % | 31 % | 0.25 | 50 % | 41 % | 16 % | 34 % | 26 % | 21 % | 16 % | 5.00 | 40 % | 24 % | 11 % | 25 % | 70 % |
| v10 replay of 21 v5 battles | 21 | 76 | 3.62 | 77 % | 16 | 34 % | 55 % | 1.24 | 47 % | 39 % | 14 % | 38 % | 24 % | 14 % | 18 % | 5.19 | 37 % | 22 % | 14 % | 28 % | 72 % |
| v10 replay of 21 v5 battles, wins | 11 | 41 | 3.73 | 84 % | 14 | 39 % | 59 % | 1.45 | 56 % | 39 % | 7 % | 37 % | 17 % | 10 % | 15 % | 5.36 | 41 % | 22 % | 14 % | 24 % | 79 % |
| v10 replay of 21 v5 battles, non-wins | 10 | 35 | 3.50 | 70 % | 17 | 29 % | 51 % | 1.00 | 37 % | 40 % | 23 % | 40 % | 31 % | 20 % | 23 % | 5.00 | 32 % | 22 % | 14 % | 32 % | 62 % |
| v5 arena, the same 21 battles | 21 | 73 | 3.48 | 74 % | 31 | 14 % | 37 % | 0.48 | 52 % | 40 % | 18 % | 30 % | 29 % | 23 % | 14 % | 5.05 | 45 % | 30 % | 8 % | 16 % | 77 % |
| v5 arena, the same 21 battles, wins | 9 | 35 | 3.89 | 83 % | 26 | 20 % | 40 % | 0.78 | 49 % | 40 % | 20 % | 31 % | 34 % | 26 % | 11 % | 5.33 | 46 % | 33 % | 8 % | 12 % | 77 % |
| v5 arena, the same 21 battles, non-wins | 12 | 38 | 3.17 | 67 % | 35 | 8 % | 34 % | 0.25 | 55 % | 39 % | 16 % | 29 % | 24 % | 21 % | 16 % | 4.83 | 45 % | 28 % | 9 % | 19 % | 77 % |



---

# Appendix: raw output of the deeper looks


## A. Net conversion, nets on predators, hunting yield, HUNT-tag losses, first catch, predator wins, leads, team size (`extra.py`)

```
=== B. our nets that hit prey: converted into a catch within 5 turns
 v10 wins     games 22  hits  34  converted 82 % | thrown by turn 3: 5 conv 80 % | turn 4-20: 24 conv 79 % | after 20: 5 conv 100 % | thrower tag HUNT 28 conv 79 %, FLEE 2 conv 100 % | thrower lost within 5 turns 3 %
 v10 non-wins games 24  hits  32  converted 50 % | thrown by turn 3: 6 conv 17 % | turn 4-20: 22 conv 59 % | after 20: 4 conv 50 % | thrower tag HUNT 22 conv 50 %, FLEE 4 conv 50 % | thrower lost within 5 turns 3 %
 v5 wins     games 14  hits  28  converted 68 % | thrown by turn 3: 6 conv 67 % | turn 4-20: 15 conv 67 % | after 20: 7 conv 71 % | thrower tag HUNT 25 conv 72 %, FLEE 2 conv 0 % | thrower lost within 5 turns 0 %
 v5 non-wins games 20  hits  40  converted 72 % | thrown by turn 3: 2 conv 50 % | turn 4-20: 17 conv 76 % | after 20: 21 conv 71 % | thrower tag HUNT 30 conv 77 %, FLEE 5 conv 80 % | thrower lost within 5 turns 5 %
 both wins     games 36  hits  62  converted 76 % | thrown by turn 3: 11 conv 73 % | turn 4-20: 39 conv 74 % | after 20: 12 conv 83 % | thrower tag HUNT 53 conv 75 %, FLEE 4 conv 50 % | thrower lost within 5 turns 2 %
 both non-wins games 44  hits  72  converted 62 % | thrown by turn 3: 8 conv 25 % | turn 4-20: 39 conv 67 % | after 20: 25 conv 68 % | thrower tag HUNT 52 conv 65 %, FLEE 9 conv 67 % | thrower lost within 5 turns 4 %
 pattern: a net of ours held prey and no catch followed (at least once in the game)
  v10: 27 % of wins (6 of 22), 46 % of non-wins (11 of 24)
  v5: 43 % of wins (6 of 14), 50 % of non-wins (10 of 20)
  both: 33 % of wins (12 of 36), 48 % of non-wins (21 of 44)

=== C. our nets that held a predator: what followed within 5 turns
 v10 wins                           games 22  nets on a predator  27 (1.23 per game)  predator then caught by the prey team 3 (11 %)  games with such a gift 3
 v10 non-wins                       games 24  nets on a predator  35 (1.46 per game)  predator then caught by the prey team 2 (6 %)  games with such a gift 2
 v10 non-wins won by the prey team  games 17  nets on a predator  30 (1.76 per game)  predator then caught by the prey team 2 (7 %)  games with such a gift 2
 v5 wins                           games 14  nets on a predator  21 (1.50 per game)  predator then caught by the prey team 3 (14 %)  games with such a gift 3
 v5 non-wins                       games 20  nets on a predator  24 (1.20 per game)  predator then caught by the prey team 5 (21 %)  games with such a gift 5
 v5 non-wins won by the prey team  games 15  nets on a predator  20 (1.33 per game)  predator then caught by the prey team 4 (20 %)  games with such a gift 4
 both wins                           games 36  nets on a predator  48 (1.33 per game)  predator then caught by the prey team 6 (12 %)  games with such a gift 6
 both non-wins                       games 44  nets on a predator  59 (1.34 per game)  predator then caught by the prey team 7 (12 %)  games with such a gift 7
 both non-wins won by the prey team  games 32  nets on a predator  50 (1.56 per game)  predator then caught by the prey team 6 (12 %)  games with such a gift 6
 all prey-team catches: share made on a unit held by a net, and whose net it was
  v10 wins     prey-team catches  40: on a held unit 42 %; held by OUR net 8 % (3); held by the prey team's own net 35 %
  v10 non-wins prey-team catches  91: on a held unit 33 %; held by OUR net 2 % (2); held by the prey team's own net 30 %
  v5 wins     prey-team catches  26: on a held unit 54 %; held by OUR net 8 % (2); held by the prey team's own net 46 %
  v5 non-wins prey-team catches  69: on a held unit 42 %; held by OUR net 7 % (5); held by the prey team's own net 35 %
  both wins     prey-team catches  66: on a held unit 47 %; held by OUR net 8 % (5); held by the prey team's own net 39 %
  both non-wins prey-team catches 160: on a held unit 37 %; held by OUR net 4 % (7); held by the prey team's own net 32 %
 games where the prey team won and the gifts cover its margin (margin in catches <= gifts, or level and tie-break):
  v10 924173218 N5 catches us 3 prey 5 pred 1 | gifts (net turn, catch turn): [(8, [10])] | prey catch turns [10, 25, 31, 35, 52] | ours [20, 22, 54]
  v10 924201411 N6 catches us 5 prey 6 pred 3 | gifts (net turn, catch turn): [(2, [7])] | prey catch turns [7, 8, 15, 46, 54, 89] | ours [7, 12, 21, 23, 49]
  v5 924139898 N5 catches us 4 prey 5 pred 1 | gifts (net turn, catch turn): [(10, [14])] | prey catch turns [8, 14, 21, 26, 35] | ours [13, 53, 56, 95]
  v5 924142260 N5 catches us 5 prey 5 pred 1 | gifts (net turn, catch turn): [(20, [23])] | prey catch turns [8, 8, 12, 18, 23] | ours [12, 28, 29, 58, 88]
  v5 924152778 N5 catches us 3 prey 3 pred 3 | gifts (net turn, catch turn): [(4, [8])] | prey catch turns [4, 8, 43] | ours [28, 88, 98]
  v5 924154696 N4 catches us 2 prey 4 pred 3 | gifts (net turn, catch turn): [(41, [44])] | prey catch turns [5, 10, 44, 58] | ours [30, 71]
 did our net on a predator save the unit it threatened? our units lost within 5 turns after we held a predator, per such net:
  v10 nets on predators 62; the held predator still caught one of ours within 5 turns: 5 (8 %)
  v5 nets on predators 45; the held predator still caught one of ours within 5 turns: 4 (9 %)
  both nets on predators 107; the held predator still caught one of ours within 5 turns: 9 (8 %)

=== D. hunting efficiency: living unit-turns by tag and catches, by phase
 v10 wins     turns   1- 20: game-turns with prey and hunters alive   433, unit-turns  1615: HUNT 70 % SEEK 11 % FLEE 18 % | catches  48 = 4.2 per 100 HUNT unit-turns, 11.1 per 100 game-turns
 v10 wins     turns  21- 40: game-turns with prey and hunters alive   342, unit-turns   998: HUNT 55 % SEEK 26 % FLEE 19 % | catches  23 = 4.2 per 100 HUNT unit-turns, 6.7 per 100 game-turns
 v10 wins     turns  41-100: game-turns with prey and hunters alive   744, unit-turns  1856: HUNT 33 % SEEK 24 % FLEE 43 % | catches  16 = 2.6 per 100 HUNT unit-turns, 2.2 per 100 game-turns
 v10 non-wins turns   1- 20: game-turns with prey and hunters alive   480, unit-turns  1922: HUNT 72 % SEEK 8 % FLEE 20 % | catches  28 = 2.0 per 100 HUNT unit-turns, 5.8 per 100 game-turns
 v10 non-wins turns  21- 40: game-turns with prey and hunters alive   480, unit-turns  1649: HUNT 49 % SEEK 36 % FLEE 15 % | catches  17 = 2.1 per 100 HUNT unit-turns, 3.5 per 100 game-turns
 v10 non-wins turns  41-100: game-turns with prey and hunters alive  1377, unit-turns  3663: HUNT 58 % SEEK 24 % FLEE 17 % | catches  18 = 0.8 per 100 HUNT unit-turns, 1.3 per 100 game-turns
 v5 wins     turns   1- 20: game-turns with prey and hunters alive   276, unit-turns  1086: HUNT 76 % SEEK 7 % FLEE 18 % | catches  24 = 2.9 per 100 HUNT unit-turns, 8.7 per 100 game-turns
 v5 wins     turns  21- 40: game-turns with prey and hunters alive   244, unit-turns   928: HUNT 34 % SEEK 41 % FLEE 25 % | catches  13 = 4.1 per 100 HUNT unit-turns, 5.3 per 100 game-turns
 v5 wins     turns  41-100: game-turns with prey and hunters alive   606, unit-turns  2074: HUNT 35 % SEEK 29 % FLEE 36 % | catches  20 = 2.8 per 100 HUNT unit-turns, 3.3 per 100 game-turns
 v5 non-wins turns   1- 20: game-turns with prey and hunters alive   397, unit-turns  1426: HUNT 68 % SEEK 11 % FLEE 20 % | catches  18 = 1.8 per 100 HUNT unit-turns, 4.5 per 100 game-turns
 v5 non-wins turns  21- 40: game-turns with prey and hunters alive   397, unit-turns  1175: HUNT 43 % SEEK 40 % FLEE 17 % | catches  17 = 3.4 per 100 HUNT unit-turns, 4.3 per 100 game-turns
 v5 non-wins turns  41-100: game-turns with prey and hunters alive  1095, unit-turns  2622: HUNT 51 % SEEK 32 % FLEE 16 % | catches  23 = 1.7 per 100 HUNT unit-turns, 2.1 per 100 game-turns
 both wins     turns   1- 20: game-turns with prey and hunters alive   709, unit-turns  2701: HUNT 72 % SEEK 9 % FLEE 18 % | catches  72 = 3.7 per 100 HUNT unit-turns, 10.2 per 100 game-turns
 both wins     turns  21- 40: game-turns with prey and hunters alive   586, unit-turns  1926: HUNT 45 % SEEK 33 % FLEE 22 % | catches  36 = 4.1 per 100 HUNT unit-turns, 6.1 per 100 game-turns
 both wins     turns  41-100: game-turns with prey and hunters alive  1350, unit-turns  3930: HUNT 34 % SEEK 27 % FLEE 40 % | catches  36 = 2.7 per 100 HUNT unit-turns, 2.7 per 100 game-turns
 both non-wins turns   1- 20: game-turns with prey and hunters alive   877, unit-turns  3348: HUNT 70 % SEEK 9 % FLEE 20 % | catches  46 = 2.0 per 100 HUNT unit-turns, 5.2 per 100 game-turns
 both non-wins turns  21- 40: game-turns with prey and hunters alive   877, unit-turns  2824: HUNT 46 % SEEK 38 % FLEE 16 % | catches  34 = 2.6 per 100 HUNT unit-turns, 3.9 per 100 game-turns
 both non-wins turns  41-100: game-turns with prey and hunters alive  2472, unit-turns  6285: HUNT 56 % SEEK 27 % FLEE 17 % | catches  41 = 1.2 per 100 HUNT unit-turns, 1.7 per 100 game-turns

=== F. units lost while tagged HUNT
 by turn  20 v10: per game wins 0.68 non-wins 0.42 | at least one: 55 % of wins (12), 38 % of non-wins (9)
 by turn  20 v5: per game wins 0.07 non-wins 0.10 | at least one: 7 % of wins (1), 10 % of non-wins (2)
 by turn  20 both: per game wins 0.44 non-wins 0.27 | at least one: 36 % of wins (13), 25 % of non-wins (11)
 by turn  40 v10: per game wins 0.73 non-wins 0.67 | at least one: 55 % of wins (12), 54 % of non-wins (13)
 by turn  40 v5: per game wins 0.07 non-wins 0.55 | at least one: 7 % of wins (1), 45 % of non-wins (9)
 by turn  40 both: per game wins 0.47 non-wins 0.61 | at least one: 36 % of wins (13), 50 % of non-wins (22)
 by turn 100 v10: per game wins 0.73 non-wins 0.96 | at least one: 55 % of wins (12), 71 % of non-wins (17)
 by turn 100 v5: per game wins 0.29 non-wins 0.65 | at least one: 21 % of wins (3), 50 % of non-wins (10)
 by turn 100 both: per game wins 0.56 non-wins 0.82 | at least one: 42 % of wins (15), 61 % of non-wins (27)
 HUNT-tag losses: how
  v10 HUNT  n  39: netted first 5 %, catcher dashed 31 %, our dash on cooldown 18 %, 3+ dashes spent 21 %, wall 5 %, own smoke 56 %, by turn 10 44 %, we dashed that turn 3 %
  v10 other n  72: netted first 44 %, catcher dashed 35 %, our dash on cooldown 29 %, 3+ dashes spent 47 %, wall 33 %, own smoke 33 %, by turn 10 7 %, we dashed that turn 10 %
  v5 HUNT  n  17: netted first 6 %, catcher dashed 12 %, our dash on cooldown 24 %, 3+ dashes spent 47 %, wall 12 %, own smoke 41 %, by turn 10 12 %, we dashed that turn 0 %
  v5 other n  58: netted first 33 %, catcher dashed 31 %, our dash on cooldown 29 %, 3+ dashes spent 60 %, wall 21 %, own smoke 45 %, by turn 10 17 %, we dashed that turn 9 %
  both HUNT  n  56: netted first 5 %, catcher dashed 25 %, our dash on cooldown 20 %, 3+ dashes spent 29 %, wall 7 %, own smoke 52 %, by turn 10 34 %, we dashed that turn 2 %
  both other n 130: netted first 39 %, catcher dashed 33 %, our dash on cooldown 29 %, 3+ dashes spent 53 %, wall 28 %, own smoke 38 %, by turn 10 12 %, we dashed that turn 9 %

=== G. first catch turn
 v10 wins     n 22 first catch turn: median 8, quartiles 4-13, by 5: 36 %, by 10: 59 %, by 15: 82 %, by 20: 86 %, never: 0
 v10 non-wins n 24 first catch turn: median 17, quartiles 9-83, by 5: 12 %, by 10: 42 %, by 15: 50 %, by 20: 67 %, never: 5
 v5 wins     n 14 first catch turn: median 10, quartiles 5-12, by 5: 29 %, by 10: 64 %, by 15: 86 %, by 20: 93 %, never: 0
 v5 non-wins n 20 first catch turn: median 18, quartiles 11-33, by 5: 20 %, by 10: 25 %, by 15: 50 %, by 20: 55 %, never: 0
 both wins     n 36 first catch turn: median 8, quartiles 5-13, by 5: 33 %, by 10: 61 %, by 15: 83 %, by 20: 89 %, never: 0
 both non-wins n 44 first catch turn: median 17, quartiles 9-33, by 5: 16 %, by 10: 34 %, by 15: 50 %, by 20: 61 %, never: 5
 win rate by first-catch turn band (both versions)
  first catch turn   1-  5: n 19 wins 63 % | v10 8 of 11, v5 4 of 8
  first catch turn   6- 10: n 18 wins 56 % | v10 5 of 12, v5 5 of 6
  first catch turn  11- 15: n 15 wins 53 % | v10 5 of 7, v5 3 of 8
  first catch turn  16- 20: n  7 wins 29 % | v10 1 of 5, v5 1 of 2
  first catch turn  21- 40: n 12 wins 25 % | v10 3 of 5, v5 0 of 7
  first catch turn  41-101: n  9 wins 11 % | v10 0 of 6, v5 1 of 3

=== H. games won by our predator team: each of its catches on us
 v10 924162616 N6 seat 0: us 5 (10 11 13 27 28) pred 5
     t6   unit  0 tag HUNT  catcher-walked our-cd-2  r 4333 dashes spent 2  last tags HHHHHH
     t7   unit  5 tag HUNT  catcher-walked our-cd-1  r 4212 dashes spent 1  last tags FFFHHH
     t25  unit  1 tag HUNT  catcher-walked we-dashed  r 5047 dashes spent 1  last tags HHSSHH
     t67  unit  2 tag FLEE  catcher-walked  r 7428 dashes spent 3  last tags FFFFFF
     t90  unit  3 tag FLEE  catcher-walked our-cd-5  r 7737 dashes spent 7  last tags FFFFFF
 v10 924168210 N4 seat 0: us 3 (8 26 58) pred 4
     t49  unit  3 tag FLEE  catcher-dashed our-cd-1  r 7525 dashes spent 5  last tags FFFFFF
     t67  unit  0 tag FLEE  catcher-dashed our-cd-5  r 4918 dashes spent 5  last tags FFFFFF
     t85  unit  2 tag FLEE  catcher-walked  r 4823 dashes spent 6  last tags FFFFFF
     t86  unit  1 tag FLEE  catcher-walked  r 4778 dashes spent 2  last tags FFFFFF
 v10 924173346 N6 seat 2: us 5 (10 11 13 20 27) pred 5
     t5   unit 17 tag HUNT  catcher-walked  r 4831 dashes spent 1 OWN-SMOKE  last tags nHHHHH
     t36  unit 14 tag SEEK  catcher-walked  r 5925 dashes spent 3 OWN-SMOKE  last tags FFFFFS
     t37  unit 16 tag SEEK  catcher-walked  r 6035 dashes spent 2 OWN-SMOKE  last tags FSSSSS
     t47  unit 15 tag HUNT  catcher-walked our-cd-3  r 4646 dashes spent 5  last tags FFFHHH
     t93  unit 12 tag FLEE  catcher-dashed we-dashed  r 2970 dashes spent 3  last tags FFFFFF
 v10 924175479 N4 seat 1: us 0 () pred 3
     t8   unit  4 tag HUNT  catcher-dashed  r 3367 dashes spent 1 OWN-SMOKE  last tags FHHHHH
     t27  unit  5 tag SEEK  catcher-walked  r 4993 dashes spent 2  last tags SSSSSS
     t92  unit  6 tag HUNT  catcher-walked  r 6533 dashes spent 2 OWN-SMOKE  last tags FFFFHH
 v10 924183332 N4 seat 1: us 2 (9 45) pred 3
     t7   unit  4 tag FLEE  NETTED(by pred, 1 turns before) catcher-walked our-cd-1  r 5224 dashes spent 2  last tags HHHHFn
     t40  unit  7 tag HUNT  NETTED(by pred, 1 turns before) catcher-dashed  r 1947 dashes spent 3  last tags HHHHHn
     t51  unit  6 tag FLEE  NETTED(by pred, 1 turns before) catcher-dashed  r 6593 dashes spent 3  last tags HHHHFn
 v10 924184549 N4 seat 1: us 2 (3 10) pred 3
     t6   unit  5 tag none  NETTED(by pred, 2 turns before) catcher-walked  r 3302 dashes spent 1 OWN-SMOKE  last tags HHHFnn
     t57  unit  6 tag SEEK  catcher-walked  r  510 dashes spent 3 OWN-SMOKE  last tags FFHSSS
     t96  unit  4 tag HUNT  catcher-walked  r 5919 dashes spent 2  last tags FSSHHH
 v10 924191504 N3 seat 0: us 1 (17) pred 2
     t9   unit  0 tag HUNT  catcher-walked  r  701 dashes spent 1 OWN-SMOKE  last tags HHHHHH
     t77  unit  1 tag FLEE  catcher-walked  r 4221 dashes spent 6  last tags SSFFFF
 v5 924128351 N6 seat 0: us 4 (13 26 46 99) pred 5
     t14  unit  5 tag none  NETTED(by prey, 2 turns before) catcher-dashed  r 6099 dashes spent 1  last tags nnHHnn
     t16  unit  2 tag SEEK  catcher-walked  r 3173 dashes spent 2  last tags HHFHSS
     t19  unit  1 tag none  catcher-walked  r 5334 dashes spent 2 OWN-SMOKE  last tags FFnnnn
     t29  unit  0 tag none  NETTED(by pred, 2 turns before) catcher-walked our-cd-2  r 4956 dashes spent 4 OWN-SMOKE  last tags HHCFnn
     t33  unit  4 tag HUNT  catcher-walked  r 5863 dashes spent 2  last tags FHHHHH
 v5 924128364 N3 seat 0: us 2 (3 12) pred 3
     t10  unit  0 tag none  NETTED(by pred, 2 turns before) catcher-walked  r 5176 dashes spent 1  last tags nnnnnn
     t24  unit  1 tag SEEK  catcher-walked  r 6519 dashes spent 3 OWN-SMOKE  last tags FFFFFS
     t72  unit  2 tag HUNT  catcher-walked  r 6319 dashes spent 2 OWN-SMOKE  last tags HHHFFH
 v5 924129552 N5 seat 2: us 2 (11 11) pred 3
     t19  unit 14 tag none  NETTED(by pred, 2 turns before) catcher-dashed  r 3530 dashes spent 2  last tags nnnnnn
     t48  unit 13 tag FLEE  catcher-dashed our-cd-2  r 7732 dashes spent 6  last tags FFFFFF
     t76  unit 11 tag FLEE  catcher-walked we-dashed  r 5876 dashes spent 4  last tags FFFFFF
 v5 924146736 N6 seat 2: us 5 (21 26 27 29 73) pred 5
     t6   unit 12 tag none  NETTED(by pred, 2 turns before) catcher-dashed  r 2920 dashes spent 1 OWN-SMOKE  last tags FHHFnn
     t31  unit 17 tag SEEK  catcher-dashed our-cd-3  r 1731 dashes spent 4 MULTI  last tags nHHCSS
     t31  unit 15 tag FLEE  catcher-walked our-cd-2  r 5015 dashes spent 3 OWN-SMOKE MULTI  last tags nnnHFF
     t40  unit 14 tag SEEK  catcher-walked  r 5348 dashes spent 2  last tags SSSFSS
     t47  unit 16 tag SEEK  catcher-walked  r 3312 dashes spent 3  last tags SSSHHS
 v5 924154769 N5 seat 2: us 2 (6 12) pred 5
     t6   unit 12 tag FLEE  NETTED(by pred, 5 turns before) catcher-walked we-dashed  r 2049 dashes spent 0 OWN-SMOKE  last tags FnnnnF
     t23  unit 11 tag HUNT  catcher-walked  r 5211 dashes spent 1 OWN-SMOKE MULTI  last tags FHnFFH
     t23  unit 14 tag HUNT  catcher-walked  r 5216 dashes spent 3 OWN-SMOKE MULTI  last tags FHnFHH
     t61  unit 13 tag FLEE  catcher-walked we-dashed  r 5916 dashes spent 4 OWN-SMOKE  last tags HFFFFF
     t89  unit 10 tag SEEK  catcher-walked  r 3486 dashes spent 7  last tags SSSSSS

=== I. end game when ahead: games where we were first under the ranking rule at turn 70
 v10: first at turn 70 in 24 of 46 games; still first at the end 21; lost the lead 3: [(924162616, 'pred', [90]), (924168210, 'pred', [85, 86]), (924173346, 'pred', [93])]
    not first at turn 70: 22 games; won anyway 1: [(924174312, [73, 74])]
    units lost after turn 70 per game: wins 0.32 non-wins 0.33; our catches after turn 70 per game: wins 0.41 non-wins 0.38
 v5: first at turn 70 in 16 of 34 games; still first at the end 13; lost the lead 3: [(924128349, 'prey', [76, 82]), (924128364, 'pred', [72]), (924129552, 'pred', [76])]
    not first at turn 70: 18 games; won anyway 1: [(924147266, [72, 91])]
    units lost after turn 70 per game: wins 0.64 non-wins 0.15; our catches after turn 70 per game: wins 0.57 non-wins 0.65
 both: first at turn 70 in 40 of 80 games; still first at the end 34; lost the lead 6: [(924162616, 'pred', [90]), (924168210, 'pred', [85, 86]), (924173346, 'pred', [93]), (924128349, 'prey', [76, 82]), (924128364, 'pred', [72]), (924129552, 'pred', [76])]
    not first at turn 70: 40 games; won anyway 2: [(924174312, [73, 74]), (924147266, [72, 91])]
    units lost after turn 70 per game: wins 0.44 non-wins 0.25; our catches after turn 70 per game: wins 0.47 non-wins 0.50
 lead at turn 40 (both versions): first in 40 games, won 30 (75 %); of the 10 lost leads: to the predator team 6, to the prey team 4
 lead at turn 55 (both versions): first in 39 games, won 31 (79 %); of the 8 lost leads: to the predator team 6, to the prey team 2
 lead at turn 70 (both versions): first in 40 games, won 34 (85 %); of the 6 lost leads: to the predator team 5, to the prey team 1
 lead at turn 85 (both versions): first in 36 games, won 33 (92 %); of the 3 lost leads: to the predator team 3, to the prey team 0

=== J. units per team = 4
 v10 N=3 n 12 wins 9 first-catch median 17, prey-team won 2, predator-team won 1, catches 2.17 lost 1.25, nets thrown 2.7 hit prey 0.8, T<100: 1
 v10 N=4 n 12 wins 2 first-catch median 19, prey-team won 6, predator-team won 4, catches 1.83 lost 2.08, nets thrown 4.4 hit prey 1.2, T<100: 0
 v10 N=5 n  7 wins 4 first-catch median 7, prey-team won 3, predator-team won 0, catches 4.00 lost 3.29, nets thrown 5.6 hit prey 1.3, T<100: 2
 v10 N=6 n 15 wins 7 first-catch median 7, prey-team won 6, predator-team won 2, catches 4.93 lost 3.20, nets thrown 5.9 hit prey 2.1, T<100: 1
 v5 N=3 n  5 wins 2 first-catch median 13, prey-team won 2, predator-team won 1, catches 1.80 lost 1.60, nets thrown 4.0 hit prey 2.2, T<100: 0
 v5 N=4 n  7 wins 2 first-catch median 30, prey-team won 5, predator-team won 0, catches 2.29 lost 1.86, nets thrown 4.0 hit prey 1.4, T<100: 0
 v5 N=5 n 15 wins 7 first-catch median 11, prey-team won 6, predator-team won 2, catches 3.73 lost 1.87, nets thrown 4.7 hit prey 1.9, T<100: 2
 v5 N=6 n  7 wins 3 first-catch median 12, prey-team won 2, predator-team won 2, catches 4.86 lost 3.71, nets thrown 7.4 hit prey 2.6, T<100: 1
 both N=3 n 17 wins 11 first-catch median 13, prey-team won 4, predator-team won 2, catches 2.06 lost 1.35, nets thrown 3.1 hit prey 1.2, T<100: 1
 both N=4 n 19 wins 4 first-catch median 20, prey-team won 11, predator-team won 4, catches 2.00 lost 2.00, nets thrown 4.3 hit prey 1.3, T<100: 0
 both N=5 n 22 wins 11 first-catch median 10, prey-team won 9, predator-team won 2, catches 3.82 lost 2.32, nets thrown 5.0 hit prey 1.7, T<100: 4
 both N=6 n 22 wins 10 first-catch median 10, prey-team won 8, predator-team won 4, catches 4.91 lost 3.36, nets thrown 6.4 hit prey 2.3, T<100: 2
 v10 replay N=3 n  4 wins 4 first-catch median 9, prey-team won 0, predator-team won 0, catches 2.50 lost 1.25, nets thrown 3.8 hit prey 1.5, T<100: 1
 v10 replay N=4 n  3 wins 1 first-catch median 14, prey-team won 2, predator-team won 0, catches 3.33 lost 2.33, nets thrown 3.0 hit prey 1.7, T<100: 1
 v10 replay N=5 n  9 wins 3 first-catch median 6, prey-team won 3, predator-team won 3, catches 3.78 lost 2.78, nets thrown 5.0 hit prey 1.7, T<100: 1
 v10 replay N=6 n  5 wins 3 first-catch median 9, prey-team won 1, predator-team won 1, catches 4.40 lost 3.80, nets thrown 8.0 hit prey 2.8, T<100: 0
```


## B. Net hits by distance, unaware losses by phase, tie-breaks, the opening, late losses, v10 wins (`extra2.py`)

```
=== B2. our net hits on prey by throwing distance, and what the thrower did next
 v10 distance    0-1000: hits  34 converted 79 % | in wins 79 % (24), in non-wins 80 % (10)
 v10 distance 1000-1500: hits  25 converted 48 % | in wins 86 % (7), in non-wins 33 % (18)
 v10 distance 1500-2100: hits   7 converted 71 % | in wins 100 % (3), in non-wins 50 % (4)
   converted 44: by the thrower itself 84 %, with a dash 45 %, on turn +1/+2/+3/+4/+5: [29, 6, 4, 2, 3]
   not converted 22: thrower had a predator within 2500 (FLEE) in the next 4 turns 5 %; thrower caught within 4 turns 0 %; the prey was netted again by us within 5 turns 18 %; the prey was caught later anyway 50 %
      924162610 WIN  t5   dist  958 thrower  6 tags before/after HHH|Hnnnn  prey unit 1  prey-team smoke within 2 turns: False
      924162613 loss t29  dist 1312 thrower  3 tags before/after SSH|Hnnnn  prey unit 6  prey-team smoke within 2 turns: False
      924162616 loss t7   dist 1437 thrower  3 tags before/after HHH|HHHCF  prey unit 8  prey-team smoke within 2 turns: True
      924162616 loss t8   dist 1187 thrower  3 tags before/after HHH|HHCFF  prey unit 8  prey-team smoke within 2 turns: True
      924162621 loss t2   dist 1356 thrower  8 tags before/after nHH|nHHHC  prey unit 12  prey-team smoke within 2 turns: False
      924170029 loss t12  dist 1436 thrower  0 tags before/after HHH|Hnnnn  prey unit 11  prey-team smoke within 2 turns: False
      924170029 loss t23  dist 1029 thrower  0 tags before/after FFF|HSSSS  prey unit 11  prey-team smoke within 2 turns: True
      924172349 WIN  t4   dist  578 thrower  3 tags before/after HCH|Hnnnn  prey unit 8  prey-team smoke within 2 turns: False
      924173346 loss t2   dist 1461 thrower 16 tags before/after nHn|nnnHn  prey unit 0  prey-team smoke within 2 turns: False
      924177530 loss t12  dist 1723 thrower  8 tags before/after HHH|HHHHH  prey unit 0  prey-team smoke within 2 turns: True
      924178655 WIN  t12  dist  672 thrower  0 tags before/after HHH|HSSSS  prey unit 9  prey-team smoke within 2 turns: True
      924178834 loss t2   dist 1045 thrower  4 tags before/after nHn|nnnHH  prey unit 11  prey-team smoke within 2 turns: True
      924178834 loss t9   dist 1412 thrower  4 tags before/after HHH|Hnnnn  prey unit 11  prey-team smoke within 2 turns: True
      924178834 loss t13  dist 1341 thrower  3 tags before/after HSH|HHSHF  prey unit 6  prey-team smoke within 2 turns: True
      924181686 WIN  t2   dist  880 thrower  8 tags before/after nHH|HHHHH  prey unit 3  prey-team smoke within 2 turns: True
      924183332 loss t6   dist 1641 thrower  5 tags before/after nnn|Hnnnn  prey unit 8  prey-team smoke within 2 turns: False
      924183332 loss t11  dist 1198 thrower  7 tags before/after CHH|HHHHS  prey unit 8  prey-team smoke within 2 turns: True
      924183346 loss t2   dist  823 thrower 14 tags before/after nFF|nnnnH  prey unit 2  prey-team smoke within 2 turns: True
      924190003 loss t3   dist 1143 thrower  9 tags before/after HHH|HHHHH  prey unit 0  prey-team smoke within 2 turns: True
      924196793 WIN  t9   dist 1495 thrower  8 tags before/after HHH|HHHHH  prey unit 14  prey-team smoke within 2 turns: True
      924201276 loss t11  dist  846 thrower  9 tags before/after HHH|Hnnnn  prey unit 17  prey-team smoke within 2 turns: True
      924205490 WIN  t5   dist  861 thrower  4 tags before/after HHH|nnnnH  prey unit 8  prey-team smoke within 2 turns: False
 v5 distance    0-1000: hits  22 converted 82 % | in wins 78 % (9), in non-wins 85 % (13)
 v5 distance 1000-1500: hits  31 converted 77 % | in wins 75 % (12), in non-wins 79 % (19)
 v5 distance 1500-2100: hits  15 converted 40 % | in wins 43 % (7), in non-wins 38 % (8)
   converted 48: by the thrower itself 94 %, with a dash 46 %, on turn +1/+2/+3/+4/+5: [22, 14, 6, 5, 1]
   not converted 20: thrower had a predator within 2500 (FLEE) in the next 4 turns 20 %; thrower caught within 4 turns 0 %; the prey was netted again by us within 5 turns 5 %; the prey was caught later anyway 65 %
 both distance    0-1000: hits  56 converted 80 % | in wins 79 % (33), in non-wins 83 % (23)
 both distance 1000-1500: hits  56 converted 64 % | in wins 79 % (19), in non-wins 57 % (37)
 both distance 1500-2100: hits  22 converted 50 % | in wins 60 % (10), in non-wins 42 % (12)
   converted 92: by the thrower itself 89 %, with a dash 46 %, on turn +1/+2/+3/+4/+5: [51, 20, 10, 7, 4]
   not converted 42: thrower had a predator within 2500 (FLEE) in the next 4 turns 12 %; thrower caught within 4 turns 0 %; the prey was netted again by us within 5 turns 12 %; the prey was caught later anyway 57 %

=== F2. units lost with no known predator within 2500 (tag HUNT, SEEK or CATCH on the last order), by phase, per exposure
 v10 wins     turns   1- 10: unaware losses 10 (0.45 per game, 14.6 per 1000 HUNT/SEEK unit-turns); all losses 11 (0.50 per game, 12.5 per 1000 living unit-turns)
 v10 wins     turns  11- 20: unaware losses  6 (0.27 per game, 9.4 per 1000 HUNT/SEEK unit-turns); all losses 10 (0.45 per game, 13.5 per 1000 living unit-turns)
 v10 wins     turns  21- 40: unaware losses  2 (0.09 per game, 2.2 per 1000 HUNT/SEEK unit-turns); all losses 12 (0.55 per game, 10.3 per 1000 living unit-turns)
 v10 wins     turns  41-100: unaware losses  1 (0.05 per game, 0.8 per 1000 HUNT/SEEK unit-turns); all losses 21 (0.95 per game, 8.8 per 1000 living unit-turns)
 v10 non-wins turns   1- 10: unaware losses  7 (0.29 per game, 9.1 per 1000 HUNT/SEEK unit-turns); all losses 11 (0.46 per game, 11.2 per 1000 living unit-turns)
 v10 non-wins turns  11- 20: unaware losses  3 (0.12 per game, 4.0 per 1000 HUNT/SEEK unit-turns); all losses  7 (0.29 per game, 7.4 per 1000 living unit-turns)
 v10 non-wins turns  21- 40: unaware losses 13 (0.54 per game, 9.3 per 1000 HUNT/SEEK unit-turns); all losses 18 (0.75 per game, 10.9 per 1000 living unit-turns)
 v10 non-wins turns  41-100: unaware losses  8 (0.33 per game, 2.6 per 1000 HUNT/SEEK unit-turns); all losses 21 (0.88 per game, 5.7 per 1000 living unit-turns)
 v5 wins     turns   1- 10: unaware losses  1 (0.07 per game, 2.2 per 1000 HUNT/SEEK unit-turns); all losses  4 (0.29 per game, 7.1 per 1000 living unit-turns)
 v5 wins     turns  11- 20: unaware losses  0 (0.00 per game, 0.0 per 1000 HUNT/SEEK unit-turns); all losses  2 (0.14 per game, 3.8 per 1000 living unit-turns)
 v5 wins     turns  21- 40: unaware losses  0 (0.00 per game, 0.0 per 1000 HUNT/SEEK unit-turns); all losses  5 (0.36 per game, 5.0 per 1000 living unit-turns)
 v5 wins     turns  41-100: unaware losses  5 (0.36 per game, 3.5 per 1000 HUNT/SEEK unit-turns); all losses 17 (1.21 per game, 7.3 per 1000 living unit-turns)
 v5 non-wins turns   1- 10: unaware losses  1 (0.05 per game, 1.7 per 1000 HUNT/SEEK unit-turns); all losses  8 (0.40 per game, 11.0 per 1000 living unit-turns)
 v5 non-wins turns  11- 20: unaware losses  2 (0.10 per game, 3.6 per 1000 HUNT/SEEK unit-turns); all losses  9 (0.45 per game, 12.9 per 1000 living unit-turns)
 v5 non-wins turns  21- 40: unaware losses 15 (0.75 per game, 15.4 per 1000 HUNT/SEEK unit-turns); all losses 19 (0.95 per game, 16.2 per 1000 living unit-turns)
 v5 non-wins turns  41-100: unaware losses  5 (0.25 per game, 2.3 per 1000 HUNT/SEEK unit-turns); all losses 11 (0.55 per game, 4.2 per 1000 living unit-turns)
 both wins     turns   1- 10: unaware losses 11 (0.31 per game, 9.6 per 1000 HUNT/SEEK unit-turns); all losses 15 (0.42 per game, 10.4 per 1000 living unit-turns)
 both wins     turns  11- 20: unaware losses  6 (0.17 per game, 5.6 per 1000 HUNT/SEEK unit-turns); all losses 12 (0.33 per game, 9.5 per 1000 living unit-turns)
 both wins     turns  21- 40: unaware losses  2 (0.06 per game, 1.2 per 1000 HUNT/SEEK unit-turns); all losses 17 (0.47 per game, 7.8 per 1000 living unit-turns)
 both wins     turns  41-100: unaware losses  6 (0.17 per game, 2.2 per 1000 HUNT/SEEK unit-turns); all losses 38 (1.06 per game, 8.1 per 1000 living unit-turns)
 both non-wins turns   1- 10: unaware losses  8 (0.18 per game, 6.0 per 1000 HUNT/SEEK unit-turns); all losses 19 (0.43 per game, 11.1 per 1000 living unit-turns)
 both non-wins turns  11- 20: unaware losses  5 (0.11 per game, 3.8 per 1000 HUNT/SEEK unit-turns); all losses 16 (0.36 per game, 9.7 per 1000 living unit-turns)
 both non-wins turns  21- 40: unaware losses 28 (0.64 per game, 11.8 per 1000 HUNT/SEEK unit-turns); all losses 37 (0.84 per game, 13.1 per 1000 living unit-turns)
 both non-wins turns  41-100: unaware losses 13 (0.30 per game, 2.5 per 1000 HUNT/SEEK unit-turns); all losses 32 (0.73 per game, 5.1 per 1000 living unit-turns)
 pattern: at least one unit lost after turn 20 with no known predator within 2500
  v10: 14 % of wins (3 of 22), 54 % of non-wins (13 of 24)
  v5: 29 % of wins (4 of 14), 55 % of non-wins (11 of 20)
  both: 19 % of wins (7 of 36), 55 % of non-wins (24 of 44)
 unaware losses: inside our own smoke / any smoke, by version and phase
  v10 turns 1-10: unaware n 17 own smoke 59 % any smoke 71 % catcher dashed 29 % | aware (FLEE/held) n 5 own smoke 40 % any smoke 40 % catcher dashed 60 % netted 100 %
  v10 turns 11-100: unaware n 33 own smoke 61 % any smoke 76 % catcher dashed 27 % | aware (FLEE/held) n 56 own smoke 25 % any smoke 29 % catcher dashed 36 % netted 48 %
  v5 turns 1-10: unaware n 2 own smoke 0 % any smoke 50 % catcher dashed 50 % | aware (FLEE/held) n 10 own smoke 50 % any smoke 50 % catcher dashed 30 % netted 80 %
  v5 turns 11-100: unaware n 27 own smoke 48 % any smoke 78 % catcher dashed 11 % | aware (FLEE/held) n 36 own smoke 42 % any smoke 42 % catcher dashed 36 % netted 31 %
  both turns 1-10: unaware n 19 own smoke 53 % any smoke 68 % catcher dashed 32 % | aware (FLEE/held) n 15 own smoke 47 % any smoke 47 % catcher dashed 40 % netted 87 %
  both turns 11-100: unaware n 60 own smoke 55 % any smoke 77 % catcher dashed 20 % | aware (FLEE/held) n 92 own smoke 32 % any smoke 34 % catcher dashed 36 % netted 41 %
 share of our living unit-turns spent inside one of our own clouds cannot be measured (positions are not in the logs).

=== L. non-wins level on catches with the winner
 v10 924162616 N6 winner pred: ours [10, 11, 13, 27, 28] theirs [6, 7, 25, 67, 90] -> decided on catch 1 (10 against 6); prey left 1, our units left 1, turns after our last catch 72
 v10 924162621 N6 winner prey: ours [6, 7, 17, 31, 57, 57] theirs [3, 22, 22, 23, 43, 45] -> decided on catch 1 (6 against 3); prey left 0, our units left 4, turns after our last catch 0
 v10 924171760 N4 winner prey: ours [17, 44, 86] theirs [14, 36, 55] -> decided on catch 1 (17 against 14); prey left 1, our units left 3, turns after our last catch 14
 v10 924173346 N6 winner pred: ours [10, 11, 13, 20, 27] theirs [5, 36, 37, 47, 93] -> decided on catch 1 (10 against 5); prey left 1, our units left 1, turns after our last catch 73
 v10 924190003 N4 winner prey: ours [19, 27, 29] theirs [3, 20, 60] -> decided on catch 1 (19 against 3); prey left 1, our units left 3, turns after our last catch 71
 v5 924134201 N5 winner prey: ours [5, 15, 16, 35, 61] theirs [2, 6, 7, 9, 28] -> decided on catch 1 (5 against 2); prey left 0, our units left 5, turns after our last catch 0
 v5 924142260 N5 winner prey: ours [12, 28, 29, 58, 88] theirs [8, 8, 12, 18, 23] -> decided on catch 1 (12 against 8); prey left 0, our units left 4, turns after our last catch 0
 v5 924146736 N6 winner pred: ours [21, 26, 27, 29, 73] theirs [6, 31, 31, 40, 47] -> decided on catch 1 (21 against 6); prey left 1, our units left 1, turns after our last catch 27
 v5 924149071 N5 winner prey: ours [14, 16, 22, 61] theirs [8, 32, 39, 45] -> decided on catch 1 (14 against 8); prey left 1, our units left 5, turns after our last catch 39
 v5 924152778 N5 winner prey: ours [28, 88, 98] theirs [4, 8, 43] -> decided on catch 1 (28 against 4); prey left 2, our units left 2, turns after our last catch 2
 pattern: level on catches with the best opponent -> who took the tie-break
  v10: level in 10 games, we took it in 5 (50 %)
  v5: level in 9 games, we took it in 4 (44 %)
  both: level in 19 games, we took it in 9 (47 %)

=== M. the opening: turns 1 to 5
 v10 wins    : dashes turn 1: 2.09, turns 1-3: 2.91 | nets thrown turns 1-3: 0.77, hit prey 0.23, hit predator 0.09 | catches by 5: 0.50 | lost by 5: 0.14 | prey-team catches by 5: 0.55 | smoke by 3: 1.00 decoys by 3: 1.27 | enemy nets holding us by 5: 0.45
 v10 non-wins: dashes turn 1: 2.12, turns 1-3: 2.92 | nets thrown turns 1-3: 0.79, hit prey 0.25, hit predator 0.17 | catches by 5: 0.12 | lost by 5: 0.21 | prey-team catches by 5: 0.54 | smoke by 3: 1.33 decoys by 3: 1.17 | enemy nets holding us by 5: 0.79
 v5 wins    : dashes turn 1: 1.07, turns 1-3: 2.79 | nets thrown turns 1-3: 0.79, hit prey 0.43, hit predator 0.07 | catches by 5: 0.29 | lost by 5: 0.00 | prey-team catches by 5: 0.36 | smoke by 3: 0.86 decoys by 3: 1.29 | enemy nets holding us by 5: 0.21
 v5 non-wins: dashes turn 1: 1.55, turns 1-3: 2.70 | nets thrown turns 1-3: 0.55, hit prey 0.10, hit predator 0.15 | catches by 5: 0.20 | lost by 5: 0.05 | prey-team catches by 5: 0.50 | smoke by 3: 0.70 decoys by 3: 1.70 | enemy nets holding us by 5: 0.85
 both wins    : dashes turn 1: 1.69, turns 1-3: 2.86 | nets thrown turns 1-3: 0.78, hit prey 0.31, hit predator 0.08 | catches by 5: 0.42 | lost by 5: 0.08 | prey-team catches by 5: 0.47 | smoke by 3: 0.94 decoys by 3: 1.28 | enemy nets holding us by 5: 0.36
 both non-wins: dashes turn 1: 1.86, turns 1-3: 2.82 | nets thrown turns 1-3: 0.68, hit prey 0.18, hit predator 0.16 | catches by 5: 0.16 | lost by 5: 0.14 | prey-team catches by 5: 0.52 | smoke by 3: 1.05 decoys by 3: 1.41 | enemy nets holding us by 5: 0.82
 how the first catch of the game was made by whoever made it (all three teams, our games)
  v10: free walk 30 %, netted walk 26 %, netted dash 24 %, free dash 20 %
  v5: netted walk 41 %, netted dash 32 %, free walk 18 %, free dash 9 %
  both: netted walk 32 %, netted dash 28 %, free walk 25 %, free dash 15 %
 our first catch: how
  v10 wins     (n 22): free walk 45 %, netted walk 32 %, netted dash 14 %, free dash 9 %
  v10 non-wins (n 19): free walk 42 %, netted dash 26 %, free dash 21 %, netted walk 11 %
  v5 wins     (n 14): netted walk 36 %, netted dash 29 %, free walk 29 %, free dash 7 %
  v5 non-wins (n 20): free walk 40 %, netted dash 35 %, netted walk 20 %, free dash 5 %
  both wins     (n 36): free walk 39 %, netted walk 33 %, netted dash 19 %, free dash 8 %
  both non-wins (n 39): free walk 41 %, netted dash 31 %, netted walk 15 %, free dash 13 %

=== N. dashes: our units lost late with the dash budget spent
 v10 wins     losses after turn 40: 21 (0.95 per game); 3+ dashes spent 90 %; 5+ 24 %; dash on cooldown 67 %; FLEE-tagged 86 %; at the wall 76 %; catcher dashed 29 %
 v10 non-wins losses after turn 40: 21 (0.88 per game); 3+ dashes spent 71 %; 5+ 29 %; dash on cooldown 29 %; FLEE-tagged 52 %; at the wall 29 %; catcher dashed 38 %
 v5 wins     losses after turn 40: 17 (1.21 per game); 3+ dashes spent 100 %; 5+ 53 %; dash on cooldown 65 %; FLEE-tagged 65 %; at the wall 41 %; catcher dashed 35 %
 v5 non-wins losses after turn 40: 11 (0.55 per game); 3+ dashes spent 82 %; 5+ 27 %; dash on cooldown 18 %; FLEE-tagged 36 %; at the wall 18 %; catcher dashed 27 %
 both wins     losses after turn 40: 38 (1.06 per game); 3+ dashes spent 95 %; 5+ 37 %; dash on cooldown 66 %; FLEE-tagged 76 %; at the wall 61 %; catcher dashed 32 %
 both non-wins losses after turn 40: 32 (0.73 per game); 3+ dashes spent 75 %; 5+ 28 %; dash on cooldown 25 %; FLEE-tagged 47 %; at the wall 25 %; catcher dashed 34 %

=== O. each v10 win in one line (to compare with the non-wins)
 924162601 N5 seat 1: us [7, 14, 18, 20, 79] | prey team [3, 5, 5] | predator team [14, 16, 24, 27]
 924162602 N6 seat 1: us [13, 15, 15, 29, 30] | prey team [11, 17, 36, 93] | predator team [4, 10, 23, 27]
 924162605 N6 seat 0: us [5, 6, 10, 16, 21] | prey team [3, 6] | predator team [6, 23, 54]
 924162607 N3 seat 1: us [13, 13, 34] | prey team [] | predator team [47]
 924162610 N3 seat 2: us [11, 39, 98] | prey team [16] | predator team [15]
 924162624 N3 seat 1: us [13, 13, 15] | prey team [4] | predator team [35, 60, 60]
 924172349 N6 seat 0: us [3, 4, 4, 25, 91] | prey team [8, 12] | predator team [25, 34, 50]
 924174312 N3 seat 0: us [3, 73, 74] | prey team [10, 18] | predator team []
 924176659 N6 seat 1: us [15, 23, 44, 81, 89] | prey team [18, 38, 67] | predator team [6, 13, 71, 85]
 924177736 N3 seat 1: us [18, 33, 44] | prey team [] | predator team [16]
 924178655 N6 seat 0: us [6, 18, 32, 53, 58] | prey team [5, 7, 8, 16] | predator team [6, 7]
 924180122 N3 seat 2: us [8, 48] | prey team [] | predator team [18, 62]
 924181686 N4 seat 2: us [24, 28, 32] | prey team [3, 69] | predator team [8, 15]
 924183141 N3 seat 2: us [37, 88] | prey team [61, 76] | predator team [39]
 924183448 N5 seat 2: us [4, 12, 15, 19, 22] | prey team [4] | predator team [15, 59, 61, 97, 97]
 924186704 N3 seat 0: us [3, 23, 27] | prey team [10] | predator team []
 924188640 N6 seat 0: us [3, 6, 14, 16, 93] | prey team [11, 12, 43] | predator team [5, 5, 9, 25]
 924189269 N6 seat 0: us [5, 14, 16, 17, 19, 20] | prey team [3, 3, 3, 12, 12] | predator team [15, 51, 77, 77, 77]
 924193849 N5 seat 0: us [7, 10, 28, 34] | prey team [9, 12] | predator team [9, 46]
 924194955 N4 seat 0: us [4, 5, 12, 18] | prey team [8] | predator team [30, 54]
 924196793 N5 seat 1: us [10, 23, 23, 46, 49] | prey team [5] | predator team [19, 25, 52, 59, 61]
 924205490 N3 seat 1: us [26, 31, 39] | prey team [] | predator team []
```


## C. Enemy nets on us, held throwers, clouds at sampled positions, smoke counts, prey-team wins (`extra3.py`)

```
=== 1. enemy nets that held one of our units: who threw, when, what followed
 v10 wins     thrown by the predator team: t1-5: 1 (0.05 per game) -> caught 0 % | t6-20: 13 (0.59 per game) -> caught 38 % | t21-100: 14 (0.64 per game) -> caught 86 %
 v10 wins     thrown by the prey team: t1-5: 9 (0.41 per game) -> caught 0 % | t6-20: 5 (0.23 per game) -> caught 0 % | t21-100: 1 (0.05 per game) -> caught 100 %
 v10 non-wins thrown by the predator team: t1-5: 10 (0.42 per game) -> caught 30 % | t6-20: 8 (0.33 per game) -> caught 62 % | t21-100: 11 (0.46 per game) -> caught 73 %
 v10 non-wins thrown by the prey team: t1-5: 9 (0.38 per game) -> caught 0 % | t6-20: 7 (0.29 per game) -> caught 0 % | t21-100: 10 (0.42 per game) -> caught 0 %
 v5 wins     thrown by the predator team: t1-5: 2 (0.14 per game) -> caught 50 % | t6-20: 6 (0.43 per game) -> caught 33 % | t21-100: 3 (0.21 per game) -> caught 67 %
 v5 wins     thrown by the prey team: t1-5: 1 (0.07 per game) -> caught 0 % | t6-20: 5 (0.36 per game) -> caught 0 % | t21-100: 2 (0.14 per game) -> caught 50 %
 v5 non-wins thrown by the predator team: t1-5: 9 (0.45 per game) -> caught 44 % | t6-20: 11 (0.55 per game) -> caught 64 % | t21-100: 3 (0.15 per game) -> caught 67 %
 v5 non-wins thrown by the prey team: t1-5: 8 (0.40 per game) -> caught 0 % | t6-20: 7 (0.35 per game) -> caught 14 % | t21-100: 10 (0.50 per game) -> caught 0 %
 both wins     thrown by the predator team: t1-5: 3 (0.08 per game) -> caught 33 % | t6-20: 19 (0.53 per game) -> caught 37 % | t21-100: 17 (0.47 per game) -> caught 82 %
 both wins     thrown by the prey team: t1-5: 10 (0.28 per game) -> caught 0 % | t6-20: 10 (0.28 per game) -> caught 0 % | t21-100: 3 (0.08 per game) -> caught 67 %
 both non-wins thrown by the predator team: t1-5: 19 (0.43 per game) -> caught 37 % | t6-20: 19 (0.43 per game) -> caught 63 % | t21-100: 14 (0.32 per game) -> caught 71 %
 both non-wins thrown by the prey team: t1-5: 17 (0.39 per game) -> caught 0 % | t6-20: 14 (0.32 per game) -> caught 7 % | t21-100: 20 (0.45 per game) -> caught 0 %
 pattern: one of ours held by an enemy net by turn 5
  v10 by any enemy        : 41 % of wins (9 of 22), 62 % of non-wins (15 of 24)
  v10 by the predator team: 5 % of wins (1 of 22), 33 % of non-wins (8 of 24)
  v10 by the prey team    : 41 % of wins (9 of 22), 29 % of non-wins (7 of 24)
  v5 by any enemy        : 21 % of wins (3 of 14), 70 % of non-wins (14 of 20)
  v5 by the predator team: 14 % of wins (2 of 14), 45 % of non-wins (9 of 20)
  v5 by the prey team    : 7 % of wins (1 of 14), 35 % of non-wins (7 of 20)
  both by any enemy        : 33 % of wins (12 of 36), 66 % of non-wins (29 of 44)
  both by the predator team: 8 % of wins (3 of 36), 39 % of non-wins (17 of 44)
  both by the prey team    : 28 % of wins (10 of 36), 32 % of non-wins (14 of 44)
 pattern: the prey team netted one of our units at any time
  v10: 59 % of wins (13 of 22), 54 % of non-wins (13 of 24); such nets per game: wins 0.68, non-wins 1.08
  v5: 29 % of wins (4 of 14), 65 % of non-wins (13 of 20); such nets per game: wins 0.57, non-wins 1.25
  both: 47 % of wins (17 of 36), 59 % of non-wins (26 of 44); such nets per game: wins 0.64, non-wins 1.16
 enemy nets aimed at us that a decoy took, per game
  v10: wins 0.59, non-wins 0.75
  v5: wins 0.43, non-wins 0.70
  both: wins 0.53, non-wins 0.73

=== 2. our nets that held prey: was the thrower free to walk in
 v10 thrower free                    : hits  45 (68 % of all), converted 76 % | by the prey team 0, by the predator team 0 | in wins 26, in non-wins 19
 v10 thrower held before the throw   : hits   9 (14 % of all), converted 78 % | by the prey team 9, by the predator team 0 | in wins 4, in non-wins 5
 v10 thrower netted on the same turn : hits   3 (5 % of all), converted 33 % | by the prey team 3, by the predator team 0 | in wins 1, in non-wins 2
 v10 thrower netted 1-2 turns after  : hits   9 (14 % of all), converted 22 % | by the prey team 8, by the predator team 1 | in wins 3, in non-wins 6
     free thrower, distance    0-1000: hits  23 converted 91 %
     free thrower, distance 1000-1500: hits  19 converted 58 %
     free thrower, distance 1500-2100: hits   3 converted 67 %
 v5 thrower free                    : hits  55 (81 % of all), converted 75 % | by the prey team 0, by the predator team 0 | in wins 24, in non-wins 31
 v5 thrower held before the throw   : hits   5 (7 % of all), converted 60 % | by the prey team 4, by the predator team 1 | in wins 1, in non-wins 4
 v5 thrower netted on the same turn : hits   1 (1 % of all), converted 0 % | by the prey team 1, by the predator team 0 | in wins 1, in non-wins 0
 v5 thrower netted 1-2 turns after  : hits   7 (10 % of all), converted 57 % | by the prey team 4, by the predator team 3 | in wins 2, in non-wins 5
     free thrower, distance    0-1000: hits  16 converted 88 %
     free thrower, distance 1000-1500: hits  26 converted 81 %
     free thrower, distance 1500-2100: hits  13 converted 46 %
 both thrower free                    : hits 100 (75 % of all), converted 75 % | by the prey team 0, by the predator team 0 | in wins 50, in non-wins 50
 both thrower held before the throw   : hits  14 (10 % of all), converted 71 % | by the prey team 13, by the predator team 1 | in wins 5, in non-wins 9
 both thrower netted on the same turn : hits   4 (3 % of all), converted 25 % | by the prey team 4, by the predator team 0 | in wins 2, in non-wins 2
 both thrower netted 1-2 turns after  : hits  16 (12 % of all), converted 38 % | by the prey team 12, by the predator team 4 | in wins 5, in non-wins 11
     free thrower, distance    0-1000: hits  39 converted 90 %
     free thrower, distance 1000-1500: hits  45 converted 71 %
     free thrower, distance 1500-2100: hits  16 converted 50 %
 pattern: a unit of ours that could not move threw its net at prey (at least once)
  v10: 18 % of wins (4 of 22), 17 % of non-wins (4 of 24)
  v5: 7 % of wins (1 of 14), 25 % of non-wins (5 of 20)
  both: 14 % of wins (5 of 36), 20 % of non-wins (9 of 44)
 all our nets thrown by a unit that could not move (held 1-3 turns before): target and result
  v10: 30 of our 212 nets (14 %): {'unit pred': 17, 'unit prey': 9, 'decoy prey': 1, 'aim': 2, 'tree': 1}
  v5: 23 of our 170 nets (14 %): {'aim': 5, 'tree': 1, 'unit pred': 11, 'unit prey': 5, 'decoy prey': 1}
  both: 53 of our 382 nets (14 %): {'unit pred': 28, 'unit prey': 14, 'decoy prey': 2, 'aim': 7, 'tree': 2}

=== 3. how often is a unit of ours inside one of our own clouds (positions known only at events: dash start, net, smoke, decoy)
 v10 LOST, aware (FLEE/held)              positions   61: inside our own cloud 26 %, inside any cloud 30 %
 v10 LOST, unaware (HUNT/SEEK/CATCH)      positions   50: inside our own cloud 60 %, inside any cloud 74 %
 v10 aware (FLEE)                         positions  293: inside our own cloud 26 %, inside any cloud 28 %
 v10 our hunter at the moment of a catch  positions  150: inside our own cloud 16 %, inside any cloud 41 %
 v10 unaware (HUNT/SEEK/CATCH)            positions  519: inside our own cloud 8 %, inside any cloud 15 %
 v5 LOST, aware (FLEE/held)              positions   46: inside our own cloud 43 %, inside any cloud 43 %
 v5 LOST, unaware (HUNT/SEEK/CATCH)      positions   29: inside our own cloud 45 %, inside any cloud 76 %
 v5 aware (FLEE)                         positions  355: inside our own cloud 13 %, inside any cloud 16 %
 v5 our hunter at the moment of a catch  positions  115: inside our own cloud 11 %, inside any cloud 32 %
 v5 unaware (HUNT/SEEK/CATCH)            positions  459: inside our own cloud 8 %, inside any cloud 14 %
 both LOST, aware (FLEE/held)              positions  107: inside our own cloud 34 %, inside any cloud 36 %
 both LOST, unaware (HUNT/SEEK/CATCH)      positions   79: inside our own cloud 54 %, inside any cloud 75 %
 both aware (FLEE)                         positions  648: inside our own cloud 19 %, inside any cloud 21 %
 both our hunter at the moment of a catch  positions  265: inside our own cloud 14 %, inside any cloud 37 %
 both unaware (HUNT/SEEK/CATCH)            positions  978: inside our own cloud 8 %, inside any cloud 15 %

=== 4. smoke count and result
 v10 smokes by turn  10 = 0 : n 10 wins 70 %, units lost 1.70, unaware losses 0.70, catches 2.30
 v10 smokes by turn  10 = 1 : n 10 wins 40 %, units lost 1.80, unaware losses 1.00, catches 3.00
 v10 smokes by turn  10 = 2 : n 14 wins 29 %, units lost 2.93, unaware losses 1.64, catches 3.50
 v10 smokes by turn  10 = 3 : n  9 wins 67 %, units lost 3.00, unaware losses 0.78, catches 4.33
 v10 smokes by turn  10 = 4+: n  3 wins 33 %, units lost 2.67, unaware losses 1.00, catches 3.00
 v10 smokes by turn  20 = 0 : n  5 wins 80 %, units lost 1.20, unaware losses 0.40, catches 2.60
 v10 smokes by turn  20 = 1 : n  8 wins 75 %, units lost 2.00, unaware losses 1.00, catches 2.50
 v10 smokes by turn  20 = 2 : n 11 wins 27 %, units lost 2.36, unaware losses 1.45, catches 3.27
 v10 smokes by turn  20 = 3 : n 10 wins 30 %, units lost 3.20, unaware losses 1.10, catches 3.60
 v10 smokes by turn  20 = 4+: n 12 wins 50 %, units lost 2.58, unaware losses 1.08, catches 3.75
 v10 smokes by turn 100 = 0 : n  1 wins 100 %, units lost 1.00, unaware losses 0.00, catches 3.00
 v10 smokes by turn 100 = 1 : n  4 wins 50 %, units lost 2.00, unaware losses 0.75, catches 2.25
 v10 smokes by turn 100 = 2 : n  4 wins 75 %, units lost 1.50, unaware losses 0.75, catches 2.75
 v10 smokes by turn 100 = 3 : n  8 wins 50 %, units lost 2.50, unaware losses 0.50, catches 2.62
 v10 smokes by turn 100 = 4+: n 29 wins 41 %, units lost 2.62, unaware losses 1.38, catches 3.66
 v5 smokes by turn  10 = 0 : n  5 wins 60 %, units lost 2.00, unaware losses 1.40, catches 2.40
 v5 smokes by turn  10 = 1 : n 12 wins 42 %, units lost 2.42, unaware losses 0.58, catches 3.25
 v5 smokes by turn  10 = 2 : n 16 wins 31 %, units lost 2.19, unaware losses 0.94, catches 3.81
 v5 smokes by turn  10 = 3 : n  1 wins 100 %, units lost 1.00, unaware losses 0.00, catches 3.00
 v5 smokes by turn  20 = 0 : n  2 wins 100 %, units lost 1.00, unaware losses 0.50, catches 2.00
 v5 smokes by turn  20 = 1 : n  6 wins 50 %, units lost 2.00, unaware losses 1.00, catches 3.00
 v5 smokes by turn  20 = 2 : n 12 wins 33 %, units lost 1.92, unaware losses 0.33, catches 3.58
 v5 smokes by turn  20 = 3 : n 11 wins 18 %, units lost 2.91, unaware losses 1.45, catches 3.36
 v5 smokes by turn  20 = 4+: n  3 wins 100 %, units lost 2.00, unaware losses 0.67, catches 4.33
 v5 smokes by turn 100 = 0 : n  1 wins 100 %, units lost 1.00, unaware losses 0.00, catches 1.00
 v5 smokes by turn 100 = 1 : n  1 wins 0 %, units lost 3.00, unaware losses 3.00, catches 2.00
 v5 smokes by turn 100 = 2 : n  4 wins 25 %, units lost 1.50, unaware losses 0.75, catches 2.75
 v5 smokes by turn 100 = 3 : n  7 wins 57 %, units lost 2.00, unaware losses 0.14, catches 4.29
 v5 smokes by turn 100 = 4+: n 21 wins 38 %, units lost 2.43, unaware losses 1.05, catches 3.38
 both smokes by turn  10 = 0 : n 15 wins 67 %, units lost 1.80, unaware losses 0.93, catches 2.33
 both smokes by turn  10 = 1 : n 22 wins 41 %, units lost 2.14, unaware losses 0.77, catches 3.14
 both smokes by turn  10 = 2 : n 30 wins 30 %, units lost 2.53, unaware losses 1.27, catches 3.67
 both smokes by turn  10 = 3 : n 10 wins 70 %, units lost 2.80, unaware losses 0.70, catches 4.20
 both smokes by turn  10 = 4+: n  3 wins 33 %, units lost 2.67, unaware losses 1.00, catches 3.00
 both smokes by turn  20 = 0 : n  7 wins 86 %, units lost 1.14, unaware losses 0.43, catches 2.43
 both smokes by turn  20 = 1 : n 14 wins 64 %, units lost 2.00, unaware losses 1.00, catches 2.71
 both smokes by turn  20 = 2 : n 23 wins 30 %, units lost 2.13, unaware losses 0.87, catches 3.43
 both smokes by turn  20 = 3 : n 21 wins 24 %, units lost 3.05, unaware losses 1.29, catches 3.48
 both smokes by turn  20 = 4+: n 15 wins 60 %, units lost 2.47, unaware losses 1.00, catches 3.87
 both smokes by turn 100 = 0 : n  2 wins 100 %, units lost 1.00, unaware losses 0.00, catches 2.00
 both smokes by turn 100 = 1 : n  5 wins 40 %, units lost 2.20, unaware losses 1.20, catches 2.20
 both smokes by turn 100 = 2 : n  8 wins 50 %, units lost 1.50, unaware losses 0.75, catches 2.75
 both smokes by turn 100 = 3 : n 15 wins 53 %, units lost 2.27, unaware losses 0.33, catches 3.40
 both smokes by turn 100 = 4+: n 50 wins 40 %, units lost 2.54, unaware losses 1.24, catches 3.54

=== 5. games the prey team won and we never led: how far behind was our first catch
 v10: n 17; prey team first catch median turn 7; ours median 19; gap median 10; prey team first catch by turn 5 in 8, by 10 in 10
    its catches in those games: 74, on a netted unit 36 %, with a dash 27 %, by turn 10 23 %
    our catches by turn 20 in those games: 0.94; in our wins: 2.18
 v5: n 15; prey team first catch median turn 6; ours median 28; gap median 6; prey team first catch by turn 5 in 7, by 10 in 12
    its catches in those games: 59, on a netted unit 39 %, with a dash 36 %, by turn 10 34 %
    our catches by turn 20 in those games: 0.73; in our wins: 1.71
 both: n 32; prey team first catch median turn 7; ours median 20; gap median 10; prey team first catch by turn 5 in 15, by 10 in 22
    its catches in those games: 133, on a netted unit 38 %, with a dash 31 %, by turn 10 28 %
    our catches by turn 20 in those games: 0.84; in our wins: 2.00
```


## D. More win / non-win patterns, repeat winners, hand check (`extra4.py`)

```
=== cloud losses
 pattern: at least one unit lost inside a cloud with no known predator within 2500
   v10 : 55 % of wins (12 of 22), 58 % of non-wins (14 of 24) | win rate with it 46 % of 26, without 50 % of 20
   v5  : 14 % of wins (2 of 14), 55 % of non-wins (11 of 20) | win rate with it 15 % of 13, without 57 % of 21
   both: 39 % of wins (14 of 36), 57 % of non-wins (25 of 44) | win rate with it 36 % of 39, without 54 % of 41
 pattern: ... inside our own cloud
   v10 : 45 % of wins (10 of 22), 50 % of non-wins (12 of 24) | win rate with it 45 % of 22, without 50 % of 24
   v5  : 7 % of wins (1 of 14), 35 % of non-wins (7 of 20) | win rate with it 12 % of 8, without 50 % of 26
   both: 31 % of wins (11 of 36), 43 % of non-wins (19 of 44) | win rate with it 37 % of 30, without 50 % of 50
 pattern: ... after turn 20, any cloud
   v10 : 14 % of wins (3 of 22), 42 % of non-wins (10 of 24) | win rate with it 23 % of 13, without 58 % of 33
   v5  : 14 % of wins (2 of 14), 50 % of non-wins (10 of 20) | win rate with it 17 % of 12, without 55 % of 22
   both: 14 % of wins (5 of 36), 45 % of non-wins (20 of 44) | win rate with it 20 % of 25, without 56 % of 55
 pattern: at least one unit lost with no known predator within 2500 by turn 10
   v10 : 32 % of wins (7 of 22), 25 % of non-wins (6 of 24) | win rate with it 54 % of 13, without 45 % of 33
   v5  : 7 % of wins (1 of 14), 5 % of non-wins (1 of 20) | win rate with it 50 % of 2, without 41 % of 32
   both: 22 % of wins (8 of 36), 16 % of non-wins (7 of 44) | win rate with it 53 % of 15, without 43 % of 65
 pattern: at least one unit lost in turns 21-40
   v10 : 41 % of wins (9 of 22), 58 % of non-wins (14 of 24) | win rate with it 39 % of 23, without 57 % of 23
   v5  : 36 % of wins (5 of 14), 55 % of non-wins (11 of 20) | win rate with it 31 % of 16, without 50 % of 18
   both: 39 % of wins (14 of 36), 57 % of non-wins (25 of 44) | win rate with it 36 % of 39, without 54 % of 41
 pattern: at least one unit lost in turns 21-40 with no known predator within 2500
   v10 : 9 % of wins (2 of 22), 38 % of non-wins (9 of 24) | win rate with it 18 % of 11, without 57 % of 35
   v5  : 0 % of wins (0 of 14), 50 % of non-wins (10 of 20) | win rate with it 0 % of 10, without 58 % of 24
   both: 6 % of wins (2 of 36), 43 % of non-wins (19 of 44) | win rate with it 10 % of 21, without 58 % of 59
 pattern: at least one unit lost after turn 40 while FLEE-tagged
   v10 : 45 % of wins (10 of 22), 29 % of non-wins (7 of 24) | win rate with it 59 % of 17, without 41 % of 29
   v5  : 57 % of wins (8 of 14), 15 % of non-wins (3 of 20) | win rate with it 73 % of 11, without 26 % of 23
   both: 50 % of wins (18 of 36), 23 % of non-wins (10 of 44) | win rate with it 64 % of 28, without 35 % of 52
 pattern: at least one unit lost while held by a net
   v10 : 50 % of wins (11 of 22), 50 % of non-wins (12 of 24) | win rate with it 48 % of 23, without 48 % of 23
   v5  : 29 % of wins (4 of 14), 55 % of non-wins (11 of 20) | win rate with it 27 % of 15, without 53 % of 19
   both: 42 % of wins (15 of 36), 52 % of non-wins (23 of 44) | win rate with it 39 % of 38, without 50 % of 42
 pattern: at least one unit lost at the wall (r > 6500)
   v10 : 45 % of wins (10 of 22), 33 % of non-wins (8 of 24) | win rate with it 56 % of 18, without 43 % of 28
   v5  : 50 % of wins (7 of 14), 15 % of non-wins (3 of 20) | win rate with it 70 % of 10, without 29 % of 24
   both: 47 % of wins (17 of 36), 25 % of non-wins (11 of 44) | win rate with it 61 % of 28, without 37 % of 52
 pattern: two or more of our units lost on one turn
   v10 : 18 % of wins (4 of 22), 4 % of non-wins (1 of 24) | win rate with it 80 % of 5, without 44 % of 41
   v5  : 14 % of wins (2 of 14), 30 % of non-wins (6 of 20) | win rate with it 25 % of 8, without 46 % of 26
   both: 17 % of wins (6 of 36), 16 % of non-wins (7 of 44) | win rate with it 46 % of 13, without 45 % of 67
 pattern: the prey team held one of our units with a net after turn 20
   v10 : 5 % of wins (1 of 22), 21 % of non-wins (5 of 24) | win rate with it 17 % of 6, without 52 % of 40
   v5  : 7 % of wins (1 of 14), 25 % of non-wins (5 of 20) | win rate with it 17 % of 6, without 46 % of 28
   both: 6 % of wins (2 of 36), 23 % of non-wins (10 of 44) | win rate with it 17 % of 12, without 50 % of 68
 pattern: the prey team held one of our units with a net twice or more
   v10 : 9 % of wins (2 of 22), 33 % of non-wins (8 of 24) | win rate with it 20 % of 10, without 56 % of 36
   v5  : 21 % of wins (3 of 14), 25 % of non-wins (5 of 20) | win rate with it 38 % of 8, without 42 % of 26
   both: 14 % of wins (5 of 36), 30 % of non-wins (13 of 44) | win rate with it 28 % of 18, without 50 % of 62
 pattern: a net of ours held prey from more than 1000 away and no catch followed
   v10 : 5 % of wins (1 of 22), 38 % of non-wins (9 of 24) | win rate with it 10 % of 10, without 58 % of 36
   v5  : 36 % of wins (5 of 14), 45 % of non-wins (9 of 20) | win rate with it 36 % of 14, without 45 % of 20
   both: 17 % of wins (6 of 36), 41 % of non-wins (18 of 44) | win rate with it 25 % of 24, without 54 % of 56
 pattern: one prey unit left at the end, we had units alive, and 30+ turns passed since our last catch
   v10 : 27 % of wins (6 of 22), 17 % of non-wins (4 of 24) | win rate with it 60 % of 10, without 44 % of 36
   v5  : 7 % of wins (1 of 14), 5 % of non-wins (1 of 20) | win rate with it 50 % of 2, without 41 % of 32
   both: 19 % of wins (7 of 36), 11 % of non-wins (5 of 44) | win rate with it 58 % of 12, without 43 % of 68
 pattern: prey left at the end, we had units alive, and 30+ turns passed since our last catch (or no catch)
   v10 : 27 % of wins (6 of 22), 67 % of non-wins (16 of 24) | win rate with it 27 % of 22, without 67 % of 24
   v5  : 29 % of wins (4 of 14), 25 % of non-wins (5 of 20) | win rate with it 44 % of 9, without 40 % of 25
   both: 28 % of wins (10 of 36), 48 % of non-wins (21 of 44) | win rate with it 32 % of 31, without 53 % of 49
 pattern: units per team = 4
   v10 : 9 % of wins (2 of 22), 42 % of non-wins (10 of 24) | win rate with it 17 % of 12, without 59 % of 34
   v5  : 14 % of wins (2 of 14), 25 % of non-wins (5 of 20) | win rate with it 29 % of 7, without 44 % of 27
   both: 11 % of wins (4 of 36), 34 % of non-wins (15 of 44) | win rate with it 21 % of 19, without 52 % of 61
 nets of the prey team that held one of ours: 74; that unit caught within 5 turns: 3
   tag of our unit on the turn the prey team netted it: {'HUNT': 63, 'none': 4, 'FLEE': 6, 'SEEK': 1}
   distance of the throw: under 1000: 58, 1000-1500: 13, over 1500: 3
 for comparison, our nets that held a predator: 107; distance under 1000: 94, 1000-1500: 10, over 1500: 3

=== teams that finished first twice or more in games with us
 hello: 4 games, first in 3; as our prey 4 (first in 3), as our predator 0 (first in 0)
      v10 924170029 N6: it was our prey, rank 1 with 5 catches at turns [5, 13, 15, 53, 71]; we: rank 2, catches at [4, 6, 11, 77], losses at [34, 51]
      v10 924177559 N4: it was our prey, rank 1 with 3 catches at turns [17, 47, 80]; we: rank 3, catches at [], losses at [21, 25]
      v10 924196793 N5: it was our prey, rank 3 with 1 catches at turns [5]; we: rank 1, catches at [10, 23, 23, 46, 49], losses at [19, 25, 52, 59, 61]
      v10 924197070 N5: it was our prey, rank 1 with 5 catches at turns [2, 6, 36, 42, 99]; we: rank 2, catches at [5, 9, 23], losses at [12, 23]
 Unleash The Leak: 3 games, first in 2; as our prey 2 (first in 2), as our predator 1 (first in 0)
      v10 924162613 N3: it was our prey, rank 1 with 3 catches at turns [5, 66, 68]; we: rank 3, catches at [], losses at [57, 64]
      v5 924128355 N3: it was our predator, rank 2 with 2 catches at turns [12, 35]; we: rank 3, catches at [18, 95], losses at [12, 35]
      v5 924154696 N4: it was our prey, rank 1 with 4 catches at turns [5, 10, 44, 58]; we: rank 3, catches at [30, 71], losses at [38, 42, 49]
 HLV: 3 games, first in 2; as our prey 2 (first in 1), as our predator 1 (first in 1)
      v10 924172349 N6: it was our prey, rank 3 with 2 catches at turns [8, 12]; we: rank 1, catches at [3, 4, 4, 25, 91], losses at [25, 34, 50]
      v5 924128351 N6: it was our predator, rank 1 with 5 catches at turns [14, 16, 19, 29, 33]; we: rank 3, catches at [13, 26, 46, 99], losses at [14, 16, 19, 29, 33]
      v5 924158600 N4: it was our prey, rank 1 with 2 catches at turns [4, 18]; we: rank 3, catches at [31], losses at [15]
 The 3 Musketeers: 2 games, first in 2; as our prey 2 (first in 2), as our predator 0 (first in 0)
      v10 924173218 N5: it was our prey, rank 1 with 5 catches at turns [10, 25, 31, 35, 52]; we: rank 2, catches at [20, 22, 54], losses at [19]
      v10 924180323 N4: it was our prey, rank 1 with 4 catches at turns [32, 35, 61, 62]; we: rank 3, catches at [83], losses at [21]
 ClaudeReviewers: 4 games, first in 2; as our prey 3 (first in 1), as our predator 1 (first in 1)
      v10 924174312 N3: it was our prey, rank 2 with 2 catches at turns [10, 18]; we: rank 1, catches at [3, 73, 74], losses at []
      v10 924176659 N6: it was our prey, rank 3 with 3 catches at turns [18, 38, 67]; we: rank 1, catches at [15, 23, 44, 81, 89], losses at [6, 13, 71, 85]
      v10 924183346 N5: it was our prey, rank 1 with 5 catches at turns [3, 4, 25, 48, 49]; we: rank 3, catches at [10, 37, 66], losses at [18, 18, 30, 41]
      v5 924154769 N5: it was our predator, rank 1 with 5 catches at turns [6, 23, 23, 61, 89]; we: rank 3, catches at [6, 12], losses at [6, 23, 23, 61, 89]
 1A26_Bhaukal: 2 games, first in 2; as our prey 2 (first in 2), as our predator 0 (first in 0)
      v10 924178834 N6: it was our prey, rank 1 with 5 catches at turns [16, 19, 31, 59, 61]; we: rank 3, catches at [27, 35, 74, 74], losses at [5, 28, 41, 57]
      v5 924149071 N5: it was our prey, rank 1 with 4 catches at turns [8, 32, 39, 45]; we: rank 2, catches at [14, 16, 22, 61], losses at []
 all opponent slots: as our prey 80, first in 32 (40 %); as our predator 80, first in 12 (15 %)
   v10: mean catches us 3.26, prey team 2.85, predator team 2.41 | first: us 48 %, prey team 37 %, predator team 15 % | last: us 28 %, prey team 37 %, predator team 35 %
   v5: mean catches us 3.38, prey team 2.79, predator team 2.21 | first: us 41 %, prey team 44 %, predator team 15 % | last: us 26 %, prey team 26 %, predator team 47 %
   both: mean catches us 3.31, prey team 2.83, predator team 2.33 | first: us 45 %, prey team 40 %, predator team 15 % | last: us 28 %, prey team 32 %, predator team 40 %

=== hand check of one game: every catch in order (game given as argument, default the first v10 non-win)
 game 924162613 N3 seat 1 rank 3 winner prey scores us/prey/pred {'us': 0, 'prey': 3, 'pred': 2}
   t5   prey catches pred unit 1 at r 5074 (netted by prey 1 turns before)
   t57  pred catches us unit 3 at r 3062 (netted by pred 1 turns before)
   t64  pred catches us unit 4 at r 2729
   t66  prey catches pred unit 2 at r 1811
   t68  prey catches pred unit 0 at r 2533
```


## E. Exact hazard rates in and out of clouds on the 21 v10 debug replays (`verify_smoke.py`)

```
v10 debug replays: unit-turns of our living units by state at the start of the turn, and how many were caught on that turn
  no predator in sight, inside an enemy cloud only               unit-turns   250 ( 3.9 %)  caught  8 (14.3 % of the losses)  =  32.0 per 1000 unit-turns
  no predator in sight, inside our own cloud                     unit-turns   661 (10.4 %)  caught 16 (28.6 % of the losses)  =  24.2 per 1000 unit-turns
  no predator in sight, outside clouds                           unit-turns  4210 (66.2 %)  caught  1 ( 1.8 % of the losses)  =   0.2 per 1000 unit-turns
  predator in sight within 2500, inside an enemy cloud only      unit-turns    18 ( 0.3 %)  caught  0 ( 0.0 % of the losses)  =   0.0 per 1000 unit-turns
  predator in sight within 2500, inside our own cloud            unit-turns    28 ( 0.4 %)  caught  0 ( 0.0 % of the losses)  =   0.0 per 1000 unit-turns
  predator in sight within 2500, outside clouds                  unit-turns  1188 (18.7 %)  caught 31 (55.4 % of the losses)  =  26.1 per 1000 unit-turns
  total unit-turns 6355, losses matched 56
by held / seen / cloud
  free | seen | cloud          unit-turns    45  caught  0  =   0.0 per 1000
  free | seen | open           unit-turns  1127  caught 13  =  11.5 per 1000
  free | unseen | cloud        unit-turns   866  caught 18  =  20.8 per 1000
  free | unseen | open         unit-turns  4153  caught  1  =   0.2 per 1000
  held | seen | cloud          unit-turns     1  caught  0  =   0.0 per 1000
  held | seen | open           unit-turns    61  caught 18  = 295.1 per 1000
  held | unseen | cloud        unit-turns    45  caught  6  = 133.3 per 1000
  held | unseen | open         unit-turns    57  caught  0  =   0.0 per 1000
tag on the last order against "a predator was in the input within 2500": {('HUNT', 'unseen'): 15, ('none', 'unseen'): 6, ('FLEE', 'seen'): 21, ('SEEK', 'unseen'): 3, ('none', 'seen'): 10, ('FLEE', 'unseen'): 1}
own-cloud flag from the catch position agrees with the flag from the exact unit position in 56 of 56 losses
```
