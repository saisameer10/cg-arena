# usage: python seatstats.py <seat> game1.json game2.json ...
# One line per game for the bot in that seat (rank 1-3, catches, units lost, turns of its catches), then totals.
# Importable: summ(file, seat) returns the same numbers as a dict.
import json,sys,re
def summ(fn,seat):
    try: d=json.load(open(fn,encoding='utf-8'))
    except ValueError: return None      # game still being written
    if 'log' not in d: return None
    log=d['log']; t=0; last=-1; ct=[]; lost=0; n=0
    for f in log['frames']:
        a=f.get('agent')
        if a is None: continue
        if last==-1 or a<=last: t+=1
        last=a
        if t==1 and a==seat: n=sum(1 for c in (f.get('stdout') or '').split(';') if c.split()[:1] in (['MOVE'],['DASH']))
        for s in (f.get('summary') or '').split('\n'):
            if re.match(r"\$%d's agent \d+ catches"%seat,s): ct.append(t)
            if re.search(r"catches \$%d's agent"%seat,s): lost+=1
    return {'file':fn,'seed':log['game_options'],'rank':log['ranking'].index(seat)+1,'catches':len(ct),'lost':lost,'turns':ct,'score':log['scores'][seat]}
def total(rows):
    n=len(rows)
    return 'games %d  wins %d  second %d  last %d  catches %d  lost %d  mean rank %.2f'%(n,sum(r['rank']==1 for r in rows),sum(r['rank']==2 for r in rows),sum(r['rank']==3 for r in rows),sum(r['catches'] for r in rows),sum(r['lost'] for r in rows),sum(r['rank'] for r in rows)/max(1,n))
if __name__=='__main__':
    seat=int(sys.argv[1]); rows=[r for r in (summ(f,seat) for f in sys.argv[2:]) if r]
    for r in rows: print(r['file'].split('/')[-1].ljust(14),'rank',r['rank'],'catches',r['catches'],'lost',r['lost'],'turns',r['turns'],r['seed'])
    print(total(rows))
