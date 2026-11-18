# Offline work after 6 PM (access to Try Catch Forest ends)

Written 2026-11-18 afternoon, when the API, the play window and the test games were still open. Everything listed as
"offline" below works with no CodinGame account, no token, no API call and no internet.

## What stops at 6 PM IST

| Stops | Why it matters |
|---|---|
| test games, replays of battles (`POST test-games`, `replay_game_id`) | the only way to run the official referee; the local referee replaces it |
| submissions, the ranking of our own submission | the arena is the only judge of real strength; see "what to do without it" |
| the statement and the stub generator | archived: `archive/challenge-*.json`, `archive/stub-*.json`, `challenges/raw/try-catch-forest/statement-*.md` |
| leaderboard and battle lists | archived: `archive/snapshots/leaderboard-*.json` (431 rows), `archive/snapshots/battles-*.json` (top 30 teams) |
| the game logs of other teams | archived: `archive/games/` (1,573 logs of the top 30 teams, latest battles) and `archive/boss/` (56 real test games against the boss) |

## What still works

| What | Where | How |
|---|---|---|
| Our bot versions (v1, v5 to v13, Player.java) | `versions/*.java` | `python offline/arena.py compile` |
| The local referee, 8 maps in parallel, ~1 game per second per core | `sim/Sim.java` | used by `offline/arena.py` |
| Replay of a real game through the local referee | `sim/Replay.java` + `offline/referee_check.py` | `python offline/arena.py check` |
| A stand-in for the league boss | `offline/bossproxy/Player.java` | `python offline/arena.py boss <bot>` |
| Three-way tournaments, every seat order | `offline/arena.py tourney` | `python offline/arena.py tourney v10 v11 v5 --games 288` |
| Analysis of every archived game | `tools/topfield.py`, `tools/arena.py`, `tools/arena2.py`, `tools/field.py` | `PYTHONIOENCODING=utf-8 python tools/topfield.py <archive>/games 40` |
| Debug build of any bot (logs its input, for replays) | `tools/mkdbg.py` | `python tools/mkdbg.py <Player.java> <out-dir>` |

Paths: the scratch data lives in `E:/cg-tmp/tcf/...`. The archive is at `E:/cg-tmp/tcf/archive/` (75 MB, not in git),
a copy of the debug replays in `archive/ours_debug/` (39 games, used by the referee check), and the boss games in
`archive/boss/`. `offline/boss_games.txt` lists the boss games with their paths.

## Checks of the local referee (so its numbers can be trusted)

Real games replayed through the local referee with the commands the teams really sent (`referee_check.py`):

| | Result (39 of our real Gold games) |
|---|---|
| Our units' positions, per turn | median 1.0 unit, 90th percentile 1.4 to 2.2 units |
| Catches found by the local referee | 96.3 % of the real catches (recall), 97.1 % of its catches are real (precision) |
| Net hits | 99.4 % recall, 100 % precision |

Remaining differences are in the first turns after a catch or a net, where the real referee's order of events inside a
turn is not known (the local referee takes 24 small steps per turn). The remaining 1 to 3 % is within the noise of a
test pool of 480 games.

## The boss stand-in (validated on the numbers, not the code)

The real boss is a binary we cannot run. The stand-in (`offline/bossproxy`) imitates the boss's labels as they appear
in 56 real test games: Fleeing, Attacking, Trapping (nets), Seeking, Spreading, and it never dashes, smokes or decoys.

| | Real boss (56 games) | Stand-in (200 maps) |
|---|---|---|
| Our rank with v10 (1 = first) | 1.13 | 1.08 |
| Our catches per game | 4.29 | 4.50 |
| Our units lost per game | 0.71 | 0.79 |
| Boss nets per game, both seats | 6.16 | 6.05 |

Use it as a sparring partner whose numbers agree with the real boss, not as a copy of it. Against the boss we are
close to the ceiling; the boss does not separate versions well.

## Tests that matter after 6 PM: AI opponents

- The local tournament (`arena.py tourney`) uses our own bots as opponents. Our bots flee differently from real teams,
  so local rankings are a filter, not a verdict. A version is better only if the local result holds on the real
  replays (done before 6 PM, see `log.md`).
- The mimic bots of the top teams (`versions/vmimic*.java`, `kb/mimic.md`, the parallel session) are the best
  stand-ins for real opponents: add them as names to the tourney command.
- Real-opponent numbers after 6 PM come only from the archive: the battles of the top 30 teams as of 18:00 IST.

## What to do without the arena (decision for the owner)

1. Choose the submission candidate on paper and offline: the highest local rank in the three-way tournament with v1 and
   v5 as fixed members, the boss stand-in check, and the replay check of a real-battle sample (`archive/games`
   replays need the official referee, so they must be done before 6 PM).
2. The live arena version stays as it is after 6 PM (v10, submission 41743202). It is not re-run or re-ranked.
3. A candidate that is not replayed on real battles before 6 PM is a guess: say so when reporting.

## Rules that do not change

- The token is never printed or committed. Scratch goes to `E:/cg-tmp/`.
- Only the parent session submits; a candidate needs its replay evidence first (`kb/gold.md`, section 8 bar: 0.15 better
  mean rank on 30 or more real battles with no error).
- The statement text stays out of git (`challenges/raw/`).

## Local result, 15:00 IST: v10 against the bundle and the smoke candidate

Tourney, 480 games, local referee, seeds 77 onward (`offline/arena.py tourney v10 c_all sd18 --games 480`):

| Version | Mean rank | Win | Last | Catches | Lost |
|---|---|---|---|---|---|
| v10 (live in the arena) | 1.88 | 39 % | 27 % | 2.58 | 2.54 |
| sd18 (smoke only within 1800) | 2.00 | 34 % | 34 % | 2.45 | 2.44 |
| c_all (bundle) | 2.10 | 28 % | 38 % | 2.35 | 2.39 |

Reading: v10 is still the best of the three locally; neither candidate is better. The bundle and the smoke-distance
candidate are not to be submitted on this evidence. Against the boss stand-in v10 ranks 1.08 (real games: 1.13).
