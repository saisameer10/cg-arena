import io
src = 'E:/New folder/prep/try-catch-forest/versions/v11.java'
dst = 'E:/cg-tmp/tcf/sub/s1/Player.java'
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    // ---- switches for ablation tests",
    "    // ---- sub-versions from the autopsy of battle 924177559 and the user's list (all off = v10)\n"
    "    static final boolean F_CLOUDPLAN = false;   // B1 in our cloud with no predator near: leave it; with one near: stay hidden, keep moving\n"
    "    static final boolean F_SMOKEMID = false;    // B3 cloud centred between us and the predator (covers both, we are out sooner)\n"
    "    static final boolean F_NOSMOKE3 = false;    // B4 no smoke on turns 1 to 3 unless the predator is inside 1500\n"
    "    static final boolean F_NEARNOSMOKE = false; // no smoke when the predator is already inside P_SMOKE_MIN: it arrives anyway\n"
    "    static final boolean F_HELDNET = false;     // a held unit nets the nearest hunter at once, sure aim or not\n"
    "    static final boolean F_HELDDECOY = false;   // a held unit without a net sends a decoy before it smokes\n"
    "    static final boolean F_NETFIRST = false;    // B5 net the hunter that was within P_NETFIRST of us before the move\n"
    "    static final boolean F_FORGET = false;      // B6 forget a remembered prey position after P_FORGET turns\n"
    "    static final boolean F_EARLYAGG = false;    // up to turn P_AGG_T: less distance kept, later smoke, bolder approach dash\n"
    "    static final boolean F_HIDETREE = false;    // nothing left to catch: stand behind a tree, away from the nearest predator\n"
    "    static final boolean F_GHOSTMAP = false;    // ghosts without a target search the map instead of circling\n"
    "    static final double P_CLOUD_TH = 1800, P_CLOUD_OUT = 1500, P_SMOKE_AHEAD = 900, P_SMOKE_MIN = 800, P_NETFIRST = 1500, P_FORGET = 8, P_AGG_T = 10;\n"
    "    static double[] hideGoal;\n"
    "    // ---- switches for ablation tests")

# B1: plan inside a cloud
rep("            if (hyp(px - sx, py - sy) < 100) sc -= 1500;\n            if (smokeHere) sc -= 400;\n        }",
    "            if (hyp(px - sx, py - sy) < 100) sc -= 1500;\n"
    "            if (smokeHere) {\n"
    "                if (!F_CLOUDPLAN) sc -= 400;\n"
    "                else { double nth = 1e18; for (Th t : threats) if (t.w >= 0.4) nth = Math.min(nth, hyp(sx - t.x, sy - t.y)); if (nth > P_CLOUD_TH) sc -= P_CLOUD_OUT; }\n"
    "            }\n        }")
# early aggression: distance kept
rep("sc -= t.w * (hidden ? 0.3 : 1.0) * P_PROX * Math.max(0, P_PROX_R - D);",
    "sc -= t.w * (hidden ? 0.3 : 1.0) * P_PROX * (F_EARLYAGG && turn <= P_AGG_T ? 0.4 : 1) * Math.max(0, P_PROX_R - D);")
# B6 forget
rep("                int age = turn - t.seen; if (age > 25) continue;", "                int age = turn - t.seen; if (age > (F_FORGET ? P_FORGET : 25)) continue;")
# hide behind a tree
rep("if (nt0 > 3600 && !inSmoke(u.x, u.y, 0)) { u.tag = \"HIDE\"; continue; } }",
    "hideGoal = null;\n"
    "                if (nt0 > 3600 && !inSmoke(u.x, u.y, 0)) {\n"
    "                    u.tag = \"HIDE\";\n"
    "                    if (!F_HIDETREE || T == 0) continue;\n"
    "                    // the spot behind the nearest tree, seen from the last known predator (or from the centre)\n"
    "                    double fx = 0, fy = 0, fd = 1e18; for (E t : tracks.values()) if (t.owner == pred && !t.dead) { double dd = hyp(t.x - u.x, t.y - u.y) + (turn - t.seen) * 100; if (dd < fd) { fd = dd; fx = t.x; fy = t.y; } }\n"
    "                    int bt = 0; double btd = 1e18; for (int k = 0; k < T; k++) { double dd = hyp(u.x - tx[k], u.y - ty[k]) - tr[k]; if (dd < btd) { btd = dd; bt = k; } }\n"
    "                    double ax = tx[bt] - fx, ay = ty[bt] - fy, al = Math.max(1, hyp(ax, ay));\n"
    "                    double hx0 = tx[bt] + ax / al * (tr[bt] + UR + 40), hy0 = ty[bt] + ay / al * (tr[bt] + UR + 40);\n"
    "                    double hl = hyp(hx0, hy0); if (hl > R - UR - 300) { hx0 *= (R - UR - 300) / hl; hy0 *= (R - UR - 300) / hl; }\n"
    "                    if (hyp(hx0 - u.x, hy0 - u.y) < 120) continue;\n"
    "                    hideGoal = new double[]{hx0, hy0};\n"
    "                }\n"
    "            } else hideGoal = null;")
