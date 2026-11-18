# Offline arena for Try Catch Forest: plays bots against each other and against the league-boss stand-in with the
# local referee (sim/Sim.java), no CodinGame account, API or test game needed.
#
# usage:
#   python arena.py compile                         compile every bot in versions/ and the boss stand-in
#   python arena.py boss <bot> [--games N]          bot in seat 0 against two boss stand-ins, compared with the real boss games
#   python arena.py tourney <bot> <bot> <bot> [--games N]   three bots, every seat order (both cycles), mean rank per bot
#   python arena.py check [folder]                  local referee against the real games (needs debug logs)
#   python arena.py replay <debug-game.json> ...    the same check for single games
# A bot is a name from versions/ (e.g. v10), or a path to a folder with a compiled Player.class, or a .java file.
import argparse, glob, io, json, os, re, shutil, statistics, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                                  # prep/try-catch-forest
VERSIONS = os.path.join(ROOT, 'versions')
SIM_SRC = os.path.join(ROOT, 'sim')
BUILD = os.environ.get('TCF_OFFLINE_BUILD', 'E:/cg-tmp/tcf/offline/build')
JAVAC = os.environ.get('JAVAC_BIN') or 'D:/tools/jdk-21/bin/javac.exe'
JAVA = os.environ.get('JAVA_BIN') or 'D:/tools/jdk-21/bin/java.exe'
BOSS_SRC = os.path.join(HERE, 'bossproxy', 'Player.java')
SIMC = os.path.join(BUILD, 'simc')


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', **kw)


def compile_src(src, name):
    """Compile one bot source into BUILD/name and return the folder (class Player)."""
    out = os.path.join(BUILD, name)
    os.makedirs(out, exist_ok=True)
    cls = os.path.join(out, 'Player.class')
    if os.path.exists(cls) and os.path.getmtime(cls) >= os.path.getmtime(src):
        return out
    r = run([JAVAC, '-nowarn', '-d', out, src])
    if r.returncode != 0:
        raise SystemExit('compile failed: %s\n%s' % (src, r.stderr))
    return out


def compile_referee():
    os.makedirs(SIMC, exist_ok=True)
    srcs = [os.path.join(SIM_SRC, 'Sim.java'), os.path.join(SIM_SRC, 'Replay.java')]
    r = run([JAVAC, '-nowarn', '-d', SIMC] + srcs)
    if r.returncode != 0:
        raise SystemExit('referee compile failed\n' + r.stderr)


def resolve(bot):
    """A version name, a .java file, or a folder with Player.class -> folder with Player.class."""
    if bot == 'boss':
        return compile_src(BOSS_SRC, 'boss')
    if os.path.isdir(bot):
        return bot
    if bot.endswith('.java'):
        return compile_src(bot, os.path.splitext(os.path.basename(bot))[0] + '_' + str(abs(hash(os.path.abspath(bot))) % 10000))
    prebuilt = os.path.join(BUILD, bot, 'Player.class')
    if os.path.exists(prebuilt):
        return os.path.join(BUILD, bot)
    src = os.path.join(VERSIONS, bot + '.java')
    if not os.path.exists(src):
        raise SystemExit('no such bot: %s (versions: %s)' % (bot, ', '.join(sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(VERSIONS, '*.java'))))))
    return compile_src(src, bot)


def cmd_compile(_):
    compile_referee()
    for src in sorted(glob.glob(os.path.join(VERSIONS, '*.java'))):
        compile_src(src, os.path.basename(src)[:-5])
    compile_src(BOSS_SRC, 'boss')
    print('compiled into', BUILD)
    print('bots:', ', '.join(sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(VERSIONS, '*.java')))) + ', boss')


def sim(args):
    compile_referee()
    r = run([JAVA, '-cp', SIMC, 'Sim'] + args)
    if r.returncode != 0:
        raise SystemExit('referee failed:\n' + r.stderr[-2000:])
    return r.stdout


REAL_BOSS = os.path.join(HERE, 'boss_games.txt')


