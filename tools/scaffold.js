'use strict';
// Scaffold a new challenge from its CodinGame type (node cli.js new <link>): creates games/<id>/ with every
// file the platform needs, already loadable and playable with the generic viewer. The rules themselves
// (referee), the bosses or the reference solution and generator are then written for that puzzle;
// every TODO says what goes where. Never overwrites an existing challenge.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const STARTERS = {
  io: {
    'bot.py': `import sys\n\n# Read the whole input in the order given by the statement's protocol, then print the answer.\n# Debug with print(..., file=sys.stderr).\nlines = sys.stdin.read().split('\\n')\nprint(f"read {len(lines)} lines", file=sys.stderr)\nprint("answer")  # TODO\n`,
    'bot.js': `// readline(), print() and printErr() are provided, like on CodinGame.\nconst lines = [];\nfor (let l = readline(); l !== null; l = readline()) lines.push(l);\nprintErr(\`read \${lines.length} lines\`);\nprint('answer'); // TODO\n`,
    'Player.java': `import java.util.*;\n\n// class Solution (CodinGame classic puzzles) or class Player both work. Debug with System.err.println.\nclass Solution {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        List<String> lines = new ArrayList<>();\n        while (in.hasNextLine()) lines.add(in.nextLine());\n        System.err.println("read " + lines.size() + " lines");\n        System.out.println("answer"); // TODO\n    }\n}\n`,
    'bot.cpp': `#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> lines;\n    for (std::string l; std::getline(std::cin, l);) lines.push_back(l);\n    std::cerr << "read " << lines.size() << " lines" << std::endl;\n    std::cout << "answer" << std::endl;  // TODO\n}\n`,
  },
  turns: {
    'bot.py': `import sys\n\n# TODO: read the initialization input in the protocol order, then each turn's input, and print one answer per turn.\n# Debug with print(..., file=sys.stderr).\nwhile True:\n    line = input()\n    print(f"got: {line}", file=sys.stderr)\n    print("WAIT")  # TODO: a legal default action\n`,
    'bot.js': `// readline(), print() and printErr() are provided, like on CodinGame.\n// TODO: read the initialization input, then each turn's input, and print one answer per turn.\nfor (let line = readline(); line !== null; line = readline()) {\n  printErr('got: ' + line);\n  print('WAIT'); // TODO: a legal default action\n}\n`,
    'Player.java': `import java.util.*;\n\n// The class must be named Player. Debug with System.err.println.\nclass Player {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        // TODO: read the initialization input, then each turn's input, and print one answer per turn.\n        while (in.hasNextLine()) {\n            String line = in.nextLine();\n            System.err.println("got: " + line);\n            System.out.println("WAIT"); // TODO: a legal default action\n        }\n    }\n}\n`,
    'bot.cpp': `#include <iostream>\n#include <string>\n\nint main() {\n    // TODO: read the initialization input, then each turn's input, and print one answer per turn.\n    for (std::string line; std::getline(std::cin, line);) {\n        std::cerr << "got: " << line << std::endl;\n        std::cout << "WAIT" << std::endl;  // TODO: a legal default action\n    }\n}\n`,
  },
};

const REFEREE = (kind, title) => `'use strict';
// ${title}: referee. Implement the rules exactly as on CodinGame (port the official referee if it is public).
// Contract: README "Adding a game by hand". Every TODO below must be replaced; node cli.js validate ${kind === 'multi' ? '<id>' : '<id>'} checks the result.
const { Referee, GameError } = require('../base');
${kind === 'solo' ? "const { generate } = require('./generator');\n" : ''}
class ChallengeReferee extends Referee {
  // TODO: CodinGame's real limits; maxTurns = engine turns (one call of getActors() each)
  static meta = { playerCount: ${kind === 'multi' ? 2 : 1}, firstTurnTimeout: 1000, turnTimeout: ${kind === 'multi' ? 100 : 150}, maxTurns: 200, viewer: 'generic' };

  constructor(opts = {}) {
    super(${kind === 'solo' ? '{ ...opts, playerCount: 1 }' : 'opts'});
${kind === 'solo' ? '    this.level = opts.testCase || generate(opts.seed === undefined ? 1 : opts.seed);   // TODO: validate the level\n' : '    // TODO: build the initial state from this.rng (seeded) and opts.league\n'}    this.outcome = null;
  }
  getStaticInfo() { return {}; }                    // TODO: what the viewer needs once (map, sizes)
  getInitInput(p) { return []; }                     // TODO: initialization lines for player p
  getActors() { return ${kind === 'multi' ? '[this.turn % 2]' : '[0]'}; }        // TODO: ${kind === 'multi' ? 'all players for simultaneous games' : 'the single player'}
  getTurnInput(p) { return [String(this.turn)]; }    // TODO: this turn's input lines for player p
  applyOutput(p, lines) {                            // TODO: parse and apply; throw GameError with CodinGame's wording
    if (!lines[0] || !lines[0].trim()) throw new GameError('Invalid output: empty line');
  }
  isGameOver() { return !!this.outcome || this.turn >= ChallengeReferee.meta.maxTurns; }
  getFrame() { return { turn: this.turn }; }          // TODO: state for the viewer
  getResult() {                                      // TODO
${kind === 'multi' ? "    return { scores: [0, 0], winner: null };" : "    const o = this.outcome || { passed: false, message: 'not finished' };\n    return { scores: [o.passed ? 1 : 0], winner: o.passed ? 0 : null, passed: o.passed, message: o.message };"}
  }
  // Explain the decisive mistakes: [{ turn, player, kind: 'mistake'|'warning'|'tip', code, message }]
  review() { return []; }                            // TODO
}

module.exports = { Referee: ChallengeReferee };
`;

