# usage: python mkreach.py <base.java> <out.java> [nocliff] [reach] [netline]
# Three independent switches on any bot of the live family (vlive_41748059, vlive_t1, vlive_press, vlive_first,
# vlive_all3, vlive_combo ...). Evidence: kb/log.md, "The ring at 3,600".
#
# nocliff  F_NOCLIFF  The five-turn chase forecast was a BONUS (0 to +3900) that exists only within 3600 of a
#                     predator: a step that leaves the 3600 zone loses it. Units were held in a ring 3400 to 3600
#                     from the nearest predator (42 % of all hunting and searching steps ended there). Now the term
#                     is a penalty measured from its cap (0 when the forecast is safe), so it is continuous at 3600.
# reach    F_REACH    While a unit hunts prey that is in sight and within 2600, the forecast, the net-line term and
#                     the wall term count only predators within 2500 (the other session's vlive_reach). Needs
#                     nocliff: with the bonus form the ring would move to just inside 2500.
# netline  F_NETLINE  A net is aimed at full range. If a team mate stands on the line beyond the expected place of
#                     the prey, the aim stops 350 behind that place instead of flying on into the team mate.
import io, sys
src, out = sys.argv[1], sys.argv[2]; flags = set(sys.argv[3:])
assert flags <= {'nocliff', 'reach', 'netline'}, flags
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:60], s.count(a)); s = s.replace(a, b)


J = lambda f: 'true' if f in flags else 'false'
rep('    static boolean aggro;',
    '    static final boolean F_NOCLIFF = %s, F_REACH = %s, F_NETLINE = %s;\n    static boolean reach;                                // set per unit: it hunts prey in sight within 2600\n    static boolean aggro;' % (J('nocliff'), J('reach'), J('netline')))
# eval: zones
rep('if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * 400;',
    'if (!hidden && D < (reach ? 2500 : 2470 + (t.immob > 0 ? 0 : 600)) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * 400;')
rep('if (nearestTh < 4000) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);',
    'if (nearestTh < (reach ? 2500 : 4000)) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);')
rep('        if (nearestTh < 3600) {', '        if (nearestTh < (reach ? 2500 : 3600)) {')
rep('sc += 1.5 * Math.min(rm, 2600);', 'sc += 1.5 * (Math.min(rm, 2600) - (F_NOCLIFF ? 2600 : 0));')
# decide: the mode of this unit
rep('            double[] w = steer(u.x, u.y, gx, gy);',
    '            reach = F_REACH && fleeTo == null && target != null && target.vis && hyp(target.x - u.x, target.y - u.y) < 2600;\n            double[] w = steer(u.x, u.y, gx, gy);')
rep('threats = baseThreats; planFlee = false; planHunt = false; aggro = false;',
    'reach = false; threats = baseThreats; planFlee = false; planHunt = false; aggro = false;')
# nets
rep('    static String net(E u, double qx, double qy) {\n        double d = hyp(qx - u.ex, qy - u.ey);\n        double ax = u.ex + (qx - u.ex) / d * NET_RANGE, ay = u.ey + (qy - u.ey) / d * NET_RANGE;',
    '    static String net(E u, double qx, double qy) {\n        double d = hyp(qx - u.ex, qy - u.ey);\n        double len = NET_RANGE;\n'
    '        if (F_NETLINE && liveNow != null) { double fx = u.ex + (qx - u.ex) / d * NET_RANGE, fy = u.ey + (qy - u.ey) / d * NET_RANGE;\n'
    '            for (E f : liveNow) if (f != u && segDist(f.ex, f.ey, qx, qy, fx, fy) < 520) len = Math.min(NET_RANGE, d + 350); }\n'
    '        double ax = u.ex + (qx - u.ex) / d * len, ay = u.ey + (qy - u.ey) / d * len;')
io.open(out, 'w', encoding='utf-8', newline='\n').write(s)
print(out, sorted(flags), len(s), 'chars')
