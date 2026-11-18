# usage: python game.py <out.json> [verbose]   - summary of one test game
import json,sys,re
d=json.load(open(sys.argv[1],encoding='utf-8'))
if 'log' not in d: print(json.dumps(d)[:600]); sys.exit()
log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]
t=0; ev=[]; last=-1
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if a<=last: t+=1
    if last==-1: t=1
    last=a
    if a==me and f.get('error'): ev.append((t,'ERROR '+str(f['error'])[:200]))
    if a==me and f.get('stderr') and 'ERR' in f['stderr']: ev.append((t,f['stderr'][:200]))
    for l in (f.get('summary') or '').split('\n'):
        if not l: continue
        if 'catches' in l or 'eliminated' in l or 'time' in l or 'nvalid' in l or ('$%d'%me in l and ('net' in l or 'smoke' in l or 'decoy' in l)) or ('nets $%d'%me in l): ev.append((t,l))
    if len(sys.argv)>2 and a==me: print(t,f.get('stdout'))
for e in ev: print(e[0],e[1])
print('me = $%d'%me,[a['name'] for a in log['agents']],'scores',log['scores'],'ranking',log['ranking'],log['game_options'])
