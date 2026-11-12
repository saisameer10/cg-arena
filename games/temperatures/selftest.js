'use strict';
// Checks for Temperatures (node cli.js selftest temperatures): every .out matches a reference answer,
// and the generic io referee judges correct, wrong and badly spaced answers as expected.
const fs = require('fs');
const path = require('path');
const { makeIoReferee } = require(path.join(__dirname, '..', 'io-referee.js'));
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'game.json'), 'utf8'));
const Ref = makeIoReferee({ ...cfg, id: 'temperatures' });

let fails = 0, n = 0;
const check = (name, ok) => { n++; if (!ok) { fails++; console.log('FAIL ' + name); } };
const answer = ts => ts.length === 0 ? 0 : ts.reduce((b, t) => (Math.abs(t) < Math.abs(b) || (Math.abs(t) === Math.abs(b) && t > b)) ? t : b);

const dir = path.join(__dirname, 'tests');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.in'))) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r/g, '').split('\n');
  const nVals = Number(lines[0]);
  const ts = nVals ? lines[1].trim().split(/\s+/).map(Number) : [];
  const expected = fs.readFileSync(path.join(dir, f.replace(/\.in$/, '.out')), 'utf8').trim();
  check(`${f}: N matches the values`, ts.length === nVals);
  check(`${f}: expected output is the reference answer`, String(answer(ts)) === expected);
}
const judge = out => { const r = new Ref({ testCase: { input: '2\n-5 5\n', expected: '5\n' } }); r.applyOutput(0, [out]); r.endTurn(); return r; };
check('a correct answer passes', judge('5').getResult().passed === true);
check('trailing spaces are accepted', judge('5   ').getResult().passed === true);
check('a wrong answer fails with the first wrong line', judge('-5').getResult().passed === false && judge('-5').review()[0].code === 'wrong-line');
check('leading spaces are reported as spacing', judge(' 5').review().some(x => x.code === 'spacing-only'));

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
