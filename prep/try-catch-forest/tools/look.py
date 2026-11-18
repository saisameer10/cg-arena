# usage: python look.py <debug-game.json> <seat> <from> <to>  - raw view of some turns: my units, everything seen, referee events
import json,sys
d=json.load(open(sys.argv[1],encoding='utf-8')); seat=int(sys.argv[2]); a0=int(sys.argv[3]); a1=int(sys.argv[4])
t=0; last=-1
for f in d['log']['frames']:
    a=f.get('agent')
    if a is None: continue
    if last==-1 or a<=last: t+=1
    last=a
    if not a0<=t<=a1: continue
    if a==seat:
        ls=(f.get('stderr') or '').split('\n')
        print('--- turn',t)
        for l in ls:
            if l.startswith(('M ','E ','T ')) and 'SPRITE' not in l: print('   ',l)
        print('    OUT',f.get('stdout'))
    if f.get('summary'): print('    REF',f['summary'].replace('\n',' || ')[:600])
