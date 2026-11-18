# Try Catch Forest: knowledge base

CodinGame "Unleash the Geek 2026" (`unleash-the-geek-2026-opp35`), game "Try Catch Forest".
Branch `try-catch-forest` holds everything for this challenge.

## Where things are

| Path | What |
|---|---|
| `prep/try-catch-forest/Player.java` | the bot that is live in the arena (one file, Java, class `Player`) |
| `prep/try-catch-forest/versions/` | every version as a complete file, with its state (played, live, candidate) |
| `prep/try-catch-forest/dummy/Player.java` | placeholder that only answers WAIT (to leave in the IDE or show on screen) |
| `prep/try-catch-forest/kb/arena.md` | what happened against real players and what was changed because of it |
| `prep/try-catch-forest/kb/learnings.md` | lessons about the game, the referee and the method; checklist for the next contest |
| `prep/try-catch-forest/kb/rules.md` | the rules in our own words, per league, plus everything measured about the referee |
| `prep/try-catch-forest/kb/strategy.md` | how the bot works, which research pattern each part answers, known weak points, ideas |
| `prep/try-catch-forest/kb/log.md` | every version: what changed, why, and the test results |
| `prep/try-catch-forest/tools/` | test game runner, debug build, statistics, loss inspection, local replay |
| `prep/try-catch-forest/research/` | scripts of the study of 1,408 Gold games (before the statement) |
| `challenges/try-catch-forest-prep.md` | that study: rules as measured, patterns of winners and losers, top 25 |
| `challenges/raw/try-catch-forest/` | original statements (`statement-<league>.md`, `.pdf`) and the stub; git-ignored, never commit |

## Working loop

All commands from `prep/try-catch-forest/tools`. Scratch output goes to `E:\cg-tmp\tcf\live`, not the repo.

```bash
python mkdbg.py ../Player.java /e/cg-tmp/tcf/live/dbg                    # debug build (same decisions, logs its input)
bash batch.sh /e/cg-tmp/tcf/live/dbg/Player.java /e/cg-tmp/tcf/live/x 8  # 8 test games against the league boss
python stats.py /e/cg-tmp/tcf/live/x*.json                               # wins, catches, losses, first catch, unused powers
python deathsdbg.py /e/cg-tmp/tcf/live/x*.json                           # what the bot saw before each loss
python audit.py /e/cg-tmp/tcf/live/x1.json 0                             # turn time, movement prediction error
python replay.py /e/cg-tmp/tcf/live/x1.json 0 /e/cg-tmp/tcf/live/x1.in   # rebuild stdin; then: java Player < x1.in
```

Arena loop (run in a scratch folder, e.g. `E:\cg-tmp	cfrena`):

```bash
python arenafetch.py <submission_id>                     # battle list + every game log into ./games
python arena.py . battles_<submission_id>.json           # ranks, catches, losses, nets, causes, match-ups
python arena2.py . battles_<submission_id>.json          # how catches are made, why games are not won
python field.py . battles_<submission_id>.json           # every team we met, with its habits
bash rerun.sh <debug-bot> <game_id> > rep/<game_id>.json # replay a battle of the current league with our code
python deathclass.py rep/*.json                          # label every loss by what the bot could see
python mkversus.py out ABC a.java b.java c.java          # several versions in one file, opponents ["me","me"]
python rrstats.py out v5 v7 v8 -- ABC BCA CAB ACB CBA BAC
```

- A local replay reproduces the bot's decisions exactly (checked: 29 of 29 turns), so a bad turn can be debugged offline.
- Test games: 30 per minute, 300 per hour. Submissions: 5 per 5 minutes. Only inside the play windows.
- Opponents for test games: `default` / `boss` (league boss), `me` (the code being tested, in another seat), or agent ids
  from `GET /challenges/<id>/opponents`. Ids of players go stale when they resubmit.
- Compare versions on the same counters as `log.md` (wins, catches, units lost over 8 or more games); one game proves nothing.

## When the league changes

1. Fetch the statement again (`GET /challenges/<id>`), save it as `challenges/raw/try-catch-forest/statement-<league>.md`
   and diff it against the previous league's file.
2. Fetch the stub generator again: new input fields break the parser first.
3. Play one debug game and run `audit.py`: movement error and turn time show at once if a rule changed.
4. Update `rules.md` (new section for the league), then the bot, then `log.md`.
5. Things most likely to change: number of powers or new powers, unit counts, vision, new entity types
   (the parser ignores unknown types; `SECRET_FOREST_SPRITE` already appears and is undocumented).

## Status

| Date | League | State |
|---|---|---|
| 2026-11-18 09:47 | Bronze | v1 submitted, 09:54 v5 submitted |
| 2026-11-18 10:16 | Silver | v5 promoted; same statement and input as Bronze; 7th of 68 at 36 % |
| 2026-11-18 | Silver | candidates v6 to v8 built from the arena analysis, not yet shown to be better (see `log.md`) |
