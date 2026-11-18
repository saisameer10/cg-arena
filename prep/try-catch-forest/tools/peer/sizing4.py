import statistics as st
from sizing import peers, ours, mr
tot = len(ours); base = s1 = s2 = 0
for N in (3, 4, 5, 6):
    o = [r for r in ours if r['N'] == N]; p = [r for r in peers if r['N'] == N]
    of = [r for r in o if r['c15']]; os_ = [r for r in o if not r['c15']]; pf = [r for r in p if r['c15']]; ps = [r for r in p if not r['c15']]
    so = len(os_) / len(o); sp = len(ps) / len(p); w = len(o) / tot
    base += w * mr(o); s1 += w * ((1 - sp) * mr(of) + sp * mr(os_)); s2 += w * ((1 - sp) * mr(of) + sp * mr(ps))
    print('%d units: slow share we %2.0f%% they %2.0f%% | fast games rank we %.2f they %.2f | slow games rank we %.2f (n %d) they %.2f (n %d); slow: catches %.2f / %.2f, lost %.2f / %.2f, lost by 30 %.2f / %.2f' % (
        N, 100 * so, 100 * sp, mr(of), mr(pf), mr(os_), len(os_), mr(ps), len(ps), st.mean(r['catch'] for r in os_), st.mean(r['catch'] for r in ps), st.mean(r['lost'] for r in os_), st.mean(r['lost'] for r in ps),
        st.mean(r['l30'] for r in os_), st.mean(r['l30'] for r in ps)))
print('our mean rank %.3f | with their share of slow games at each unit count %.3f | and their rank in slow games %.3f' % (base, s1, s2))
