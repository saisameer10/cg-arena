# Target 24: all versions compared, what to take from each, and the steps (2026-11-18, 17:55 IST)

Written at the end of the first play window. Next window: 2026-11-19, 09:00 to 12:00 IST (the last one).

## 1. Where 24 is

Gold leaderboard at 17:50 IST (429 teams): rating 29.9 at rank 1, 27.4 at rank 10, 25.9 at rank 25, 24.8 at rank 50,
23.1 at rank 100. **A rating of 24 is about rank 70.** Our best completed run is v10 at 19.5; the bot that is live
(`vuser1_m4`) stood at 18.1 with 43 % of its games played. The league grew and got harder during the day: 19.5 was
132nd of 416 at 15:00 and would be about 250th now. The gap to 24 is 4.5 to 6 points.

## 2. Every version, with what real battles say

Arena results are the judge. Two warnings from today apply to every number below: results from different hours do
not compare (the same v10 code scored 1.80 before 15:00 and 2.07 after 16:00), and samples per team size are small.

### Submitted to Gold (mean rank; games in brackets)

| Version | What it is | All | 3 units | 4 units | 5 units | 6 units | Catches | by turn 10 | Lost | Rating |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 (11:03) | safety core: chase lookahead, wide nets, smoke on self | 1.84 (32) | 2.00 (5) | 2.17 (6) | 1.64 (14) | 1.86 (7) | 3.44 | 0.44 | 2.22 | 16.1 at 30 % |
| v10 (11:35) | v5 + search map, approach dash, dash budget, no unseen-ground penalty | 1.81 (37) | **1.55** (11) | 2.44 (9) | 1.75 (4) | **1.62** (13) | 3.27 | 0.70 | 2.51 | **19.5**, finished |
| Leader mimic A (15:41) | rule book of ATI x iHot on v10's engine parts, unfinished copy | 1.88 (25) | 1.78 (9) | 1.88 (8) | 1.50 (4) | 2.50 (4) | 3.04 | 0.64 | 2.72 | 16.5 at 16 % |
| Hybrid (16:02) | mimic A with 4 units, v10 otherwise | 1.96 (47) | 2.12 (8) | **1.62** (8) | 2.16 (19) | 1.75 (12) | 3.09 | 0.74 | 3.06 | 19.9 at 52 % |
| Personal v16 (16:44) | v10 + blind-in-smoke planning, cloud between us and the predator, held unit answers at once, one cloud for several predators, harder hunting until the first catch | 1.95 (145) | 1.85 (39) | 1.93 (40) | 2.00 (33) | 2.06 (33) | 2.59 | 0.54 | **2.30** | not recorded here |
| vuser1_m4 (17:43, live) | personal v16 + three rules, mimic A with 4 units | 1.98 (49) | 2.00 (14) | 2.00 (10) | 1.79 (14) | 2.18 (11) | 2.86 | 0.57 | 2.29 | 18.1 at 43 % |

Larger samples from `target23.md` for the same code in two runs: v10 code 1.81 (27) / 2.42 (12) / 2.11 (36) / 1.72 (32)
for 3 / 4 / 5 / 6 units; mimic A 1.40 (5) / 1.64 (22) / 1.80 (5) / 2.00 (2).

### Tested on replays of real Gold battles, not submitted

