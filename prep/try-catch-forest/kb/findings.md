# Try Catch Forest: findings in one page (state of 2026-11-18, 19:40 IST)

A digest of the other notes, with the numbers that matter and where each one comes from. Nothing here is new;
if a figure here and in the source note differ, the source note is right. Read `learnings.md` for the lessons in
full and `tomorrow.md` for the plan of the last window (2026-11-19, 09:00 to 12:00 IST).

## 1. Where we stand

- Gold, 440 teams. Rating by rank at 18:25: 5th 28.4, 20th 26.6, 50th 25.1, 100th 23.3, 150th 22.3, 250th 20.2.
- Our runs: v10 19.48 (132nd of 416 at 15:00); the live code (`versions/vlive_41748059.java`) 20.47 at 90 % of
  one run and 18.99 (302nd of 429) in the next run of the same file.
- **One arena run is worth plus or minus 0.75 points.** No submission of the day is shown to be better than
  another by its rating. Source: `tomorrow.md`, `target23.md`.
- A rating of 23 is rank 95 to 130. It means a mean rank of about 1.8 against opponents ranked 100 to 400; the
  live code scores 1.95 to 2.09 there. 0.1 of mean rank is about 1.2 rating points.

## 2. Every version and what real battles say

Mean rank: 1 is first, 3 is last, 2.00 is average. "Replay" = the version replayed on real arena battles of the
live bot; "paired" = test games on a battle's map against its two real opponents (`tools/pairfield.py`).

| Version | What it is | Evidence on real opponents | Verdict |
|---|---|---|---|
| v1 | first bot from the statement | 80 Bronze arena games | replaced |
| v5 | v1 + referee slide rule, five-turn chase, wide nets | Gold arena 1.84 (32 games); best net use (45 to 47 % hit prey) but slow (0.44 catches by turn 10) | promoted us Bronze to Gold |
| v10 | v5 + search map, approach dash, dash budget, three harmful rules off | replay of v5's 21 Gold battles: 1.52 against 1.81; arena 1.81 morning, 2.07 to 2.09 afternoon | the base of everything later |
| v12, v13, vs3, vs4, smoke from 1800, nets within 1600 | single rules on v10 | replays: level (v12), worse (v13 2.04 against 1.88; vs3 2.06 against 1.75; smoke 2.06 against 1.83), not better (vs4) | dropped |
| vgo | five rules together (commit, cloud memory, hunt first, early dash, ghost plan) | replay: 2.25 against 1.62 after 8 battles | dropped; a bundle cannot be read |
| vgo_b | vgo with smoke as in v10 | paired, 13 battles: 1.69 against the live code's 1.92 | open: the only lead of the size 23 needs, not confirmed |
| vmimic_a (leader mimic) | imitation of ATI x iHot | arena alone 1.88 (25); 4-unit games 1.50 to 1.64 over 22 arena games; replay on v10's battles 1.90 against 1.75 | good with 4 units, collapses with 6 |
| vhybrid4 | mimic with 4 units, v10 otherwise | arena 1.96 to 2.00 (66 games); its 4-unit part 1.55 against v10's 1.91 paired on 11 battles | the 4-unit gain is real in that run |
| vmimic2, vmimic3 | imitations of Les Gens Bons and FullStuck | replay: 2.50 each against v10 1.75 (4 battles) | behind, too few games |
| vlive_41748059 | v10 + plan in smoke, cloud between us and the predator, held unit answers at once, one cloud for several predators, harder hunting until the first catch | arena 1.95 (145 games) and 2.06 (79 games) | live |
| vuser1_m4 | live code + three user rules + mimic with 4 units | arena 2.02 (60 games) against 1.95 | the careful-net rule was the loss |
| vport_live_m4 | live code with the mimic in 4-unit games | paired, 13 battles: 2.15 against 1.92 | contradicts the hybrid's gain; open |
| vlive_late, vlive_3p, vlive_engine, vlive_net1, vpress, vs-commit, vchase, vres, vhybrid45/345/4c | candidates on the live code or v10 | crash-checked locally only | untested on real opponents |

Sources: `target24.md` section 2, `log.md`, `subversions.md`, `versions/README.md`.

## 3. What worked

1. **Smoke on ourselves when a predator comes within about 2300 with a clear line.** The single most valuable tool
   in the ablation; across all teams a unit with a predator start within 2000 is netted within 4 turns in 36 % of
   cases without smoke and 4 % with smoke on itself (`gold-autopsy.md`).
2. **The five-turn chase lookahead, the no-touch rule and the ways-out count** (flight). v5 lost 1.95 units a game
   where top teams lose 2.6 to 3.4.
