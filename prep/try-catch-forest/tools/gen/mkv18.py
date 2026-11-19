# usage: python mkv18.py <base.java> <out.java> [ring] [press] [t1] [hnet] [combo] [no3net] [late]
# Carries the levers of the live family over to v18 (versions/v18_dl.java = v18_final, the user's defensive line).
# Each lever is the same text as in its own generator, with the anchors of v18 where they differ:
#   ring   F_NOCLIFF + F_REACH   mkreach.py   (kb/log.md, "The ring at 3,600"; v18 has the same forecast bonus)
#   press  F_PRESS               mkpress.py   (dashes spent on prey in sight)
#   t1     F_T1                  mkt1hnet.py  (turn 1: dash at prey and net it, no smoke unless a predator is close)
#   hnet   F_HNET                mkt1hnet.py  (a held unit nets back before it smokes)
#   combo  F_T1UNSEEN, F_NETEARLY  mkcombo.py (needs t1: turn-1 prey known from the rotation, capped early nets)
#   no3net (needs t1) no turn-1 net in 3-unit games (kb/findings.md 7: with 3 units a turn-1 net is worth 0.01 catches)
#   late   F_SCORELATE  from turn 60 the score against the predator team (its points = our units lost) scales the soft
#          threat terms: x0.5 for a hunter while that team is ahead of us (a unit lost changes no place), x1.5 for a unit
#          without prey in sight within 2600 while we lead it by one (kb/log.md, 19 Nov 10:30: 24 and 18 of 282 games)
import io, sys
src, out = sys.argv[1], sys.argv[2]; flags = sys.argv[3:]
assert set(flags) <= {'ring', 'press', 't1', 'hnet', 'combo', 'no3net', 'late', 'netback', 'decoy'}, flags
assert 'combo' not in flags or 't1' in flags
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)


RESET = "threats = baseThreats; planFlee = false; planHunt = false; aggro = false;"
if 'press' in flags:
    rep("    static boolean approachDash;",
        "    // ---- F_PRESS (tools/gen/mkpress.py): with the target in sight and a dash ready, a dash at it costs as little as an approach dash\n"
        "    static final boolean F_PRESS = true;\n"
        "    static final double P_PRESS_MIN = 1100, P_PRESS_MAX = 2100, P_PRESS_SAFE = 2500, P_PRESS_NEAR = 1400;\n"
        "    static final int P_PRESS_FAT = 6;         // no pressing dash beyond this fatigue before turn P_PRESS_LATE\n"
        "    static final int P_PRESS_LATE = 60;       // from here on an unused dash is worth nothing: no fatigue limit\n"
        "    static boolean pressDash;                 // set per unit\n"
        "    static boolean approachDash;")
    rep("u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n",
        "u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n"
        "            pressDash = false;\n"
        "            if (F_PRESS && target != null && target.vis && u.cd == 0 && holdLeft(target) == 0 && !planFlee\n"
        "                    && (u.fat <= P_PRESS_FAT || turn > P_PRESS_LATE)) {\n"
        "                double dT = hyp(target.x - u.x, target.y - u.y);\n"
        "                if (target.cd > 0) pressDash = dT <= (ntF > P_PRESS_SAFE ? P_PRESS_MAX : P_PRESS_NEAR);\n"
        "                else pressDash = dT >= P_PRESS_MIN && dT <= P_PRESS_MAX && ntF > P_PRESS_SAFE;\n"
        "            }\n")
    rep("(F_DASH && !(walkUnsafe || rush || preyNear || approachDash)))) break;",
        "(F_DASH && !(walkUnsafe || rush || preyNear || approachDash || pressDash)))) break;")
    rep("!(walkUnsafe || rush || approachDash || lastReward >= 300000 ||",
        "!(walkUnsafe || rush || approachDash || pressDash || lastReward >= 300000 ||")
    rep("sc -= approachDash ? 300 : 700 + 250 * u.fat;", "sc -= approachDash || pressDash ? 300 : 700 + 250 * u.fat;")
    rep(RESET, RESET + " pressDash = false;")
