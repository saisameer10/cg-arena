# usage: python slidefit.py <debug-game.json>...  - fits movement models against the moves the referee really made
import json,sys,math
rows=[]; trees=[]
for fn in sys.argv[1:]:
    d=json.load(open(fn,encoding='utf-8')); log=d['log']
    for seat in (0,1,2):
        t=0; last=-1; prev=None; tr=[]
        for f in log['frames']:
            a=f.get('agent')
            if a is None: continue
            if a!=seat or not f.get('stderr'): continue
            M={}
            for l in f['stderr'].split('\n'):
                if l.startswith('M '): x=l.split(); M[int(x[1])]=x
                if l.startswith('TREE '): x=l.split(); tr.append((float(x[2]),float(x[3]),float(x[4])))
            if prev:
                pm,out=prev
                for c in out.split(';'):
                    x=c.split()
                    if x[0] in('MOVE','DASH') and int(x[1]) in pm and int(x[1]) in M:
                        u=int(x[1]); a0=pm[u]; a1=M[u]
                        if a0[8]!='0' or a1[8]!='0' or a0[11]!='0' or a1[11]!='0': continue
                        rows.append((x[0],float(a0[4]),float(a0[5]),float(x[2]),float(x[3]),float(a1[4]),float(a1[5]),tr))
            prev=(M,f.get('stdout',''))
UR=220; R=8000
def clamp(x,y):
    l=math.hypot(x,y)
    return (x*(R-UR)/l,y*(R-UR)/l) if l>R-UR else (x,y)
def modelA(x,y,gx,gy,sp,tr,steps=8):
    d=math.hypot(gx-x,gy-y)
    if d<1e-6: return x,y
    ln=min(d,sp); ux=(gx-x)/d; uy=(gy-y)/d
    for s in range(steps):
        x+=ux*ln/steps; y+=uy*ln/steps
        for (a,b,r) in tr:
            dd=math.hypot(x-a,y-b); m=r+UR
            if dd<m: x=a+(x-a)*m/dd; y=b+(y-b)*m/dd
        x,y=clamp(x,y)
    return x,y
def modelC(x,y,gx,gy,sp,tr):   # like A, but each step heads for the goal again (re-aim) 
    steps=60
    rem=sp
    for s in range(steps):
        d=math.hypot(gx-x,gy-y)
        if d<1e-6: break
        st=min(d,sp/steps)
        x+=(gx-x)/d*st; y+=(gy-y)/d*st
        for (a,b,r) in tr:
            dd=math.hypot(x-a,y-b); m=r+UR
            if dd<m: x=a+(x-a)*m/dd; y=b+(y-b)*m/dd
        x,y=clamp(x,y)
    return x,y
def modelD(x,y,gx,gy,sp,tr): return modelA(x,y,gx,gy,sp,tr,steps=60)
def modelE(x,y,gx,gy,sp,tr):  # end point projection only
    return modelA(x,y,gx,gy,sp,tr,steps=1)
def hit_time(x,y,vx,vy,a,b,rr):
    # first t in [0,1] where |p + v t - c| = rr, coming from outside
    fx=x-a; fy=y-b
    A=vx*vx+vy*vy; B=2*(fx*vx+fy*vy); C=fx*fx+fy*fy-rr*rr
    if A<1e-9: return None
    if C<=0:   # already touching/inside: blocked only if moving inward
        return 0.0 if B<0 else None
    D=B*B-4*A*C
    if D<0: return None
    t=(-B-math.sqrt(D))/(2*A)
    return t if 0<=t<=1 else None
def modelF(x,y,gx,gy,sp,tr,keep=False,iters=4):
    d=math.hypot(gx-x,gy-y)
    if d<1e-6: return x,y
    ln=min(d,sp); vx=(gx-x)/d*ln; vy=(gy-y)/d*ln
    rem=1.0
    for it in range(iters):
        best=None
        for (a,b,r) in tr:
            t=hit_time(x,y,vx*rem,vy*rem,a,b,r+UR)
            if t is not None and (best is None or t<best[0]): best=(t,a,b,r)
        if best is None: x+=vx*rem; y+=vy*rem; rem=0; break
        t,a,b,r=best
        x+=vx*rem*t; y+=vy*rem*t; rem*=(1-t)
        nx=(x-a); ny=(y-b); nl=math.hypot(nx,ny); nx/=nl; ny/=nl
        dot=vx*nx+vy*ny
        sp0=math.hypot(vx,vy)
        vx-=dot*nx; vy-=dot*ny
        if keep:
            l=math.hypot(vx,vy)
            if l>1e-9: vx*=sp0/l; vy*=sp0/l
        # nudge off the circle so the same tree is not hit again at t=0
        x=a+nx*(r+UR+0.01); y=b+ny*(r+UR+0.01)
        if rem<1e-6: break
    return clamp(x,y)
def modelG(x,y,gx,gy,sp,tr): return modelF(x,y,gx,gy,sp,tr,keep=True)
def modelH(x,y,gx,gy,sp,tr,steps=10,keep=False):  # sub-steps, velocity (not position) projected when the step would enter a tree
    d=math.hypot(gx-x,gy-y)
    if d<1e-6: return x,y
    ln=min(d,sp); vx=(gx-x)/d*ln/steps; vy=(gy-y)/d*ln/steps
    for s in range(steps):
        nx_=x+vx; ny_=y+vy
        for (a,b,r) in tr:
            if math.hypot(nx_-a,ny_-b)<r+UR:
                ux=(x-a); uy=(y-b); ul=math.hypot(ux,uy); ux/=ul; uy/=ul
                dot=vx*ux+vy*uy
                if dot<0:
                    wx=vx-dot*ux; wy=vy-dot*uy
                    nx_=x+wx; ny_=y+wy
        x,y=clamp(nx_,ny_)
    return x,y
res={}
for name,m in (('D 60 fixed steps, position pushed out',modelD),('F straight to contact, then tangent (projected speed)',modelF),('G same, full speed kept',modelG),('H 10 sub-steps, velocity projected',modelH),('H 100 sub-steps',lambda *a: modelH(*a,steps=100))):
    es=[]
    for (c,x,y,gx,gy,ax,ay,tr) in rows:
        px,py=m(x,y,gx,gy,600 if c=='MOVE' else 1200,tr)
        es.append(math.hypot(px-ax,py-ay))
    res[name]=es[:]
    es.sort()
    print(name.ljust(54),'n',len(es),'median',round(es[len(es)//2],1),'p90',round(es[int(len(es)*.9)],1),'p99',round(es[int(len(es)*.99)],1),'max',round(es[-1],1),'>20:',sum(e>20 for e in es))
for i,(c,x,y,gx,gy,ax,ay,tr) in enumerate(rows):
    e=res['F straight to contact, then tangent (projected speed)'][i]
    if e>20:
        px,py=modelF(x,y,gx,gy,600 if c=='MOVE' else 1200,tr)
        near=sorted(tr,key=lambda t: math.hypot(x-t[0],y-t[1])-t[2])[:2]
        print(c,'err',round(e),'start',(x,y),'goal',(gx,gy),'actual',(ax,ay),'pred',(round(px),round(py)),'startR',round(math.hypot(x,y)),'actR',round(math.hypot(ax,ay)),'moved',round(math.hypot(ax-x,ay-y)),'gaps',[round(math.hypot(x-t[0],y-t[1])-t[2]) for t in near],[round(math.hypot(ax-t[0],ay-t[1])-t[2]) for t in near])
