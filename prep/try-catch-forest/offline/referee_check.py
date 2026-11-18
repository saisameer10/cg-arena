# usage: python referee_check.py <debug-game.json | folder>...
# Replays real games through the local referee (sim/Replay.java) with the commands the teams really sent, and
# compares its decisions with the real referee text of the same game:
#   catches (hunter, prey) per turn, net hits (thrower, unit hit) per turn, and our own unit positions per turn.
# Needs debug games (our bot's stderr: TREE, M and E lines), e.g. the games made with tools/rerun.sh + mkdbg.py.
import io, json, sys, re, os, math, subprocess, glob, statistics, tempfile

SIM = 'E:/cg-tmp/tcf/offline/simc'
JAVA = os.environ.get('JAVA_BIN') or 'D:/tools/jdk-21/bin/java.exe'


def load(fn):
    d = json.load(io.open(fn, encoding='utf-8'))
    return d['log'] if 'log' in d else d


def build(log):
    frames = log['frames']
    me = [a['index'] for a in log['agents'] if a.get('me')]
    if not me:
        return None, 'no me flag'
    me = me[0]
    first = [f for f in frames if f.get('agent') == me and f.get('stderr')]
    if not first:
        return None, 'no debug lines'
    ls = first[0]['stderr'].split('\n')
    trees = [tuple(map(float, l.split()[2:5])) for l in ls if l.startswith('TREE ')]
    if not trees:
        return None, 'no TREE lines'
    M1 = {int(l.split()[1]): (float(l.split()[4]), float(l.split()[5])) for l in ls if l.startswith('M ')}
    N = len(M1)
    units = {}
    for uid, (x, y) in M1.items():                                   # ours
        units[uid] = (me, x, y)
    for p in range(3):                                               # the others: rotations of ours (verified on 22 units)
        if p == me:
            continue
        a = (p - me) * 2 * math.pi / 3
        for j in range(N):
            mx, my = M1[j + me * N]
            units[p * N + j] = (p, mx * math.cos(a) - my * math.sin(a), mx * math.sin(a) + my * math.cos(a))
    # turns: a new turn starts when the agent index does not increase
    turns = []; cur = None; last = -1
    for f in frames:
        a = f.get('agent')
        if a is None:
            continue
        if cur is None or a <= last:
            cur = {'cmd': {}, 'summ': [], 'M': {}}
            turns.append(cur)
        last = a
        if f.get('stdout') is not None:
            cur['cmd'][a] = f.get('stdout')
        cur['summ'] += [s for s in (f.get('summary') or '').split('\n') if s]
        if a == me and f.get('stderr'):
            for l in f['stderr'].split('\n'):
                if l.startswith('M '):
                    x = l.split(); cur['M'][int(x[1])] = (float(x[4]), float(x[5]), x[8] == '1')
    return {'me': me, 'N': N, 'trees': trees, 'units': units, 'turns': turns}, None


def replay_input(g, path):
    trees = g['trees']; N = g['N']; units = g['units']
    lines = [f'N {N}', f'T {len(trees)}'] + [f'{x:.0f} {y:.0f} {r:.0f}' for x, y, r in trees]
    lines += [f'U {len(units)}'] + [f'{uid} {o} {x:.0f} {y:.0f}' for uid, (o, x, y) in sorted(units.items())]
    lines += [f'TURNS {len(g["turns"])}']
    for k, t in enumerate(g['turns'], 1):
        lines.append(f'TURN {k}')
        for s in range(3):
            c = t['cmd'].get(s)
            lines.append('CMD %d %s' % (s, c if c else '-'))
    io.open(path, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')


def real_events(g):
    catches = set(); nets = set(); pos = {}
    for k, t in enumerate(g['turns'], 1):
        for s in t['summ']:
            for m in re.finditer(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s):
                catches.add((k, int(m.group(2)), int(m.group(4))))
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m and ' nets ' in s:
                tail = s.split(' nets ', 1)[1]
                for pl, un in re.findall(r"\$(\d)'s agent (\d+)", tail):
                    nets.add((k, int(m.group(2)), int(un)))
        for uid, (x, y, gh) in t['M'].items():
            pos[(k, uid)] = (x, y, gh)
    return catches, nets, pos


def local(path):
    out = subprocess.run([JAVA, '-cp', SIM, 'Replay', path], capture_output=True, text=True, encoding='utf-8').stdout
    catches = set(); nets = set(); pos = {}; ended = 0
    for l in out.split('\n'):
        f = l.split()
        if not f:
            continue
        if f[0] == 'CATCH': catches.add((int(f[1]), int(f[2]), int(f[3])))
        elif f[0] == 'NET': nets.add((int(f[1]), int(f[2]), int(f[3])))
        elif f[0] == 'POS': pos[(int(f[1]), int(f[2]))] = (float(f[3]), float(f[4]))
        elif f[0] == 'END': ended = int(f[1])
    return catches, nets, pos, ended


def compare(fn):
    log = load(fn)
    g, why = build(log)
    if g is None:
        return None, why
    tmp = os.path.join(tempfile.gettempdir(), 'refcheck.txt')
    replay_input(g, tmp)
    rc, rn, rp = real_events(g)
    lc, ln, lp, ended = local(tmp)
    # our own units: real position at the start of turn k+1 against the local end-of-turn-k position
    errs = []
    for (k, uid), (x, y, gh) in rp.items():
        if gh or k - 1 < 1 or (k - 1, uid) not in lp:
            continue
        lx, ly = lp[(k - 1, uid)]
        errs.append(math.hypot(lx - x, ly - y))
    res = {
        'file': os.path.basename(fn), 'turns_real': len(g['turns']), 'turns_local': ended,
        'catch_real': len(rc), 'catch_local': len(lc), 'catch_both': len(rc & lc),
        'net_real': len(rn), 'net_local': len(ln), 'net_both': len(rn & ln),
        'pos_n': len(errs), 'pos_med': statistics.median(errs) if errs else None,
        'pos_p90': sorted(errs)[int(len(errs) * 0.9)] if errs else None,
        'pos_over20': sum(e > 20 for e in errs),
    }
    return res, None


if __name__ == '__main__':
    files = []
    for a in sys.argv[1:]:
        files += sorted(glob.glob(os.path.join(a, '*.json'))) if os.path.isdir(a) else [a]
    rows = []
    for fn in files:
        r, why = compare(fn)
        if r is None:
            print('skip', os.path.basename(fn), why); continue
        rows.append(r)
        print('%-14s turns %3d/%3d | catches real %3d local %3d both %3d | net hits real %3d local %3d both %3d | our positions n %4d median %5.1f p90 %6.1f >20: %d' % (
            r['file'][:14], r['turns_real'], r['turns_local'], r['catch_real'], r['catch_local'], r['catch_both'],
            r['net_real'], r['net_local'], r['net_both'], r['pos_n'], r['pos_med'] or 0, r['pos_p90'] or 0, r['pos_over20']))
    if rows:
        cr = sum(r['catch_real'] for r in rows); cb = sum(r['catch_both'] for r in rows); cl = sum(r['catch_local'] for r in rows)
        nr = sum(r['net_real'] for r in rows); nb = sum(r['net_both'] for r in rows); nl = sum(r['net_local'] for r in rows)
        print('TOTAL games %d: catches recall %.1f%% precision %.1f%% | net hits recall %.1f%% precision %.1f%%' % (
            len(rows), 100 * cb / max(1, cr), 100 * cb / max(1, cl), 100 * nb / max(1, nr), 100 * nb / max(1, nl)))
