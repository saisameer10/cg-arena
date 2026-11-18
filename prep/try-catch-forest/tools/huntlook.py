# usage: python huntlook.py <debug-game.json>  - what our units did all game (tags), and how close they got to prey
import json,sys,math,collections
d=json.load(open(sys.argv[1],encoding='utf-8')); log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]; prey=(me+1)%3; pred=(me+2)%3
t=0; last=-1; tags=collections.Counter(); rows=[]
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if a!=me: continue
    M=[l.split() for l in (f.get('stderr') or '').split('\n') if l.startswith('M ')]
    E=[l.split() for l in (f.get('stderr') or '').split('\n') if l.startswith('E ') and ' UNIT ' in l]
    live=[m for m in M if m[8]=='0']
    P=[e for e in E if int(e[3])==prey]; Q=[e for e in E if int(e[3])==pred]
    dp=min([math.hypot(float(m[4])-float(e[4]),float(m[5])-float(e[5])) for m in live for e in P] or [9e9])
    dq=min([math.hypot(float(m[4])-float(e[4]),float(m[5])-float(e[5])) for m in live for e in Q] or [9e9])
    tg=collections.Counter(c.split()[4] for c in (f.get('stdout') or '').split(';') if len(c.split())>4 and c.split()[0] in('MOVE','DASH'))
    tags.update(tg)
    pw=[l for l in (f.get('stderr') or '').split('\n') if l.startswith('T ')]
    rows.append((t,len(live),len(P),round(dp) if dp<9e8 else None,len(Q),round(dq) if dq<9e8 else None,dict(tg),pw[0].split()[5:] if pw else ''))
print('tags over the game',dict(tags))
n=len(rows); print('turns with prey in sight: %d of %d; with prey within 2000: %d; within 1200: %d'%(sum(1 for r in rows if r[2]),n,sum(1 for r in rows if r[3] and r[3]<2000),sum(1 for r in rows if r[3] and r[3]<1200)))
for r in rows[::4]: print('  t%-3d live %d  prey seen %d nearest %-6s  pred seen %d nearest %-6s %s pw %s'%r)
