'use strict';
// Game registry: every sub-folder with a game.json + referee.js is a playable game.
//   game.json  : { name, bosses:[{id,name,file,args?}], starters:{python:"starters/bot.py",...} }
//   referee.js : exports { Referee } (extends games/base.js Referee)
//   statement.md, viewer.js : shown / run in the browser
const fs = require('fs');
const path = require('path');

function loadGames() {
  const root = __dirname;
  const games = {};
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    const cfgPath = path.join(dir, 'game.json');
    if (!fs.existsSync(cfgPath)) continue;
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    const { Referee } = require(path.join(dir, 'referee.js'));
    const starters = {};
    for (const [lang, rel] of Object.entries(cfg.starters || {})) {
      starters[lang] = fs.readFileSync(path.join(dir, rel), 'utf8');
    }
    games[entry.name] = {
      id: entry.name,
      name: cfg.name || entry.name,
      dir,
      Referee,
      bosses: cfg.bosses || [],
      starters,
      statement: fs.existsSync(path.join(dir, 'statement.md')) ? fs.readFileSync(path.join(dir, 'statement.md'), 'utf8') : '',
      viewerPath: path.join(dir, 'viewer.js'),
    };
  }
  return games;
}

module.exports = { loadGames };
