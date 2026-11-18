import io, os, sys
src = 'E:/cg-tmp/tcf/sub/s1/Player.java'
dst = 'E:/cg-tmp/tcf/sub/commit/Player.java'
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


on = 'true' if len(sys.argv) > 1 and sys.argv[1] == 'on' else 'false'
rep("    static boolean t1Flee;\n",
    "    static boolean t1Flee;\n"
    "    // ---- commit to netted prey: 7 of v10's 18 wasted net hits in Gold were a hunter 1100 to 1800 from the held prey\n"
    "    //      that turned away from a predator it only remembered (kb/gold-autopsy.md, tools netfail)\n"
    "    static final boolean F_COMMIT = " + on + ";   // a free unit that can reach held prey in time ignores everything but predators in sight\n"
    "    static final double P_COMMIT_SLACK = 300;  // reach test: distance - 440 <= 600 * turns held + slack (+600 if our dash is ready)\n"
    "    static boolean commitOn;\n")
# eval: only predators in sight count, and only the hard rule
rep("        for (Th t : threats) {\n            double m = 1e18;",
    "        for (Th t : threats) {\n            if (commitOn && t.w < 1) continue;                 // remembered or extrapolated: not for a committed unit\n            double m = 1e18;")
rep("if (m < lim) { sc -= t.w * deathScale * (1e6 + (lim - m) * 500); if (t.w >= 0.5) lastUnsafe = true; }",
    "if (m < lim) { sc -= t.w * deathScale * (1e6 + (lim - m) * 500); if (t.w >= 0.5) lastUnsafe = true; }\n"
    "            if (commitOn) continue;                            // no soft distance, margin, net line, wall, lookahead or ways-out")
# unit loop: who is committed
rep("            E target = targetOf.get(u);",
    "            E target = targetOf.get(u);\n"
    "            commitOn = false;\n"
    "            if (F_COMMIT && target != null && target.vis && target.immob > 0\n"
    "                    && hyp(target.x - u.x, target.y - u.y) - CATCH <= MOVE * target.immob + P_COMMIT_SLACK + (u.cd == 0 ? MOVE : 0)) commitOn = true;")
rep('u.tag = bestCert ? "CATCH" : nt < 2500 ? "FLEE"', 'u.tag = bestCert ? "CATCH" : commitOn ? "COMMIT" : nt < 2500 ? "FLEE"')
rep("        List<String> out = new ArrayList<>();", "        commitOn = false;\n        List<String> out = new ArrayList<>();")
os.makedirs(os.path.dirname(dst), exist_ok=True)
io.open(dst, 'w', encoding='utf-8', newline='\n').write(s)
print('commit source written, F_COMMIT =', on, len(s))
