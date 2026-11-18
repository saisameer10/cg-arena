# Hand-over: state at the end of the first window (2026-11-18, 18:00 IST)

Read this first when work resumes. Everything below is saved; nothing is running.

## State of the contest

| | |
|---|---|
| League | Gold (top league), 429 teams |
| Live submission | 41748858 = `versions/vuser1_m4.java` (the user's personal version + three rules, leader mimic in 4-unit games), submitted 17:43 IST by another session; 18.1 at 43 % of its games when last read (17:51) |
| Best completed run | v10 (`versions/v10.java`), rating 19.5 |
| Target | 24 = about rank 70 (rank 100 is at 23.1, rank 50 at 24.8) |
| Next and last window | 2026-11-19, 09:00 to 12:00 IST. Until then test games, replays and submissions answer 409; battles, logs and the leaderboard can still be read |
| Rule for submitting | only on the user's own word in the chat of the session that submits |

## Where everything is

| What | Where |
|---|---|
| Plan and comparison of every version | `kb/target24.md` (sections 2 to 6); the other session's `kb/target23.md` |
| Every result of the day | `kb/log.md` (versions, replays, submissions), `kb/gold.md` (sections 7 to 12) |
| Larger studies by the other sessions | `kb/gold-autopsy.md`, `kb/autopsy/`, `kb/mimic.md`, `kb/subversions.md`, `kb/whylost.md`, `kb/offline.md` |
| Lessons | `kb/learnings.md` |
| All bot files | `versions/` (README there lists most; `v14` to `v16` are the user's GitHub upload, `vlive_41748059` the user's personal version as submitted, `vuser1*`, `vhybrid*`, `vmimic*`, `vs*`, `vgo*`, `vpress`, `vres`, `vchase` candidates) |
| Tools | `tools/` (list and usage in `kb/README.md`; added today: `multicmp.py`, `paircmp.py`, `netclass.py`, `netted.py`, `heldcheck.py`, `incloud.py`, `lane.sh` + `lane_tasks.py`, `rerun.sh`) |
| Local referee | `sim/Sim.java`; compiled variants in `E:\cg-tmp\tcf\sim\bin` |
| Scratch data (not in git) | `E:\cg-tmp\tcf\gold`: battle lists `battles_<submission>.json`, rows `rows_<submission>.json`, game logs `games/`, replay folders (`g10` v10 on v5's battles, `g12`, `g15`, `g16`, `gm` mimic on v10's battles, `rh10` / `rhc` v10 and mimic C on the hybrid's 4-unit battles), built debug variants (`dbg10`, `mim`, `vmimic_c`, `vmimic2`, `vmimic3`, `vpress`, `vgob`, `vres`, `plc`, `hyb`), GitHub copies of v14 to v16 in `cmpsrc/` |
| Earlier data | `E:\cg-tmp\tcf\arena` (Bronze, Silver), `E:\cg-tmp\tcf\goldtop` (483 games of the top 15), `E:\cg-tmp\cgskill` (1,408 Gold games of 17 Nov) |

## What is decided and what is open

Decided by real battles:
- v10 is better than v5 (rating 19.5 against 16.1 at 30 %); nothing built on v10 by adding one rule has beaten it
  on replays (v12, v13, vs3, vs4, smoke distance, net range, vgo).
- In 4-unit games the leader mimic (copy A) beats v10: 1.55 against 1.91 on the same 11 battles; 1.50 to 1.64 over
  22 arena games against v10's 2.42.
- Smoke from 2300, on ourselves: both confirmed.
- The local referee can reject an idea, not accept one (the cut-off rule won locally and lost on real battles;
  pool membership moves local results by more than the effects tested).

Open, in the order of `target24.md` section 6:
1. One table per engine and team size from the 16:00 to 18:00 games only.
2. The 5-unit games: a third of all games and our worst size; which engine should play them.
3. Why v5 converts 77 % of net hits from 1000 to 1500 and v10 48 %: net-by-net comparison on the 21 battles both played.
4. Portfolio candidates (engine per team size) built and checked against recorded inputs.
5. One new rule behind a switch: hunt the prey unit that is about to score.
6. Not yet judged on real battles: `v16` from GitHub (v10 + `F_AGGRO`), `vres` (last net kept for defence),
   `vpress`, `vgo_b`, `vhybrid45`, `vhybrid345`, the personal version against v10 on the same battles.
7. The user's question at 17:50, still to be answered by them: start the tonight list now, beginning with the
   5-unit study and the same-hours table?

## How to resume the replay lane tomorrow at 09:00

Replays work only on battles of the submission that is live at that moment, so every resubmission closes the
previous base. In a scratch folder with `fetch.py` (= `tools/arenafetch.py`) and the debug builds:

```bash
python tools/mkdbg.py versions/<file>.java <build-dir>      # debug build of each version to replay
bash tools/lane.sh > lane.log 2>&1                          # follows the live submission; edit tools/lane_tasks.py first
python tools/multicmp.py rows_<submission>.json live v10=r<submission>_v10 mimicA=r<submission>_mimicA
```

A replay takes 40 to 160 seconds; `rerun.sh` waits for the game to finish. A Gold placement run was 37 games in
the morning and 140 or more in the afternoon; allow 40 minutes before reading a rating.

## Other sessions that worked on this today

Analysis session ("CodingGame-like platform architecture (fork)"), fork 2 (switch test beds `vs*`, `vgo*`, `vpress`,
`vchase`, `vuser1*`), fork 3 (offline arena, `kb/offline.md`), mimic session (`vmimic*`, `kb/mimic.md`). They share
this working tree: commit only your own paths, never stash or reset.
