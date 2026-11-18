# usage: python fetch.py [submission_id ...]  - downloads the battle list and every finished game log (cached)
import json,sys,os,subprocess,time
API='https://www.codingame.com/api/v1'; CH='unleash-the-geek-2026-opp35'
tok=open(os.path.expanduser('~/.config/codingame/token')).read().strip()
def get(url):
    for k in range(4):
        r=subprocess.run(['curl','-s','-H','Authorization: Bearer '+tok,url],capture_output=True)
        try: d=json.loads(r.stdout.decode('utf-8'))
        except Exception: time.sleep(2); continue
        if d.get('status')==429: time.sleep(int(d.get('retry_after_seconds',10))+1); continue
        lim=d.get('limits',{}).get('requests',{})
        if lim and lim.get('remaining',99)<8: time.sleep(lim.get('resets_in_seconds',10)+1)
        return d
    return {}
os.makedirs('games',exist_ok=True)
subs=sys.argv[1:] or ['']
for s in subs:
    battles=[]; before=None
    while True:
        u='%s/challenges/%s/battles?limit=100'%(API,CH)+('&submission='+s if s else '')+('&before=%s'%before if before else '')
        d=get(u); bs=d.get('battles',[]); battles+=bs; before=d.get('next_before')
        if not before or not bs: break
    sid=s or str(d.get('submission_id'))
    json.dump(battles,open('battles_%s.json'%sid,'w'))
    done=[b for b in battles if b.get('done')]
    new=0
    for b in done:
        fn='games/%s.json'%b['game_id']
        if os.path.exists(fn): continue
        g=get('%s/games/%s?format=json'%(API,b['game_id']))
        if 'frames' in g: json.dump(g,open(fn,'w')); new+=1
    print('submission',sid,'battles',len(battles),'done',len(done),'downloaded now',new)
    if battles: print(' sample',json.dumps(battles[0])[:400])
