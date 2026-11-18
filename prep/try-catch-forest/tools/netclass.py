# usage: python netclass.py <debug-game.json>...   - our nets by intended target (the visible enemy nearest to the aim line)
import json,sys,re,math,collections
def segd(px,py,ax,ay,bx,by):
    dx=bx-ax;dy=by-ay;l2=dx*dx+dy*dy
    if l2<1e-9: return math.hypot(px-ax,py-ay)
    t=max(0,min(1,((px-ax)*dx+(py-ay)*dy)/l2)); return math.hypot(px-ax-dx*t,py-ay-dy*t)
B=collections.defaultdict(lambda:[0,0,0])
for fn in sys.argv[1:]:
    try: d=json.load(open(fn,encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d: continue
    g=d['log']; me=[a['index'] for a in g['agents'] if a.get('me')][0]; prey=(me+1)%3; pred=(me+2)%3
    t=0; last=-1; E={}; M={}
    for f in g['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==me:
            ls=(f.get('stderr') or '').split('\n')
            E[t]=[x.split() for x in ls if x.startswith('E ') and ' UNIT ' in x]
            M[t]={x.split()[1]:x.split() for x in ls if x.startswith('M ')}
        for s in (f.get('summary') or '').split('\n'):
            m=re.match(r"\$%d's agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)(?: \(aimed at \((-?\d+), (-?\d+)\)\))?"%me,s)
            if not m: continue
            x0,y0=int(m.group(2)),int(m.group(3)); ax,ay=(int(m.group(6)),int(m.group(7))) if m.group(6) else (int(m.group(4)),int(m.group(5)))
            tail=s.split(' nets ',1)[1] if ' nets ' in s else ''
            hitPrey=bool(re.search(r"\$%d's agent"%prey,tail)); hitPred=bool(re.search(r"\$%d's agent"%pred,tail))
            best=None
            for e in E.get(t,[]):
                ex,ey=float(e[4])+float(e[6]),float(e[5])+float(e[7])     # where it was heading
                dd=min(segd(float(e[4]),float(e[5]),x0,y0,ax,ay),segd(ex,ey,x0,y0,ax,ay))
                if best is None or dd<best[0]: best=(dd,e)
            held = M.get(t,{}).get(m.group(1),[0]*12)[11]!='0'
            if not best or best[0]>700: k='no visible enemy near the line'
            else:
                e=best[1]; dist=math.hypot(float(e[4])-x0,float(e[5])-y0)
                who='PREY' if int(e[3])==prey else 'PREDATOR'
                k='%s %s, %s, %s'%(who,'dash on cooldown' if e[9]!='0' else 'can dash        ','held' if e[11]!='0' else 'free','<1000' if dist<1000 else '1000-1500' if dist<1500 else '1500-2000' if dist<2000 else '>2000')
                B['%s total'%who][0]+=1; B['%s total'%who][1]+=hitPrey; B['%s total'%who][2]+=hitPred
                if held: B['%s (thrown by a held unit of ours)'%who][0]+=1; B['%s (thrown by a held unit of ours)'%who][1]+=hitPrey; B['%s (thrown by a held unit of ours)'%who][2]+=hitPred
            B[k][0]+=1; B[k][1]+=hitPrey; B[k][2]+=hitPred
            kt='turn '+('01-03' if t<=3 else '04-10' if t<=10 else '11-30' if t<=30 else '31+')
            B[kt][0]+=1; B[kt][1]+=hitPrey; B[kt][2]+=hitPred
print('%-52s %6s %9s %13s'%('intended target','thrown','hit prey','hit predator'))
for k,v in sorted(B.items()): print('%-52s %6d %8d%% %12d%%'%(k,v[0],100*v[1]/v[0],100*v[2]/v[0]))
