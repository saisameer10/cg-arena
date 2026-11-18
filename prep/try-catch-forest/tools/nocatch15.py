# usage: python nocatch15.py <debug-or-plain-game.json>  -> prints 1 if our bot had no catch by turn 15 in that game, else 0
import json,sys,re
try: d=json.load(open(sys.argv[1],encoding='utf-8'))
except Exception: print(0); sys.exit()
if 'log' not in d: print(0); sys.exit()
g=d['log']; me=[a['index'] for a in g['agents'] if a.get('me')][0]
t=0; last=-1; first=None
for f in g['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    for s in (f.get('summary') or '').split('\n'):
        if first is None and re.match(r"\$%d's agent \d+ catches"%me,s): first=t
print(1 if (first is None or first>15) else 0)
