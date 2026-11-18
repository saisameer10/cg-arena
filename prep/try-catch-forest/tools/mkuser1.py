import io
src = 'E:/New folder/prep/try-catch-forest/versions/vlive_41748059.java'
dst = 'E:/New folder/prep/try-catch-forest/versions/vuser1.java'
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


# ---- switches
rep("    static final boolean F_EARLY = true;       // v16: hunt harder until the first catch of the game\n",
    "    static final boolean F_EARLY = true;       // v16: hunt harder until the first catch of the game\n"
    "    // ---- user rules of 2026-11-18 17:30 (each a switch; all off = the bot of submission 41748059)\n"
    "    static final boolean F_SMOKE_ON_PRED = true; // U1: the cloud is thrown on the predator itself, so we leave it and see again at once\n"
    "    static final boolean F_NET_CAREFUL = true;   // U2: attack nets only when a hit is near certain, never along a line with a team mate,\n"
    "                                                 //     only with one of our units close enough to finish, and the netted prey is then hunted hard\n"
    "    static final boolean F_USER_AGGRO = true;    // U3: press until our first catch in games with 3 or 4 units, and whenever our score\n"
    "                                                 //     is not above our predator's (its score = our units caught)\n"
    "    static final double P_FINISH = 1600, P_SURE_CD = 1700, P_SURE_NEAR = 1100;\n")

# ---- U3: when the pressing mode is on
rep("    static boolean early() { return F_EARLY && !firstBlood && preyTeamCatches == 0 && turn <= EARLY_MAX_TURN; }",
    "    static int lostUnits() { int n = 0; for (E u : mine) if (u.ghost) n++; return n; }\n"
    "    static boolean early() {\n"
    "        if (F_USER_AGGRO && myScore < N) {\n"
    "            if (N <= 4 && myScore == 0) return true;                 // small game: until our first catch\n"
    "            if (myScore <= lostUnits()) return true;                 // level with or behind our predator: attack, do not just flee\n"
    "        }\n"
    "        return F_EARLY && !firstBlood && preyTeamCatches == 0 && turn <= EARLY_MAX_TURN;\n"
    "    }")

# ---- U2: a unit whose prey is held and reachable hunts it hard (same pressing terms)
rep("            aggro = early && target != null;",
    "            aggro = early && target != null;\n"
    "            if (F_NET_CAREFUL && target != null && holdLeft(target) > 0 && hyp(target.x - u.x, target.y - u.y) - CATCH <= MOVE * holdLeft(target) + 600) aggro = true;   // go for the kill")

# ---- U2: attack nets
rep("                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;\n                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;\n                // a target that cannot dodge",
    "                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;\n"
    "                if (F_NET_CAREFUL && friendOnLine(u, u.ex + (qx - u.ex) / d * NET_RANGE, u.ey + (qy - u.ey) / d * NET_RANGE, live)) continue;   // no team mate anywhere on the flight line\n"
    "                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;\n                // a target that cannot dodge")
rep("                boolean sure = q.immob == 1 || q.cd > 0 || d <= 1400 || lateral <= 250;\n                // v16: in the early game",
    "                boolean sure = F_NET_CAREFUL ? (q.immob == 1 || (q.cd > 0 && d <= P_SURE_CD) || d <= P_SURE_NEAR || (lateral <= 150 && d <= 1500))\n"
    "                                             : (q.immob == 1 || q.cd > 0 || d <= 1400 || lateral <= 250);\n                // v16: in the early game")
rep("                if (!sure && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;",
    "                if (F_NET_CAREFUL) {\n"
    "                    if (!sure) continue;\n"
    "                    boolean fin = false; for (E h : live) if (h.immob == 0 && hyp(h.ex - qx, h.ey - qy) <= P_FINISH) fin = true;\n"
    "                    if (!fin) continue;                           // nobody close enough to make the catch\n"
    "                } else if (!sure && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;")

# ---- U1: smoke on the predator
rep("        if (ps.isEmpty()) return new double[]{px, py};\n        double cx = 0, cy = 0, ws = 0, dn = 1e18;",
    "        if (ps.isEmpty()) return new double[]{px, py};\n"
    "        if (F_SMOKE_ON_PRED) {\n"
    "            double[] np = null; double nd = 1e18;\n"
    "            for (double[] p : ps) { double d = hyp(p[0] - px, p[1] - py); if (d < nd) { nd = d; np = p; } }\n"
    "            double cap = held ? 1500 : 1950;                         // a held unit cannot walk out: it stays inside the cloud\n"
    "            if (nd <= cap || nd < 1) return new double[]{np[0], np[1]};\n"
    "            return new double[]{px + (np[0] - px) / nd * cap, py + (np[1] - py) / nd * cap};\n"
    "        }\n"
    "        double cx = 0, cy = 0, ws = 0, dn = 1e18;")
io.open(dst, 'w', encoding='utf-8', newline='\n').write(s)
print('written', dst, len(s))
