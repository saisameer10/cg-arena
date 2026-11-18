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
