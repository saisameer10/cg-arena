# usage: python pairfield.py <out-dir> <how-many-battles> <name=bot.java> [<name=bot.java> ...]
# Run it in the folder that holds battles_<submission>.json and games/ (written by arenafetch.py).
# Environment: PF_BATTLES = battle list to take seeds and opponents from (default: the newest battles_*.json),
# PF_UNTIL = HHMM local time after which no new game is started (default 2359), PF_SQUAD = our name in the lists.
# Paired test on the real field without "replay": for each of the newest finished battles of the live submission it takes
# the battle's seed and its two opponents and plays every bot given in seat 0 against them (ordinary test games).
# Stops starting games at 17:57 local time (play window). Writes <out-dir>/<name>_<game_id>.json.
import json,sys,os,subprocess,io,time,datetime,glob
API='https://www.codingame.com/api/v1'; CH='unleash-the-geek-2026-opp35'
tok=open(os.path.expanduser('~/.config/codingame/token')).read().strip()
out=sys.argv[1]; K=int(sys.argv[2]); bots=[a.split('=',1) for a in sys.argv[3:]]
os.makedirs(out,exist_ok=True)
def call(args):
    r=subprocess.run(['curl','-s','-m','90','-H','Authorization: Bearer '+tok]+args,capture_output=True)
    try: return json.loads(r.stdout.decode('utf-8'))
    except Exception: return {}
BF=os.environ.get('PF_BATTLES') or max(glob.glob('battles_4*.json'),key=os.path.getmtime)
UNTIL=os.environ.get('PF_UNTIL','2359'); SQUAD=os.environ.get('PF_SQUAD','The Final Boss')
print('battle list',BF,'until',UNTIL,flush=True)
bs=[b for b in json.load(open(BF)) if b.get('done')]
bs.sort(key=lambda b:-b['game_id'])
n=0
for b in bs:
    if n>=K: break
    fn='games/%s.json'%b['game_id']
    if not os.path.exists(fn): continue
    g=json.load(open(fn)); seed=g.get('game_options')
    opp=[p['agent_id'] for p in b['players'] if p['nickname']!=SQUAD]
    if len(opp)!=2 or not seed: continue
    ok=True
    for name,path in bots:
        if datetime.datetime.now().strftime('%H%M')>=UNTIL: print('time is up, stop'); sys.exit()
        o='%s/%s_%s.json'%(out,name,b['game_id'])
        if os.path.exists(o): continue
        body={'language':'Java','code':io.open(path,encoding='utf-8').read(),'opponents':opp,'game_options':seed}
        io.open('pf_body.json','w',encoding='utf-8').write(json.dumps(body))
        d=call(['-X','POST',API+'/challenges/'+CH+'/test-games?wait=30&format=json','-H','Content-Type: application/json','--data-binary','@pf_body.json'])
        while d.get('status') not in ('done','failed') and d.get('test_game_id'):
            d=call([API+'/test-games/%s?wait=30&format=json'%d['test_game_id']])
        json.dump(d,open(o,'w'))
        if 'log' not in d:
            print(name,b['game_id'],'no game:',d.get('code'),str(d.get('detail',''))[:120],flush=True); ok=False; break
        lg=d['log']; print(name,b['game_id'],seed,'scores',lg['scores'],'ranking',lg['ranking'],flush=True)
    if ok: n+=1
