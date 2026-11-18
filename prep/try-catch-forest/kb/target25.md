# Target 25: what teams rated 25 do against our opponents, move by move (2026-11-18, night)

Question: which exact habits separate a bot rated 25 from ours, against the opponents we actually meet?
Method: game logs only (the play window was closed). Scripts in `tools/peer/`: `fetch25.py` (download), `anatomy.py`
(every catch, loss, net, smoke and held unit), `geo.py` (positions, first turn, contacts with prey), `geo2.py`
(what a hunter does near prey and what comes of it), `geo3.py` (the same for defence). Outputs: `E:/cg-tmp/tcf/peer25/*.out`.

## 1. Data and how positions were obtained

| Group | Games | Who |
|---|---|---|
| us (live) | 214 | the live code (`vlive_41748059`), two runs |
| v10 | 54 | v10's own run |
| at 23 | 271 | 9 teams ranked 95 to 130 (downloaded earlier by the other session) |
| at 25 | 436 | 41 teams ranked 30 to 70 (rating 24.6 to 25.9 on the evening of the 18th), their last games |

All games are against two opponents ranked beyond 100: the field we meet. Teams at 25 play most of their games
against the top 100; these 436 are the ones that compare with ours.

The logs give exact positions for every dash (start), power (thrower) and catch. Between those points the unit
follows its MOVE/DASH orders in a straight line, so its position can be rebuilt forwards and backwards; the three
teams start as exact 120-degree rotations of each other (checked on 1,142 pairs, error 0). Error of the rebuilt
positions against the next exact point: median 1 unit, 75 % under about 100, 90 % under 600 (slides along trees are
not modelled). Start positions are known for 95 to 99 % of units. Dash cooldown is derived from the dashes
themselves (after its k-th dash a unit cannot dash for k turns; the most frequent gap between two dashes is exactly
that minimum).

Limits: observational data. A bot dashes when its own evaluation likes the situation, so "dash against walk in the
same state" overstates what a blind rule would gain. Each number below is a difference between bots or between
choices, not the measured effect of a change of ours. The paired test of the last window decides.

## 2. The result in one table

| Per game | us (live) | at 23 | at 25 |
|---|---|---|---|
| Mean rank; first; last | 2.00; 34 %; 33 % | 1.78; 45 %; 23 % | 1.64; 52 %; 16 % |
| Catches | 2.66 | 3.12 | 3.36 |
| Units lost | 2.38 | 2.68 | 2.58 |
| No catch by turn 15 | 42 % | 28 % | 23 % |
| Catches in turns 1-5 / 6-15 / 16-30 / 31-60 / 61+ | 0.22 / 0.58 / 0.69 / 0.60 / 0.57 | 0.41 / 0.79 / 0.52 / 0.77 / 0.63 | 0.45 / 0.79 / 0.71 / 0.78 / 0.63 |
| Times a prey unit comes within 2000 of one of ours ("contacts") | 13.8 | 11.3 | 11.1 |
| Contacts that end in a catch within 3 / 6 / 12 turns | 11 / 18 / 24 % | 15 / 22 / 31 % | 17 / 25 / 36 % |
| Dashes | 14.4 | 21.6 | 22.0 |
| Dashes at prey within 2500 | 3.6 | 7.8 | 8.0 |
| Catches made with a dash / walking | 1.07 / 1.59 | 1.27 / 1.85 | 1.42 / 1.94 |

By units per team (mean rank; catches): 3 units 1.92; 1.88 against 1.73; 1.93 for teams at 25. 4 units 1.97; 2.12
against 1.63; 2.92. 5 units 1.98; 3.06 against 1.66; 3.85. 6 units 2.11; 3.60 against 1.53; 4.92.

**Reading: we find prey more often than teams at 25 and lose fewer units. The whole gap is what happens after
contact: they turn 25 % of contacts into a catch within six turns, we 18 %. With no predator within 2500 it is 26 %
against 16 %, so caution is not the reason.** 0.70 catches a game is about 0.36 of mean rank, which is 4 to 5 rating
points at the rate of `target23.md`.

Where the 0.70 catches are, by the state of the victim (ours / at 25): held by our net 0.98 / 1.07; held by the
third team's net 0.04 / 0.11; free, inside its own team's cloud 0.42 / 0.52; free, on dash cooldown 0.66 / 0.95;
free and able to dash 0.31 / 0.52; free, inside our cloud 0.25 / 0.20.

## 3. Nuance 1 (largest): the dash is spent on prey, not kept

Turns in which one of our units is the nearest to a prey unit, can dash, and no predator is within 2500:

