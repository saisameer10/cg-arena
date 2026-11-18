# usage: python mkdbg.py <Player.java> <out-dir>   - writes <out-dir>/Player.java, the debug variant of the bot.
# The debug variant prints on stderr: TREE lines, every input line (M = my unit, E = anything else), the predicted
# end positions (P ...) and the time and power pool of the turn (T ...). audit.py, deathsdbg.py, replay.py and
# slidefit.py read these lines from the test game log. Decisions are identical to the release build.
import io,sys,os
s=io.open(sys.argv[1],encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:50],s.count(a)); s=s.replace(a,b)
rep("            st = new StringTokenizer(in.readLine());\n            int id = Integer.parseInt(st.nextToken()); String type",
    "            String raw = in.readLine(); st = new StringTokenizer(raw);\n            if (!raw.contains(\" UNIT \" + myId + \" \")) System.err.println(\"E \" + raw); else System.err.println(\"M \" + raw);\n            int id = Integer.parseInt(st.nextToken()); String type")
rep("            readTurn(in, line);\n            String cmd;",
    "            long t0 = System.nanoTime(); readTurn(in, line);\n            String cmd;")
rep("            System.out.println(cmd);",
    "            StringBuilder sb = new StringBuilder(\"P\"); for (E u : mine) if (!u.ghost) sb.append(' ').append(u.id).append(' ').append(Math.round(u.ex)).append(' ').append(Math.round(u.ey));\n            System.err.println(sb); System.err.println(\"T \" + turn + \" ms \" + (System.nanoTime() - t0) / 1000000.0 + \" pw \" + nets + \" \" + smokes + \" \" + decoys);\n            System.out.println(cmd);")
rep("        for (int i = 0; i < T; i++) { StringTokenizer st = new StringTokenizer(in.readLine()); st.nextToken();",
    "        for (int i = 0; i < T; i++) { String rawT = in.readLine(); System.err.println(\"TREE \" + rawT); StringTokenizer st = new StringTokenizer(rawT); st.nextToken();")
os.makedirs(sys.argv[2],exist_ok=True)
io.open(os.path.join(sys.argv[2],'Player.java'),'w',encoding='utf-8',newline='\n').write(s)
