# usage: python paircmp.py <rows_SUB.json> <dir-with-replays> <label>
# Compares the arena result of each battle with the replay of the same battle played by another version.
import json,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from seatstats import summ
rows={r['id']:r for r in json.load(open(sys.argv[1]))}
A=[];B=[]
for fn in sorted(os.listdir(sys.argv[2])):
    if not fn.endswith('.json'): continue
    gid=int(fn.split('.')[0])
    try: d=json.load(open(os.path.join(sys.argv[2],fn),encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d or gid not in rows: continue
    seat=[a['index'] for a in d['log']['agents'] if a.get('me')][0]
    b=summ(os.path.join(sys.argv[2],fn),seat); a=rows[gid]
    A.append(a); B.append(b)
    print('  %d seat %d N %d | arena v5: rank %d catches %d lost %d first %s | %s: rank %d catches %d lost %d first %s'%(gid,seat,a['N'],a['rank'],a['catches'],a['lost'],a['ct'][:1],sys.argv[3],b['rank'],b['catches'],b['lost'],b['turns'][:1]))
n=len(A)
if n:
    f=lambda q,k: sum(x[k] for x in q)/n
    by=lambda q,key,lim: sum(sum(1 for t in x[key] if t<=lim) for x in q)/n
    print('games',n)
    print('  v5 in the arena : wins %d second %d last %d mean rank %.2f catches %.2f lost %.2f catches by turn 10 %.2f by 20 %.2f'%(sum(x['rank']==1 for x in A),sum(x['rank']==2 for x in A),sum(x['rank']==3 for x in A),f(A,'rank'),f(A,'catches'),f(A,'lost'),by(A,'ct',10),by(A,'ct',20)))
    print('  %s replaying them: wins %d second %d last %d mean rank %.2f catches %.2f lost %.2f catches by turn 10 %.2f by 20 %.2f'%(sys.argv[3],sum(x['rank']==1 for x in B),sum(x['rank']==2 for x in B),sum(x['rank']==3 for x in B),f(B,'rank'),f(B,'catches'),f(B,'lost'),by(B,'turns',10),by(B,'turns',20)))
    print('  better rank in %d games, worse in %d, same in %d'%(sum(b['rank']<a['rank'] for a,b in zip(A,B)),sum(b['rank']>a['rank'] for a,b in zip(A,B)),sum(b['rank']==a['rank'] for a,b in zip(A,B))))
