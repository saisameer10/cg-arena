# usage: python incloud.py <debug-replay-dir>...  - share of our living unit-turns spent inside one of our own clouds
import json,sys,glob,re,math
for d in sys.argv[1:]:
    tot=[0,0]; early=[0,0]; n=0
    for fn in glob.glob(d+'/*.json'):
        try: g=json.load(open(fn,encoding='utf-8'))
        except ValueError: continue
        if 'log' not in g: continue
        n+=1; log=g['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]
        t=0; last=-1; M={}; smokes=[]
        for f in log['frames']:
            a=f.get('agent')
            if a is None: continue
            if last==-1 or a<=last: t+=1
            last=a
            if a==me: M[t]=[x.split() for x in (f.get('stderr') or '').split('\n') if x.startswith('M ')]
            for s in (f.get('summary') or '').split('\n'):
                m=re.match(r"\$%d's agent \d+ at .* deploys smoke at \((-?\d+), (-?\d+)\)"%me,s)
                if m: smokes.append((t,int(m.group(1)),int(m.group(2))))
        for tt,units in M.items():
            for u in units:
                if u[8]!='0': continue
                x,y=float(u[4]),float(u[5])
                inside=any(1<=tt-st<=9 and math.hypot(x-sx,y-sy)<1900 for (st,sx,sy) in smokes)
                tot[0]+=1; tot[1]+=inside
                if tt<=30: early[0]+=1; early[1]+=inside
    if n: print('%-8s games %2d  unit-turns inside our own cloud: turns 1-30 %4.1f%%   whole game %4.1f%%'%(d,n,100*early[1]/max(1,early[0]),100*tot[1]/max(1,tot[0])))