const GENERATOR = kind => `'use strict';
// Random ${kind === 'io' ? 'test inputs' : 'levels'} (hidden-validator style). Must be deterministic for a seed.
// ${kind === 'io' ? 'Return { name, input }: node cli.js make-tests <id> runs the reference solution to get the expected output.' : 'Return the level data the referee reads from opts.testCase; node cli.js make-tests <id> keeps only levels the reference solution passes.'}
const { mulberry32, seedToUint32 } = require('../base');

function generate(seed) {
  const rng = mulberry32(seedToUint32(seed));
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  throw new Error('TODO: write generate(seed) for this puzzle');   // e.g. const n = int(1, 100);
}

module.exports = { generate };
`;

const SOLUTION = `# SPOILER: reference solution, used to compute expected outputs and to prove that tests can be passed.
# TODO: write it (any language: solution.py, solution.js, Solution.java).
import sys
print("TODO")
`;

const BOSS = `// Bosses for this game: node boss.js wood|bronze|silver. Ordinary bots (stdin/stdout), deterministic, legal in every league.
// wood = legal and simple; bronze = one clear idea; silver = uses every rule.
'use strict';
const level = process.argv[2] || 'wood';
// TODO: read the initialization input, then each turn's input, and print one legal answer per turn.
for (let line = readline(); line !== null; line = readline()) {
  print('WAIT'); // TODO
}
`;

function scaffold({ id, title, url, kind, cgType, level }) {
  const dir = path.join(ROOT, 'games', id);
  if (fs.existsSync(path.join(dir, 'game.json'))) throw new Error(`games/${id}/ already exists: nothing was changed`);
  const files = {};
  const io = kind === 'io';
  const cfg = { name: title, url };
  if (io) Object.assign(cfg, { type: 'io', timeLimitMs: 2000, tests: 'tests', solution: 'solution/solution.py' });
  if (kind === 'solo') Object.assign(cfg, { tests: 'tests', solution: 'solution/solution.py' });
  if (kind === 'multi') cfg.bosses = [
    { id: 'wood', name: 'Boss Wood', file: 'bosses/boss.js', args: ['wood'] },
    { id: 'bronze', name: 'Boss Bronze', file: 'bosses/boss.js', args: ['bronze'] },
    { id: 'silver', name: 'Boss Silver', file: 'bosses/boss.js', args: ['silver'] },
  ];
  cfg.starters = { python: 'starters/bot.py', javascript: 'starters/bot.js', java: 'starters/Player.java', cpp: 'starters/bot.cpp' };
  files['game.json'] = JSON.stringify(cfg, null, 2) + '\n';
  files['statement.md'] = `# ${title}\n\n${kind === 'multi' ? 'Multiplayer game' : io ? 'Classic puzzle' : 'Solo puzzle'} ([CodinGame page](${url}), CodinGame type ${cgType}${level ? ', ' + level : ''}). The original statement is in the **Original statement** tab once fetched.\n\nTODO: the rules in our own words.\n\n## Protocol\n\nTODO: the exact input and output, copied as facts from the statement (line by line, with constraints and time limits).\n`;
  for (const [f, src] of Object.entries(STARTERS[io ? 'io' : 'turns'])) files['starters/' + f] = src;
  if (!io) files['referee.js'] = REFEREE(kind, title);
  if (kind !== 'multi') { files['generator.js'] = GENERATOR(kind); files['solution/solution.py'] = SOLUTION; files['tests/.keep'] = ''; }
  if (kind === 'multi') files['bosses/boss.js'] = BOSS;
  for (const [f, src] of Object.entries(files)) { const p = path.join(dir, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, src); }
  const notes = path.join(ROOT, 'challenges', id + '.md');
  if (!fs.existsSync(notes)) fs.writeFileSync(notes, `# Challenge: ${title}\n\n## Source\n\n- Puzzle URL: <${url}>\n- CodinGame type: ${cgType}${level ? ' (' + level + ')' : ''}; arena kind: ${kind}\n- Official referee source: TODO (link, or "not public")\n\n## Rule decisions\n\nTODO: every ambiguity and the choice made.\n\n## Tests / bosses\n\nTODO: what they cover and how they were proven.\n`);
  return { dir, files: Object.keys(files).map(f => `games/${id}/${f}`).concat(fs.existsSync(notes) ? [`challenges/${id}.md`] : []) };
}

module.exports = { scaffold };
