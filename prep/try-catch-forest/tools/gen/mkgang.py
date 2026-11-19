# usage: python mkgang.py   - builds versions/v18_2_gang.java and versions/v18_2_gangflank.java from versions/v18_2.java
# F_GANG:    every free unit that can reach netted prey before the hold ends goes for it (no cap of two, no load penalty),
#            and units sharing that netted prey are not pushed apart.
# F_NETMATE: a net at prey is preferred when a free team mate can reach the prey within the hold; a unit that is itself
#            held for two or more turns nets prey only then.
# F_FLANK:   the second hunter on a free prey in sight aims 800 beyond it, on the side away from the nearer hunter.
import os, sys
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'versions')
src = open(os.path.join(V, 'v18_2.java'), encoding='utf-8').read()

def rep(s, a, b):
    if s.count(a) != 1: sys.exit('anchor found %d times: %s' % (s.count(a), a[:70]))
    return s.replace(a, b)

def build(flank):
    s = src
    s = rep(s, '    static final boolean F_COMMIT = true;',
            '    static final boolean F_GANG = true;        // gang: all units that can reach netted prey in time go for it\n'
            '    static final boolean F_NETMATE = true;     // gang: nets at prey prefer a team mate able to finish\n'
            '    static final boolean F_FLANK = %s;       // gang: the second hunter aims beyond the prey\n'
            '    static final boolean F_COMMIT = true;' % ('true' if flank else 'false'))
    s = rep(s, 'int cd, fat = 1, immob;', 'int cd, fat = 1, immob; E tgt;')
    s = rep(s, '        // moves of the living units\n',
            '        for (E u : live) u.tgt = targetOf.get(u);\n'
            '        if (F_GANG) for (E u : live) {\n'
            '            if (u.immob > 0) continue;\n'
            '            E cur = targetOf.get(u); if (cur != null && holdLeft(cur) > 0) continue;\n'
            '            E gq = null; double gd = 1e18;\n'
            '            for (E q : cand) {\n'
            '                int gh = holdLeft(q); if (gh <= 0) continue;\n'
            '                double dq0 = hyp(q.x - u.x, q.y - u.y);\n'
            '                if (dq0 - CATCH > MOVE * gh + (u.cd == 0 ? 600 : 0)) continue;\n'
            '                if (dq0 < gd) { gd = dq0; gq = q; }\n'
            '            }\n'
            '            if (gq == null) continue;\n'
            '            if (cur != null && cur.vis && hyp(cur.x - u.x, cur.y - u.y) < gd) continue;   // its own prey is nearer and in sight\n'
            '            targetOf.put(u, gq); u.tgt = gq;\n'
            '        }\n'
            '        // moves of the living units\n')
    s = rep(s, 'for (E o : liveNow) if (o != u) sc -=',
            'for (E o : liveNow) if (o != u && !(F_GANG && target != null && o.tgt == target && holdLeft(target) > 0)) sc -=')
    s = rep(s, '                double l = hyp(gx, gy); if (l > R - UR) { gx *= (R - UR) / l; gy *= (R - UR) / l; }\n                wG = (holdLeft(target) > 0',
            '                if (F_FLANK && !held && target.vis && hyp(target.x - u.x, target.y - u.y) > 1000) {\n'
            '                    E lead = null; double ldist = hyp(target.x - u.x, target.y - u.y);\n'
            '                    for (E o : live) if (o != u && o.immob == 0 && o.tgt == target) { double od = hyp(target.x - o.x, target.y - o.y); if (od < ldist) { ldist = od; lead = o; } }\n'
            '                    if (lead != null && ldist > 1) { gx += (target.x - lead.x) / ldist * 800; gy += (target.y - lead.y) / ldist * 800; }\n'
            '                }\n'
            '                double l = hyp(gx, gy); if (l > R - UR) { gx *= (R - UR) / l; gy *= (R - UR) / l; }\n                wG = (holdLeft(target) > 0')
    s = rep(s, '                double cost = d + (sure ? 0 : 1500);\n',
            '                double cost = d + (sure ? 0 : 1500);\n'
            '                if (F_NETMATE) {\n'
            '                    boolean mate = false;\n'
            '                    for (E m : live) if (m != u && m.immob == 0 && hyp(qx - m.ex, qy - m.ey) - CATCH <= MOVE * 3 + (m.cd == 0 ? 600 : 0)) mate = true;\n'
            '                    if (u.immob > 1 && !mate) continue;\n'
            '                    if (mate) cost -= 800;\n'
            '                }\n')
    return s

for name, fl in (('v18_2_gang', False), ('v18_2_gangflank', True)):
    open(os.path.join(V, name + '.java'), 'w', encoding='utf-8', newline='\n').write(build(fl))
    print('wrote', name)
