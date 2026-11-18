# Gold autopsy: wins, losses and the top five (2026-11-18, hand-over)

Written by the analysis session for the session that owns testing and code. Nothing here was built or tested: these
are findings and a ranked list of things to try. Full tables: `autopsy/top-gold-teams.md` (2,176 games, five teams)
and `autopsy/our-gold-games.md` (80 Gold games of ours: v10 46, v5 34). Each finding is a comparison; samples under
30 per side are marked weak.

## 1. How we lose (80 Gold games, 36 wins, 44 non-wins)

| Cause of the non-win | v10 | v5 | Both |
|---|---|---|---|
| Prey team won, we never led | 10 | 13 | 23 |
| Prey team won after we had led (our hunt stalled) | 7 | 2 | 9 |
| Predator team won by a catch after turn 70 | 4 | 2 | 6 |
| Predator team won earlier | 3 | 3 | 6 |

1. **We lose to the prey team, not to the predator team**: 32 of 44 non-wins. Opponents in the prey seat finish
   first in 40 % of our games, in the predator seat in 15 %. When the prey team caught every unit of the third team
   (18 games) we won none. The prey team is the one team whose score we can stop: every unit of it we catch is a
   hunter it loses.
2. **The first catch predicts, early losses do not.** "We made the game's first catch": 58 % of wins, 16 % of
   non-wins. Win rate by turn of our first catch: 63 / 56 / 53 % for turns 1-5 / 6-10 / 11-15, then 29 / 25 / 11 %
   (weak). "A unit lost by turn 10": 31 % of wins, 41 % of non-wins: no separation.
3. **Same hunting time, half the yield.** HUNT share of unit-turns in turns 1-20: 72 % in wins, 70 % in non-wins;
   SEEK 9 % in both. Catches per 100 HUNT unit-turns: 3.7 against 2.0. Finding prey is not the Gold problem
   (it was in Silver); finishing is.
4. **Nets from far are half wasted, mostly in v10.** Hits that became a catch: 80 % from under 1000, 64 % from
   1000-1500, 50 % beyond 1500 (weak). From 1000-1500 v10 converts 48 % of 25, v5 77 % of 31. "Netted prey from
   over 1000 and no catch followed": 5 % of v10's wins, 38 % of its non-wins.
5. **The prey team nets our hunters at close range**: 0.64 such nets per win, 1.16 per non-win. Only 3 of 74 got
   the unit caught; the cost is the prey that walks away. A hit by a thrower that is itself netted in the next two
   turns converts 38 % (16) against 75 % (100).
6. **A predator net on us in the first five turns**: 8 % of wins, 39 % of non-wins.
7. **Blind inside a cloud, turns 21 to 40.** 79 of 186 lost units had no known predator within 2500 on their last
   order; 75 % of those stood in a cloud (54 % in our own), against 15 % of unaware units that survived. Such a loss
   in turns 21-40: 6 % of wins, 43 % of non-wins. Exact positions (21 debug replays): a free unit in a cloud with
   no predator in sight is caught 20.8 times per 1000 unit-turns; in the open with a predator in sight 11.5; in the
   open with none in sight 0.2. The bot forgets a predator after 3 turns, a cloud lasts 9.
   Caution: the ablation showed smoke is our most valuable tool; this says what to do inside the cloud, not to drop it.
8. **Leads lost late to the predator team.** First at turn 70 in 40 games, won 34; 5 of the 6 lost went to the
   predator team catching one unit on turns 72-93. Those units had been fleeing for 6 or more turns with 3 to 7
   dashes spent.
9. **Tie-breaks are lost on catch number 1**: level on catches in 19 games, 9 taken; all 10 lost by a first catch
   3 to 24 turns later.
10. **Four units per team: 4 wins in 19** (65 / 50 / 45 % for 3 / 5 / 6 units); first catch at median turn 20
    against 10-13. Weak. Seats make no difference (45 / 46 / 44 %).

Checked and dropped: "our nets on predators feed the prey team" (12 % in wins and in non-wins); "early losses
decide"; "more smoke, fewer wins".

v10 against v5 in the arena (46 and 34 games): wins 48 % against 41 % (s.e. 11), catches by turn 10 0.74 against
0.44 (s.e. 0.16), dashes per game 13.8 against 19.7 (the only difference beyond two standard errors). v10 loses
17 of its 22 early units unaware (v5 2 of 12).

Loss labels of v10's first 18 Gold battles, replayed with the debug build (47 units; descriptions, not causes):
three or more dashes spent 43 %, inside our own smoke 40 %, no predator seen in the last three turns 40 %, held by
a net 23 %, at the wall 23 %, two or more predators within 1500 19 %, catcher dashed with our dash ready 17 %,
stacked 11 %. Replays in `E:\cg-tmp\tcf\gold\r10` (17 of 18 identical to the arena game).

## 2. What the top five do (2,176 games)

| Team | Games | Wins | The one thing that is theirs |
|---|---|---|---|
| ATI x iHot (leader) | 47 | 66 % | survives the first ten turns: dash and smoke on turn 1, nets kept for late |
| Les Gens Bons | 311 | 53 % | nets on turn 1 (1.21 per game against 0.57), early nets hit 40 % against 28 % |
| Lore | 64 | 44 % | nets its hunters (48 % of its nets); no opening smoke; dies at the wall |
| RNG | 206 | 41 % | slow opening, ghosts follow predators, dashes onto held prey 61 % against 43 % |
| SoloLeveling | 121 | 31 % | burns dashes (7.4 per unit against 4.8); not strong in this data |

