# usage: python heldcheck.py <debug-replay-dir>...  - what a held unit of ours had and did while a hunter came for it
import json,sys,glob,re,math,collections
C=collections.Counter(); N=0
for d in sys.argv[1:]:
  for fn in glob.glob(d+'/*.json'):
    try: g=json.load(open(fn,encoding='utf-8'))
    except ValueError: continue
    if 'log' not in g: continue
    log=g['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]; pred=(me+2)%3
    t=0; last=-1; out={}; M={}; E={}; PW={}; caught={}
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==me:
            ls=(f.get('stderr') or '').split('\n'); out[t]=f.get('stdout') or ''
            M[t]={x.split()[1]:x.split() for x in ls if x.startswith('M ')}
            E[t]=[x.split() for x in ls if x.startswith('E ') and ' UNIT ' in x and int(x.split()[3])==pred]
            pw=[x for x in ls if x.startswith('T ')]
            if pw: PW[t]=[int(v) for v in pw[0].split()[5:8]]   # pool after this turn's orders
        for s in (f.get('summary') or '').split('\n'):
            m=re.match(r"\$\d's agent \d+ catches \$%d's agent (\d+)"%me,s)
            if m: caught[m.group(1)]=t
    for tt in sorted(M):
        for u,mu in M[tt].items():
            if mu[8]!='0' or mu[11]=='0': continue            # living and held this turn
            prev=M.get(tt-1,{}).get(u)
            if prev and prev[11]!='0': continue               # first turn of being held only
            N+=1
            x,y=float(mu[4]),float(mu[5])
            seen=[math.hypot(float(e[4])-x,float(e[5])-y) for e in E.get(tt,[]) if e[11]=='0']
            nets_before=PW.get(tt-1,[0,0,0])[0]; smoke_before=PW.get(tt-1,[0,0,0])[1]
            cmd=[c.split()[0] for c in out.get(tt,'').split(';') if len(c.split())>1 and c.split()[1]==u and c.split()[0] in('NET','SMOKE','DECOY')]
            died=u in caught and caught[u]<=tt+4
            k='hunter in sight within 3000' if seen and min(seen)<3000 else 'no hunter in sight'
            C[k]+=1; C[k+' | died']+=died
            if seen and min(seen)<3000:
                a2=('threw a net' if 'NET' in cmd else 'smoked' if 'SMOKE' in cmd else 'did nothing')
                why=''
                if a2=='did nothing': why=' (nets left %s, smokes left %s)'%('yes' if nets_before>0 else 'NO','yes' if smoke_before>0 else 'NO')
                C['   '+a2+why]+=1; C['   '+a2+why+' | died']+=died
print('first turn held, units:',N)
for k in sorted(C):
    if k.endswith('| died'): continue
    print('%-64s %3d   caught within 4 turns %d%%'%(k,C[k],100*C[k+' | died']/C[k]))