3. **Search map, approach dash and dash budget** (v10): catches by turn 10 from 0.48 to 1.24 on the same battles.
4. **Nets at prey that cannot dodge; never keeping a net unused.** 55 to 82 % of prey hits become a catch for
   every top team; ours 70 to 79 %.
5. **Decoys at the predator as a net shield**: 15 to 32 % of the enemy nets that hit us hit a decoy.
6. **Picking the bot by units per team** inside one file (hybrid): the cleanest paired evidence of the day.
7. **Method: paired tests on real battles** (replays, then `pairfield.py`), ablation by switches, one main reason
   per lost game (`whylost.py`).

## 4. What did not work

1. **Smoke later or elsewhere**: from 1800 (worse on 36 battles), past the hunter (v6, harmful), centred on the
   predator (a trade: losses while held 47 % to 32 %, losses at the wall 18 % to 32 %).
2. **Careful attack nets** (only when sure, with a finisher near): net hits on prey 31 % to 22 %, tie-break losses
   15 % to 26 %. It removes the early close nets that make first catches.
3. **Second hunter aiming behind the prey** (v13): better locally, worse on real battles.
4. **Two-turn worst-case search for fleeing** (vchase): worse than the five-turn simple chase locally.
5. **Bundles** (vgo, vs1 to vs3, the three user rules together): lost, and nobody can say which part lost.
6. **Imitating a top team**: the leader's copy matched 40 of 50 measured habits and still lost more units than
   the original; two of three mimics were behind v10.
7. **The local referee as a judge**: pools moved by 0.2 to 0.4 with the maps; two identical programs differed by
   0.26; the live code is last of eight locally. Use it for crash checks only.
8. **Reading causes from labels on losses** ("42 % of losses were in our own smoke" led to a harmful change).

## 5. Nets, smoke, decoys

| Power | What the data says | Source |
|---|---|---|
| Net | A net is worth 16 to 26 % of a catch whenever it is thrown. Teams at 23 throw the same number as we do but earlier: 1.77 by turn 3 against our 0.69; none of ours on turn 1. With 6 units their nets of turns 1 to 3 give 0.61 catches a game, ours 0.19; with 3 units a turn-1 net is wasted (0.01). | `target23.md` |
| Net | Top teams net their nearest prey on turns 2 to 4 from 650 to 880 and catch it a turn later. The leader is the exception: 0.2 nets by turn 3, 28 % of its nets at predators, median net turn 42. | `gold.md`, `gold-autopsy.md` |
| Net | A unit that dashes on the net turn is hit 28 to 30 %, one that does not 69 to 74 %. | `gold-autopsy.md` |
| Net | 18 of 70 prey hits of v10 were wasted: the nearest hunter ran from a predator it could not see (7), was held itself (6), lost sight (4). | `log.md` |
| Net | 20 to 28 % of nets hit a predator (defence); we 28 %, teams at 23 20 %. | `target23.md` |
| Smoke | Hides, does not protect: it blinds our units inside too. On ourselves it is the best defence we have; every other placement tested was worse or a trade. | `learnings.md` |
| Smoke | Teams at 23 use less (3.3 against our 4.3 a game) and far less in turns 1 to 5 (0.77 against 1.69); a unit that smokes cannot net that turn. Not acted on: "smoke later" lost on replays. | `target23.md` |
| Smoke | Top teams differ widely: 0.9 (Lore) to 4.0 (Kogaion) a game. No single style. | `gold.md` |
| Decoy | Universal: 3 to 4.6 a game for every top team, 4.4 for us. 77 to 90 % of ours are destroyed by a predator walking into them. | `gold.md`, `target23.md` |
| Decoy | An enemy decoy cannot be told from a unit in one frame. Les Gens Bons sends decoys away from the predator (82 %), and its held units send one (42 %). | `learnings.md`, `gold-autopsy.md` |

## 6. Tie-breaks

- The shown score is 3 x catches + tie-break rank. Ties go to the earlier first catch, then the second.
- **25 to 32 % of our places below first are lost level on catches**, every one decided by the first catch.
  Theirs came on about turn 4 to 6, ours on about turn 15 to 18; in 40 of 53 we had no catch by turn 10.
- Most in small games (live code, first run): 10 of 39 three-unit games, 7 of 40 four-unit, 4 of 33 five-unit,
  2 of 33 six-unit.
- Source: `log.md` ("Tie-breaks"), `tools/tiebreak.py`.

## 7. Units per team

| Units | What we know |
|---|---|
| 3 | Only three catches exist: most tie-breaks. 57 % of games have no catch by turn 15, for teams at 23 as for us. v10 was good here (1.50 to 1.55 in the morning). |
| 4 | v10's weak count (2.42 to 2.44; first catch at median turn 19). The leader mimic scored 1.50 to 1.64. Teams at 23 score 1.63 against our 1.97, and in slow 4-unit games still reach 3.05 catches against our 1.77. |
| 5 | Level with teams at 23 (1.98 against 1.99) although they have a catch by turn 15 in 83 % of games and we in 60 %. |
| 6 | Largest gap to teams at 23: 2.11 against 1.78. They have a catch by turn 15 in 95 % of games, we in 72 %; the difference is nets in turns 1 to 3. The mimic collapses here (5.0 of 6 units lost). |

