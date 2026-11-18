# downloads game logs of teams ranked 95 to 130 against opponents ranked beyond 100 (the games comparable to ours)
import json,os,subprocess,time
API='https://www.codingame.com/api/v1'
tok=open(os.path.expanduser('~/.config/codingame/token')).read().strip()
rows=json.load(open('lb.json')); rank={r['agent_id']:r['rank'] for r in rows}
targets=[r for r in rows if 35<=r["rank"]<=64]
os.makedirs('games',exist_ok=True); idx={}; n=0
for r in targets:
    p=subprocess.run(['curl','-s','-m','40','-X','POST','https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId','-H','Content-Type: application/json;charset=UTF-8','-d',json.dumps([r['agent_id'],None])],capture_output=True)
    try: bs=json.loads(p.stdout.decode('utf-8'))
    except Exception: bs=[]
    time.sleep(0.7); k=0
    for b in bs:
        ps=b.get('players') or []
        if len(ps)!=3 or not b.get('done'): continue
        opp=[rank.get(q.get('playerAgentId')) for q in ps if q.get('playerAgentId')!=r['agent_id']]
        if any(o is None or o<=100 for o in opp) or k>=25: continue
        gid=b['gameId']; fn='games/%s.json'%gid; idx[str(gid)]=r['agent_id']; k+=1
        if os.path.exists(fn): continue
        g=subprocess.run(['curl','-s','-m','40','-H','Authorization: Bearer '+tok,API+'/games/%s?format=json'%gid],capture_output=True)
        try:
            j=json.loads(g.stdout.decode('utf-8'))
            if 'frames' in j: json.dump(j,open(fn,'w')); n+=1
        except Exception: pass
        time.sleep(0.55)
    print(r['nickname'],r['rank'],'games',k,flush=True)
json.dump(idx,open('peer25_index.json','w')); print('downloaded',n,'index',len(idx))
