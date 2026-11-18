# usage: python audit.py <debug-game.json> [seat]  - checks of the debug build's stderr against the referee
import json,sys,re,math,collections
d=json.load(open(sys.argv[1],encoding='utf-8')); log=d['log']
seat=int(sys.argv[2]) if len(sys.argv)>2 else 0
turns=[]; t=0; last=-1; summ=collections.defaultdict(list)
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if a==seat and f.get('stderr'): turns.append((t,f['stderr'].split('\n'),f.get('stdout','')))
    for l in (f.get('summary') or '').split('\n'):
        if l: summ[t].append(l)
ms=[]; err=[]; big=[]
prevP=None; prevOut=''
decoyT={}   # turn -> list of (player, unit) decoys deployed by others
for tt,ls in summ.items():
    for l in ls:
        m=re.match(r"\$(\d)'s agent (\d+) at .* deploys a decoy",l)
        if m and int(m.group(1))!=seat: decoyT.setdefault(tt,[]).append(int(m.group(2)))
immob=[]
for (tt,lines,out) in turns:
    M={}; E=[]
    for l in lines:
        if l.startswith('M '): a=l.split(); M[int(a[1])]=a
        elif l.startswith('E '): E.append(l[2:])
        elif l.startswith('T '): ms.append(float(l.split()[3]))
        elif l.startswith('ERR'): print(tt,l)
    if prevP:
        for i in range(0,len(prevP),3):
            uid,x,y=prevP[i:i+3]
            if uid in M and M[uid][8]=='0':
                e=math.hypot(float(M[uid][4])-x,float(M[uid][5])-y)
                held = M[uid][11]!='0'
                if not held:
                    err.append(e)
                    if e>60: big.append((tt-1,uid,round(e),[c for c in prevOut.split(';') if c.split()[1]==str(uid)][:1]))
    P=[l for l in lines if l.startswith('P')]
    prevP=[int(v) for v in P[0].split()[1:]] if P else None
    prevOut=out
    # enemy entities with duplicate ids, or after a decoy was deployed
    ids=collections.Counter(l.split()[0] for l in E if ' UNIT ' in l)
    for l in E:
        a=l.split()
        if ' UNIT ' in l and ids[a[0]]>1: print('DUP turn',tt,l)
    for l in E:
        if ' UNIT ' in l and l.split()[10]!='0': immob.append((tt,l))
ms.sort(); err.sort()
print('turn time ms: first',[round(float(l.split()[3]),1) for (tt,lines,o) in turns[:4] for l in lines if l.startswith('T ')],'median',ms[len(ms)//2],'max',ms[-1])
print('move prediction error: n',len(err),'median',round(err[len(err)//2],1),'p90',round(err[int(len(err)*.9)],1),'max',round(err[-1],1))
for b in big[:15]: print('  big',b)
print('decoys deployed by others (turn: units):',decoyT)
print('immobilised enemies seen:',immob[:8])
