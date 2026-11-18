import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Replays a real game through the local referee (Sim.Game): the map, the start positions and the commands the teams
 * really sent, turn by turn. Prints what the local referee decided, so that it can be compared with the referee text
 * of the real game (see offline/referee_check.py, which writes the input file).
 *
 * input file (one item per line):
 *   N <units per team>
 *   T <tree count>, then T lines "x y r"
 *   U <unit count>, then U lines "id owner x y"
 *   TURNS <count>, then per turn: "TURN k" and three lines "CMD seat <commands>" ("-" = the team sent nothing)
 * output lines: "CATCH turn hunter prey", "NET turn thrower hit", "POS turn id x y" for every unit alive, and "END turn".
 */
public class Replay {
    public static void main(String[] args) throws IOException {
        List<String> ls = Files.readAllLines(Paths.get(args[0]));
        int i = 0;
        int N = Integer.parseInt(ls.get(i++).split("\\s+")[1]);
        int T = Integer.parseInt(ls.get(i++).split("\\s+")[1]);
        double[] tx = new double[T], ty = new double[T], tr = new double[T];
        for (int k = 0; k < T; k++) { String[] f = ls.get(i++).trim().split("\\s+"); tx[k] = Double.parseDouble(f[0]); ty[k] = Double.parseDouble(f[1]); tr[k] = Double.parseDouble(f[2]); }
        int U = Integer.parseInt(ls.get(i++).split("\\s+")[1]);
        Sim.U[] units = new Sim.U[3 * N];
        for (int k = 0; k < U; k++) {
            String[] f = ls.get(i++).trim().split("\\s+");
            Sim.U u = new Sim.U(); u.id = Integer.parseInt(f[0]); u.owner = Integer.parseInt(f[1]);
            u.x = Double.parseDouble(f[2]); u.y = Double.parseDouble(f[3]); units[u.id] = u;
        }
        int turns = Integer.parseInt(ls.get(i++).split("\\s+")[1]);
        Sim.Game g = new Sim.Game(tx, ty, tr, units, N);
        StringBuilder out = new StringBuilder();
        for (int t = 1; t <= turns; t++) {
            i++;                                            // "TURN k"
            String[] cmd = new String[3];
            for (int s = 0; s < 3; s++) {
                String l = ls.get(i++);                     // "CMD seat text"
                String text = l.length() > 6 ? l.substring(6) : "-";
                cmd[s] = text.equals("-") ? null : text;
            }
            g.turn = t;
            g.play(cmd);
            for (int[] e : g.catchEv) if (e[0] == t) out.append("CATCH ").append(t).append(' ').append(e[1]).append(' ').append(e[2]).append('\n');
            for (int[] e : g.netEv) if (e[0] == t) out.append("NET ").append(t).append(' ').append(e[1]).append(' ').append(e[2]).append('\n');
            for (Sim.U u : units) if (!u.ghost && !g.out[u.owner]) out.append("POS ").append(t).append(' ').append(u.id).append(' ').append(Math.round(u.x)).append(' ').append(Math.round(u.y)).append('\n');
            out.append("END ").append(t).append('\n');
            if (g.over()) break;
        }
        System.out.print(out);
    }
}
