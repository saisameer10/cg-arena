# One engine, three rule books. versions/vmimic2.java (Les Gens Bons) is the master file: its engine is copied and
# the rule-book constants are replaced by the values below, each with its evidence as the comment.
#   python mimic_teams.py            writes versions/vmimic.java (ATI x iHot) and versions/vmimic3.java (FullStuck)
# Evidence comes from tools/mimic_measure.py, mimic_measure2.py and the fingerprints (kb/mimic.md). "n =" = cases.
import io, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(HERE, '..', 'versions')

ATI = {
    'file': 'vmimic.java',
    'head': ' * Try Catch Forest (Unleash the Geek 2026): MIMIC of the squad "ATI x iHot" (player ultimateraman, agent 6900145).\n'
            ' * Rank and sample: first of Gold on 2026-11-18 at 14:14 IST (rating 27.47, 55 % of its placement games played); 110 games of agent 6900145 studied.\n',
    'book': 'ATI x iHot, agent 6900145, 110 games',
    'TEAM': ('"ATI x iHot"', ''),
    'P_THREAT': (2200, 'flee from a predator in sight nearer than this. Turn 7+: moving away (within 60 deg) 65-79 % under 1600, 62-69 % at 1600-2000, 46-52 % at 2000-2600, 23-26 % beyond 3500 (n = 9,000)'),
    'P_THREAT_T1': (2600, 'turn 1: dash 92 / 97 / 91 % and smoke 81 / 89 / 86 % with a predator start under 1500 / 2000 / 2500; 68 % and 12 % at 2500-3500 (n = 312)'),
    'P_FLEE_MOVE_T1': (1500, 'turn 1: a threatened unit moves away only if the predator is nearer than this, else it heads at prey (and still dashes and smokes): away 66 % under 1500, 39 % at 1500-2000, 44 % at 2000-2500, where 75 % and 65 % head at the nearest prey (n = 207)'),
    'P_FLEE_PREY_W': (0.35, 'a fleeing unit leans towards the nearest prey it knows: median angle off "straight away" 31 deg (n = 1,425), 40 deg near the wall. The weight is fitted'),
    'P_ATTACK': (1600, 'a prey in sight nearer than this is attacked even with a predator near: heading at the prey 79-92 % with prey under 1600 whatever the predator distance, 42-68 % at 1600-2200 (n = 2,400)'),
    'P_ATTACK_MEMORY': (2, 'turns a prey out of sight is still attacked at its last position. ASSUMPTION: its own smoke blinds the unit on turns 2 and 3, yet 41-65 % head at the nearest prey on turn 2 and 0.89 catches come by turn 10'),
    'F_SYM_THREAT': ('true', 'turn 1: react to predators known only through the 120-degree symmetry. Yes: 91-97 % of the units with a predator start under 2500 dash; trees would hide a part of them'),
    'F_SYM_ATTACK': ('true', 'turn 1: dash at prey known only through the symmetry. Yes: predator far, dash 83-94 % with a prey start under 2200, 57 % at 2200-3500 (n = 165)'),
    'P_T1_SIGHT': (0, 'not used: the symmetry gives every start position'),
    'F_SYM_SEEK': ('true', 'walk at prey start positions known through the symmetry: 77-80 % of the units with no predator near head at the nearest prey on turn 1 (n = 286)'),
    'P_HUNT_LEAD': (1.0, 'hunters aim at prey position + this x its last move. Median angle off position + move 10 deg, off the position 13 deg (n = 5,800)'),
    'P_ADASH': (1700, 'ATTACK: dash at a free prey in sight nearer than this. Dash share when ready, no predator near: 46-66 % at 600-1600, 23 % at 1600-2200, 2 % with nobody near (n = 1,900)'),
    'P_ADASH_HELD': (1800, 'ATTACK: dash at a held prey between walking reach (1040) and this: 32-50 % at 600-1600, 12 % under 600 (n = 108, weak)'),
    'P_FDASH': (1700, 'FLEE: dash when the predator in sight is nearer than this: 80 / 75 / 52 % under 800 / 1200 / 1600 from a predator without dash, 26 / 50 / 50 % from one with, 21-37 % at 1600-2000, 4 % beyond (n = 1,600)'),
    'P_FDASH_T1': (2600, 'FLEE on turn 1: 92 / 97 / 91 % with a predator start under 1500 / 2000 / 2500, 68 % at 2500-3500 (n = 312)'),
    'P_T1_DASH_SHARE': (1.0, 'every unit the rules ask to dash on turn 1 dashes (91-97 %)'),
    'F_FDASH_NEEDS_PRED_DASH': ('false', 'FLEE dash only from a predator whose dash is ready. No: see P_FDASH'),
    'P_TDASH': (2500, 'HUNT: early dashes are spent to travel to a prey nearer than this. Turn 1 with the predator beyond 2500: 94 % with a prey start at 1600-2200, 57 % at 2200-3500; 46 % of the units with nobody under 3500'),
    'P_TDASH_MAX_MADE': (1, '... while the unit has made at most this many dashes. Dashes per game by turn: 3.16 / 0.13 / 1.27 / 0.48 / 0.45 / 0.77 on turns 1-6: again on turn 3, when the first cooldown ends; 33 % of the units with nobody near dash on turn 3 (n = 121)'),
    'F_TDASH_UNSEEN': ('true', '... also at a prey that is remembered but not in sight (the turn-3 dash with nobody near)'),
    'P_NET_D_NODASH': (1600, 'net at a free prey in sight whose dash is on cooldown when OUR move ends nearer than this to it: thrown on 11 / 16 / 13 / 5 / 0 % of the unit-turns at 0-600 / 1000 / 1300 / 1600 / 2000 while nets are left (n = 1,580)'),
    'P_NET_D_READY': (1100, 'same for a prey that can dash: 6 / 9 / 5 / 6 / 0 % (n = 1,970): half as often'),
    'P_NET_MIN_D': (0, 'no lower limit: 11 % under 600'),
    'P_NET_EVERY': (7, 'turns the team waits between two nets at prey. FITTED, not recovered: the nets come on about one fitting unit-turn in ten, median net turn 17, 0.90 / 1.42 / 1.81 nets per game in turns 1-5 / 6-20 / 21-100'),
    'P_NET_D_T1': (0, 'no net on turn 1: 0 of 146 units with a prey start under 2000'),
    'F_NET_ONE_PER_PREY': ('true', 'only one unit nets a given prey on a turn. ASSUMPTION (nets are scarce: 0.90 in turns 1-5)'),
    'F_NET_HELD_PREY': ('false', 'net at a prey that is already held. No: 0-1 % (n = 211)'),
    'P_NET_LEAD': (0.7, 'aim at prey position + this x its last move. Median 0.42, least squares 0.27 over 232 nets; 43 % of the aim lines pass within 60 of position + last move, 32 % within 60 of the position'),
    'F_NET_FULL_RANGE': ('false', 'the aim point is the target itself, not 2000 out: aim distance 1076 / 1359 / 1697 (quartiles), 14 % at full range (n = 166)'),
    'P_NET_OVER': (400, 'the aim point lies this far beyond the expected position of the target: aim distance 1359 against 956 from thrower to target after the moves (medians, n = 166)'),
    'P_NETP_HELD_NODASH': (1200, 'a HELD unit nets a predator without dash nearer than this: 18 % at 800-1200 (n = 22, weak)'),
    'P_NETP_HELD_READY': (1600, 'a held unit nets a predator that can dash nearer than this: 7-12 % at 800-1600 (n = 41, weak)'),
    'P_NETP_NODASH': (1600, 'a free unit nets a predator without dash nearer than this: 19 / 17 / 13 % under 800 / 1200 / 1600, 2 % beyond (n = 599)'),
    'P_NETP_READY': (1400, 'a free unit nets a predator that can dash nearer than this: 6 / 17 / 5 % under 800 / 1200 / 1600 (n = 395). 36 % of all nets go at predators, from 802 (median, after the moves)'),
    'P_NETP_EVERY': (0, 'turns the team waits between two nets at predators. FITTED on nets per game and the share at predators (36 %)'),
    'P_DECOY_D': (2000, 'a FLEEING unit sends a decoy when the predator in sight is nearer than this: 5-11 % of the unit-turns under 2000 after turn 20, 1 % at 2000-2600 (n = 6,000)'),
    'P_DECOY_GAP': (3, 'a unit that walks waits this many turns after its last decoy. FITTED on decoys per game (0.05 / 0.55 / 2.95 by phase); 15-60 % send one while an earlier one is alive (n = 479)'),
    'F_DECOY_IN_ATTACK': ('false', 'only when fleeing (ASSUMPTION)'),
    'F_DECOY_ONE_ALIVE': ('false', 'wait until the last decoy of the unit is gone. No: see P_DECOY_GAP'),
    'P_DECOY_ANGLE': (86, 'the decoy target is this many degrees off the unit own order: 86 for 360 of 360'),
    'P_DECOY_LEN': (2400, '... and this far from the unit: 2400 for 390 of 391'),
    'F_DECOY_REL_MOVE': ('true', 'the angle is measured from the unit own order, not from the escape line (angle to the predator 55 / 92 / 121, quartiles: no link)'),
    'F_DECOY_NEEDS_NO_SMOKE': ('true', 'decoys only once the smoke is used up. ASSUMPTION from the phases: smokes 2.33 / 1.27 / 0.82 per game, decoys 0.05 / 0.55 / 2.95'),
    'F_DECOY_OPPOSITE_SIDE': ('true', 'not used with F_DECOY_REL_MOVE (the side is the one nearer to the centre: ASSUMPTION, 51 % measured)'),
    'P_DECOY_HELD_D': (0, 'held units send no decoy: 5-7 % per held turn (n = 410)'),
    'P_SMOKE_D': (2000, 'a threatened unit that DASHES throws smoke when the predator in sight is nearer than this: 69 / 75 / 80 / 61 % under 800 / 1200 / 1600 / 2000 while smoke is left (n = 229), 7-12 % when it walks'),
    'P_SMOKE_D_T1': (2600, 'same on turn 1: 81 / 89 / 86 % with a predator start under 1500 / 2000 / 2500, 12 % at 2500-3500 (n = 312). 2.33 smokes per game in turns 1-5'),
    'F_SMOKE_IN_ATTACK': ('true', 'also when the unit attacks prey with the predator near: turn 1 with prey and predator both under 2000: 98 % dash, 88 % use a power (n = 60)'),
    'F_SMOKE_ONLY_ON_COOLDOWN': ('false', 'not this team: 18-29 % with the dash ready, 7-17 % on cooldown'),
    'F_SMOKE_WITH_FLEE_DASH': ('true', 'smoke goes with the dash: 99 % of 189 turn-1 smokes and 69 % of 297 later ones on a turn with a dash'),
    'P_SMOKE_FRAC': (1.0, 'where the cloud goes: this share of the way from the unit (after its move) to the predator. At the predator: 9-11 deg off its direction (median), cloud centre 400-550 from it after the moves (n = 482)'),
    'P_SMOKE_MAX': (1800, '... but at most this far: throw distance 1355 / 1618 / 1800 (quartiles), never more'),
    'P_SMOKE_HELD_D': (0, 'held units: 4 % on the first held turn (n = 243)'),
    'F_SMOKE_AFTER_DECOY': ('false', 'smoke first (decoys only when no smoke is left)'),
    'P_GHOST': (1, '1 = walk onto the nearest living prey: 36 % of ghost orders end within 1000 of one, 11 % of a predator, 21 % of a team mate (n = 15,505)'),
    'F_GHOST_DASH': ('false', 'ghosts never dash: 0 in 110 games'),
    'P_GHOST_STOP': (0, 'ghosts keep ordering: 13 % of ghost turns without order'),
    'F_GHOST_EXPLORE': ('true', 'a ghost with no prey to go to keeps moving: 13 % of ghost turns have no order (n = 17,784)'),
}

