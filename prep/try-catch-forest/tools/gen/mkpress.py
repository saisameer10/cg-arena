# builds versions/vlive_press.java = the live code (vlive_41748059) + one switch, F_PRESS: spend dashes on prey in sight.
# Evidence: kb/target25.md (teams rated about 25 dash at prey in 26 to 40 % of the turns in which we dash in 4 to 5 %;
# a dash from 1100 to 2100 doubles to triples the share of contacts that end in a catch within 3 turns, in every group).
import io, os
src = 'E:/New folder/prep/try-catch-forest/versions/vlive_41748059.java'
outs = ['E:/cg-tmp/tcf/sub/vlive_press/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vlive_press.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)


rep("    static boolean approachDash;",
    "    // ---- vlive_press: the live code plus pressing dashes. The live code dashes at prey in sight only for a certain catch,\n"
    "    //      or for a likely one while the unit has dashed at most twice; it stands 1100 to 2100 from prey with a dash in\n"
    "    //      hand twice as long as teams rated 25 and dashes in 5 % of those turns (they: 15 to 40 %).\n"
    "    //      Rule: with the target in sight and a dash ready, dash candidates are allowed and cost as little as an\n"
    "    //      approach dash when (a) the prey is on cooldown and within P_PRESS_MAX (1400 with a predator near), or\n"
    "    //      (b) the prey can dash, is P_PRESS_MIN to P_PRESS_MAX away and no predator is within P_PRESS_SAFE.\n"
    "    //      Under P_PRESS_MIN against prey that can dash, walking catches as often as dashing: the dash is kept.\n"
    "    static final boolean F_PRESS = true;\n"
    "    static final double P_PRESS_MIN = 1100, P_PRESS_MAX = 2100, P_PRESS_SAFE = 2500, P_PRESS_NEAR = 1400;\n"
    "    static final int P_PRESS_FAT = 6;         // no pressing dash beyond this fatigue before turn P_PRESS_LATE\n"
    "    static final int P_PRESS_LATE = 60;       // from here on an unused dash is worth nothing: no fatigue limit\n"
    "    static boolean pressDash;                 // set per unit\n"
    "    static boolean approachDash;")
rep("u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n",
    "u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n"
    "            pressDash = false;\n"
    "            if (F_PRESS && target != null && target.vis && u.cd == 0 && holdLeft(target) == 0 && !planFlee\n"
    "                    && (u.fat <= P_PRESS_FAT || turn > P_PRESS_LATE)) {\n"
    "                double dT = hyp(target.x - u.x, target.y - u.y);\n"
    "                if (target.cd > 0) pressDash = dT <= (ntF > P_PRESS_SAFE ? P_PRESS_MAX : P_PRESS_NEAR);\n"
    "                else pressDash = dT >= P_PRESS_MIN && dT <= P_PRESS_MAX && ntF > P_PRESS_SAFE;\n"
    "            }\n")
rep("(F_DASH && !(walkUnsafe || rush || preyNear || approachDash)))) break;",
    "(F_DASH && !(walkUnsafe || rush || preyNear || approachDash || pressDash)))) break;")
rep("!(walkUnsafe || rush || approachDash || lastReward >= 300000 ||",
    "!(walkUnsafe || rush || approachDash || pressDash || lastReward >= 300000 ||")
rep("sc -= approachDash ? 300 : 700 + 250 * u.fat;",
    "sc -= approachDash || pressDash ? 300 : 700 + 250 * u.fat;")
rep("threats = baseThreats; planFlee = false; planHunt = false; aggro = false;",
    "threats = baseThreats; planFlee = false; planHunt = false; aggro = false; pressDash = false;")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_press written', len(s))
