# usage: python find_boss_games.py <folder>...   - lists the test games in which two seats were the league boss
# and one seat was us (debug or plain logs). Prints the count and writes boss_games.txt next to this script.
import io, json, sys, os, glob

HERE = os.path.dirname(os.path.abspath(__file__))
found = []
for root in sys.argv[1:]:
    for fn in glob.glob(os.path.join(root, '**', '*.json'), recursive=True):
        try:
            d = json.load(io.open(fn, encoding='utf-8'))
        except Exception:
            continue
        log = d['log'] if 'log' in d else d
        if 'frames' not in log:
            continue
        ag = log.get('agents', [])
        boss = [a for a in ag if a.get('name') == 'BOSS 1']
        me = [a for a in ag if a.get('me')]
        if len(boss) == 2 and len(me) == 1:
            found.append((fn, me[0]['index'], [b['index'] for b in boss], log.get('game_options', '')))
io.open(os.path.join(HERE, 'boss_games.txt'), 'w', encoding='utf-8').write(''.join('%s\t%d\t%s\t%s\n' % (f, m, ','.join(map(str, b)), o) for f, m, b, o in found))
print('games with the league boss in two seats and us in one:', len(found))