def real_boss_stats():
    """Mean rank, our catches and losses, and the net throws of both boss seats, over the real boss games."""
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    from seatstats import summ
    rows = [l.split('\t') for l in io.open(REAL_BOSS, encoding='utf-8').read().strip().split('\n') if l]
    R = []; NB = []
    for fn, me, bosses, opt in rows:
        me = int(me); r = summ(fn, me)
        if not r:
            continue
        R.append(r)
        d = json.load(io.open(fn, encoding='utf-8')); log = d['log'] if 'log' in d else d
        nb = sum(1 for f in log['frames'] for s in (f.get('summary') or '').split('\n') if re.match(r"\$[12]'s agent \d+ at .* throws a net", s))
        NB.append(nb)
    n = len(R)
    return {'games': n, 'rank': sum(r['rank'] for r in R) / n, 'catches': sum(r['catches'] for r in R) / n,
            'lost': sum(r['lost'] for r in R) / n, 'boss_nets': sum(NB) / n,
            'win': sum(1 for r in R if r['rank'] == 1) / n}


def cmd_boss(a):
    bot = resolve(a.bot)
    boss = resolve('boss')
    out = sim(['fixed', str(a.games), str(a.threads), str(a.seed), 'us=' + bot, 'boss=' + boss, 'boss=' + boss])
    print(out.strip())
    real = real_boss_stats()
    print('\nreal boss games (%d, us in seat 0 with v1/v5/v10 etc.): rank %.3f  catches %.2f  lost %.2f  win %.0f%%  boss nets per game (both seats) %.2f' % (
        real['games'], real['rank'], real['catches'], real['lost'], 100 * real['win'], real['boss_nets']))
    print('the stand-in is a check of our own numbers against the real boss, not the boss itself (kb/offline.md).')


def cmd_tourney(a):
    bots = [resolve(b) for b in a.bots]
    if len(bots) != 3:
        raise SystemExit('tourney takes exactly three bots (a three-way round robin needs three seats)')
    names = a.bots
    out = sim(['%d' % a.games, str(a.threads), str(a.seed)] + ['%s=%s' % (n, b) for n, b in zip(names, bots)])
    print(out.strip())


def cmd_check(a):
    sys.path.insert(0, HERE)
    import referee_check as rc
    files = []
    for p in (a.paths or ['E:/cg-tmp/tcf/gold/r10', 'E:/cg-tmp/tcf/gold/g10']):
        files += sorted(glob.glob(os.path.join(p, '*.json'))) if os.path.isdir(p) else [p]
    compile_referee()
    rows = []
    for fn in files:
        r, why = rc.compare(fn)
        if r:
            rows.append(r)
            print('%-14s catches real %3d local %3d both %3d | net hits real %3d local %3d both %3d | positions median %.1f' % (
                r['file'][:14], r['catch_real'], r['catch_local'], r['catch_both'], r['net_real'], r['net_local'], r['net_both'], r['pos_med'] or 0))
    if rows:
        cr = sum(r['catch_real'] for r in rows); cb = sum(r['catch_both'] for r in rows); cl = sum(r['catch_local'] for r in rows)
        nr = sum(r['net_real'] for r in rows); nb = sum(r['net_both'] for r in rows); nl = sum(r['net_local'] for r in rows)
        print('TOTAL %d games: catches recall %.1f%% precision %.1f%% | net hits recall %.1f%% precision %.1f%%' % (
            len(rows), 100 * cb / max(1, cr), 100 * cb / max(1, cl), 100 * nb / max(1, nr), 100 * nb / max(1, nl)))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('compile').set_defaults(f=cmd_compile)
    b = sub.add_parser('boss'); b.add_argument('bot'); b.add_argument('--games', type=int, default=200); b.add_argument('--threads', type=int, default=2); b.add_argument('--seed', type=int, default=1); b.set_defaults(f=cmd_boss)
    t = sub.add_parser('tourney'); t.add_argument('bots', nargs=3); t.add_argument('--games', type=int, default=288); t.add_argument('--threads', type=int, default=2); t.add_argument('--seed', type=int, default=1); t.set_defaults(f=cmd_tourney)
    c = sub.add_parser('check'); c.add_argument('paths', nargs='*'); c.set_defaults(f=cmd_check)
    args = ap.parse_args()
    args.f(args)
