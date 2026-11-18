# Learnings

What this challenge taught, for the next league and for the next contest. Facts about the rules are in `rules.md`,
the bot's design in `strategy.md`, the version history in `log.md`. This file is the "why" and the "do it again / never
again" list.

## 1. About the game

1. **Points are scarce, so time decides.** A team has 3 to 6 units, so 3 to 6 points exist per hunter. A third of the
   Gold games end level on catches and go to the tie-break (who made the 1st catch earlier, then the 2nd ...).
   Catching all prey is not enough: with 3 units per team we came second twice with a full 3 catches.
2. **Speeds are equal, so nothing is caught by walking.** Hunter and prey both walk 600. A catch needs one of:
   a net, a dash against a unit that cannot answer with a dash, a second hunter, the wall, a tree, or a blind prey.
3. **The dash is a budget, not a cooldown.** The k-th dash costs k turns. Units that dashed five times early had a
   cooldown of 5 or 6 late in the game and could not escape. Spend a dash for a catch or to survive, never to travel.
4. **A net is a catch if someone walks in.** After a net lands the prey stands for four more turns: 2,400 of walking.
   Nets unused at the end are points thrown away (a game was lost on the tie-break with two nets left).
5. **The wall kills.** A unit that runs straight away from two predators reaches the wall in a few turns and is
   caught there. A unit pushed along the wall into a tree that touches the wall stops dead.
6. **What you cannot see kills.** Sight is 2000 and trees block it. Most late losses had no predator in sight on any
   of the five turns before the catch. A dash of 1200 into hidden ground is the worst case.
7. **Turn 1 is not blind.** The three teams are rotations of each other, so every enemy start is known. Prey that
   starts inside dash reach can be caught on turn 1, and a unit that starts next to a predator knows it.
8. **Wiping out the prey ends our scoring.** After it, the only thing left is not to give points: stand still
   (2600 sight) and move only when a predator shows.
9. **A netted unit is not helpless.** It still throws: its net belongs to the hunter walking in, not to prey.
10. **Smoke hides, it does not protect.** A cloud is 1900 wide and blinds the units inside, ours included. A hunter
    that knows where a held unit stands walks in anyway.
11. **Ghosts are free scouts.** They see, cannot be seen or caught, and walk through trees.

## 2. About the referee (each one was checked, see `rules.md` for the evidence)

- Collisions are tested along the whole move in time order, with centres 440 apart.
- Movement: straight to the tree, then along the tangent with what is left of the speed. A pushed-out or
  "walk around the circle" model is wrong by up to 400 units.
- `immobilizedTurns` 4 on the turn after the net: four turns to arrive, not five.
- Enemy cooldown and fatigue are in the input. Use them: "can this unit dash now" is known, not guessed.
- An enemy decoy is indistinguishable from a unit in one frame.
- The shown score is 3 x catches + tie-break rank; do not read it as catches.
- There are undocumented entities (`SECRET_FOREST_SPRITE`). A parser that rejects unknown types would crash.

## 3. About the method

What worked:
1. **Study games before the statement.** 1,408 Gold logs gave the cycle, speeds, ranges, turn order and the patterns
   of winners and losers a day early. Most of the plan survived the statement.
2. **Then distrust that study.** Logs cannot show what is not printed. Wrong or incomplete until the statement:
   dash cooldown ("every second turn"), net hold ("4 turns" was right for the input, the statement says 5),
   smoke ("immune to nets": nobody can aim into it, the rule is about sight), strike distance (first 1650, then 950,
   exact 1040). Mark every measured value as measured and re-check all of them against the statement.
3. **One probe game before writing the bot.** A script that only prints its input showed the field values, the id
   layout, the rotation of the start positions, visible enemy cooldowns and the undocumented entity.
4. **A debug build that logs its whole input.** With it: exact local replay of any game (same decisions, 29 of 29
   turns), movement error measured against the referee, and "what did the unit see before it died".