| Distance to the prey | Such turns per game (us / at 25) | We dash at it | They dash at it | Caught within 3 turns after a dash (us / at 23 / at 25) | ... after walking |
|---|---|---|---|---|---|
| Prey can dash, 1100-1400 | 4.1 / 2.0 | 5 % | 40 % | 21 / 19 / 23 % | 9 / 13 / 14 % |
| Prey can dash, 1400-1700 | 4.8 / 2.7 | 5 % | 30 % | 16 / 19 / 18 % | 7 / 9 / 9 % |
| Prey can dash, 1700-2100 | 8.0 / 4.5 | 5 % | 15 % | 14 / 21 / 19 % | 3 / 6 / 6 % |
| Prey can dash, 800-1100 | 1.7 / 1.3 | 7 % | 40 % | 16 / 16 / 25 % | 17 / 22 / 23 % |
| Prey on cooldown, under 800 | 0.6 / 0.6 | 31 % | 44 % | 72 / 65 / 72 % | 26 / 52 / 37 % |
| Prey on cooldown, 800-1100 | 1.3 / 0.7 | 20 % | 38 % | 71 / 65 / 61 % | 24 / 29 / 23 % |
| Prey on cooldown, 1100-1400 | 3.1 / 1.3 | 4 % | 35 % | 48 / 27 / 31 % | 17 / 15 / 17 % |
| Prey on cooldown, 1400-1700 | 3.7 / 1.6 | 4 % | 26 % | 17 / 15 / 23 % | 9 / 9 / 12 % |
| Prey on cooldown, 1700-2100 | 5.8 / 2.9 | 2 % | 11 % | 14 / 16 / 20 % | 5 / 6 / 6 % |

- We stand 1100 to 2100 from prey with a dash in hand twice as long as they do, and dash in 2 to 5 % of those turns.
- In every group, our own rare dashes included, a dash from 1100 to 2100 doubles or triples the share of catches
  within three turns. Under 1100 against prey that can still dash, walking is as good as dashing.
- The hunter is lost within four turns in 0 to 1 % of these turns whatever it does.
- Fatigue: 79 % of our dashes at prey are made by units that have dashed at most twice; half of theirs by units that
  have dashed three times or more (3.7 a game against our 0.75).
- After turn 30 we dash 2.2 to 2.7 times per 100 living unit-turns, they 4.7 to 6.1. In turns 61 and later we have
  3.4 contacts a game and convert 10 %; they have 1.9 and convert 19 %. A dash not used by turn 100 is worth nothing.
- What keeps the dash: on cooldown with a predator within 1000 a unit is lost within six turns in 20 to 30 % of
  turns, against 17 to 24 % with a dash ready. That is the whole price, and only at that distance.

Cause in our code (`decide`, dash filter): a dash at prey in sight is kept as a candidate only for a certain catch,
or for a likely one while the unit's fatigue is at most 2; an approach dash needs the prey beyond 1500, fatigue at
most 2 and no predator within 3000; and a dash costs 700 + 250 x fatigue in the score against a gain of 600 to 1200.

**Candidate built: `versions/vlive_press.java`** (`tools/gen/mkpress.py`, switch `F_PRESS`): with the target in
sight and a dash ready, dash candidates are allowed and cost as little as an approach dash when (a) the prey is on
cooldown and within 2100 (1400 with a predator within 2500), or (b) the prey can dash, is 1100 to 2100 away and no
predator is within 2500. Fatigue limit 6 before turn 60, none after. Hard safety rules unchanged.
Checks: 120 local games without a crash (press 1.81, live 2.09, v10 2.08; the local referee cannot rank, see
`learnings.md`); on the recorded inputs of 3 real games it orders 22 % more dashes than the live code; turn time
unchanged. No game against real opponents yet.

## 4. Nuance 2: the first turn

Units by distance to the nearest prey unit at the start (about 1.25 units a game start within 2000 of prey):

| Prey within 2000 | us | at 23 | at 25 |
|---|---|---|---|
| Dash towards it | 42 % | 59 % | 66 % |
| Net (after the move) | 0 % | 40 % | 38 % |
| ... net hits prey | | 31 % | 34 % |
| Smoke | 32 % | 5 % | 6 % |
| That prey caught by turn 5 / 10 | 12 / 24 % | 21 / 34 % | 25 / 37 % |

Prey 2000 to 3200 away: they net in 22 to 29 % of cases (dash, then net: a dash carries the net 3200 from the
start), hit 18 to 25 %; that prey is caught by turn 5 in 16 to 19 % of cases against our 9 %.

Units with a predator within 2000 at the start (1.3 to 1.5 a game):

| | us | at 23 | at 25 |
|---|---|---|---|
| Dash (away from it) | 24 % (16 %) | 75 % (41 %) | 81 % (52 %) |
| Smoke | 57 % | 11 % | 17 % |
| Net | 0 % | 20 % | 26 % |
| Decoy | 36 % | 28 % | 35 % |
| Netted by turn 3 | 26 % | 26 % | 22 % |
| Lost by turn 10 | 17 % | 25 % | 22 % |

- Our smoke opening is the safest of the three (17 % lost by turn 10 against 22 to 25 %). It costs the net and the
  sight of that unit: about 0.07 units a game saved against about 0.16 early catches a game not made.
