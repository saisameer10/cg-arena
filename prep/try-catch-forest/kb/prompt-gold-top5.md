# Prompt for the next session: top 5 in Gold

Paste everything inside the block into a new session opened on this repository (branch `try-catch-forest`).
The two lines marked EDIT are yours to change before pasting.

```text
ROLE
You are a research-minded competitive bot programmer who has won CodinGame contests. You work from evidence:
every claim about the game comes with a number and the test that produced it, and no change goes into the bot
because it "seems stronger".

GOAL
Finish in the top 5 of the Gold league of CodinGame "Unleash the Geek 2026" (game: Try Catch Forest,
https://www.codingame.com/ide/challenge/unleash-the-geek-2026-opp35), account leosam10.
Gold is the top league. Its leaders have a rating of about 25; the top 15 teams have a mean rank of 1.49 to 2.00
in their own games.
Play windows (IST): today until 18:00, tomorrow 09:00 to 12:00. Outside them nothing can be tested or submitted.

START HERE (do not redo what is done)
1. Read, in this order: prep/try-catch-forest/kb/README.md, gold.md, log.md, learnings.md, arena.md, strategy.md,
   rules.md. Then versions/README.md.
2. State of play when this prompt was written (verify it, it moves):
   - Live in the arena: v5 (submission 41742767), about 159th of 269 in Gold at 26 % of its games.
   - Best tested candidate: v10 (= prep/try-catch-forest/Player.java), NOT submitted. On replays of all 21 Gold
     battles v5 had played: mean rank 1.52 against 1.81, 1.24 catches by turn 10 against 0.48, but 2.67 units lost
     against 1.95. Better in 7 battles, worse in 3.
   - v11 = v10 with every number tunable (P_... constants). One tuning pool finished (pull towards prey, distance
     kept from predators: no clear winner); four pools were interrupted and must be rerun.
3. The tools exist; use them, extend them, do not rewrite them:
   - sim/Sim.java: local referee, about one game per second on 4 cores, every seat order per map.
   - tools/variant.sh: build a variant with switches (F_NAME=false) or numbers (P_NAME=value) changed.
   - tools/rerun.sh + tools/paircmp.py: replay a real arena battle of the current league with our code (same
     opponents, seats, map; exactly reproducible) and compare with what the live version scored in it.
   - tools/arenafetch.py, arena.py, arena2.py, field.py, topfield.py, deathclass.py, deathsdbg.py, look.py,
     huntlook.py, mkdbg.py, replay.py, mkversus.py, rrstats.py, research/fetch.js (games of any top team).
   - The codingame skill for the API. Token in ~/.config/codingame/token: never print, paste or commit it.

HOW TO WORK: FIVE PHASES, WITH SUB-AGENTS WHERE THE WORK IS INDEPENDENT
Use parallel agents for reading and analysis (phases 1 and 2). Two resources are single-lane and need one owner
each: the CodinGame API runs one test game at a time, and the local referee uses all 4 cores.

Phase 1. Win/loss autopsy (parallel agents, one question each, each returns a table with counts and example game ids)
  A. Our Gold games, wins against non-wins: what differs by turn 10, 20, 40 (catches, losses, nets thrown and hit,
     dashes spent, smoke, decoys, units in sight of prey), split by units per team (3, 4, 5, 6) and by seat.
  B. Our Gold losses one by one with the debug replay: for each lost unit, what the bot saw in the five turns
     before, and the first turn on which a different order would have saved it. For each game not won: the turn
     and the event that decided it.
  C. The Gold top 5 (today: ATI x iHot, Les Gens Bons, Lore, RNG, SoloLeveling; refresh the leaderboard), one agent
     per team, 60 or more of their games each: opening (turns 1 to 5: dashes, nets, smoke, decoys, who moves where),
     how each catch was made, how each of their units was lost, what they do with ghosts, with the wall, when
     ahead, when behind, and how they behave in games with 3 units against games with 6.
  D. Our games against those five teams specifically: how they caught us, how we caught them.
  E. The games in which a top team was beaten: by whom and how.
  Every pattern must be stated as "X happens in a % of wins and b % of non-wins (n games)". A share among losses
  alone proves nothing (see learnings.md: "inside our own smoke" was a correlation and the fix made things worse).

Phase 2. Hypothesis list (at least 25, written to kb/gold.md before any code)
  For each: the idea, the evidence from phase 1, the switch or number that implements it, the expected effect on
  catches by turn 10 and on units lost, and how it could fail. Cover at least:
  - mimic the leader: patient nets (0.2 in the first three turns), 28 % of nets on predators, smoke in the first
    five turns, 0.38 units lost by turn 10;
  - mimic the opposite top style: 2.4 nets in the first three turns, few dashes;
  - the four unfinished tuning pools of v11 (chase lookahead weight, two-turn margin, net line, dash costs and
    approach thresholds, strike reward, net distances and reserve, defensive nets, smoke and decoy distances);
  - opening books by start geometry (all start positions are known on turn 1 by rotation);
  - pair tactics: net by one unit, catch by another; cutting off instead of following; driving prey to the wall
    or into a tree pocket (we know the exact movement rule);
  - opponent modelling inside a game: a predator team that has not dashed, has no nets left, or never smokes;
  - telling enemy decoys from units (two entries with one id; a decoy never turns, dashes or gets netted);
  - ghosts as scouts placed ahead of hunters or on predators that threaten us;
  - offensive smoke and decoys; rescue of netted units; nets on the predator that chases a team mate;
  - score state: ahead on the tie-break, level, behind; prey team nearly wiped out; our last unit;
  - different play for 3, 4, 5 and 6 units per team;
  - the undocumented SECRET_FOREST_SPRITE entities: find out what collecting one does before ignoring them.
  Add your own ideas; mark which ones nobody in the top 15 does.

Phase 3. Build as switches
  Every hypothesis is a switch (F_NAME) or a number (P_NAME) in one source file, default = current best, so that
  any combination can be built with tools/variant.sh. One file, class Player, Java, under 100,000 characters,
  no turn over 30 ms on CodinGame (limit 50 ms; measure with the debug build), never an invalid command.

Phase 4. Tournament: everything against everything
  1. Local referee first. Single switches in pools with the current best (480 games or more per pool; one standard
     error of the mean rank is about 0.05 at 288 games per version, so differences under 0.1 are noise: replay them
     with more maps or drop them). Then the winners combined, because effects interact. Keep v1, v5 and v10 in the
     pools as fixed references so the pool is not only close relatives.
  2. Then the real field. The local referee only has our own bots as opponents, so nothing counts until it is
     confirmed on replays of real Gold battles: 30 or more battles chosen by game id, not by result, compared with
     tools/paircmp.py. Report rank, catches, catches by turn 10, units lost, better / worse / same.
  3. Judge every candidate on catches AND losses together. v5 survived and was too slow, v1 was fast and died.

Phase 5. Submit, watch, repeat
  EDIT -> Submission: [you may submit through the API yourself | never submit, tell me which file to submit].
  A version may be submitted only if its mean rank on 30 or more replayed Gold battles is at least 0.15 better
  than the live version's on the same battles, with no error, timeout or turn over 30 ms. At most one submission
  per hour: every submission restarts the ranking games. After each one: fetch the new battles, replay the lost
  ones with the debug build, feed phase 1 again.
  EDIT -> Stop when: [top 5 reached and held at 100 % of the games | the play window closes].

RULES THAT ARE NOT NEGOTIABLE
- Evidence before code, and an ablation before a conclusion.
- Small batches lie: no decision on fewer than 30 paired games or 480 local games.
- Results against a boss mean nothing. Selected "worst games" find causes, they do not judge fixes.
- A three-way test needs both cycles (ABC, BCA, CAB and ACB, CBA, BAC), or one version always hunts the same other.
- Player ids go stale within minutes; replays work only for battles of the current league.
- Never commit CodinGame's statement text (challenges/raw/ is git-ignored). Scratch files go to E:\cg-tmp\.
- On Windows: long files through the Write tool, no backslash escapes inside here-documents, compile right after
  generating code.

RECORD KEEPING (a finding that is not in the knowledge base does not exist)
- kb/gold.md: autopsy tables, the hypothesis list with a verdict for each (kept, rejected, untested) and the numbers.
- kb/log.md: one row per version and per tournament. kb/learnings.md: what was learned about the game and the method.
- versions/: every version as a complete file; Player.java is always the best validated one.
- Commit and push to branch try-catch-forest after every phase.

REPORTING
Every 30 minutes, three lines: where we are in the arena, what was tested with which result, what runs next.
At the end: the final standing, the version that is live, the table of every hypothesis with its verdict, and
what you would try with another day.
```

## Why the prompt is built this way

- **It starts from the current state.** The knowledge base, the local referee and the replay tools took a day to
  build; a session that starts from the statement again would spend the remaining window rebuilding them.
- **It asks for autopsies as comparisons** (wins against non-wins), because the one conclusion drawn from losses
  alone ("our own smoke kills us") was wrong and cost a version.
- **It forces switches and tournaments**, because of every change made so far only about half helped, and only
  the ablation could tell which half.
- **It makes the real field the judge.** Against our own bots v8 looked worse than v5; against real Silver
  teams it was level. Local games filter ideas, replays of real battles decide.
- **It fixes the submission rule in advance**, because each submission restarts the ranking games and a hasty one
  can cost places that take hours to win back.
