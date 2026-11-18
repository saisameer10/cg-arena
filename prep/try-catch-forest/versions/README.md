# Versions

Each file is a complete bot (class `Player`); to play one, send the file as it is (`tools/run.sh versions/v8.java Java ...`).

| File | State | What it is |
|---|---|---|
| `v1.java` | played 80 Bronze games in the arena | first bot written from the statement |
| `v5.java` | live in the arena from Bronze to Gold (submissions 41741950, 41742214, 41742767) | v1 + referee slide rule, five-turn chase, wider nets, unseen-ground penalty, rescue nets |
| `v6.java` | candidate, not submitted | v5 + dash budget, smoke past the hunter, no stacking, ways-out count, unseen predators keep moving, time guard |
| `v7.java` | candidate, not submitted | v6 + early approach dash, lighter unseen-ground penalty for hunters |
| `v8.java` | candidate, not submitted | v7 + search map instead of the ring patrol |
| `v9.java` | test bed | v8 with an on/off switch (`F_...`) on every change, for ablation on the local referee |
| `v10.java` | **live in the Gold arena since 2026-11-18 11:40 IST (submission 41743202)**; same as `../Player.java` | v9 with three harmful changes off (unseen-ground penalty, smoke past the hunter, old-predator avoidance) |
| `v11.java` | test bed | v10 with its numbers as constants (`P_...`) that `tools/variant.sh` can change, for tuning |

`../Player.java` is the version to play: the best one that has passed a fair test. A candidate replaces it only after a fair test
(paired seeds or replays of arena battles, both catches and losses) shows it is better; `kb/log.md` has the numbers.
| `v12.java` | tested, not better than v10 | v11 + rescue nets without a sure aim, decoys only against predators in sight, optional dash-only unseen-ground penalty |
| `v13.java` | tested: better on the local referee, worse on real Gold battles | v12 + the second hunter of a prey aims behind it (`F_PINCER`) |
| `v14.java` | tested: locally worse than v10 (2.01 against 1.94, 720 games) | v10 + six switches from `kb/gold-top5-research.md`: smoke placement, memory in clouds, held unit nets first, predator net aim, prey net range, held-prey net lines |
| `v15.java` | test bed | v14 + `F_AGGRO`: approach and strike dashes up to the 4th dash in turns 1-40, cheaper dashes, approach with a predator at 2200 |
| `v16.java` | **candidate to submit (2026-11-18 16:20)** | v15 with only `F_AGGRO` on (= v10 + attack). Local: 1.93 against v10 2.04 (960 games). Real Gold opponents, 21 paired rounds: mean place 1.95 / v10 2.05 / v5 2.43; catches 3.10 / 2.57 / 2.38; wins 33 % / 23 % / 14 % |

## Files added on the afternoon of 2026-11-18 (results in `../kb/log.md`, last section)

| File | State | What it is |
|---|---|---|
| `vmimic_a_tested.java` | played 25 arena games alone (submission 41746943) and the four-unit games of the hybrid | imitation of the leader (ATI x iHot), the copy that was tested on real battles (md5 8a9d4df40526) |
| `vhybrid4.java` | played 66 arena games (submission 41747326) | mimic copy A in four-unit games, v10 in all others (`tools/mkhybrid.py`) |
| `vhybrid45.java`, `vhybrid345.java`, `vhybrid4c.java` | built and checked, never submitted | mimic copy A with 4 and 5 units / with 3, 4 and 5 units / copy C with 4 units; v10 otherwise |
| `vlive_41748059.java` | **live in the arena overnight (submission 41749025, resubmitted 17:55)**; first run 145 games as 41748059 | v10 + "better ability usage" + early aggression by team size, as submitted at 16:44 from another session |
| `vport_live_m4.java` | built and checked, never submitted | `vlive_41748059` with mimic copy A in four-unit games (`tools/mkportfolio.py`) |
| `vport_live_m4_v6.java` | built and checked, never submitted; 95,998 characters | the same, and v10 in six-unit games |
| `vuser1.java` | part of the next file | `vlive_41748059` + three user rules as switches: smoke on the predator, careful attack nets with a finisher, pressing mode |
| `vuser1_m4.java` | played 60 arena games (submission 41748858): mean rank 2.02 against 1.95 before | `vuser1` with mimic copy A in four-unit games |