FS = {
    'file': 'vmimic3.java',
    'head': ' * Try Catch Forest (Unleash the Geek 2026): MIMIC of the squad "FullStuck" (player MatthCrouzet, agent 6893977).\n'
            ' * Rank and sample: second of Gold on 2026-11-18 at 13:28 IST (rating 24.47, all placement games played); 264 games of agent 6893977 studied.\n',
    'book': 'FullStuck, agent 6893977, 264 games',
    'TEAM': ('"FullStuck"', ''),
    'P_THREAT': (1800, 'flee from a predator in sight nearer than this. Turn 7+: moving away (within 60 deg) 68-82 % under 800, 60-76 % at 800-1200, 54-63 % at 1200-1600, 39-50 % at 1600-2000, 34-36 % at 2000-2600 (n = 14,000)'),
    'P_THREAT_T1': (2000, 'turn 1: decoy 54 / 84 / 54 % with a predator start at 800-1200 / 1600 / 2000, 0-1 % beyond 2000 (n = 500)'),
    'P_FLEE_MOVE_T1': (1500, 'turn 1: a threatened unit moves away only if the predator is nearer than this, else it heads at prey: away 73 % under 1500, 37 % at 1500-2000 where 60 % head at the nearest prey (n = 341)'),
    'P_FLEE_PREY_W': (0.35, 'a fleeing unit leans towards the nearest prey it knows: median angle off "straight away" 54 deg on turn 1 (n = 341), 32 deg later (n = 5,071). The weight is fitted'),
    'P_ATTACK': (1600, 'a prey in sight nearer than this is attacked even with a predator near: heading at the prey 53-66 % with prey under 1600 and a predator under 1200, 27-37 % with prey beyond 2200 (n = 3,500)'),
    'P_ATTACK_MEMORY': (0, 'prey out of sight is not attacked (no evidence either way)'),
    'F_SYM_THREAT': ('false', 'turn 1: react to predators known only through the symmetry. No: decoy 0-1 % with a predator start beyond 2000 (n = 750)'),
    'F_SYM_ATTACK': ('true', 'turn 1: dash at prey known only through the symmetry. Yes: predator far, dash 86 / 96 % with a prey start under 1000 / 1600 (n = 111): trees would hide a part of them'),
    'P_T1_SIGHT': (2000, 'turn 1: enemies within this distance and not behind a tree count as in sight'),
    'F_SYM_SEEK': ('true', 'walk at prey start positions known through the symmetry: 72-80 % of the units with no predator near head at the nearest prey on turn 1 (n = 817)'),
    'P_HUNT_LEAD': (0.0, 'hunters aim at prey position + this x its last move. Median angle off the position 16 deg, off position + move 17 deg (n = 9,897)'),
    'P_ADASH': (1600, 'ATTACK: dash at a free prey nearer than this. Turn 1: 86 / 96 % under 1000 / 1600, 27 % at 1600-2200, 0 % beyond (n = 668); later 42-54 % at 1000-1600 when ready (n = 2,100)'),
    'P_ADASH_HELD': (1700, 'ATTACK: dash at a held prey between walking reach (1040) and this: 38 % at 1300-1600 (n = 85); 75 % of the units under 1040 of a prey just netted dash (n = 56)'),
    'P_FDASH': (1200, 'FLEE: dash when the predator in sight is nearer than this and can dash: 70 / 49 / 9 % under 800 / 1200 / 1600 (n = 2,508)'),
    'P_FDASH_T1': (1500, 'FLEE on turn 1: 64 % with a predator start under 1500, 34 % at 1500-2000, 18 % at 2000-2500 (n = 490)'),
    'P_T1_DASH_SHARE': (1.0, 'no share rule: the turn-1 dash follows the distances (96 % at prey under 1600)'),
    'F_FDASH_NEEDS_PRED_DASH': ('true', 'FLEE dash only from a predator whose dash is ready: 70 / 49 % against 17 / 9 % from one without (n = 6,200)'),
    'P_TDASH': (1800, 'HUNT: the first dash of a unit is spent to travel to a prey in sight nearer than this: 24 % with no dash made at 1600-3000, 8-10 % afterwards (n = 7,200); turn 1: 27 % at 1600-2200, 0 % beyond'),
    'P_TDASH_MAX_MADE': (0, '... while the unit has made at most this many dashes'),
    'F_TDASH_UNSEEN': ('false', '... also at a prey that is not in sight. No: 0 % on turn 1 with prey beyond 2200 (n = 475)'),
    'P_NET_D_NODASH': (1300, 'net at a free prey in sight whose dash is on cooldown when OUR move ends nearer than this to it: thrown on 14 / 20 / 9 / 5 / 3 % of the unit-turns at 0-600 / 1000 / 1300 / 1600 / 2000 while nets are left (n = 2,446)'),
    'P_NET_D_READY': (1300, 'same for a prey that can dash: 14 / 17 / 10 / 7 / 2 % (n = 3,510); 22 / 38 / 15 % after a dash of ours'),
    'P_NET_MIN_D': (0, 'no lower limit after turn 1 (turn 1: 21 % under 600 against 67 % at 600-1000)'),
    'P_NET_EVERY': (4, 'turns the team waits between two nets at prey. FITTED, not recovered: median net turn 12, 1.19 / 1.08 / 1.34 nets per game in turns 1-5 / 6-20 / 21-100'),
    'P_NET_D_T1': (1100, 'same on turn 1: 67 / 60 / 40 / 9 % at 600-1000 / 1300 / 1600 / 2000 (n = 129)'),
    'F_NET_ONE_PER_PREY': ('true', 'only one unit nets a given prey on a turn. ASSUMPTION (1.19 nets in turns 1-5)'),
    'F_NET_HELD_PREY': ('false', 'net at a prey that is already held. No: 1-4 % (n = 848)'),
    'P_NET_LEAD': (0.4, 'aim at prey position + this x its last move. Median 0.39, least squares 0.35 over 604 nets'),
    'F_NET_FULL_RANGE': ('true', 'the aim point is 2000 from the thrower along the line: 86-88 % of 656 nets at prey'),
    'P_NET_OVER': (0, 'not used with full range'),
    'P_NETP_HELD_NODASH': (800, 'a HELD unit nets a predator without dash nearer than this: 10 % under 800 (n = 105)'),
    'P_NETP_HELD_READY': (1200, 'a held unit nets a predator that can dash nearer than this: 19 % at 800-1200, 6 % under 800 (n = 112)'),
    'P_NETP_NODASH': (0, 'a free unit does not net predators: 0-1 % (n = 2,274)'),
    'P_NETP_READY': (0, 'a free unit does not net predators: 0-1 % (n = 1,855). 6.8 % of all nets go at predators'),
    'P_NETP_EVERY': (0, 'no pause'),
    'P_DECOY_D': (2000, 'a FLEEING unit sends a decoy when the predator in sight is nearer than this: 21-36 % of the unit-turns under 2000 while decoys are left, 0-2 % beyond; turn 1: 54 / 84 / 54 % at 800-1200 / 1600 / 2000 (n = 2,600)'),
    'P_DECOY_GAP': (0, 'no gap of its own: see F_DECOY_ONE_ALIVE'),
    'F_DECOY_IN_ATTACK': ('true', 'also from a unit that attacks prey with the predator near: prey and predator both under 2000 on turn 1: decoy 30 %, net 39 % (n = 141)'),
    'F_DECOY_ONE_ALIVE': ('true', 'wait until the last decoy of the unit is gone (10 turns): 4-7 % with a decoy of its own alive against 21-36 % without (n = 4,600)'),
    'P_DECOY_ANGLE': (60, 'the decoy target is this many degrees off the line "straight away from the predator" ...'),
    'P_DECOY_LEN': (3000, '... and this far from the unit: along 1500, across 2598 for 1,115 of 1,115 decoys (angle to the predator 120)'),
    'F_DECOY_REL_MOVE': ('false', 'the angle is measured from the escape line'),
    'F_DECOY_NEEDS_NO_SMOKE': ('false', 'decoys from the start: 1.52 per game in turns 1-5'),
    'F_DECOY_OPPOSITE_SIDE': ('true', 'of the two sides the decoy takes the one the unit does not take: 93 % of 966'),
    'P_DECOY_HELD_D': (2300, 'a held unit sends one when a predator is nearer than this: 18-20 % per held turn at 1000-2300 while decoys are left (n = 324), 1 % under 1000'),
    'P_SMOKE_D': (1300, 'a fleeing unit that DASHES drops smoke when the predator in sight is nearer than this: 85 / 76 / 49 / 22 % under 800 / 1200 / 1600 / 2000 while smoke is left (n = 866), 2-3 % when it walks'),
    'P_SMOKE_D_T1': (1300, 'same on turn 1: 28 % with a predator start under 1500, 3 % at 1500-2000 (n = 341)'),
    'F_SMOKE_IN_ATTACK': ('false', 'only when fleeing (ASSUMPTION: 0-1 % with the predator beyond 2000)'),
    'F_SMOKE_ONLY_ON_COOLDOWN': ('false', 'not this team: 17-26 % with the dash ready under 1200, 7-9 % on cooldown'),
    'F_SMOKE_WITH_FLEE_DASH': ('true', 'smoke goes with the dash: 100 / 92 / 78 % of the smokes of turn 1 / 2-5 / 6+ on a turn with a dash (n = 859)'),
    'P_SMOKE_FRAC': (0, 'where the cloud goes: on the unit itself, where its dash ends: 859 of 859 within 1 of it'),
    'P_SMOKE_MAX': (1800, 'not used'),
    'P_SMOKE_HELD_D': (0, 'held units drop no smoke: 0-1 % (n = 1,456)'),
    'F_SMOKE_AFTER_DECOY': ('false', 'smoke first when both apply: decoy 11 % with the predator under 800 on turn 1 against 54-84 % farther out, smoke 28 %'),
    'P_GHOST': (1, '1 = walk onto the nearest living prey: 63 % of ghost orders end within 1000 of one, 6 % of a predator (n = 32,071)'),
    'F_GHOST_DASH': ('false', 'ghosts never dash: 0 in 264 games'),
    'P_GHOST_STOP': (300, 'a ghost nearer than this to its prey gives no order: 39 % of ghost turns without order while 63 % of the orders end within 1000 of a prey'),
    'F_GHOST_EXPLORE': ('false', 'a ghost with no prey to go to stands: 39 % of ghost turns have no order (n = 52,700)'),
}