rep("            double[] w = steer(u.x, u.y, gx, gy);",
    "            if (hideGoal != null) { gx = hideGoal[0]; gy = hideGoal[1]; wG = 1.0; }\n            double[] w = steer(u.x, u.y, gx, gy);")
# early aggression: approach dash
rep("u.fat <= P_APP_FAT && ntF > P_APP_PRED &&", "u.fat <= P_APP_FAT && ntF > (F_EARLYAGG && turn <= P_AGG_T ? 2000 : P_APP_PRED) &&")
# nets at the hunter
rep("                boolean need = (u.immob > 0 && d <= CATCH + MOVE * u.immob + MOVE) || d <= P_DNET_NEED;",
    "                boolean need = (u.immob > 0 && d <= CATCH + MOVE * u.immob + MOVE) || d <= P_DNET_NEED\n"
    "                        || (F_NETFIRST && hyp(e.x - u.x, e.y - u.y) <= P_NETFIRST) || (F_HELDNET && u.immob > 0);")
rep("                boolean hit = e.cd > 0 || d <= P_DNET_HIT || lateral <= 250;",
    "                boolean hit = e.cd > 0 || d <= P_DNET_HIT || lateral <= 250 || (F_HELDNET && u.immob > 0);")
# smoke: when
rep("            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < P_SMOKE_D && line);",
    "            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < (F_EARLYAGG && turn <= P_AGG_T ? 1500 : P_SMOKE_D) && line);\n"
    "            if (F_NOSMOKE3 && turn <= 3 && D >= 1500 && u.immob == 0) wantSmoke = false;\n"
    "            if (F_NEARNOSMOKE && D < P_SMOKE_MIN) wantSmoke = false;\n"
    "            if (F_HELDDECOY && u.immob > 0 && decoys > 0 && turn - u.lastDecoy > 8 && D < 3500) {\n"
    "                out.add(\"DECOY \" + u.id + \" \" + Math.round(near.x) + \" \" + Math.round(near.y)); decoys--; u.usedPower = true; u.lastDecoy = turn; continue;\n"
    "            }")
# smoke: where
rep("if (ml > 50) { cx += mx / ml * 900; cy += my / ml * 900; } }\n",
    "if (ml > 50) { cx += mx / ml * P_SMOKE_AHEAD; cy += my / ml * P_SMOKE_AHEAD; } }\n"
    "                if (F_SMOKEMID) { double k = Math.min(dl / 2, 1700); cx = u.ex + (hx - u.ex) / dl * k; cy = u.ey + (hy - u.ey) / dl * k; }\n")
# ghosts search
rep("            else { double a = (g.id - myId * N) * 2 * Math.PI / Math.max(1, N) - turn * 0.2; gx = Math.cos(a) * 4000; gy = Math.sin(a) * 4000; }",
    "            else {\n"
    "                int cell = F_GHOSTMAP && !preyGone ? searchCell(g.x, g.y, claimed) : -1;\n"
    "                if (cell >= 0) { claimed.add(cell); gx = cellX(cell); gy = cellY(cell); }\n"
    "                else { double a = (g.id - myId * N) * 2 * Math.PI / Math.max(1, N) - turn * 0.2; gx = Math.cos(a) * 4000; gy = Math.sin(a) * 4000; }\n"
    "            }")
import os
os.makedirs(os.path.dirname(dst), exist_ok=True)
io.open(dst, 'w', encoding='utf-8', newline='\n').write(s)
print('s1 written', len(s))
