import io, os
src = 'E:/New folder/prep/try-catch-forest/versions/vlive_41748059.java'
outs = ['E:/cg-tmp/tcf/sub/vlive_late/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vlive_late.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    static long turnStart;\n",
    "    static long turnStart;\n"
    "    // ---- vlive_late: the live arena code plus the three parts of vgo_b that act after a net has landed.\n"
    "    //      On 13 paired battles against real Gold teams the live code caught earlier (0.85 by turn 10 against 0.31)\n"
    "    //      and vgo_b caught more in total (3.15 against 2.54, net hits on prey 2.0 against 1.5).\n"
    "    static final boolean F_COMMIT = true;      // a free unit that can reach held prey in time ignores everything but predators in sight\n"
    "    static final boolean F_HUNTFIRST = true;   // a prey within 1500 that is held or has no dash: soft threat terms x P_HUNTFIRST\n"
    "    static final boolean F_GHOSTPLAN = true;   // ghost 1 on held prey (else the prey nearest our hunters), ghost 2 on the predator nearest our units\n"
    "    static final double P_COMMIT_SLACK = 300, P_HUNTFIRST = 0.5, P_HUNTFIRST_EARLY = 0.3;\n"
    "    static boolean commitOn; static double softK = 1;\n")
rep("        for (Th t : threats) {\n            double m = 1e18;\n            for (int i = 1; i <= 10; i++)",
    "        for (Th t : threats) {\n            if (commitOn && t.w < 1) continue;\n            double tw = t.w < 1 ? t.w * softK : t.w;\n            double m = 1e18;\n            for (int i = 1; i <= 10; i++)")
rep("if (m < lim) { sc -= t.w * deathScale * (1e6 + (lim - m) * 500); if (t.w >= 0.5) lastUnsafe = true; }",
    "if (m < lim) { sc -= tw * deathScale * (1e6 + (lim - m) * 500); if (t.w >= 0.5) lastUnsafe = true; }\n            if (commitOn) continue;")
rep("if (m2 < 0) sc -= t.w * 25 * Math.min(-m2, 1200);", "if (m2 < 0) sc -= tw * 25 * Math.min(-m2, 1200);")
rep("if (F_PROX && t.immob <= 1) sc -= t.w * (hidden", "if (F_PROX && t.immob <= 1) sc -= t.w * softK * (hidden")
rep("!treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * 400;", "!treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * softK * 400;")
rep("            sc += 1.5 * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= deathScale * 30000;",
    "            sc += softK * 1.5 * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= softK * deathScale * 30000;")
rep("            E target = targetOf.get(u);",
    "            E target = targetOf.get(u);\n"
    "            commitOn = F_COMMIT && target != null && target.vis && target.immob > 0\n"
    "                    && hyp(target.x - u.x, target.y - u.y) - CATCH <= MOVE * target.immob + P_COMMIT_SLACK + (u.cd == 0 ? MOVE : 0);\n"
    "            softK = 1;\n"
    "            if (F_HUNTFIRST) for (E q : seenPrey) if (hyp(q.x - u.x, q.y - u.y) < 1500 && (q.immob > 0 || q.cd > 0)) { softK = turn <= 10 ? P_HUNTFIRST_EARLY : P_HUNTFIRST; break; }")
rep('u.tag = bestCert ? "CATCH" : nt < 2500 ? "FLEE"', 'u.tag = bestCert ? "CATCH" : commitOn ? "COMMIT" : nt < 2500 ? "FLEE"')
rep("        List<String> out = new ArrayList<>();", "        commitOn = false; softK = 1;\n        List<String> out = new ArrayList<>();")
rep("        for (E g : ghosts) {\n            E best = null; double bd = 1e18;\n",
    "        int gi = 0;\n        for (E g : ghosts) {\n            E best = null; double bd = 1e18;\n"
    "            int gk = gi++;\n"
    "            if (F_GHOSTPLAN && gk == 0) {\n"
    "                for (E q : seenPrey) if (q.immob > 0 && !taken.contains(q.id)) { double d = hyp(q.x - g.x, q.y - g.y); if (d < bd) { bd = d; best = q; } }\n"
    "                if (best == null && !live.isEmpty()) for (E q : watch) { if (taken.contains(q.id)) continue; double d = 1e18; for (E o : live) d = Math.min(d, hyp(q.x - o.x, q.y - o.y)); d += (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }\n"
    "            } else if (F_GHOSTPLAN && gk == 1 && !live.isEmpty()) {\n"
    "                for (E q : predWatch) { if (taken.contains(q.id)) continue; double d = 1e18; for (E o : live) d = Math.min(d, hyp(q.x - o.x, q.y - o.y)); if (d < bd) { bd = d; best = q; } }\n"
    "            }\n"
    "            if (best == null) bd = 1e18;\n")
rep("            for (E q : watch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y) + (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }",
    "            if (best == null) for (E q : watch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y) + (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_late written', len(s))
