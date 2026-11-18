# usage: python deaths.py g*.json  - how each of my units was lost
import json,sys,re,glob,collections
tot=collections.Counter()
for fn in sys.argv[1:]:
    d=json.load(open(fn,encoding='utf-8'))
    if 'log' not in d: continue
    log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]
    t=0; last=-1; out={}; summ=collections.defaultdict(list)
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==me: out[t]=f.get('stdout','')
        for l in (f.get('summary') or '').split('\n'):
            if l: summ[t].append(l)
    for tt in sorted(summ):
        for l in summ[tt]:
            m=re.match(r"\$(\d)'s agent (\d+) catches \$%d's agent (\d+) at \((-?\d+), (-?\d+)\)"%me,l)
            if not m: continue
            u=m.group(3)
            netted=[k for k in range(max(1,tt-5),tt+1) if any(('nets $%d\'s agent %s'%(me,u)) in s for s in summ[k])]
            cmds=[]
            for k in range(max(1,tt-3),tt+1):
                cmds.append(str(k)+': '+' | '.join(c for c in out.get(k,'').split(';') if len(c.split())>1 and c.split()[1]==u))
            kind='netted' if netted else 'free'
            tag=[c for c in out.get(tt,'').split(';') if len(c.split())>4 and c.split()[1]==u and c.split()[0] in('MOVE','DASH')]
            tg=tag[0].split()[4] if tag else 'none'
            tot[kind+' '+tg]+=1
            print(fn,'turn',tt,'unit',u,'by',m.group(2),kind,netted,'at',m.group(4),m.group(5)); 
            for c in cmds: print('    ',c)
print(dict(tot))
