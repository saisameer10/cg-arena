# Sub-versions tested on the local referee (2026-11-18 afternoon)

Test bed of the battle-autopsy session. Nothing here was submitted or played through the CodinGame API.
Verdicts from real Gold battles are in `log.md` and `gold.md` (testing session); where one exists it overrules this file.

## The test bed

- `versions/vs0.java` = v11 (v10 with tunable numbers) + 14 switches, all off, so it plays exactly like v10.
- `versions/vs1.java`, `vs2.java`, `vs3.java` = vs0 with a bundle switched on (see the end).
- Tempo switches (`F_SPREAD`, `F_NET23`, `F_DASH25`, `F_PRESS`) are in the scratch source `E:/cg-tmp/tcf/sub/s2/Player.java`
  (vs0 + 4 switches); they are not in `versions/` yet.
- Build a variant: `bash tools/variant.sh versions/vs0.java <out-dir> F_NAME=true P_NAME=value`.
- Logs: `E:/cg-tmp/tcf/sub/pools1.log` to `pools5.log`. Generators: `mks1.py`, `mks2.py`, `mks3.py` in the same folder.

| Switch or number | What it does when on |
|---|---|
| `F_CLOUDPLAN` | a unit in our cloud with no predator within 1,800 is pushed to leave it |
| `F_SMOKEMID` | cloud centred between the thrower and the predator |
| `P_SMOKE_AHEAD` (900) | how far ahead of its own move the thrower puts the cloud; 0 = on itself |
| `P_SMOKE_D` (2300) | smoke when a predator with a clear line is within this distance |
| `F_NOSMOKE3` | no smoke on turns 1 to 3 unless the predator is inside 1,500 |
| `F_NEARNOSMOKE` | no smoke when the predator is already inside 800 |
| `F_HELDNET` | a held unit nets the nearest hunter at once, sure aim or not |
| `F_HELDDECOY` | a held unit sends a decoy before it smokes |
| `F_NETFIRST` | net the hunter that was within 1,500 before our move |
| `F_FORGET` | forget a remembered prey position after 8 turns |
| `F_EARLYAGG` | until turn 10: less distance kept from predators, smoke only inside 1,500, bolder approach dash |
| `F_HIDETREE` | nothing left to catch: stand behind the nearest tree |
| `F_GHOSTMAP` | ghosts without a target search the map |
| `F_FINISHER`, `P_FINISH` | net at free prey only if one of our hunters ends within `P_FINISH` of it |
| `F_CLOUDMEM` | while a unit of ours is in a cloud, predators seen up to 9 turns ago stay in the threat model |
| `F_T1` | turn 1: predator start inside 2,000 -> dash away; smoke if inside 1,500, or inside 2,000 with a clear line |

## Results

Mean rank, lower is better. 288 games per version per pool unless stated; one standard error is about 0.05.
"base" is v10 unchanged in the same pool.

| Pool (members) | Variant | Mean rank | base | Reading |
|---|---|---|---|---|
| S1 (base + 4 variants) | leave the cloud | 1.99 | 2.05 | no effect |
| | cloud between us and the predator | 2.06 | 2.05 | no effect; 2.46 units lost against 2.26 |
| | smoke inside 1,500 | 1.88 | 2.05 | see "smoke distance" |
| | smoke inside 1,800 | 1.88 | 2.05 | see "smoke distance" |
| S2 (base + 4 variants) | no smoke on turns 1 to 3 | 1.94 | 1.96 | no effect |
| | no smoke inside 800 | 1.96 | 1.96 | no effect |
| | cloud on the thrower | 1.97 | 1.96 | no effect |
| | early aggression | 2.07 | 1.96 | worse |
| S3 (base + 4 variants) | held unit nets at once | 1.96 | 1.93 | no effect |
| | held unit: decoy before smoke | 2.04 | 1.93 | worse |
| | net the hunter before fleeing | 1.92 | 1.93 | no effect |
| | forget prey after 8 turns | 1.94 | 1.93 | no effect |
| S4 (base, 2 variants, v5, v1) | hide behind a tree | 1.88 | 1.88 | no effect |
| | ghosts search the map | 1.93 | 1.88 | no effect |
| | v5 / v1 | 2.10 / 2.17 | 1.88 | v10 ahead of both |
| A1 (base + 4 variants) | net only with a finisher within 800 | 2.00 | 1.95 | no effect |
| | ... within 1,000 | 2.02 | 1.95 | no effect; catches by turn 20 0.78 against 0.98 |
| | ... within 1,300 | 1.87 | 1.95 | no effect |
| | cloud memory | 2.10 | 1.95 | worse |
| A2 (base, 3 variants, v5) | turn-1 rule | 1.99 | 1.84 | worse |
| | turn-1 rule + smoke inside 1,800 | 2.18 | 1.84 | worse |