| Version | Change against v10 | Result | Verdict |
|---|---|---|---|
| v12 | rescue nets, decoys only for visible predators, wider approach dash | 1.81 against 1.81 (26 battles) | level |
| v13 | second hunter aims behind the prey | 2.04 against 1.88 (24) | worse (better locally) |
| smoke from 1800 | | 2.06 against 1.83 (36) | worse |
| nets within 1600 | | 2.00 against 1.50 (10) | worse so far |
| vs3 | net only with a hunter within 1300 | 2.06 against 1.75 (16) | worse |
| vs4 | always dash onto held prey | 1.97 against 1.83 (29) | not better |
| vgo | commit, cloud memory, hunt first, early dash, ghost plan | 2.25 against 1.62 (8) | clearly worse |
| Mimic A on v10's battles | | 1.90 against 1.75 (20) | level to slightly worse |
| Mimic A on the hybrid's 4-unit battles | | **1.55 against v10's 1.91 (11)**, above v10 in 5, below in 1 | better with 4 units |
| Mimic C on the same 11 | A with v10's flight, net aim, decoy, spacing | 1.73 (7 first, 4 last) | level with A |
| Mimics of Les Gens Bons and FullStuck | | 2.50 each against v10 1.75 (4 battles) | behind, too few |

Never judged on real battles: vgo_b, vpress, vres (last net kept for defence), vchase, vhybrid45 / 345 / 4c,
v14 / v15 / v16 from the GitHub upload (v16 there = v10 + `F_AGGRO`: approach and strike dashes up to the fourth
dash in turns 1 to 40), vuser1 without the mimic.

## 3. What is good and what is bad in each

| Version | Good (evidence) | Bad (evidence) |
|---|---|---|
| v5 | best net use: 45 to 47 % of nets hit prey and 77 to 79 % of hits become a catch; few units lost | slow: 0.44 catches by turn 10; weak with 3 and 4 units |
| v10 | strong with 3 and 6 units (1.55, 1.62); early catches 0.70; fastest search | weak with 4 units (2.42 to 2.44, first catch at median turn 20) and with 5 in the afternoon field (2.11 to 2.28, half of them last places); nets worse than v5 (31 to 36 % hit prey); 35 % of its losses are hunters hit from out of sight |
| Leader mimic A | 4-unit games (1.50 to 1.64 over 22 arena games; 1.55 against 1.91 paired); most early catches (0.95 to 1.3 by turn 10 in replays) | loses most units (2.7 to 3.3 per game); collapses with 6 units (5.0 of 6 lost); turn-1 fault (net instead of smoke in 40 % of cases) |
| Mimic C | nets hit 64 %, no nets on our own units, six-unit games sound locally | all or nothing on real battles (7 first, 4 last of 11) |
| Personal v16 | fewest units lost of the afternoon versions (2.30; 1.7 to 1.8 with 3 and 4 units); the most even across team sizes; best 3-unit result of the afternoon (1.85 over 39) | fewest catches (2.59 per game; 2.15 with 4 units against the mimic's 3.5) |
| vuser1_m4 | 5-unit games 1.79 over 14 so far | nothing else separates yet; its 4-unit games (mimic A) are at 2.00 over 10, below the hybrid's 1.62 over 8 |

## 4. Can the good of one go into another

Three ways, in the order the evidence supports them.

1. **By team size, in one file (portfolio).** The bot knows the unit count on turn 1. This is the one combination
   already proven: the hybrid's 4-unit half beat v10 on the same battles. Best engine per size on today's numbers:

   | Units | Candidate | Evidence | Rival |
   |---|---|---|---|
   | 3 | v10 or personal v16 | v10 1.55 (11, morning) and 2.07 to 2.12 (afternoon); personal 1.85 (39, afternoon) | open: same-hour pair needed |
   | 4 | mimic A | 1.50 to 1.64 (22); 1.55 against 1.91 paired | personal 1.93 (40) |
   | 5 | open | vuser1 1.79 (14), mimic A 1.50 to 1.80 (9), personal 2.00 (33), v10 2.11 to 2.28 (36 to 44) | this is where most places are lost: a third of all games |
   | 6 | v10 | 1.62 to 1.76 (25 to 32) | personal 2.06 (33), mimic A 2.50 (4) |

   Picking the best of several small samples flatters the pick. Expect less than the table promises.
2. **Rules moved between engines, one at a time, each behind a switch.** Worth trying because the source engine
   shows the effect in real battles:
   - v5's net discipline into v10 (v10 converts 48 % of hits from 1000 to 1500 where v5 converted 77 %). The simple
     versions of this (range limit, finisher distance) lost on replays, so the difference is elsewhere: v5 throws
     later and with more nets in hand. Compare the two on the same battles net by net before coding anything.
   - the mimic's opening (dash and smoke on turn 1 when a predator starts within 2000, attack prey under 1600) into
     v10 for 4 and 5 units only. As a general rule it was 0.15 worse locally; by team size it has not been tried.
   - the personal version's survival rules (held unit answers on its first held turn; planning from memory inside a
     cloud) into the mimic, which loses the most units. Mimic copy D tried cloud memory and a dash budget and was not
     better locally; the held-unit rule has the best field evidence (held with a hunter in sight: 100 % caught with
     nothing left, 50 % after a net at the hunter).
   - v10's flight scoring into the mimic for 6 units: that is mimic C; it fixed the collapse locally.