## Files not listed above (added 2026-11-18, 19:40 IST; results in `../kb/subversions.md`, `../kb/mimic.md`, `../kb/findings.md`)

| File | State | What it is |
|---|---|---|
| `v10-placebo.java` | control | v10 with its 24 search directions turned by 7.5 degrees (same rules, other trajectories), to measure how far two equally strong programs differ on the same battles |
| `vs0.java` | test bed | v11 + 14 switches, all off (plays exactly like v10): plan in smoke, smoke between us and the predator, no smoke under 3 units of distance, held unit nets or decoys at once, net first, forget stale predators, early aggression, hide behind a tree, ghost map, finisher, cloud memory, turn-1 rule |
| `vs1.java`, `vs2.java`, `vs3.java` | vs1, vs2 local only (2.03 against 1.85; 2.20 against 1.95); vs3 replayed: worse (2.06 against 1.75, 16 battles) | vs0 with a bundle on: finisher 1,000 + cloud memory + turn-1 rule / finisher 1,300 + turn-1 rule / net only with a hunter within 1,300 |
| `vs4.java` | replayed: not better (1.97 against 1.83, 29 battles) | always dash onto held prey (`F_RUSH`) |
| `vs-commit.java` | local only | vs0 + commit to netted prey (`F_COMMIT`) |
| `vs-tempo.java` | local only | vs0 + four tempo switches (spread, nets at 2 to 3 units, dash from 2,500, press), all off |
| `vgo.java` | replayed: clearly worse (2.25 against 1.62, 8 battles) | v10 + commit, cloud memory, hunt first, early dash, ghost plan |
| `vgo_b.java` | paired on 13 real battles: 1.69 against the live code's 1.92; not confirmed | vgo with smoke as in v10 (`F_SMOKEGOAL`, `F_SMOKEBACK` 0.66) |
| `vpress.java` | local only | v10 + press mode from turn 16 while we have no catch |
| `vchase.java` | local only: flight search worse (1.97 against 1.83), catch test level (1.80) | v10 + two-ply search with the referee's movement rule (`F_MM_FLEE`, `F_MM_STRIKE`) |
| `vres.java` | not replayed | v10 with the last net kept for defence until turn 85 |
| `vmimic.java` = `vmimic_b.java` | local pools only | leader mimic, 15:33 copy (turn-1 fault fixed) |
| `vmimic_a.java` | = `vmimic_a_tested.java` above | leader mimic, 15:08 copy |
| `vmimic_c.java` | replayed on 11 four-unit battles: 1.73 against copy A's 1.55 | copy B with four parts taken back from v10 |
| `vmimic_d.java`, `vmimic_e.java` | local pools only | copy C + memory in clouds / + an opening for small teams (`F_SMALL_OPENING`) |
| `vmimic2.java`, `vmimic3.java` | replayed on 4 battles: 2.50 each against v10 1.75 | imitations of Les Gens Bons and of FullStuck |
| `vlive_late.java` | crash-checked; candidate for the paired test of the last window | live code + commit to netted prey, hunt first when a point is near, ghost plan |
| `vlive_3p.java` | crash-checked; candidate | `vlive_late` + no unit-for-point trade while the predator team is level, hold a late lead, hunt the hunters |
| `vlive_engine.java` | crash-checked (2.00 against 2.02 locally; turn time as the live code); candidate | live code + two-ply search as a veto on moves that are caught within two turns, and as the test of a certain catch |
| `vlive_net1.java` | crash-checked; candidate | live code + nets on turn 1: at most 0 / 1 / 2 / 2 for 3 / 4 / 5 / 6 units (`../kb/target23.md`) |