1. **ATI wins in the first ten turns.** It loses a unit by turn 10 in 28 % of its games (others 56 %) and takes
   0.40 net hits in turns 1-5 (others 0.90). After that it is no safer than anyone.
2. **The mechanism is dash plus smoke on turn 1**, by distance of the nearest predator start:

   | Predator start | Dash | Smoke | Direction |
   |---|---|---|---|
   | under 1500 | 100 % | 81 % | away |
   | 1500-2000 | 86 % | 59 % | mostly away |
   | 2000-2500 | 85 % | 19 % | mixed |
   | beyond 2500 | 42-56 % | 0 % | at the nearest prey |

   Across all teams, a unit with a predator start within 2000: no smoke: netted within 4 turns 36 %, caught within
   5 turns 25 % (2,408 cases). Smoke on itself: 4 % and 12 % (198). Smoke on the predator: 24 % and 20 % (117).
   This agrees with our ablation (smoke on ourselves beats smoke past the hunter).
3. **ATI keeps its nets**: 0.30 in turns 1-5 (others 1.97), median net turn 42 (others 6). 38 % go at predators,
   three quarters of those with the predator within 1500. It nets prey whose dash is on cooldown (17 % against 8 %
   at 800-1200) and almost never prey that can dash. Held prey is caught on the next turn 67 % against 48 %,
   because its hunter stands 771 away at the hit (others 1,044).
4. **Nets are what beat ATI**: 18 % of its lost units were held in its wins, 49 % in its non-wins (weak: 31 and 16
   games). Its units dash on turns 1, 3 and 6; a unit that dashes on the net turn is hit 28-30 %, one that does not
   69-74 %. So the windows against it are turns 2 and 4-5 (inferred from its dash timing, not measured).
5. **For every team a non-win starts with an early loss before its first catch**: win rate 36 / 27 / 28 / 20 / 10 %
   in that case against 75 / 68 / 54 / 56 / 41 % otherwise (same team order as the table; others 16 against 47).
6. **Nobody protects a lead**: after turn 30 the distance kept from predators is the same ahead, level or behind.
7. **Ghosts**: RNG's follow predators (24 % of orders within 1000 of one, others 11 %); Les Gens Bons' and Lore's
   follow prey (48 % against 25 %).
8. Les Gens Bons also puts smoke on itself every time (856 of 856), sends decoys away from the predator
   (82 % against 38 %), and its held units send a decoy (42 % against 20 %).

Sprites (`SECRET_FOREST_SPRITE`): no effect on the power pool, dash cooldown or fatigue in 51 debug games. The
"pool went up by one" that appears in debug logs is our own counter: a power ordered by a unit that is caught on
that turn is not spent.

## 3. What to try, in the order the evidence supports

Each needs a switch, a pool on the local referee and then 30 or more replayed Gold battles. Expected direction
only; none of this is tested.

| # | Change | Evidence | Risk |
|---|---|---|---|
| 1 | **Finish before netting from far**: offensive net only when a hunter of ours is within about 1000 of the target, or will be next turn (ATI: 771 at the hit) | finding 1.4 (v10: 48 % conversion from 1000-1500 against v5's 77 %), 2.3 | fewer nets thrown, slower first catch if too strict; tune the distance |
| 2 | **Turn-1 rule of the leader**: predator start within 1500: dash away and smoke on ourselves, always; 1500-2000: dash, smoke if a line is clear; beyond 2500: go at the nearest prey | 2.2 (36 % / 25 % against 4 % / 12 %), 1.6 | uses one or two smokes on turn 1 |
| 3 | **Inside a cloud keep the predators in mind for the life of the cloud** (9 turns, not 3), keep moving on a changing heading, leave on the far side | 1.7 (20.8 against 11.5 catches per 1000 unit-turns) | none obvious; do not reduce smoke use |
| 4 | **Catch the prey team's hunters first**: prefer the prey unit that is closest to catching the third team (or simply the nearest one we can finish), and nets on prey that has just made a catch | 1.1 (32 of 44 non-wins go to the prey team) | needs their targets to be inferred; start with "nearest finishable" |
| 5 | **Do not get netted while hunting**: a hunter within 1000 of a prey unit that can see it should approach across the line, not along it, and the second hunter nets first | 1.5 (0.64 against 1.16), 2.4 (side movement halves hits) | slower approach |
| 6 | **Late game with a lead**: after about turn 70, units that are ahead on score stop hunting when a predator is within reach and keep a dash in hand | 1.8 (5 of 6 late losses) | we do not see the other scores, only ours and our own losses; use "prey gone or 15 turns left" as the trigger |
| 7 | **Dodge nets in the windows**: move across the line of any predator within 2400 that has a clear line, on the turns our dash is on cooldown | 2.4 (hit 69-74 % standing or walking along, 28-30 % when dashing) | costs distance in a chase |
| 8 | **First catch sooner in games with 4 units** | 1.10 (weak) | may be noise; check on the local referee with N fixed to 4 |
| 9 | Held units send a decoy when no net is left (Les Gens Bons 42 % against 20 %) | 2.8 | weak evidence of effect |
| 10 | A ghost on the nearest predator of our living units (RNG) against a ghost on prey (Les Gens Bons, Lore) | 2.7 | both styles are in the top five; test, do not assume |

Already tested and settled elsewhere (`log.md`): smoke on ourselves, no unseen-ground penalty, search map, approach
dash, stale-predator model, ways-out count.