5. **Fit the physics, do not guess it.** Four slide models were compared on 638 real moves; one fits 99 % within
   3.4 units. Every safety check in the bot depends on knowing where a move really ends.
6. **Every change came from a concrete loss.** Wall deaths -> five-turn chase. Blind deaths -> hidden-ground penalty.
   Unused nets -> wider net rule. No change was made because it "seemed stronger".
7. **One scoring function for all moves** instead of separate flee / hunt modes: a hunter next to a predator and a
   fleeing unit next to prey are handled by the same numbers.

What went wrong, and the rule that follows:
1. **Judging versions on unpaired batches of 7 or 8 games.** v1 won 7 of 7, v5 6 of 8, although v5 lost far fewer
   units. Maps, unit counts and the other two players differ from game to game. Rule: compare on the same seeds
   (`seedbatch.sh`) and head to head in the same game (`mkversus.py`). See section 4.
2. **Reporting wins against the boss as if they were strength.** The Bronze boss never dashes. Rule: also play the
   bot against itself and against real players as soon as a league has them.
3. **Testing only from seat 0.** The seat decides who hunts whom. Rule: play all three seats.
4. **Counting on tools that broke quietly.** Player agent ids went stale and two games returned errors instead of
   logs; a statistics script crashed on games without debug lines. Rule: scripts print what they skipped.
5. **Shell quoting on Windows.** Long commands are refused, and `\\n` inside a here-document became a real line
   break twice (a Java string, then a Java character). Rule: files through the Write tool, no escapes in
   here-documents, compile right after generating code.

## 4. Which version is better: v1 or v5

Short answer: **neither is clearly stronger. v5 survives, v1 catches sooner.** Three independent measurements agree.

| Measurement | v1 | v5 |
|---|---|---|
| Same 15 seeds against two Bronze bosses | 14 wins, 65 catches, 22 units lost | 13 wins, 66 catches, 6 units lost |
| ... earlier catches on the same seed | better on 9 seeds | better on 6 seeds |
| Head to head, 12 games (both in one game, boss third) | mean rank 1.58, 38 catches, 26 lost | mean rank 1.58, 37 catches, 17 lost |
| Bronze arena | 80 games: 51 % first, 28 % last, mean rank 1.76 | 197 games: 49 % first, 21 % last, mean rank 1.73 |
| Bronze arena, catches by turn 10 / in total | 1.14 / 3.76 | 0.75 / 3.14 |
| Bronze arena, units lost per game | 3.04 | 1.99 |

- "7 of 7" for v1 and "6 of 8" for v5 were two small batches on different maps; on the same seeds they are 14 and 13 of 15.
- v5 is the one that was promoted to Silver (it replaced v1 in the arena after 7 minutes).
- The lesson is in the last two rows: each safety rule added after v1 saved units and cost catches. A change has to
  be judged on both columns at once.

## 5. Learnings from the arena (277 Bronze games, see `arena.md`)

1. **The boss is not a player.** The Bronze boss never dashes. Against it we lost 0.4 units per game, against
   players 2.0 to 3.0. 31 % of our arena losses came on a turn where the catcher dashed.
2. **Finding prey is the bottleneck, not catching it.** In a game without a catch our units had prey in sight on
   17 of 100 turns and spent two thirds of their turns searching. 58 % of v5's non-wins ended with prey alive on
   one side and our units alive on the other. A fixed patrol is not a search; keep a map of what was seen when.
3. **Smoke on yourself is a blindfold.** 42 % of the lost units of v5's worst games were inside our own cloud,
   most of them standing still. Throw it past the hunter: it is blind, we are not.
4. **Units of one team must not share a spot.** They pass through each other, so nothing keeps them apart; fleeing
   from the same predator they end on the same point and one predator takes all of them in one turn (up to four).
5. **Count the dashes.** 67 % of the lost units had dashed three times or more; their cooldown was 4 to 8 turns when
   the predator finally dashed. Rule now: dash for a catch, for netted prey, or when no walk is safe.
6. **A penalty can freeze a unit.** The "no steps into unseen ground" rule exempted standing still; inside smoke
   everything is unseen, so standing won every turn. Check what a new term does to the "stay" candidate.
