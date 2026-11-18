# usage: python whynot.py
# For every game not won: was the team above ahead on catches, or level (place decided by the turn of the first catch)?
# And who made the first catch of the game, and what that was worth.
import json, os, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anatomy as A
G = A.groups()
def pc(a, b): return ('%.0f%%' % (100.0 * a / b)) if b else '-'
for name, lst in G.items():
    c = collections.Counter(); fct = []
    for fn, ag in lst:
        try: g = json.load(open(fn))
        except Exception: continue
        if ag is None:
            me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
            if not me: continue
            seat = me[0]['index']
            if any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != seat): continue
        else:
            s = [a['index'] for a in g['agents'] if a.get('agent_id') == ag]
            if not s: continue
            seat = s[0]
        P = A.parse(g); ev = P['ev']
        n = [0, 0, 0]; first = [999, 999, 999]
        for t in sorted(ev):
            for e in ev[t]:
                if e[0] == 'catch': n[e[1]] += 1; first[e[1]] = min(first[e[1]], t)
        rk = g['ranking'].index(seat) + 1
        c['games'] += 1; c['rank'] += rk; c['r%d' % rk] += 1
        gf = min(first)
        if gf < 999:
            c['anycatch'] += 1
            mine = first[seat] == gf
            c['firstcatch'] += mine
            if mine: c['fc_win'] += rk == 1; c['fc_rank'] += rk
            else: c['nfc'] += 1; c['nfc_win'] += rk == 1; c['nfc_rank'] += rk
        if n[seat] == 0: c['zero'] += 1
        if first[seat] < 999: fct.append(first[seat])
        if rk > 1:
            above = g['ranking'][rk - 2]
            if n[above] > n[seat]: c['behind'] += 1; c['behind%d' % min(3, n[above] - n[seat])] += 1
            elif n[above] == n[seat]:
                c['tie'] += 1
                if first[seat] < 999 and first[above] < 999: c['tie_turns'] += first[seat] - first[above]; c['tie_n'] += 1
            else: c['other'] += 1
        # ties won: level on catches with the team below
        if rk < 3:
            below = g['ranking'][rk]
            if n[below] == n[seat]: c['tiewon'] += 1
    k = c['games']; fct.sort()
    print('\n%s: %d games, mean rank %.2f, first %s' % (name, k, c['rank'] / max(1, k), pc(c['r1'], k)))
    print('  not first: %s of games.  team above had more catches: %s of games (by 1: %s, by 2: %s, by 3+: %s);  level on catches, lost the tie: %s;  other: %s'
          % (pc(k - c['r1'], k), pc(c['behind'], k), pc(c['behind1'], k), pc(c['behind2'], k), pc(c['behind3'], k), pc(c['tie'], k), pc(c['other'], k)))
    print('  ties: lost %s of games, won %s of games (level with the team below); a lost tie was lost by %.1f turns on average'
          % (pc(c['tie'], k), pc(c['tiewon'], k), c['tie_turns'] / max(1, c['tie_n'])))
    print('  first catch of the game is ours: %s;  then first place %s, mean rank %.2f;  when it is not ours: first place %s, mean rank %.2f'
          % (pc(c['firstcatch'], c['anycatch']), pc(c['fc_win'], c['firstcatch']), c['fc_rank'] / max(1, c['firstcatch']), pc(c['nfc_win'], c['nfc']), c['nfc_rank'] / max(1, c['nfc'])))
    print('  our first catch: median turn %s, by turn 5 in %s of games, by turn 15 in %s, none at all in %s'
          % (fct[len(fct) // 2] if fct else '-', pc(sum(x <= 5 for x in fct), k), pc(sum(x <= 15 for x in fct), k), pc(c['zero'], k)))
