# usage: python mkversus.py <out-dir> <order> <A.java> <B.java> [<C.java>]
# Writes <out-dir>/Player.java holding two or three versions of the bot (classes VA, VB, VC).
# <order> gives the version of seats 0, 1, 2, e.g. "AB" with opponents '["me","default"]' (seat 2 = boss) or
# "ABC", "BCA", "CAB" with opponents '["me","me"]' for a round robin where every version sits in every seat.
# Rotating one order keeps the cycle (in ABC, BCA and CAB version A always hunts B): for a fair test of three
# versions play both cycles, i.e. also ACB, CBA and BAC.
# Opponents stay the same for every version, which player ids from the arena do not (they go stale on a resubmit).
import io, sys, os, re


def load(p, name):
    s = io.open(p, encoding='utf-8').read()
    s = re.sub(r'^import [^\n]+\n', '', s, flags=re.M)
    assert len(re.findall(r'^class Player \{', s, flags=re.M)) == 1
    s = re.sub(r'^class Player \{', 'class %s {' % name, s, flags=re.M)
    assert 'Player.' not in s
    # CodinGame refuses code over 100,000 characters: drop comments and indentation
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'(^|\s)//[^\n]*', '', s)
    s = '\n'.join(l.strip() for l in s.split('\n') if l.strip())
    return s


out, order, files = sys.argv[1], sys.argv[2], sys.argv[3:]
names = ['VA', 'VB', 'VC'][:len(files)]
calls = ' else '.join("if (v == '%s') %s.main(args);" % (n[1], n) for n in names)
main = '''import java.io.*;
import java.util.*;

class Player {
    public static void main(String[] args) throws IOException {
        BufferedInputStream in = new BufferedInputStream(System.in, 1 << 16);
        in.mark(64); int seat = -1, c;
        while ((c = in.read()) != 10 && c != -1) if (c >= '0' && c <= '9') seat = c - '0';
        in.reset(); System.setIn(in);
        String order = "%s";
        char v = order.charAt(seat < order.length() ? seat : 0);
        %s
    }
}
''' % (order, calls)
os.makedirs(out, exist_ok=True)
io.open(os.path.join(out, 'Player.java'), 'w', encoding='utf-8', newline='\n').write(main + '\n' + '\n'.join(load(f, n) for f, n in zip(files, names)))
