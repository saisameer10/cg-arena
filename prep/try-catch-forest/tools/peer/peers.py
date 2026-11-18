# How do teams rated about 23 score against the same kinds of opponents as we meet?  (reads only: leaderboard + battle lists)
import json,os,subprocess,sys,time,collections
API='https://www.codingame.com/api/v1'; CH='unleash-the-geek-2026-opp35'
tok=open(os.path.expanduser('~/.config/codingame/token')).read().strip()
def api(p):
    r=subprocess.run(['curl','-s','-m','40','-H','Authorization: Bearer '+tok,API+p],capture_output=True)
    try: return json.loads(r.stdout.decode('utf-8'))
    except Exception: return {}
def last_battles(agent):
    r=subprocess.run(['curl','-s','-m','40','-X','POST','https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId','-H','Content-Type: application/json;charset=UTF-8','-d',json.dumps([agent,None])],capture_output=True)
    try: return json.loads(r.stdout.decode('utf-8'))
    except Exception: return []
rows=[]
for off in (0,100,200,300,400):
    rows+=api('/challenges/%s/leaderboard?limit=100&offset=%d'%(CH,off)).get('rows',[]); time.sleep(0.6)
json.dump(rows,open('lb.json','w'))
rank={r['agent_id']:r['rank'] for r in rows}; score={r['rank']:r['score'] for r in rows}
print('leaderboard rows',len(rows),'| rating at rank 5/20/50/100/150/250: ',[round(score.get(k,0),1) for k in (5,20,50,100,150,250)])
me=[r for r in rows if r.get('me')]
targets=[r for r in rows if 35<=r['rank']<=64][::3]+me
agg=collections.defaultdict(lambda: collections.Counter())
for r in targets:
    bs=last_battles(r['agent_id']); time.sleep(0.7)
    grp='us' if r.get('me') else 'teams ranked 35 to 64'
    n=0
    for b in bs:
        ps=b.get('players') or []
        if len(ps)!=3 or not b.get('done'): continue
        mine=[p for p in ps if p.get('playerAgentId')==r['agent_id']]
        opp=[rank.get(p.get('playerAgentId')) for p in ps if p.get('playerAgentId')!=r['agent_id']]
        if not mine or any(o is None for o in opp): continue
        pos=mine[0].get('position'); 
        if pos is None: continue
        lo,hi=min(opp),max(opp)
        k='both top 100' if hi<=100 else 'one top 100' if lo<=100 else 'both 100-250' if hi<=250 else 'one beyond 250'
        c=agg[(grp,k)]; c['n']+=1; c['rank']+=pos+1; c['first']+=pos==0; c['last']+=pos==2; n+=1
        c2=agg[(grp,'all')]; c2['n']+=1; c2['rank']+=pos+1; c2['first']+=pos==0; c2['last']+=pos==2
    print(' %-22s rank %3d rating %.2f battles used %d'%(r['nickname'][:22],r['rank'],r['score'],n))
for grp in ('teams ranked 35 to 64','us'):
    for k in ('both top 100','one top 100','both 100-250','one beyond 250','all'):
        c=agg.get((grp,k))
        if c and c['n']: print('%-22s %-15s games %4d  mean rank %.2f  first %2d%%  last %2d%%'%(grp,k,c['n'],c['rank']/c['n'],100*c['first']/c['n'],100*c['last']/c['n']))
