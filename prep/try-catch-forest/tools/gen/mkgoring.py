# usage: python mkgoring.py   - builds versions/vgo_b_ring.java = vgo_b + the fix for the ring at 3,600
# (kb/log.md, "The ring at 3,600"). Same two switches as mkreach.py / mkv18.py, with vgo_b's own weights:
#   F_NOCLIFF  the chase forecast is a penalty from its cap instead of a bonus inside 3600 of a predator;
#   F_REACH    a unit hunting prey in sight within 2600 (and not walking to a hiding place) counts the forecast, the
#              net-line term and the wall term only for predators within 2500.
import io
V = 'E:/New folder/prep/try-catch-forest/versions/'
s = io.open(V + 'vgo_b.java', encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)


rep('    static boolean approachDash;',
    '    static final boolean F_NOCLIFF = true, F_REACH = true;   // tools/gen/mkgoring.py\n    static boolean reach;\n    static boolean approachDash;')
rep('if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * softK * P_NETLINE;',
    'if (!hidden && D < (reach ? 2500 : 2470 + (t.immob > 0 ? 0 : 600)) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * softK * P_NETLINE;')
rep('if (nearestTh < 4000) sc -= P_WALL * Math.max(0, hyp(px, py) - 6300);',
    'if (nearestTh < (reach ? 2500 : 4000)) sc -= P_WALL * Math.max(0, hyp(px, py) - 6300);')
rep('        if (nearestTh < 3600) {', '        if (nearestTh < (reach ? 2500 : 3600)) {')
rep('sc += softK * P_ROLL * Math.min(rm, 2600);', 'sc += softK * P_ROLL * (Math.min(rm, 2600) - (F_NOCLIFF ? 2600 : 0));')
rep('            double[] w = steer(u.x, u.y, gx, gy);',
    '            reach = F_REACH && hideGoal == null && target != null && target.vis && hyp(target.x - u.x, target.y - u.y) < 2600;\n            double[] w = steer(u.x, u.y, gx, gy);')
io.open(V + 'vgo_b_ring.java', 'w', encoding='utf-8', newline='\n').write(s)
print('vgo_b_ring written', len(s))
