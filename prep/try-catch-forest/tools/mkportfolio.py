# usage: python mkportfolio.py <out-file.java> <default.java> <bot.java>=<sizes> [<bot.java>=<sizes> ...]
# Writes one bot (class Player) that chooses, on turn 1, which of several complete bots plays the game, by the
# number of units per team. Example:
#   python mkportfolio.py versions/vport.java versions/vlive.java versions/vmimic_a.java=4 versions/v10.java=6
# plays vmimic_a in four-unit games, v10 in six-unit games and vlive in all others.
# The wrapper reads the start-up input and the first turn byte by byte, counts our units, then hands the same bytes
# followed by the rest of standard input to the chosen bot, so each bot plays exactly as it would alone.
# Sources lose comments and indentation (CodinGame refuses code over 100,000 characters).
import io, sys, re


def load(p, name):
    s = io.open(p, encoding='utf-8').read()
    s = re.sub(r'^import [^\n]+\n', '', s, flags=re.M)
    assert len(re.findall(r'^class Player \{', s, flags=re.M)) == 1, p
    s = re.sub(r'^class Player \{', 'class %s {' % name, s, flags=re.M)
    assert 'Player.' not in s, 'a reference to Player. in ' + p
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'(^|\s)//[^\n]*', '', s)
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip())


out, default = sys.argv[1], sys.argv[2]
alts = [a.rsplit('=', 1) for a in sys.argv[3:]]
names = ['V%s' % chr(66 + i) for i in range(len(alts))]
branches = ''
for (f, sizes), n in zip(alts, names):
    cond = ' || '.join('mine == %d' % int(x) for x in sizes.split(','))
    branches += 'if (%s) %s.main(args); else ' % (cond, n)
main = '''import java.io.*;
import java.util.*;

class Player {
    static String line(InputStream in, ByteArrayOutputStream buf) throws IOException {
        StringBuilder sb = new StringBuilder(); int c;
        while ((c = in.read()) != -1) { buf.write(c); if (c == 10) break; sb.append((char) c); }
        return sb.toString().trim();
    }
    public static void main(String[] args) throws IOException {
        InputStream in = System.in; ByteArrayOutputStream buf = new ByteArrayOutputStream();
        String myId = line(in, buf); line(in, buf);
        int trees = Integer.parseInt(line(in, buf));
        for (int i = 0; i < trees; i++) line(in, buf);
        line(in, buf); line(in, buf);
        int n = Integer.parseInt(line(in, buf)), mine = 0;
        for (int i = 0; i < n; i++) { String[] f = line(in, buf).split(" "); if (f.length > 2 && f[1].equals("UNIT") && f[2].equals(myId)) mine++; }
        System.setIn(new SequenceInputStream(new ByteArrayInputStream(buf.toByteArray()), in));
        %sVA.main(args);
    }
}
''' % branches
body = main + '\n' + load(default, 'VA') + '\n' + '\n'.join(load(f, n) for (f, s), n in zip(alts, names)) + '\n'
io.open(out, 'w', encoding='utf-8', newline='\n').write(body)
print('written', out, len(body), 'characters;', 'default', default, '|', ', '.join('%s for %s units' % (f, s) for f, s in alts))
