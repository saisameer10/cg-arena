import json, os, statistics as st
from earlynets3 import nets, peers as PN, ours as ON
from sizing import peers, ours
# earlynets3 and sizing load games in the same order with the same filters
for name, S, Nn in (('teams at 23', peers, PN), ('us', ours, ON)):
    assert len(S) == len(Nn)
    for N in (3, 4, 5, 6):
        idx = [i for i, r in enumerate(S) if r['N'] == N]
        if not idx: continue
        def per(lo, hi):
            z = [r for i in idx for r in Nn[i] if lo <= r['t'] <= hi]
            return len(z) / len(idx), (100 * sum(1 for r in z if r['prey']) / len(z) if z else 0), sum(1 for r in z if r['conv']) / len(idx)
        a = per(1, 1); b = per(2, 3); c = per(4, 15)
        print('%-11s %d units (%3d games): pool nets used %.2f | turn 1: %.2f nets, %2.0f%% hit, %.2f catches | turns 2-3: %.2f, %2.0f%%, %.2f | turns 4-15: %.2f, %2.0f%%, %.2f | catches by 15: %.2f, of which after a net %.2f' % (
            name, N, len(idx), st.mean(S[i]['net'] for i in idx), a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], st.mean(S[i]['c15'] for i in idx), a[2] + b[2] + c[2]))
