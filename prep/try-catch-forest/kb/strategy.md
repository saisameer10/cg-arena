# Strategy and how the bot implements it

## Shape of the bot (`Player.java`)

1. `readTurn`: own units, visible enemies, clouds. Enemy units are remembered by id (`tracks`). On turn 1 every enemy
   start position is filled in by rotation. A remembered position that we can see is empty is dropped (`lost`). A rise
   of `myScore` marks the nearest prey we lost sight of as dead.
2. `decide`:
   - threats = predators in sight + predators seen in the last 3 turns (wider reach, lower weight); older ones
     (4 to 8 turns) only push units away from the place;
   - prey candidates = prey in sight + remembered prey (up to 25 turns);
   - hunters are assigned greedily: cheapest pair first, two per prey at most, netted prey 2500 cheaper;
   - each free unit scores about 50 moves with `eval` and takes the best;
   - powers: nets at prey, nets at hunters, smoke, decoys;
   - ghosts go and sit on prey (then on predators) to keep them in sight.
3. `simMove` is the referee's movement (see rules.md, slide rule); every candidate is scored at its real end point.

## `eval`: what a move is scored on

| Term | Size | Purpose |
|---|---|---|
| Unavoidable catch (netted prey on the path, or prey that cannot outrun the move) | +300,000 | take every certain point |
| Likely catch (paths cross; prey must dash to survive) | +25,000 to +30,000 | strike prey that may not react |
| Predator can touch the path this turn (reach 1200 if its dash is ready, else 600; 0 if netted) | -1,000,000 (x0.2 with a certain catch) | never stand where a predator can reach |
| Two-turn margin: predator's two-turn reach against our next move | -25 per unit short | do not end somewhere that is lost next turn |
| Five-turn chase (`rollout`): keep the direction, predators run at us | +1.5 per unit of smallest distance, -30,000 if caught | see the wall or a tree before it kills |
| Predator within 2500 (x0.3 if a tree or smoke hides us) | -1 per unit | distance and cover |
| Clear net line to a predator within 2470 (+600 if it is free to move) | -400 | stay out of net lines |
| Beyond radius 6300 with a predator within 4000 | -1.5 per unit | the wall ring kills |
| Distance to the way point of the goal | -1 to -2 per unit (0.5 when exploring) | close in on prey |
| Ground around the end point that none of our units sees | -1200 x share (walk), -2500 x share (dash) | no blind steps into hidden predators |
| Place where a predator stood 4 to 8 turns ago | -1 per unit inside 1800 | memory beyond sight |
| Dash | -(700 + 250 x fatigue), +1500 if netted prey is only reachable by dashing | dashes are a budget |

## Research patterns and where they live in the code

| Pattern (1,408 Gold games) | In the bot |
|---|---|
| W1 net, then walk in; dash onto netted prey | netted prey is 2500 cheaper to assign, goal weight 2, +300,000 for the catch, dash bonus when walking is too slow |
| W2 net the unit that cannot dodge | "sure" nets: dash on cooldown, within 1400, or not moving across the line |
| W3 no nets on turn 1 | skipped on turn 1 unless the target has no dash |
| W4 hunt in pairs | two hunters per prey |
| W5 strike prey that has no dash | certain-catch test uses the prey's real cooldown from the input |
| W6 rescue the netted unit | a held unit keeps its net for the hunter; team mates net a hunter that can reach a held unit; smoke on the held unit |
| W7 smoke one turn early | smoke when a predator has a clear line within 2300 of the position after the move |
| W8 turn 1 next to a predator: dash away and smoke | predators are known on turn 1 by rotation; same smoke rule; dash decided by reach |
| L1 not reacting | every move is scored against every known predator |
| L2 dash mistimed | a dash is chosen only when walking is not safe, or for a catch |
| L3 power ordered on the turn of death | moves are safe first; decoys leave before the move |
| L4 chasing without a finish | nets are spent early (one kept for defence unless the target is sure) |
| L6 netted and abandoned | see W6 |
| L7 wall ring | wall term + five-turn chase |
| L9 walking towards the predator | reach test on the whole path |
| First catch and tie-break | strike on turn 1 when prey starts inside dash reach (positions known by rotation) |

Statement rules the research could not see, and their use:
- dash cooldown grows: dash cost rises with `fatigue`;
- ghosts see: they are scouts;
- decoy takes a net: it is sent straight at the predator, between it and us;
- smoke only blocks sight: remembered predators keep counting for 3 turns after we lose them.

## Known weak points

1. Enemy decoys are not told from real units. Two entries with one id only block long nets. Idea: the entry whose
   speed or heading changes is the real one; a decoy never dashes, never turns, never gets netted.
2. Slow first catch in games with 3 units per team: second place twice on the tie-break (3 catches each).
   Ideas: dash earlier towards known start positions, send the unit nearest to a prey start at once, net sooner.
3. A walking unit can still meet a predator hidden behind a tree (1 loss in 8 games). The hidden-ground term only
   looks 650 around the end point.
4. Worst-case flight: a dash-ready predator at 1000 that never dashes (the Bronze boss) still makes us flee instead
   of striking the prey next to it.
5. The enemy's net count is unknown; the bot assumes nets are always available.
6. No offensive use of smoke or decoys.
7. Side quest (trees touched) and sprites are ignored.
8. Tested only from seat 0 and only against the Bronze boss and itself.

## Ideas not tried
- Model each opponent: a team that never dashed in 10 turns can be approached closer.
- Net the predator that chases a team mate when it runs along our line.
- Hold ghosts still on a watch point (2600 sight) instead of following.
- Hide behind a tree from the nearest predator when nothing is left to catch.
- Local referee in cg-arena (add-challenge skill) for thousands of offline games and parameter tuning.