if 't1' in flags:
    rep("    static boolean approachDash;",
        "    // ---- F_T1 (tools/gen/mkt1hnet.py): turn 1: dash at prey in sight, net it, no smoke or decoy unless a predator is close\n"
        "    static final boolean F_T1 = true;\n"
        "    static final double P_T1_DASH = 2100, P_T1_NET = 2000, P_T1_SMOKE = 1000;\n"
        "    static final int[] P_T1_NETS = {0, 1, 1, 1, 1, 2, 2};   // nets spent on turn 1 at most, index = units per team\n"
        "    static int t1Nets = 0;\n"
        "    static boolean approachDash;")
    rep("u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n",
        "u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n"
        "            if (F_T1 && turn == 1 && target != null && target.vis && u.cd == 0 && ntF > P_T1_SMOKE\n"
        "                    && hyp(target.x - u.x, target.y - u.y) <= P_T1_DASH) approachDash = true;\n")
    rep("                if (turn == 1 && q.cd == 0) continue;",
        "                if (turn == 1 && q.cd == 0 && !(F_T1 && d <= P_T1_NET && t1Nets < P_T1_NETS[Math.min(6, N)])) continue;")
    rep("            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; }\n        }\n        // 2. nets at the hunter",
        "            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; if (turn == 1) t1Nets++; }\n        }\n        // 2. nets at the hunter")
    rep("            if (dn > 2300 || !(line || dn < 1600)) continue;\n",
        "            if (dn > 2300 || !(line || dn < 1600)) continue;\n"
        "            if (F_T1 && turn == 1 && dn > P_T1_SMOKE) continue;\n")
    rep("            if (near == null) continue;\n            boolean line = !treeBlocks(u.ex, u.ey, near.x, near.y, NET_TREE);\n",
        "            if (near == null) continue;\n"
        "            if (F_T1 && turn == 1 && Math.min(D, Dpre) > P_T1_SMOKE) continue;\n"
        "            boolean line = !treeBlocks(u.ex, u.ey, near.x, near.y, NET_TREE);\n")
if 'hnet' in flags:
    rep("    static boolean approachDash;",
        "    // ---- F_HNET (tools/gen/mkt1hnet.py): a held unit nets back first, also with an unsure aim\n"
        "    static final boolean F_HNET = true;\n"
        "    static final double P_HNET_FAR = 2100;\n"
        "    static boolean approachDash;")
    rep("            if (!sure && d <= 2000 && d < ud) { ud = d; ue = e; ux = qx; uy = qy; }",
        "            if (!sure && d <= (F_HNET ? P_HNET_FAR : 2000) && d < ud) { ud = d; ue = e; ux = qx; uy = qy; }")
    rep("        if (nets > 0 && be != null && !multi) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = \"HELDNET\"; return; }\n",
        "        if (nets > 0 && be != null && (!multi || F_HNET)) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = \"HELDNET\"; return; }\n"
        "        if (F_HNET && nets > 0 && ue != null) { out.add(net(u, ux, uy)); ue.netTargeted = true; u.tag = \"HELDNET\"; return; }\n")
if 'combo' in flags:
    rep("    static final boolean F_T1 = true;",
        "    // ---- combo additions (tools/gen/mkcombo.py)\n"
        "    static final boolean F_T1UNSEEN = true;    // turn 1: prey placed by the rotation counts for the dash and the net\n"
        "    static final boolean F_NETEARLY = true;    // turns 2 to P_NETEARLY: a net at prey in reach without a sure aim, capped\n"
        "    static final int P_NETEARLY = 5, P_NETEARLY_MAX = 2;\n"
        "    static int earlyNets = 0;\n"
        "    static final boolean F_T1 = true;")
    rep("P_T1_DASH = 2100,", "P_T1_DASH = 2700,")
    rep("target != null && target.vis && u.cd == 0 && ntF > P_T1_SMOKE", "target != null && (target.vis || (F_T1UNSEEN && target.seen == turn)) && u.cd == 0 && ntF > P_T1_SMOKE")
    rep("            for (E q : seenPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;",
        "            List<E> netPrey = seenPrey;\n"
        "            if (F_T1UNSEEN && turn == 1) {\n"
        "                netPrey = new ArrayList<>(seenPrey);\n"
        "                for (E t : tracks.values()) {\n"
        "                    if (t.owner != prey || t.vis || t.dead || t.seen != turn) continue;\n"
        "                    int j = t.id - prey * N; boolean gh = false;\n"
        "                    for (E m : mine) if (m.id - myId * N == j && m.ghost) gh = true;\n"
        "                    if (!gh) netPrey.add(t);\n"
        "                }\n"
        "            }\n"
        "            for (E q : netPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;")
    rep("if (!sure && (nets < 2 || !F_NETWIDE) && !(lastNet && F_NETWIDE)) continue;",
        "boolean earlyNet = F_NETEARLY && turn >= 2 && turn <= P_NETEARLY && earlyNets < P_NETEARLY_MAX && nets >= 2;\n"
        "                if (!sure && !earlyNet && (nets < 2 || !F_NETWIDE) && !(lastNet && F_NETWIDE)) continue;")
    rep("if (turn == 1) t1Nets++; }", "if (turn == 1) t1Nets++; else if (turn <= P_NETEARLY) earlyNets++; }")
