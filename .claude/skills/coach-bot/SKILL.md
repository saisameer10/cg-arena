---
name: coach-bot
description: Improve the user's bot for a cg-arena challenge: find its recurring mistakes from reviews, arena or test runs, CodinGame replays, screenshots or videos, change the code, and prove the new version is better. Use when the user asks why their bot loses, how to improve it, to beat a boss, or shares images/videos/replays of games.
---

# Coach the user's bot

Work from evidence, change one idea at a time, and prove every improvement with numbers.

## 1. Collect evidence

- Locate the user's code: `my-bots/`, a saved arena version (`node cli.js pool <game>`), or the code they paste. Never overwrite their file: write the new version next to it (`my-bots/<name>_v2.java`).
- Multiplayer: `node cli.js arena <game> <bot> --opponents all --games 6 --league <their league>` prints win rates per opponent and **patterns in your losses** (review codes grouped across games). For one game in detail: `node cli.js <game> <bot> boss:silver --review all --replay E:/cg-tmp/r.json`.
- Solo/io: `node cli.js <game> <bot> --test all --random 20` prints each failing test's decisive mistake and patterns across tests.
- CodinGame replays (the user's games or top players'), the best evidence after local games: `node cli.js replay <replay link or id> --turns key` downloads it (no login), re-simulates it with our referee (fidelity checks printed), and shows each turn's orders, true positions, per-player statistics and our review. `node cli.js replay battles <their CodinGame name> --losses --fetch 5` sums statistics and recurring review codes over their latest losses; `node cli.js replay top 20` lists top players to compare with. In the web IDE: Arena tab, *Import replay*. Full re-simulation exists for Ocean of Code; other games show raw orders per frame.
- Screenshots (CodinGame viewer, their losses, top players): read the images; note positions, the turn, what each side did, and what the losing side could have done.
- Videos: if `ffmpeg -version` works, extract frames (`ffmpeg -i v.mp4 -vf fps=2 E:/cg-tmp/frames/f-%03d.png`) and read the frames around the decisive moments; otherwise ask for screenshots.
- Statement and rules: `games/<game>/statement.md` and `challenges/raw/<game>.html`.

## 2. Diagnose

Map each recurring pattern to the code that produces it (quote the lines). Rank by how many losses it explains. Typical causes: no look-ahead (one-step greedy), wrong input parsing (off-by-one, stale state between turns), timeouts near the limit (heavy search without a time check), not using a rule (devices never charged, sonar never fired), and protocol slips (extra stdout lines, debug on stdout).

## 3. Improve and prove

1. Write the change in a new file; keep the protocol identical.
2. Compare old vs new on the same seeds: `node cli.js <game> my-bots/new.java my-bots/old.java --games 20 --seed 100` (multi) or `--test all --random 30` (solo).
3. Save both as arena versions (`node cli.js submit <game> <file> --name v3`) and run the arena, so the Elo ladder shows the progress.
4. Report: the patterns found (with counts), the changes made, before/after numbers, and the next weakness to work on.

Never present a change as an improvement without the comparison run. Keep per-turn time under 70 % of the limit (the review flags slower turns).
