# usage: python replay.py <debug-game.json> <seat> <out.txt>  - rebuilds the bot's stdin from a debug game
import json,sys,re
d=json.load(open(sys.argv[1],encoding='utf-8')); log=d['log']; seat=int(sys.argv[2])
out=[]; t=0; last=-1; score=0; pend=0; first=True
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1; score+=pend; pend=0
    last=a
    if a==seat and f.get('stderr'):
        ls=f['stderr'].split('\n')
        if first:
            tr=[l[5:] for l in ls if l.startswith('TREE ')]
            out+= [str(seat),'8000',str(len(tr))]+tr; first=False
        ents=[l[2:] for l in ls if l.startswith(('M ','E '))]
        pw=[l for l in ls if l.startswith('T ')][0].split()
        out+=[str(score),None,str(len(ents))]+ents
        out[out.index(None)]='PW%d'%t
    for l in (f.get('summary') or '').split('\n'):
        if re.match(r"\$%d's agent \d+ catches"%seat,l): pend+=1
# power pool before the turn = pool printed after the previous turn's decision; first turn: printed value plus what was used
pools={}
t=0; last=-1
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if a==seat and f.get('stderr'):
        pw=[l for l in f['stderr'].split('\n') if l.startswith('T ')][0].split()
        after=[int(pw[5]),int(pw[6]),int(pw[7])]
        o=f.get('stdout','')
        used=[sum(1 for c in o.split(';') if c.startswith(k)) for k in ('NET','SMOKE','DECOY')]
        pools[t]=[after[i]+used[i] for i in range(3)]
out=[(' '.join(map(str,pools[int(l[2:])])) if isinstance(l,str) and l.startswith('PW') else l) for l in out]
open(sys.argv[3],'w').write('\n'.join(out)+'\n')
print('turns',t)
