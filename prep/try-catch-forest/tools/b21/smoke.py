import json,math,re
d=json.load(open('rep.json',encoding='utf-8')); log=d['log']; me=0
t=0; last=-1; clouds=[]; M={}; S={}; out={}
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if a==me:
        ls=(f.get('stderr') or '').split('\n'); out[t]=f.get('stdout') or ''
        M[t]=[l.split() for l in ls if l.startswith('M ')]
        S[t]=[l.split() for l in ls if l.startswith('E ') and ' UNIT ' in l]
    for s in (f.get('summary') or '').split('\n'):
        m=re.match(r"\$0's agent (\d+) at \((-?\d+), (-?\d+)\) deploys smoke at \((-?\d+), (-?\d+)\)",s)
        if m: clouds.append((t,int(m.group(1)),int(m.group(2)),int(m.group(3)),int(m.group(4)),int(m.group(5))))
        m=re.match(r"\$0's agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at (.*)",s)
        if m: print('NET turn',t,'unit',m.group(1),'from',(m.group(2),m.group(3)),m.group(4)[:110])
        m=re.match(r"\$0's agent (\d+) at .* deploys a decoy towards (.*)",s)
        if m: print('DECOY turn',t,'unit',m.group(1),'towards',m.group(2))
print('our smokes:')
for (ct,u,ux,uy,cx,cy) in clouds:
    pr=[(e[1],round(math.hypot(float(e[4])-ux,float(e[5])-uy))) for e in S[ct] if int(e[3])==2]
    py=[(e[1],round(math.hypot(float(e[4])-ux,float(e[5])-uy))) for e in S[ct] if int(e[3])==1]
    inside=[m[1] for m in M[ct] if m[8]=='0' and math.hypot(float(m[4])-cx,float(m[5])-cy)<1900]
    print('  turn %d unit %s threw from (%d,%d) to centre (%d,%d): offset %d from the thrower | predators in sight (id, distance to thrower) %s | prey in sight %s | our living units inside the new cloud: %s'%(ct,u,ux,uy,cx,cy,math.hypot(cx-ux,cy-uy),pr,py,inside))
blind=0; tot=0; per={}
for tt in sorted(M):
    for m in M[tt]:
        if m[8]!='0': continue
        tot+=1
        x,y=float(m[4]),float(m[5])
        if any(ct<tt<=ct+9 and math.hypot(x-cx,y-cy)<1900 for (ct,u,ux,uy,cx,cy) in clouds):
            blind+=1; per[m[1]]=per.get(m[1],0)+1
print('unit-turns alive',tot,'of which inside our own smoke',blind,per)
first=[tt for tt in sorted(M) if tt<=30]
b30=sum(1 for tt in first for m in M[tt] if m[8]=='0' and any(ct<tt<=ct+9 and math.hypot(float(m[4])-cx,float(m[5])-cy)<1900 for (ct,u,ux,uy,cx,cy) in clouds))
print('turns 1-30: alive unit-turns',sum(1 for tt in first for m in M[tt] if m[8]=='0'),'inside our own smoke',b30)