7. **Dead ends exist.** A big tree next to the wall leaves a pocket whose only exit points at the pursuer. Count the
   real ways out of a position (simulated moves), do not just look at the distance to the wall.
8. **A predator you cannot see has not stopped.** Behind a tree or inside a cloud it keeps coming. Keep it in the
   model on its last heading for a few turns, with its dash cooldown running down.
9. **Decoys earn their keep**: a third of the enemy nets that hit us hit a decoy.

Method:
1. **Replay lost arena battles with the debug build at once** (`rerun.sh`): the opponents are the real ones and the
   log shows everything the bot saw. It only works for battles of the current league: after the promotion the
   Bronze battles could no longer be replayed.
2. **Player ids go stale within minutes** (every resubmit makes a new agent). A paired test against a named player
   broke in the middle. For version-against-version tests use a round robin of our own versions in one file
   (`mkversus.py`, opponents `["me","me"]`): stable, strong opponents that dash.
3. **Selected bad games flatter any fix.** The 12 worst games went from 45 to 25 units lost with v6, but on fresh
   paired seeds v6 was exactly level with v5. Use the bad games to find causes, fresh seeds to judge the fix.
4. **CodinGame refuses code over 100,000 characters.** Three versions in one file need comments and indentation removed.
5. **A time guard makes local replays non-deterministic** when the local machine is slower than CodinGame's
   (our turns: about 1 to 5 ms there, 5 to 25 ms here).
6. **A game between three of our own bots takes about a minute**; budget 15 games per quarter of an hour.

## 5b. Learnings from Gold and from the local referee

1. **Counting labels on losses does not find causes.** "42 % of lost units were inside our own smoke" led to moving
   the smoke onto the hunter; the ablation showed that smoke on ourselves is the most valuable tool we have and that
   the new placement was harmful. Threatened units smoke, so they die in smoke more often. Switch a rule off and
   measure; do not infer it from where the bodies are.
2. **A switch on every rule from the first day.** With `F_...` constants and a local referee, 15 rules were judged
   in 35 minutes. Three of our own additions were harmful and had been in the bot for hours.
3. **Build the local referee on day one, not day two.** One game per second against 1.5 minutes through the API.
   Everything before it was decided on 8 to 20 games.
4. **Self play can accept what the field rejects.** The cut-off rule gained 0.2 to 0.4 of mean rank locally and lost
   0.2 on 23 real Gold battles: it exploits how our own bots flee. The local referee may reject an idea; only real
   opponents may accept it.
5. **A replay comparison flatters, too.** v10 looked 0.29 better than v5 on v5's 21 battles and came out level on
   its own 37 arena games (mean rank), although its rating is 2 to 3 points higher. Rank in a 3-player game moves
   slowly; watch the rating and the place as well.
6. **Mean rank depends on who you meet.** Matchmaking is by rating: in 69 Gold games we met a top-20 team 6 times.
   Figures that look like the leaders' figures mean little when they come from the middle of the league.
7. **A Gold submission is 37 games in about 40 minutes.** Only the last submission counts, so a submission is also
   the fastest honest test there is, as long as the best version is the one left standing at the end.
8. **Long nets miss.** Beyond 1500 a net at prey hits 20 to 33 % in Gold even when the prey cannot dash.
9. **Tuning numbers is the last 1 %.** Twenty variations of fifteen numbers over 2,400 games: nothing outside the noise.
   Structure (what the bot does at all) decided every step of the day, in both directions.

## 5c. Learnings from the afternoon and evening of 2026-11-18 (numbers in `log.md`)

About the game:
1. **A game is decided by turn 15.** With a catch of ours by turn 15 the mean rank is 1.54, without one 2.31,
   although only 0.4 units are lost by then. This holds for every version and team size, locally and in the arena.
2. **The tie-break is the first catch, and it is lost by many turns, not by one.** A quarter to a third of the
   places below first are level on catches; all were decided by the first catch, ours later by a median of 8 to
   11 turns. Three- and four-unit games carry most of them, because only three or four catches exist.
