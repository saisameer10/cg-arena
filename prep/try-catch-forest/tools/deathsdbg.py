# usage: python deathsdbg.py d*.json  - what the bot saw in the turns before each loss (debug build only)
import json,sys,re,math,collections
for fn in sys.argv[1:]:
    d=json.load(open(fn,encoding='utf-8'))
    if 'log' not in d: continue
    log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]; pred=(me+2)%3
    t=0; last=-1; out={}; summ=collections.defaultdict(list); M={}; E={}
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==me:
            out[t]=f.get('stdout',''); M[t]={}; E[t]=[]
            for l in (f.get('stderr') or '').split('\n'):
                x=l.split()
                if l.startswith('M '): M[t][x[1]]=x
                elif l.startswith('E ') and x[2]=='UNIT' and int(x[3])==pred: E[t].append(x)
        for l in (f.get('summary') or '').split('\n'):
            if l: summ[t].append(l)
    for tt in sorted(summ):
        for l in summ[tt]:
            m=re.match(r"\$(\d)'s agent (\d+) catches \$%d's agent (\d+) at \((-?\d+), (-?\d+)\)"%me,l)
            if not m: continue
            u=m.group(3); k0=m.group(2)
            print(fn,'turn',tt,'unit',u,'caught by',k0,'at',m.group(4),m.group(5),'R',round(math.hypot(int(m.group(4)),int(m.group(5)))))
            for k in range(max(1,tt-4),tt+1):
                mu=M.get(k,{}).get(u)
                if not mu: continue
                x,y=float(mu[4]),float(mu[5])
                seen=['%s@%d cd%s im%s v%d'%(e[1],math.hypot(float(e[4])-x,float(e[5])-y),e[9],e[11],math.hypot(float(e[6]),float(e[7]))) for e in E.get(k,[])]
                seen=[s for s in seen if int(s.split('@')[1].split()[0])<4000]
                cm=' | '.join(c for c in out.get(k,'').split(';') if len(c.split())>1 and c.split()[1]==u)
                ev=[s for s in summ[k] if ("agent %s "%u in s and '$%d'%me in s) or ("agent %s "%k0 in s and ('net' in s or 'dash' in s))]
                print('   t%d pos (%d,%d) cd%s im%s  sees pred: %s  -> %s   %s'%(k,x,y,mu[9],mu[11],seen,cm,ev))