def build(spec):
    s = io.open(os.path.join(V, 'vmimic2.java'), encoding='utf-8').read()
    m = re.search(r' \* Try Catch Forest \(Unleash the Geek 2026\): MIMIC of[^\n]*\n \* Rank and sample:[^\n]*\n', s)
    assert m, 'header'
    s = s[:m.start()] + spec['head'] + s[m.end():]
    m = re.search(r'    // RULE BOOK: [^\n]*', s)
    s = s[:m.start()] + '    // RULE BOOK: %s. "n =" is the number of cases.' % spec['book'] + s[m.end():]
    names = set(re.findall(r'^    static final \w+ ((?:P|F)_\w+) = ', s, re.M))
    for k, v in spec.items():
        if k in ('file', 'head', 'book'): continue
        m = re.search(r'^(    static final (\w+) ' + k + r' = )[^;]*;[^\n]*\n', s, re.M)
        assert m, k
        decl = m.group(1) + str(v[0]) + ';'
        s = s[:m.start()] + (decl.ljust(50) + '// ' + v[1] if v[1] else decl) + '\n' + s[m.end():]
        names.discard(k)
    left = sorted(names - {'P_PRED_MEMORY', 'P_PREY_MEMORY', 'P_WALL_R', 'P_WALL_W', 'P_ADASH_MIN'})
    assert not left, 'constants without a value for this team: %s' % left
    io.open(os.path.join(V, spec['file']), 'w', encoding='utf-8', newline='\n').write(s)
    print(spec['file'], len(s), 'characters')


if __name__ == '__main__':
    build(ATI); build(FS)
