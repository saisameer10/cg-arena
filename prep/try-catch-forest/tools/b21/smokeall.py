import json,math,re,glob,sys
rows=[]; throws=[]
for fn in glob.glob('E:/cg-tmp/tcf/gold/r10/*.json')+glob.glob('E:/cg-tmp/tcf/gold/g10/*.json'):
    try: d=json.load(open(fn,encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d: continue
    log=d['log']; me=[a['index'] for a in log['agents'] if a.get('me')][0]; pred=(me+2)%3; prey=(me+1)%3
    t=0; last=-1; clouds=[]; M={}; S={}
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if a==me:
            ls=(f.get('stderr') or '').split('\n')
            M[t]=[l.split() for l in ls if l.startswith('M ')]; S[t]=[l.split() for l in ls if l.startswith('E ') and ' UNIT ' in l]
        for s in (f.get('summary') or '').split('\n'):
            m=re.match(r"\$%d's agent (\d+) at \((-?\d+), (-?\d+)\) deploys smoke at \((-?\d+), (-?\d+)\)"%me,s)
            if m:
                ux,uy,cx,cy=int(m.group(2)),int(m.group(3)),int(m.group(4)),int(m.group(5))
                clouds.append((t,cx,cy))
                pd=min([math.hypot(float(e[4])-ux,float(e[5])-uy) for e in S.get(t,[]) if int(e[3])==pred] or [9e9])
                held=any(mm[1]==m.group(1) and mm[11]!='0' for mm in M.get(t,[]))
                throws.append((pd,held,t))
    def inside(tt,x,y): return any(ct<tt<=ct+9 and math.hypot(x-cx,y-cy)<1900 for (ct,cx,cy) in clouds)
    al=bl=sight=0
    for tt in sorted(M):
        if tt>30: break
        for m in M[tt]:
            if m[8]!='0': continue
            al+=1; x,y=float(m[4]),float(m[5])
            if inside(tt,x,y): bl+=1
        if any(int(e[3])==prey for e in S[tt]): sight+=1
    c10=sum(1 for f in log['frames'] for s in (f.get('summary') or '').split('\n') if re.match(r"\$%d's agent \d+ catches"%me,s))
    rows.append({'rank':log['ranking'].index(me)+1,'blind':bl/max(1,al),'sight':sight/30.0,'smokes':len(clouds),'catches':c10})
def avg(q,k): return sum(r[k] for r in q)/max(1,len(q))
W=[r for r in rows if r['rank']==1]; L=[r for r in rows if r['rank']>1]
print('games',len(rows),'wins',len(W),'non-wins',len(L))
print('share of our living unit-turns (turns 1-30) inside our own smoke: wins %.0f%%, non-wins %.0f%%'%(100*avg(W,'blind'),100*avg(L,'blind')))
print('turns 1-30 with prey in sight: wins %.0f%%, non-wins %.0f%%'%(100*avg(W,'sight'),100*avg(L,'sight')))
print('smokes thrown per game: wins %.1f, non-wins %.1f'%(avg(W,'smokes'),avg(L,'smokes')))
rows.sort(key=lambda r:r['blind'])
h=len(rows)//2; lo=rows[:h]; hi=rows[h:]
print('games split at the median blind share: low half (blind %.0f%%): mean rank %.2f, catches %.2f | high half (blind %.0f%%): mean rank %.2f, catches %.2f'%(100*avg(lo,'blind'),avg(lo,'rank'),avg(lo,'catches'),100*avg(hi,'blind'),avg(hi,'rank'),avg(hi,'catches')))
free=[p for (p,h,t) in throws if not h]
bk=[('under 1100',0,1100),('1100-1500',1100,1500),('1500-1900',1500,1900),('1900-2300',1900,2300),('2300-3000',2300,3000),('no predator in sight',3000,1e12)]
print('smokes thrown by free units: %d; distance of the nearest visible predator at the throw:'%len(free))
for nm,a,b in bk: print('   %-22s %3d  %.0f%%'%(nm,sum(1 for p in free if a<=p<b),100*sum(1 for p in free if a<=p<b)/max(1,len(free))))
print('smokes thrown by held units:',sum(1 for (p,h,t) in throws if h),' thrown on turns 1-3:',sum(1 for (p,h,t) in throws if t<=3))
