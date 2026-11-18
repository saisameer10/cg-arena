import statistics as st
from sizing import peers, ours, mr
for name, rows in (('teams at 23', peers), ('us', ours)):
    for lab, q in (('catch by 15', [r for r in rows if r['c15']]), ('no catch by 15', [r for r in rows if not r['c15']])):
        print('%-12s %-15s n %3d rank %.2f first %2.0f%% last %2.0f%% | catches %.2f (by 30: %.2f) | lost %.2f (by 10: %.2f, by 30: %.2f, after 60: %.2f) | nets by 15: %.2f, hits %.2f | dashes/unit by 15: %.2f | smokes %.2f' % (
            name, lab, len(q), mr(q), 100 * st.mean(r['win'] for r in q), 100 * st.mean(r['lastp'] for r in q), st.mean(r['catch'] for r in q), st.mean(r['c30'] for r in q),
            st.mean(r['lost'] for r in q), st.mean(r['l10'] for r in q), st.mean(r['l30'] for r in q), st.mean(r['l60'] for r in q), st.mean(r['net15'] for r in q), st.mean(r['hit'] for r in q),
            sum(r['dash_t15'] for r in q) / max(1, sum(r['N'] for r in q)), st.mean(r['smoke'] for r in q)))
    q = [r for r in rows if not r['c15']]
    for N in (3, 4, 5, 6):
        z = [r for r in q if r['N'] == N]; a = [r for r in rows if r['N'] == N]
        if z: print('    %d units: no catch by 15 in %2.0f%% of games; those: rank %.2f, catches %.2f, lost %.2f' % (N, 100 * len(z) / len(a), mr(z), st.mean(r['catch'] for r in z), st.mean(r['lost'] for r in z)))
