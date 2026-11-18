import io, os
src = 'E:/New folder/prep/try-catch-forest/versions/vlive_41748059.java'
outs = ['E:/cg-tmp/tcf/sub/vlive_engine/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vlive_engine.java']
s = io.open(src, encoding='utf-8').read()
m8 = io.open('E:/cg-tmp/tcf/sub/mks8.py', encoding='utf-8').read()
SEARCH = m8[m8.index("SEARCH = r'''") + len("SEARCH = r'''"):m8.index("'''\nrep(")]
SEARCH = SEARCH.replace("// ---- vchase: two-ply search with the referee's exact movement rule for BOTH sides",
    "// ---- vlive_engine: the live code plus the two-ply search of vchase in its corrected form.\n"
    "    //      The first form replaced the five-turn chase and lost 0.13 rank locally; here the chase stays and the\n"
    "    //      search only vetoes a move after which we are caught within two turns whatever we do.")
SEARCH = SEARCH.replace("static final boolean F_MM_FLEE = true;     // flight: our move, the predator's best reply (16 directions x walk/dash), our best next move",
    "static final boolean F_MM_FLEE = true;     // veto: against the predator's best reply (16 directions x walk/dash) no next move of ours escapes")
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
rep("    static double eval(E u, double px, double py, double ux, double uy, boolean dash,", SEARCH + "    static double eval(E u, double px, double py, double ux, double uy, boolean dash,")
rep("if (d0 + rq - mySp < CATCH - 25) reward = Math.max(reward, 300000);", "if (!F_MM_STRIKE && d0 + rq - mySp < CATCH - 25) reward = Math.max(reward, 300000);")
rep("        if (certain != null) certain[0] = reward >= 300000;",
    "        if (F_MM_STRIKE && !u.ghost && mmPrey != null && reward < 300000) {\n"
    "            double dq0 = hyp(mmPrey.x - sx, mmPrey.y - sy), dq1 = hyp(mmPrey.x - px, mmPrey.y - py);\n"
    "            if (dq0 < mySp + DASH + CATCH && mySp > 1 && mmCaught(sx, sy, px, py, mmPrey)) reward = 300000;\n"
    "            else if (!mmHurry && dq1 < 1500 && dq1 < dq0 && mmForced2(u, px, py, dash, mmPrey)) reward = Math.max(reward, P_FORCE2);\n"
    "        }\n"
    "        if (certain != null) certain[0] = reward >= 300000;")
rep("            double rm = F_ROLL ? rollout(px, py, ux, uy) : 2600;",
    "            double rm = F_ROLL ? rollout(px, py, ux, uy) : 2600;\n"
    "            if (F_MM_FLEE && !mmPreds.isEmpty() && u.immob == 0 && !mmHurry && mmFlee(u, px, py, dash) < CATCH + 20) sc -= deathScale * 30000;")
rep("        boolean preyGone = myScore >= N;\n", "        boolean preyGone = myScore >= N;\n        replyCache.clear(); reply2Cache.clear();\n")
rep("            E target = targetOf.get(u);",
    "            E target = targetOf.get(u);\n"
    "            mmPreds = new ArrayList<>(); mmPrey = null; mmHurry = System.nanoTime() - turnStart > 15_000_000L;\n"
    "            if (F_MM_FLEE) {\n"
    "                E p1 = null, p2 = null; double d1 = 1800, d2 = 1800;\n"
    "                for (E e : seenPred) { if (e.immob > 1) continue; double d = hyp(e.x - u.x, e.y - u.y); if (d < d1) { p2 = p1; d2 = d1; p1 = e; d1 = d; } else if (d < d2) { p2 = e; d2 = d; } }\n"
    "                if (p1 != null) mmPreds.add(p1); if (p2 != null) mmPreds.add(p2);\n"
    "            }\n"
    "            if (F_MM_STRIKE) { double bq = 2200; for (E q : seenPrey) { if (q.immob > 0) continue; double d = hyp(q.x - u.x, q.y - u.y); if (d < bq) { bq = d; mmPrey = q; } } }")
rep("        List<String> out = new ArrayList<>();", "        mmPreds = new ArrayList<>(); mmPrey = null;\n        List<String> out = new ArrayList<>();")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_engine written', len(s))
