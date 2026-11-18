# usage: python mkhybrid.py <out-file.java> <A.java> <B.java> <sizes>
# Writes one bot (class Player) that plays as B in games whose number of units per team is in <sizes>
# (comma separated, e.g. "4" or "4,5") and as A in all other games. The team size is counted on the first turn,
# before either bot has read anything: the wrapper reads the start-up input and the first turn byte by byte,
# then hands the same bytes, followed by the rest of standard input, to the chosen bot.
# Both sources lose their comments and indentation (CodinGame refuses code over 100,000 characters).
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


out, a, b, sizes = sys.argv[1:5]
cond = ' || '.join('mine == %d' % int(x) for x in sizes.split(','))
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
        if (%s) VB.main(args); else VA.main(args);
    }
}
''' % cond
io.open(out, 'w', encoding='utf-8', newline='\n').write(main + '\n' + load(a, 'VA') + '\n' + load(b, 'VB') + '\n')
print('written', out, 'B plays team sizes', sizes)