Smoke distance, in four pools:

| Pool (members) | Games per version | 1,200 | 1,500 | 1,800 | 2,000 | 2,300 (v10) |
|---|---|---|---|---|---|---|
| S1 (base + cloud, mid, 1,500, 1,800) | 288 | | 1.88 | 1.88 | | 2.05 |
| C1 (five smoke distances only) | 576 | 2.05 | 2.03 | 1.99 | 1.93 | 1.98 |
| A2 (base, turn-1 variants, 1,800, v5) | 288 | | | 2.21 | | 1.84 |
| C3 (base, 1,500, 1,800, v1, v5) | 288 | | 2.12 | 2.07 | | 1.73 |
| Real Gold battles (testing session, 36 replays) | | | | 2.06 | | 1.83 |

Combination pool C2 (members: 1,800 alone and four combinations on it; 288 each): 1,800 + leave cloud 2.02,
+ forget 2.05, + no smoke on turns 1 to 3 2.02, all four + net-first 1.87, against 1.97 for 1,800 alone. Not followed
up, because 1,800 itself was rejected on real battles.

## What this says

1. No sub-version is a proven improvement over v10.
2. Later smoke is rejected: worse on real battles and in both pools that contained older versions.
3. Clear local losers: early aggression as a bundle, decoy from a held unit, cloud memory, the turn-1 rule.
4. **The local referee is not a ranking tool at this effect size.** The same change (smoke inside 1,800) was 0.17
   better, level, 0.34 worse and 0.37 worse in four pools; v5 beat v10 in one pool and lost to it in another. The two
   pools that agreed with the real battles were the ones with v1 and v5 as fixed members. Use pools with fixed,
   different opponents, read them only as "clear loser or not", and let replays of real Gold battles decide.
5. Testing 14 variants at 288 games each makes one false "winner" likely; the first smoke result was that.

## Bundles handed to the testing session

| File | Switches on | Local check | State |
|---|---|---|---|
| `vs1.java` | finisher 1,000 + cloud memory + turn-1 rule | 60 games: 2.03 against v10 1.85 | not replayed (two of its three parts lost locally) |
| `vs2.java` | finisher 1,300 + turn-1 rule | 60 games: 2.20 against v10 1.95 | not replayed |
| `vs3.java` | finisher 1,300 | pool A1: 1.87 against 1.95 | queued behind the testing session's `vs4` |

The evidence behind each idea from the Gold logs is in `reports/Gold league improvement evidence.md`
(notes in `research_notes/Gold league improvement evidence/`).

## Tempo switches (added 15:30 IST; source `versions/vs-tempo.java` = vs0 + 4 switches, all off)

Ideas from the tempo research note: do more early, instead of restricting. Pools with v1 and v5 as fixed members.

| Pool | Variant | Mean rank | base |
|---|---|---|---|
| P1 (288 each) | `F_SPREAD`: one hunter per prey first, until turn 6 | 1.96 | 1.95 |
| | `F_NET23`: net any visible prey on turns 2 and 3 | 1.95 | 1.95 (identical games: v10 already throws these nets) |
| P2 (288 each) | `F_DASH25`: dash at prey 1,000 to 2,500 away in turns 2 to 5 | 1.96 | 2.02 |
| | `F_PRESS`: prey not on the predator's side: keep less distance | 2.04 | 2.02 |
| P3 (270 each) | all four together | 1.97 | 1.90 |

No effect from any of them, alone or together. In these three pools v10 stayed ahead of v1 (2.05 to 2.10) and of
v5 in two of three (2.08, 1.87, 2.01).

## Commit to netted prey (`versions/vs-commit.java` = vs0 + `F_COMMIT=true`, `P_COMMIT_SLACK=300`)

Asked for by the analysis session: of 70 net hits on prey in 39 debug replays of v10, 18 were not converted, 7 of
them because our nearest unit (1,100 to 1,800 from the held prey) turned away from a predator it only remembered.
With the switch on, a free unit that can reach held prey in time (distance - 440 <= 600 x turns held + 300, +600 if
its dash is ready) scores its moves only on predators in sight this turn (the hard "cannot be touched" rule), on
the pull to the prey and on the catch itself; remembered predators, soft distance, two-turn margin, net line, wall,
chase lookahead and ways-out count are dropped for it. Its moves are tagged COMMIT in the log.
Local check only: compiles, 60 games on one thread with no crash (1.95 against v10 2.00 and v5 2.02; too few to
judge). To be judged on replays of real Gold battles by the share of net hits that become a catch (v10: 74 %).