3. **Two different bots can each be the better one at a different team size.** v10 scored 2.44 with four units
   where the leader's imitation scored about 1.7; with six units it was the other way round. One file that picks
   the bot by team size on turn 1 (`tools/mkportfolio.py`) uses both.
4. **Early close nets make first catches.** The top teams net their nearest prey on turns 2 to 4 from 650 to 880
   and catch it a turn later. A rule that allows attack nets only when sure cut our net hits on prey from 31 % to
   22 % and doubled the share of tie-break losses.
5. **A cloud on the predator protects held units and the opening** (losses while held 47 % -> 32 %, losses by
   turn 10 19 % -> 12 %) **and costs at the wall** (18 % -> 32 %). Earlier local tests of other placements had
   said "no gain"; the arena showed a trade, not a gain.
6. **A net hit is wasted mostly by our own flight.** In 7 of 18 wasted hits the nearest unit ran from a predator
   it could not see while the held prey stood 1100 to 1800 away.
7. **Imitation has a ceiling.** The copy of the leader matched 40 of 50 measured habits and still lost more units
   than the original: what the leader decides inside a chase is not in the logs.
8. **A two-turn worst-case search is worse than a five-turn simple chase** for fleeing: the wall and the tree
   pockets lie further ahead than two turns.

About the method:
1. **The local referee cannot rank close candidates.** Pools on ten maps gave gaps of 0.2 to 0.4 that vanished on
   other maps; two identical programs differed by 0.26. The maps are the sample, not the games. It can find
   crashes and clearly broken ideas, nothing finer.
2. **One arena run is not a measurement of a version either.** The same file reached 20.4 in one run and 18.5 in
   the next. The field got harder through the day (the same v10 code: 1.81 in the morning, 2.09 in the afternoon).
   Compare versions inside the same hour, by mean rank over the games, not by the rating shown.
3. **A paired test inside one run is the cleanest evidence we found.** A hybrid plays two bots in the same hour
   against the same field, split by team size; replaying its battles with the other bot gives the pair.
4. **Replays are tied to the live submission.** Every submission closes the replay base of the version it
   replaces. Three submissions from three sessions within an hour cut off three test series. One session
   submits, on the user's word, and says so to the others first.
5. **A test that selects on the state at a given turn is fair; one that selects on the final result is not.**
   "Games with no catch by turn 15" is a state; "our worst games" is a result.
6. **A change that only acts in a bad state cannot hurt the good games** and needs replays only for the games in
   that state. This is the cheapest kind of change to test and the least risky to ship.
7. **Bundles cannot be read.** Five rules shipped together lost clearly and nobody knows which one lost; three
   user rules shipped together showed one loss, one trade and one gain only because each moved its own counter.
   Give every rule a counter of its own before shipping it.
8. **Check what the instruction costs before following it under time pressure.** The net rule was built as asked
   in ten minutes and was the main loss of the run; the cost was visible on recorded games before submitting
   (nets per game fell from 3 to 5 to 0 or 1) and was reported but not acted on.

## 6. Checklist for the next contest

1. Before the statement: collect game logs of the test league, measure rules, list patterns of winners and losers.
2. Statement day: read it line by line; table "statement vs measured"; fix every constant.
3. Probe game; note everything the statement does not say.
4. First bot: correct and safe before clever (valid output, time limit, no crash on unknown input).
5. Debug build, replay tool, loss inspector on day one.
6. Fit the referee's movement and collision rules from recorded moves.
7. Compare versions only on paired seeds and head to head; judge catches and losses together; keep `log.md` current.
7b. After the first submission: download every arena game, replay the lost ones with the debug build the same hour.
8. After each promotion: new statement, diff, probe game, then code.
9. Keep the original statement out of git; write rules in our own words.
10. Give every rule its own counter in the logs, test rules one at a time, and let exactly one session submit.
11. Split results by team size and by state at turn 15 before judging a version.
