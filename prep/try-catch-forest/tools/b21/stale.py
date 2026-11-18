import json,math,re,glob
rows=[]
for fn in glob.glob('E:/cg-tmp/tcf/gold/r10/*.json')+glob.glob('E:/cg-tmp/tcf/gold/g10/*.json')+['E:/cg-tmp/tcf/b21/rep.json']:
    try: d=json.load(open(fn,encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d: continue
    log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]; prey=(me+1)%3
    hunt=blindhunt=rev=mv=0; prevd={}
    t=0
    for f in log['frames']:
        if f.get('agent')!=me or not f.get('stderr'): continue
        t+=1
        ls=f['stderr'].split('\n'); M={l.split()[1]:l.split() for l in ls if l.startswith('M ')}
        seen=any(l.startswith('E ') and ' UNIT %d '%prey in l for l in ls)
        for c in (f.get('stdout') or '').split(';'):
            x=c.split()
            if len(x)>4 and x[0] in('MOVE','DASH') and x[4]=='HUNT' and x[1] in M and M[x[1]][8]=='0':
                hunt+=1
                if not seen: blindhunt+=1
                m=M[x[1]]; dx=float(x[2])-float(m[4]); dy=float(x[3])-float(m[5]); l=math.hypot(dx,dy)
                if l>1:
                    dx/=l; dy/=l
                    if x[1] in prevd:
                        mv+=1
                        if dx*prevd[x[1]][0]+dy*prevd[x[1]][1]<-0.3: rev+=1
                    prevd[x[1]]=(dx,dy)
    rows.append({'fn':fn[-14:],'rank':log['ranking'].index(me)+1,'hunt':hunt,'bh':blindhunt/max(1,hunt),'rev':rev/max(1,mv)})
def avg(q,k): return sum(r[k] for r in q)/max(1,len(q))
b=[r for r in rows if r['fn'].endswith('rep.json')][0]; rows=[r for r in rows if not r['fn'].endswith('rep.json')]
W=[r for r in rows if r['rank']==1]; L=[r for r in rows if r['rank']>1]
print('games',len(rows))
print('HUNT orders given while no prey at all is in sight: wins %.0f%%, non-wins %.0f%%, battle 21: %.0f%%'%(100*avg(W,'bh'),100*avg(L,'bh'),100*b['bh']))
print('HUNT orders that reverse the direction of the previous turn: wins %.0f%%, non-wins %.0f%%, battle 21: %.0f%%'%(100*avg(W,'rev'),100*avg(L,'rev'),100*b['rev']))
rows.sort(key=lambda r:r['rev']); h=len(rows)//2
print('split at the median reversal share: low half %.0f%% -> mean rank %.2f | high half %.0f%% -> mean rank %.2f'%(100*avg(rows[:h],'rev'),avg(rows[:h],'rank'),100*avg(rows[h:],'rev'),avg(rows[h:],'rank')))
rows.sort(key=lambda r:r['bh'])
print('split at the median blind-hunt share: low half %.0f%% -> mean rank %.2f | high half %.0f%% -> mean rank %.2f'%(100*avg(rows[:h],'bh'),avg(rows[:h],'rank'),100*avg(rows[h:],'bh'),avg(rows[h:],'rank')))
