# usage: python stats.py a1.json a2.json ...   - totals over test games
import json,sys,re
n=w=last=c=l=0; firsts=[]; left=[0,0,0]; slow=0
for fn in sys.argv[1:]:
    d=json.load(open(fn,encoding='utf-8'))
    if 'log' not in d: continue
    log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]
    n+=1; w+= log['ranking'][0]==me; last+= log['ranking'][2]==me
    t=0; lastA=-1; first=None; pw=[0,0,0]
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if lastA==-1 or a<=lastA: t+=1
        lastA=a
        if a==me and f.get('stderr'):
            for s in f['stderr'].split('\n'):
                if s.startswith('T '):
                    x=s.split(); pw=[int(x[5]),int(x[6]),int(x[7])]
                    if float(x[3])>40 and t>1: slow+=1
        for s in (f.get('summary') or '').split('\n'):
            if re.match(r"\$%d's agent \d+ catches"%me,s):
                c+=1
                if first is None: first=t
            if re.search(r"catches \$%d's agent"%me,s): l+=1
    firsts.append(first if first else 999)
    for i in range(3): left[i]+=pw[i]
firsts.sort()
print('games',n,'wins',w,'last',last,'catches',c,'lost',l,'first catch median turn',firsts[len(firsts)//2],'unused nets/smokes/decoys per game',[round(x/n,1) for x in left],'turns over 40 ms',slow)
