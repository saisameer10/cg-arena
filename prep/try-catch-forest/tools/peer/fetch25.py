# downloads game logs of teams ranked 30 to 70 (rating about 25) against opponents ranked beyond 100
import json,os,subprocess,time
API='https://www.codingame.com/api/v1'; CH='unleash-the-geek-2026-opp35'
tok=open(os.path.expanduser('~/.config/codingame/token')).read().strip()
def api(p):
    r=subprocess.run(['curl','-s','-m','40','-H','Authorization: Bearer '+tok,API+p],capture_output=True)
    try: return json.loads(r.stdout.decode('utf-8'))
    except Exception: return {}
rows=[]
for off in (0,100,200,300,400):
    rows+=api('/challenges/%s/leaderboard?limit=100&offset=%d'%(CH,off)).get('rows',[]); time.sleep(0.6)
json.dump(rows,open('lb.json','w'))
rank={r['agent_id']:r['rank'] for r in rows}
print('rows',len(rows),'rating at rank 30/50/70/100:',[round([x['score'] for x in rows if x['rank']==k][0],2) for k in (30,50,70,100)],flush=True)
targets=[r for r in rows if 30<=r['rank']<=70]
idx={}; n=0
for r in targets:
    p=subprocess.run(['curl','-s','-m','40','-X','POST','https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId','-H','Content-Type: application/json;charset=UTF-8','-d',json.dumps([r['agent_id'],None])],capture_output=True)
    try: bs=json.loads(p.stdout.decode('utf-8'))
    except Exception: bs=[]
    time.sleep(0.7); k=0; tot=0
    for b in bs:
        ps=b.get('players') or []
        if len(ps)!=3 or not b.get('done'): continue
        tot+=1
        opp=[rank.get(q.get('playerAgentId')) for q in ps if q.get('playerAgentId')!=r['agent_id']]
        if any(o is None or o<=100 for o in opp) or k>=45: continue
        gid=b['gameId']; fn='games/%s.json'%gid; idx[str(gid)]=r['agent_id']; k+=1
        if os.path.exists(fn): continue
        g=subprocess.run(['curl','-s','-m','40','-H','Authorization: Bearer '+tok,API+'/games/%s?format=json'%gid],capture_output=True)
        try:
            j=json.loads(g.stdout.decode('utf-8'))
            if 'frames' in j: json.dump(j,open(fn,'w')); n+=1
        except Exception: pass
        time.sleep(0.55)
    print(r['rank'],'%.2f'%r['score'],'battles',tot,'used',k,flush=True)
    json.dump(idx,open('peer_index.json','w'))
print('downloaded',n,'index',len(idx))
