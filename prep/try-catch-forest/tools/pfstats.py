# usage: python pfstats.py <dir>   - paired results of pairfield.py (we are seat 0 in every game)
import json,glob,os,sys,re,collections
d=sys.argv[1]; R=collections.defaultdict(dict)
for fn in glob.glob(d+'/*.json'):
    name,gid=os.path.basename(fn)[:-5].rsplit('_',1)
    try: j=json.load(open(fn))
    except ValueError: continue
    if 'log' not in j: continue
    lg=j['log']; t=0; last=-1; c=l=0; N=0
    for f in lg['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==0 and t==1: N=len(set(x.split()[1] for x in (f.get('stdout') or '').split(';') if len(x.split())>1 and x.split()[0] in ('MOVE','DASH')))
        for s in (f.get('summary') or '').split('\n'):
            if re.match(r"\$0's agent \d+ catches",s): c+=1
            if re.search(r"catches \$0's agent",s): l+=1
    R[gid][name]=(lg['ranking'].index(0)+1,c,l,N)
names=sorted({n for g in R.values() for n in g})
full=[g for g in R if all(n in R[g] for n in names)]
print('battles with all bots played:',len(full),'| bots:',names)
for g in sorted(full): print('  %s  %d units  '%(g,R[g][names[0]][3])+'   '.join('%s: place %d, %d catches, %d lost'%((n,)+R[g][n][:3]) for n in names))
for n in names:
    q=[R[g][n] for g in full]; k=len(q)
    if k: print('%-6s mean rank %.2f  first %d second %d last %d  catches %.2f  lost %.2f'%(n,sum(x[0] for x in q)/k,sum(x[0]==1 for x in q),sum(x[0]==2 for x in q),sum(x[0]==3 for x in q),sum(x[1] for x in q)/k,sum(x[2] for x in q)/k))
four=[g for g in full if R[g][names[0]][3]==4]
print('4-unit battles among them:',len(four))
