# tracks the hybrid's arena games by units per team (4 units = leader mimic, otherwise v10)
import sys,subprocess,json
sys.path.insert(0,'E:/New folder/prep/try-catch-forest/tools')
import arena,whylost
SUB=sys.argv[1] if len(sys.argv)>1 else '41747326'
subprocess.run([sys.executable,'fetch.py',SUB],capture_output=True)
rows=[whylost.facts(*x) for x in arena.load('.','battles_%s.json'%SUB)]
def line(name,q):
    n=len(q)
    if not n: return '%-16s no games yet'%name
    return '%-16s games %2d  first %2d second %2d last %2d  mean rank %.2f  catches %.2f  lost %.2f  no catch by turn 15: %d'%(name,n,sum(r['rank']==1 for r in q),sum(r['rank']==2 for r in q),sum(r['rank']==3 for r in q),sum(r['rank'] for r in q)/n,sum(len(r['c']) for r in q)/n,sum(len(r['lost']) for r in q)/n,sum(1 for r in q if not r['c'] or r['c'][0]>15))
print(line('4 units (mimic)',[r for r in rows if r['N']==4]))
print(line('3, 5, 6 (v10)',[r for r in rows if r['N']!=4]))
print(line('all',rows))
for N in (3,5,6): print(line('  %d units'%N,[r for r in rows if r['N']==N]))
