import json,math,sys
d=json.load(open('rep.json',encoding='utf-8')); log=d['log']; me=0; prey=1; pred=2
a0=int(sys.argv[1]); a1=int(sys.argv[2])
t=0; last=-1; trees=[]
for f in log['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if a==me:
        ls=(f.get('stderr') or '').split('\n')
        if not trees: trees=[tuple(map(float,l.split()[2:5])) for l in ls if l.startswith('TREE')]
        if a0<=t<=a1:
            M=[l.split() for l in ls if l.startswith('M ')]
            E=[l.split() for l in ls if l.startswith('E ')]
            pw=[l for l in ls if l.startswith('T ')][0].split()[5:8]
            print('=== turn',t,'pool after orders (nets smokes decoys)',pw)
            for m in M:
                x,y=float(m[4]),float(m[5])
                near=[]
                for e in E:
                    if e[2]=='UNIT':
                        dd=math.hypot(float(e[4])-x,float(e[5])-y)
                        if dd<3200: near.append('%s%s@%d(cd%s%s)'%('prey' if int(e[3])==prey else 'PRED',e[1],dd,e[9],' held'+e[11] if e[11]!='0' else ''))
                tg=min(trees,key=lambda q: math.hypot(x-q[0],y-q[1])-q[2]); gap=math.hypot(x-tg[0],y-tg[1])-tg[2]-220
                cm=[c for c in (f.get('stdout') or '').split(';') if len(c.split())>1 and c.split()[1]==m[1]]
                print('  u%s %s (%6d,%6d) R%4d cd%s fat%s%s treeGap%4d | sees %s | %s'%(m[1],'GHOST' if m[8]=='1' else 'alive',x,y,math.hypot(x,y),m[9],m[10],' HELD'+m[11] if m[11]!='0' else '',gap,' '.join(near) or '-',' ; '.join(cm) or '(no order)'))
            sm=[e for e in E if e[2]=='SMOKE']; 
            if sm: print('  smoke seen:',[(e[4],e[5],'life'+e[9]) for e in sm])
    if a0<=t<=a1 and f.get('summary'): print('  REF:',f['summary'].replace('\n',' || ')[:700])