4-unit games were 46 % of v10's lost places. Sources: `whylost.md`, `target23.md`, `target24.md`.

## 8. The top teams

- **No single winning style** (`gold.md` section 2, 483 games; `gold-autopsy.md` section 2, 2,176 games):

  | Team | Wins | What is theirs |
  |---|---|---|
  | ATI x iHot (leader) | 66 % | survives the first ten turns: dash and smoke on turn 1 when a predator starts within 2000; keeps its nets for late |
  | Les Gens Bons | 53 % | nets on turn 1 (1.21 a game), early nets hit 40 %; smoke on itself every time |
  | Lore | 44 % | nets its hunters (48 % of nets); no opening smoke |
  | RNG | 41 % | slow opening, ghosts follow predators, dashes onto held prey 61 % |
  | SoloLeveling | 31 % | burns dashes (7.4 per unit) |

- What they share: 0.7 to 1.2 catches by turn 10; 55 to 82 % of prey hits become a catch; nobody is safe (2.6 to
  3.4 units lost a game); nobody protects a lead after turn 30.
- For every team a non-win starts with an early loss before its first catch (win rate 10 to 36 % then, 41 to 75 %
  otherwise).
- **We hardly meet them**: 10 of 206 games of the live code had a top-100 opponent; 60 % of our lost places go to
  winners ranked 100 to 250 and 36 % to winners beyond 250 (`target23.md`). The top 10 is not where our rating is
  lost.
- Teams at 25 (rank 35 to 64) score 1.73 and 1.41 against the two lower groups of opponents, teams at 23 score
  1.81 and 1.69, we 2.09 and 1.95.

## 9. Good and bad for us

| Good | Bad |
|---|---|
| With a catch by turn 15 we play like a team at 23 (1.81 against 1.74). | 42 % of our games have no catch by turn 15 (teams at 23: 28 %), and those end at 2.26 (theirs at 1.88). |
| We convert net hits better than teams at 23 (70 % against 62 %). | Our nets come late: 62 % of them after turn 10 (theirs 32 %). |
| We lose fewer units (2.38 against 2.68). | We catch less: 2.66 against 3.12, and 1.66 against 2.15 without a net. We dash a quarter less (6.4 against 8.4 per unit). |
| No errors or timeouts in the 145 arena games of the first run; turn time median 2 ms, worst 26 ms on recorded games. | The same file moved by 1.5 rating points between two runs: the final rating is partly a draw. |

The gap to 23, sized within unit counts: 1.995 now; 1.92 with their share of slow games (about +0.9 points);
1.83 with their rank in those games as well (about +2 points in all). Observed differences between teams, not
measured effects of a change (`target23.md`, last sections).

## 10. Method lessons that cost us most

1. Results from different hours do not compare: the same v10 code scored 1.81 in the morning and 2.09 in the
   afternoon.
2. A net stops at the first thing it meets: nets grouped by flight distance look far better at short range than
   they are. Group by turn.
3. Totals across unit counts mislead (mix effect): "teams at 23 lose fewer units in slow games" vanished once the
   unit count was held fixed.
4. Every submission restarts the ranking games and closes the replay base of the version before it. One session
   submits, on the user's word.
5. Replays work only for battles of the current submission played by this account's token; test games and
   submissions only inside the play windows. Battle lists, the leaderboard and game logs stay readable.

## 11. Where the material is

| What | Where |
|---|---|
| All bots | `versions/` (`README.md` there lists each one) |
| How each candidate is built from its base | `tools/gen/` (`mks*.py` on v10/v11, `mklive*.py` on the live code) |
| Arena analysis | `tools/arena.py`, `arena2.py`, `field.py`, `topfield.py`, `whylost.py`, `tiebreak.py`, `netfail.py`, `mimcmp.py`, `allcmp.py`, `hybtrack.py` |
| Real-field paired test | `tools/pairfield.py`, `tools/pfstats.py` |
| Teams at 23 and 25 against us | `tools/peer/` |
| Battle 21 autopsy | `battle-924177559.md`, `tools/b21/` |
| Deep-research report | `reports/Gold league improvement evidence.md`, `research_notes/` |
| Downloads (not in git: other teams' game logs) | `E:\cg-tmp\tcf\gold\games`, `E:\cg-tmp\tcf\peer\games`, `E:\cg-tmp\tcf\gold\pf` |