if 'ring' in flags:
    rep('    static boolean aggro;',
        '    // ---- ring fix (tools/gen/mkreach.py): the chase forecast is a penalty from its cap, not a bonus inside 3600 of a predator;\n'
        '    //      a unit hunting prey in sight within 2600 counts the forecast, the net-line term and the wall term only within 2500\n'
        '    static final boolean F_NOCLIFF = true, F_REACH = true;\n    static boolean reach;\n    static boolean aggro;')
    rep('if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= soft * t.w * 400;',
        'if (!hidden && D < (reach ? 2500 : 2470 + (t.immob > 0 ? 0 : 600)) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= soft * t.w * 400;')
    rep('if (nearestTh < 4000) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);',
        'if (nearestTh < (reach ? 2500 : 4000)) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);')
    rep('        if (nearestTh < 3600) {', '        if (nearestTh < (reach ? 2500 : 3600)) {')
    rep('sc += 1.5 * Math.min(rm, 2600);', 'sc += 1.5 * (Math.min(rm, 2600) - (F_NOCLIFF ? 2600 : 0));')
    rep('            double[] w = steer(u.x, u.y, gx, gy);',
        '            reach = F_REACH && fleeTo == null && target != null && target.vis && hyp(target.x - u.x, target.y - u.y) < 2600;\n            double[] w = steer(u.x, u.y, gx, gy);')
    rep(RESET, "reach = false; " + RESET)
if 'netback' in flags:   # a free unit nets its hunter within 1500 first, as v18 did (kb/log.md 19 Nov 10:45: net 38 % caught, smoke 52 %)
    rep('static final boolean F_NETSAVE = true;', 'static final boolean F_NETSAVE = false;')
if 'decoy' in flags:     # more decoys: half of the pool (2 per unit) is unused at the end and a predator runs into 75 to 83 % of them
    rep('    static boolean aggro;',
        '    static final boolean F_DECOY_MORE = true;   // a new decoy after 3 turns against a hunter inside 1800, after 5 turns inside 2900 (was 5 and 8)\n    static boolean aggro;')
    rep('turn - u.lastDecoy > (F_DECOY_ESCAPE && Dpre < 1800 ? 5 : 8) && Dpre < 2900',
        'turn - u.lastDecoy > (F_DECOY_MORE ? (Dpre < 1800 ? 3 : 5) : F_DECOY_ESCAPE && Dpre < 1800 ? 5 : 8) && Dpre < 2900')
if 'no3net' in flags:
    rep("P_T1_NETS = {0, 1, 1, 1, 1, 2, 2};", "P_T1_NETS = {0, 1, 1, 0, 1, 2, 2};")
if 'late' in flags:
    rep('    static boolean aggro;',
        '    // ---- F_SCORELATE (tools/gen/mkv18.py): late in the game the score against the predator team scales the soft threat terms\n'
        '    static final boolean F_SCORELATE = true;\n    static final int P_LATE_T = 60;\n    static final double P_LATE_BEHIND = 0.5, P_LATE_AHEAD = 1.5;\n'
        '    static double lateSoft = 1.0;\n    static boolean aggro;')
    rep('double soft = commitNow && t.e.seen != turn ? 0.3 : 1.0;', 'double soft = (commitNow && t.e.seen != turn ? 0.3 : 1.0) * lateSoft;')
    rep('            double[] w = steer(u.x, u.y, gx, gy);',
        '            lateSoft = 1.0;\n'
        '            if (F_SCORELATE && turn >= P_LATE_T) {\n'
        '                int ps = 0; for (E m : mine) if (m.ghost) ps++;\n'
        '                boolean preyClose = target != null && target.vis && hyp(target.x - u.x, target.y - u.y) < 2600;\n'
        '                if (ps > myScore && fleeTo == null && target != null) lateSoft = P_LATE_BEHIND;\n'
        '                else if (myScore - ps == 1 && !preyClose) lateSoft = P_LATE_AHEAD;\n'
        '            }\n'
        '            double[] w = steer(u.x, u.y, gx, gy);')
    rep(RESET, "lateSoft = 1.0; " + RESET)
io.open(out, 'w', encoding='utf-8', newline='\n').write(s)
print(out, flags, len(s), 'chars')
