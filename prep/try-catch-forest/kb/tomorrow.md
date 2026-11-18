# Plan for the last window (2026-11-19, 09:00 to 12:00 IST)

Written at the close of 2026-11-18. Target: 23. Standing at the close: the live code (submission 41749025, the same
program as `versions/vlive_41748059.java`) had reached 20.47 at 90 % of its games in its previous run; it was
resubmitted at 17:55 and stood at 19.99 after 32 %.

## What the last hour showed

1. **The local referee cannot rank our bots.** The live code is last of eight locally (2.11) and the best-rated bot
   we have had in the arena. Use the referee for crash checks only.
2. **A real-field test that works without replays**: `tools/pairfield.py` plays each candidate against the two real
   opponents of a recent arena battle on that battle's map. 20 seconds per game. (Replays are refused for the live
   submission's battles: they are not flagged as played by this account's token.)
3. **13 paired battles** (`kb/subversions.md`): vgo_b 1.69, live code 1.92, portfolio with the mimic at four units
   2.15. Too few to decide. What they do show is where each bot gets its catches:

   | Bot | Catches by turn 10 | by turn 20 | Total | Net hits on prey | First catch, median turn |
   |---|---|---|---|---|---|
   | Live code | 0.85 | 1.38 | 2.54 | 1.5 | 7 |
   | vgo_b | 0.31 | 1.00 | 3.15 | 2.0 | 13 |

   The live code is better early, vgo_b later. `versions/vlive_late.java` is the live code plus the three parts of
   vgo_b that act after a net has landed (commit to netted prey, hunt first when a point is near, ghost plan). It
   compiles and is crash-checked locally; it has no real-field game yet.

## Checked at 18:19 IST: one run of the arena is worth plus or minus a point

The resubmission of 17:55 (41749025, the same program as 41748059, byte for byte) finished its ranking games at
**18.99, 302nd of 429** (first / second / last in the 79 games fetched: 24 / 26 / 29, mean rank 2.06).
The run before it, same program, had reached **20.47** at 90 % (46 / 41 / 40 over 127 games, mean rank 1.95).

- The same code scored 20.47 and 18.99 within two hours. So the differences we read between submissions today
  (v10 19.48, hybrid 19.45, live code 20.47) are all inside the run-to-run noise. No submission of today is shown
  to be better than another by its rating.
- Only paired tests against the same opponents on the same maps (`tools/pairfield.py`) can compare two bots, and
  they need 40 or more battles each.
- The final rating is one more draw of that noise. A full run took about 50 minutes this evening, so the last
  window has room for two or three runs. Resubmitting restarts the run: a run that ends well should be left alone,
  a run that ends badly can be replaced, as long as the last one has time to finish before 12:00. With a spread of
  about 0.75 per run, the best of three draws is on average about 0.6 above a single one.

## The first 45 minutes: measure, on the real field

```bash
cd /e/cg-tmp/tcf/gold
python fetch.py <live submission id>          # new battles: seeds and opponents that are valid now
V="/e/New folder/prep/try-catch-forest/versions"
PF_UNTIL=0945 python "/e/New folder/prep/try-catch-forest/tools/pairfield.py" pf2 40 \
  live="$V/vlive_41748059.java" late="$V/vlive_late.java" vgo_b="$V/vgo_b.java" > pf2.log 2>&1
python "/e/New folder/prep/try-catch-forest/tools/pfstats.py" pf2
```

- Three bots x 40 battles = 120 games = 40 minutes. One test game runs at a time: nothing else may use the API then.
- If the battle list is short at 09:00 (few games played yet, or opponents resubmitted), let the live bot play ten
  minutes first, then fetch again.
- Fourth bot if time allows: `vlive_3p.java` = `vlive_late.java` plus the three-player levers of `target23.md`, each a
  switch: no unit-for-point trade while the predator team has as many points as we have (`F_NOTRADE`); after turn 65
  with more points than the predator team, soft threat terms x 1.6 (`F_HOLDLEAD`); prefer the prey unit within 2,000
  of a predator in sight (`F_HUNTHUNTERS`). Compiles, 60 local games without a crash, no real-field game yet.
- Fifth bot: `vlive_engine.java` = the live code plus the two-ply search in its corrected form. The first form
  (vchase) replaced the five-turn chase and lost 0.13 rank locally. Here the chase stays; the search only vetoes a
  move after which we are caught within two turns whatever we do (`F_MM_FLEE`), and a catch counts as certain only
  if every reply of the prey still ends on our path, with a reward for a forced catch in two (`F_MM_STRIKE`).
  Compiles, 60 local games without a crash (2.00 against 2.02 for the live code), turn time on the same recorded
  games: median 2 to 4 ms, worst 26 ms, against 2 ms and 26 ms for the live code. No real-field game yet.
- Then, in this order: `vpress.java`, `vs-commit.java`.
- A full ranking run took about 50 minutes on the evening of the 18th (0 to 90 % between 16:44 and 17:32), so testing
  can go on until about 10:30 if the first round is not decisive.

## Decision at 09:45 to 10:00

- Submit a candidate only if, over 30 or more shared battles, its mean rank is at least 0.15 better than the live
  code's AND it is not behind on catches. Otherwise keep the live code: it needs its two remaining hours to finish
  its ranking games anyway.
- One submission only, by 10:00, so that it plays for two hours. Every submission restarts the ranking games; at
  17:55 on the 18th the live code lost its 90 % run that way.
- The user decides on the submission; this session does not submit.

## What would have to be true for 23

- The live code is at about 20.5. The step to 23 is larger than anything measured today: every rule tested on real
  battles was level or worse, and vgo_b's lead is 13 battles old.
- The honest best case for tomorrow is a candidate that confirms a lead of 0.2 to 0.3 in mean rank over 40
  battles; that is worth roughly one rating point, not two and a half.
- Beyond that the remaining ideas are in `target23.md` (three-player levers, overnight tuning) and are untested.