- Far from every predator (beyond 4500) we dash on turn 1 with 96 % of units, they with 46 %: our first dash goes
  into travel, theirs is kept for the strike.
- Candidate that exists: `versions/vlive_net1.java` (turn-1 nets, capped by units per team). It does not change the
  smoke or the dash direction; a unit that smokes cannot net that turn.

## 5. Nuance 3: nets depend on the prey's dash, not on distance

Net at the nearest prey unit, all groups together, share that hit:

| Distance | Prey on cooldown | Prey could dash | ... and did dash that turn | Thrower dashed that turn |
|---|---|---|---|---|
| under 800 | 60 % | 34 % | 24 % | 32 % |
| 800-1400 | 58 to 61 % | 27 to 34 % | 21 to 23 % | 33 to 38 % |
| 1400-2100 | 47 to 55 % | 29 to 30 % | 14 to 22 % | 35 % |
| 2100-2500 | 18 % | 19 % | 8 % | 30 % |

- Up to 2100 the distance hardly matters; whether the prey can dash doubles the hit rate. A range limit on nets is
  not supported (it also lost on replays). Our rule already treats prey on cooldown as a sure target.
- 32 to 34 % of their nets are thrown on a turn the thrower dashed (ours 15 %), with the same hit rate as standing
  throws: the dash is used to bring prey into net range.
- We keep nets longer: 2.83 of our 4.52 nets come after turn 10, 1.53 of their 4.16. Nets that hit a decoy: 15 %
  against 10 %; nets at predators: 28 % against 21 %.
- After a net at free prey within the next three turns, a contact ends in a catch in 29 to 36 % of cases; without a
  net 11 to 20 %.

## 6. Nuance 4: defence is not where the gap is

- Per turn with a predator within 2600, our units are lost as rarely as theirs or more rarely at every distance
  (within 1000 and able to dash: 17 % lost within six turns, they 24 %).
- We are netted more often (1.57 times a game against 1.12) and survive it slightly more often (59 % caught within
  six turns against 66 %).
- A held unit that nets back on its next turn is caught in 31 to 39 % of cases; one that smokes in 56 to 65 %; one
  that does nothing in 65 to 70 %. Smoke after being netted is no better than nothing in any group. (This corrects
  the earlier figure of 70 % against 100 %, which rested on 10 and 19 cases.)
- Smoke on the unit itself, all groups together: no fewer losses than walking once the predator is beyond 1400
  (12 to 16 % against 9 to 16 %); under 1400 a few points fewer (16 to 22 % against 20 to 28 %).
- A net that hits the predator at under 1000 halves the losses (8 to 14 % against 20 to 28 %).

## 7. Smaller nuances

| Nuance | us | at 25 | Worth |
|---|---|---|---|
| Catches of prey held by the third team's net | 0.04 a game | 0.11 | 0.07 catches |
| Catches of free prey inside its own team's cloud | 0.42 | 0.52 | 0.10 catches |
| Smokes in turns 1-5 / after turn 30 | 1.69 / 0.68 | 0.86 / 1.28 | follows from the opening |
| Smoke centred over 1500 from the thrower | 0 % | 23 % (at 23: 39 %) | not understood yet |
| Pair hunting: conversion with a second unit within 3000 / alone | 20 % / 13 % | 29 % / 21 % | same lift for both: not a gap |
| Prey decoys walked into | 1.88 a game | 1.84 | not a gap |
| 3 units: catches | 1.88 | 1.93 | equal; their better rank there is the earlier first catch |

## 8. What this means for 25

- 25 means playing the lower field at about 1.64 mean rank. That needs about 0.7 more catches a game at the same
  losses. Everything measured says those catches are in contacts we already have.
- Order of the levers by measured size: pressing dashes (section 3), the first turn (section 4), earlier nets and
  nets carried by a dash (section 5). Defence, search and pair hunting are not gaps.
- Honest expectation: one switch will not close 0.36 of mean rank. If `vlive_press` wins its pairs, a plausible gain
  is a third of the gap (about 0.1 mean rank, a good point of rating); the opening is a second step of similar size.
  25 by the end of the last window is unlikely; 21 to 23 is the realistic range if both steps hold.

## 9. For the last window (adds to `tomorrow.md`)

1. Put `vlive_press` into the first round of the paired test, next to the live code, `vlive_net1`, `vlive_late`, `vgo_b`.
   Read `pfstats.py` also by "dashes per game" and "catches made with a dash": if press does not dash more against
   real opponents, the rule did not fire and the result says nothing.
2. If press and net1 both lead, the pair of them is the candidate for the second round (two switches, both with
   field evidence; build with both generators applied in turn).
3. Next rules to build, in this order, each behind a switch: (a) turn 1: a unit with prey within 2000 dashes at it
   and nets instead of smoking unless a predator is within 1000; (b) a held unit nets back whenever a predator is in
   reach, an unsure net before smoke; (c) target choice prefers prey on cooldown and prey held by anyone's net.
