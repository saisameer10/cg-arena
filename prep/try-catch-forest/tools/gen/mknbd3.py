# usage: python mknbd3.py   - versions/v18_2_cr_nbd3.java = v18_2_cr_netback (netback with every team size) + more decoys (F_DECOY_MORE, as in nd3)
#                              + F_DASH3: on turn 3 a unit that has dashed at most once may dash again at its target
#                                (in sight or known), when no predator is within 3000.
import os, sys
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'versions')
s = open(os.path.join(V, 'v18_2_cr_netback.java'), encoding='utf-8').read()
def rep(s, a, b):
    if s.count(a) != 1: sys.exit('anchor found %d times: %s' % (s.count(a), a[:60]))
    return s.replace(a, b)
s = rep(s, '    static final boolean F_NETSAVE = false;',
        '    static final boolean F_DECOY_MORE = true;   // a new decoy after 3 turns against a hunter inside 1800, after 5 turns inside 2900 (was 5 and 8)\n'
        '    static final boolean F_DASH3 = true;        // second dash on turn 3 at the target when no predator is within 3000\n'
        '    static final boolean F_NETSAVE = false;')
s = rep(s, 'turn - u.lastDecoy > (F_DECOY_ESCAPE && Dpre < 1800 ? 5 : 8) && Dpre < 2900',
        'turn - u.lastDecoy > (F_DECOY_MORE ? (Dpre < 1800 ? 3 : 5) : F_DECOY_ESCAPE && Dpre < 1800 ? 5 : 8) && Dpre < 2900')
s = rep(s, '            pressDash = false;',
        '            if (F_DASH3 && turn == 3 && target != null && u.cd == 0 && u.fat <= 2 && ntF > 3000 && hyp(target.x - u.x, target.y - u.y) > 1200) approachDash = true;\n'
        '            pressDash = false;')
open(os.path.join(V, 'v18_2_cr_nbd3.java'), 'w', encoding='utf-8', newline=chr(10)).write(s)
print('wrote v18_2_cr_nbd3')