3. **Do not merge scoring terms blindly.** Every bundle of several rules (vgo, v14-style) has been worse than its
   parts; three of v10's own additions were harmful until the ablation found them.

## 5. What 24 needs, honestly

All six submissions sit between 1.81 and 1.98 mean rank in their own runs. A portfolio of the best halves might
reach 1.7 to 1.8 if the per-size leads are real. Teams rated 24 beat our kind of opposition more clearly than that.
So the portfolio is the first step, not the whole way; the rest has to come from the two things nobody here has
yet: finishing (same hunting time, half the yield in non-wins: 2.0 catches per 100 hunting turns against 3.7 in
wins) and playing the third team (32 of 44 Gold non-wins were won by our prey team).

## 6. Steps

Tonight (no test games or submissions until 09:00; logs, the local referee and the offline arena all work):

1. **One table, same hours.** Re-read all arena games of the afternoon (16:00 to 18:00) per engine and team size;
   that is the only fair base for the portfolio choice. Tool: `tools/arena.py` per submission; the hybrid-style runs
   split by engine with `hybtrack.py`.
2. **Five-unit study.** 5-unit games are a third of all games and our worst size. For v10, the personal version and
   the mimic: first-catch turn, units lost by turn 15, net use, why the place was lost (`tools/whylost.py`), on
   5-unit games only.
3. **Net-by-net comparison of v5 and v10 on the 21 battles both played** (v5's arena games and v10's replays exist):
   turn, distance, target state, nets left, follow-up. Find the rule that explains 77 % against 48 %.
4. **Build portfolio candidates** with `tools/mkhybrid.py` / the portfolio generator: (a) v10 at 3 and 6, mimic A at
   4, best 5-unit engine at 5; (b) the same with the personal version at 3. Check each against recorded inputs
   (it must equal the chosen engine move for move) and for size (limit 100,000 characters).
5. **Overnight local runs with the mimics as opponents**, by team size (the offline arena reproduces real games:
   96 % of catches). Use them to reject, never to accept.
6. **One new rule with field support, behind a switch**: hunt the prey unit that is about to score (closest to one
   of our predators) instead of the nearest one. Test locally by team size; real battles decide.

Tomorrow, 09:00 to 12:00 IST (about four 40-minute runs; only the last submission counts):

| Time | Action |
|---|---|
| 09:00 | Submit portfolio (a). Read it by team size and engine at 40 to 60 games. While it runs, replay its battles with the rival engine for the open sizes (3 and 5): pairs on the same battles are the fairest test we have. |
| 09:45 | Swap the engine of any size where the rival is ahead by 0.3 or more on 8 or more paired battles; submit. |
| 10:30 | Add the one rule from step 6, or the net rule from step 3, only if it won its pairs; submit. |
| 11:15 | Last submission: the best version so far, unchanged. No experiments after this: a run needs about 40 minutes. |

Rules for every step: one change per submission; judge inside one run or on paired replays, never across hours;
keep the previous best file ready to resubmit; record every submission in `log.md`.
