(() => {
  const $ = id => document.getElementById(id);
  const PLAYER_COLORS = ['#ff8a3d', '#4fa3ff'];
  const state = { games: [], languages: [], game: null, lang: null, frames: [], static: null, meta: null, names: [], idx: 0, playing: null, running: false, abort: null, result: null, tab: 'console0', follow: true, logs: [], turnCount: [0, 0], board: [] };
  let editor = null, editorReady = null;

  // ---------- editor ----------
  // Monaco and marked come from cdnjs with `async`; without network the textarea fallback takes over at once.
  function initEditor() {
    editorReady = new Promise(resolve => {
      let settled = false;
      const fallback = () => {
        if (settled) return;
        settled = true; editor = null;
        $('fallback').style.display = 'block';
        $('status').textContent = 'basic editor (Monaco could not be loaded; Tab inserts 4 spaces)';
        resolve();
      };
      const t = setTimeout(fallback, 12000);
      // CDN mirrors tried in order (cdnjs dropped older Monaco versions once; a 404 must not cost the editor)
      const MIRRORS = [
        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs',
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
        'https://unpkg.com/monaco-editor@0.52.2/min/vs',
      ];
      const loadLoader = i => {
        if (i >= MIRRORS.length) return fallback();
        const s = document.createElement('script');
        s.src = MIRRORS[i] + '/loader.js';
        s.onload = () => window.require ? start(MIRRORS[i]) : loadLoader(i + 1);
        s.onerror = () => loadLoader(i + 1);
        document.head.appendChild(s);
      };
      const start = base => {
        window.require.config({ paths: { vs: base } });
        window.require(['vs/editor/editor.main'], () => {
          clearTimeout(t);
          const late = settled;                  // Monaco arrived after the fallback: adopt the textarea's text, never lose it
          settled = true;
          editor = monaco.editor.create($('monaco'), { value: late ? $('fallback').value : '', language: state.lang ? state.lang.monaco : 'python', theme: 'vs-dark', automaticLayout: true, fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false });
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
          editor.onDidChangeModelContent(() => saveCode());
          if (late) { $('fallback').style.display = 'none'; $('status').textContent = ''; }
          resolve();
        }, fallback);
      };
      loadLoader(0);
    });
  }
  const getCode = () => editor ? editor.getValue() : $('fallback').value;
  function setCode(code, monacoLang) {
    if (editor) {
      editor.setValue(code);
      monaco.editor.setModelLanguage(editor.getModel(), monacoLang || 'plaintext');
    } else $('fallback').value = code;
  }
  const codeKey = () => `cg-arena:code:${state.game.id}:${state.lang.id}`;
  let saveTimer = null;
  function saveCode() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const code = getCode();
        const prev = localStorage.getItem(codeKey());
        if (code.trim() === '' && prev && prev.trim()) return;   // never replace saved work with an empty buffer
        localStorage.setItem(codeKey(), code);
      } catch {}
    }, 300);
  }
  function loadCode(forceStarter) {
    let code = null;
    if (!forceStarter) { try { code = localStorage.getItem(codeKey()); } catch {} }
    if (code === null || code.trim() === '') code = state.game.starters[state.lang.id] || `${state.lang.id === 'python' ? '#' : '//'} no starter for ${state.lang.name} in ${state.game.name}\n`;
    setCode(code, state.lang.monaco);
  }
  $('fallback').addEventListener('input', saveCode);
  $('fallback').addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target, s = ta.selectionStart, en = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
    ta.selectionStart = ta.selectionEnd = s + 4;
    saveCode();
  });

  // ---------- setup ----------
  async function init() {
    initEditor();
    const data = await (await fetch('/api/games')).json();
    state.games = data.games; state.languages = data.languages;
    $('game').innerHTML = data.games.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    $('lang').innerHTML = data.languages.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    try { $('game').value = localStorage.getItem('cg-arena:game') || data.games[0].id; } catch {}
    try { $('lang').value = localStorage.getItem('cg-arena:lang') || data.languages[0].id; } catch {}
    await editorReady;
    selectGame();
    const ml = $('markedLib');
    if (ml && !window.marked) ml.addEventListener('load', renderStatement);   // statement upgrades from <pre> to HTML when marked arrives
    $('game').onchange = selectGame;
    $('lang').onchange = () => { state.lang = state.languages.find(l => l.id === $('lang').value); try { localStorage.setItem('cg-arena:lang', state.lang.id); } catch {} loadCode(false); };
    $('run').onclick = run;
    $('stop').onclick = () => state.abort && state.abort.abort();
    $('reset').onclick = () => { if (confirm('Replace your code with the starter code?')) { loadCode(true); saveCode(); } };
    $('first').onclick = () => goTo(0);
    $('prev').onclick = () => goTo(state.idx - 1);
    $('next').onclick = () => goTo(state.idx + 1);
    $('play').onclick = togglePlay;
    $('slider').oninput = () => goTo(+$('slider').value);
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
    document.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); run(); } });
    $('saveVersion').onclick = saveVersion;
    $('runTests').onclick = runAllTests;
    $('saveVersionSolo').onclick = saveVersion;
    $('stopTests').onclick = () => { state.stopTests = true; state.abort && state.abort.abort(); };
    $('arenaRun').onclick = runArena;
    $('arenaStop').onclick = () => state.arenaAbort && state.arenaAbort.abort();
    window.addEventListener('resize', draw);
    new ResizeObserver(draw).observe($('viewer'));
  }
  function setTab(name) {
    state.tab = name;
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x.dataset.tab === name));
    renderConsole();
  }
  // Statement panel: our summary (statement.md) or, when "node cli.js fetch" saved it, the original
  // CodinGame statement in a sandboxed frame (no scripts).
  function renderStatement() {
    if (!state.game) return;
    const g = state.game;
    let view = 'summary';
    try { view = localStorage.getItem(`cg-arena:stmt:${g.id}`) || (g.hasOriginal ? 'original' : 'summary'); } catch {}
    if (!g.hasOriginal) view = 'summary';
    const md = window.marked ? marked.parse(g.statement) : `<pre style="white-space:pre-wrap">${esc(g.statement)}</pre>`;
    const bar = g.hasOriginal
      ? `<div class="stmtbar"><button class="secondary tiny ${view === 'original' ? 'on' : ''}" data-view="original">Original statement</button><button class="secondary tiny ${view === 'summary' ? 'on' : ''}" data-view="summary">Arena notes</button>${g.url ? `<a href="${g.url}" target="_blank" rel="noopener">CodinGame ↗</a>` : ''}</div>`
      : (g.url ? `<div class="stmtbar"><a href="${g.url}" target="_blank" rel="noopener">CodinGame page ↗</a><span class="dim">original statement: node cli.js fetch ${g.id}</span></div>` : '');
    $('statement').classList.toggle('framed', view === 'original');
    $('statement').innerHTML = bar + (view === 'original'
      ? `<iframe class="stmtframe" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" src="/api/statement?game=${encodeURIComponent(g.id)}"></iframe>`
      : `<div class="stmtbody">${md}</div>`);
    $('statement').querySelectorAll('[data-view]').forEach(b => b.onclick = () => { try { localStorage.setItem(`cg-arena:stmt:${g.id}`, b.dataset.view); } catch {} renderStatement(); });
  }

  function selectGame() {
    state.game = state.games.find(g => g.id === $('game').value);
    state.lang = state.languages.find(l => l.id === $('lang').value) || state.languages[0];
    try { localStorage.setItem('cg-arena:game', state.game.id); } catch {}
    renderStatement();
    state.board = [];
    refreshOpponents();
    $('p0').value = 'me'; $('p1').value = state.game.bosses.length ? 'boss:' + state.game.bosses[0].id : 'me';
    // solo puzzles: one player, test cases instead of opponents; multiplayer: two slots + arena
    const solo = state.game.kind === 'solo';
    $('p0Label').style.display = solo ? 'none' : '';
    $('p1Label').style.display = solo ? 'none' : '';
    $('testLabel').style.display = solo ? '' : 'none';
    for (const [tab, show] of [['console1', !solo], ['arena', !solo], ['tests', solo]]) document.querySelector(`.tabs button[data-tab=${tab}]`).style.display = show ? '' : 'none';
    document.querySelector('.tabs button[data-tab=console0]').textContent = solo ? 'Console' : 'Console P0';
    if (solo && (state.tab === 'console1' || state.tab === 'arena')) state.tab = 'console0';
    if (!solo && state.tab === 'tests') state.tab = 'console0';
    setTab(state.tab);
    $('test').innerHTML = (state.game.tests || []).map((t, i) => `<option value="${esc(t.id)}">${i + 1}. ${esc(t.name)}</option>`).join('')
      + (state.game.hasGenerator ? `<option value="random">Random level (uses Seed)</option>` : '');
    state.testResults = {};
    renderTests();
    state.review = [];
    renderReview();
    loadArena();   // saved versions (and, for multiplayer, the Elo board)
    const leagues = state.game.leagues || [];
    $('leagueLabel').style.display = leagues.length ? '' : 'none';
    $('league').innerHTML = leagues.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    if (leagues.length) {
      let saved = null; try { saved = localStorage.getItem(`cg-arena:league:${state.game.id}`); } catch {}
      const def = leagues.find(l => l.default) || leagues[0];
      $('league').value = leagues.some(l => l.id === saved) ? saved : def.id;
      $('league').onchange = () => { try { localStorage.setItem(`cg-arena:league:${state.game.id}`, $('league').value); } catch {} };
    }
    loadCode(false);
    loadViewer(state.game.id);
    state.frames = []; state.static = null; state.result = null; state.logs = []; state.idx = 0;
    $('result').textContent = ''; $('result').className = '';
    updateControls(); draw(); renderConsole();
  }
  const loadedViewers = new Set();
  function loadViewer(gameId) {
    if (loadedViewers.has(gameId)) return;
    loadedViewers.add(gameId);
    const s = document.createElement('script'); s.src = `/games/${gameId}/viewer.js`; s.onload = draw; document.head.appendChild(s);
  }
  const seedValue = () => {
    const s = $('seed').value.trim() || '1';
    if (!/^[+-]?\d{1,20}$/.test(s)) throw new Error('Seed must be an integer (up to 20 digits)');
    return s;
  };

  // ---------- running a match ----------
  async function readStream(res, onLine) {
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || `${res.status} ${res.statusText}`);
    }
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); if (line.trim()) onLine(JSON.parse(line)); }
    }
  }
  // the test selected in the header ("random" = a generated level from the Seed box)
  const selectedTest = seed => { const v = $('test').value; return v === 'random' ? `random:${seed}` : v; };

  // Runs one match (or one solo test) and streams it into the viewer. Resolves with the events
  // received, so "Run all tests" can keep each replay. opts.test overrides the selected test.
  async function run(opts = {}) {
    if (state.running) return null;
    let seed;
    try { seed = seedValue(); } catch (e) { $('result').textContent = e.message; $('result').className = 'lose'; return null; }
    const solo = state.game.kind === 'solo';
    const players = solo ? [playerSpec(opts.candidate || 'me')] : ['p0', 'p1'].map(id => playerSpec($(id).value));
    const test = solo ? (opts.test || selectedTest(seed)) : null;
    state.running = true; state.frames = []; state.result = null; state.logs = []; state.idx = 0; state.follow = true; state.review = [];
    renderReview();
    stopPlay();
    $('run').disabled = true; $('stop').disabled = false; $('status').textContent = 'starting…';
    $('result').textContent = ''; $('result').className = '';
    const ctrl = state.abort = new AbortController();
    const events = [];
    try {
      const res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, players, seed, test, league: (state.game.leagues || []).length ? $('league').value : null, timeoutMultiplier: +$('tmult').value || 1 }), signal: ctrl.signal });
      await readStream(res, ev => { events.push(ev); onEvent(ev); });
    } catch (e) {
      if (e.name !== 'AbortError') { $('result').textContent = 'Error: ' + e.message; $('result').className = 'lose'; events.push({ type: 'error', message: e.message }); }
      else $('status').textContent = 'stopped';
    } finally {
      state.running = false; state.abort = null;
      $('run').disabled = false; $('stop').disabled = true;
      if (!state.result) $('status').textContent = $('status').textContent === 'stopped' ? 'stopped' : '';
    }
    if (solo && test) recordTest(test, events);
    return events;
  }
  function onEvent(ev) {
    if (ev.type === 'start') {
      state.static = ev.static; state.meta = ev.game; state.names = ev.players; state.frames = []; state.logs = []; state.turnCount = [0, 0];
      state.testName = ev.test ? ev.test.name : null;
      $('status').textContent = ev.test ? `running test: ${ev.test.name}` : `running (seed ${ev.seed}${ev.league ? ', ' + ev.league : ''})`;
      updateControls(); draw();
    } else if (ev.type === 'frame') {
      for (const a of ev.actors) a.turnNo = ++state.turnCount[a.player];   // the player's own turn number
      state.frames.push(ev);
      if (ev.summary && ev.summary.length) state.logs.push(...ev.summary.map(s => ({ turn: ev.turn, text: s })));
      if (state.follow) state.idx = state.frames.length - 1;
      updateControls(); if (state.follow) { draw(); renderConsole(); }
    } else if (ev.type === 'end') {
      state.result = ev.result;
      if (ev.summary && ev.summary.length) state.logs.push(...ev.summary.map(s => ({ turn: state.frames.length, text: s })));
      const r = ev.result;
      state.review = ev.review || r.review || [];
      renderReview();
      const me = ['p0', 'p1'].map(id => $(id).value === 'me');
      let text, cls;
      const mistakes = state.review.filter(x => x.kind === 'mistake').length;
      const hint = state.review.length ? `   ·   Review: ${mistakes ? mistakes + ' mistake(s)' : state.review.length + ' note(s)'}, see the Review tab` : '';
      if (r.aborted) { text = 'Stopped'; cls = 'draw'; }
      else if (r.passed !== undefined) {   // solo puzzle
        text = (r.passed ? '✔ Success: ' : '✘ Failure: ') + r.message + hint; cls = r.passed ? 'win' : 'lose';
        $('result').textContent = text; $('result').className = cls;
        $('status').textContent = `finished in ${state.frames.length} turns${state.testName ? ' · ' + state.testName : ''}`;
        renderConsole();
        return;
      }
      else if (r.winner === null || r.winner === undefined) { text = `Draw  (scores ${r.scores.join(' – ')})`; cls = 'draw'; }
      else {
        text = `P${r.winner} ${state.names[r.winner]} wins  (scores ${r.scores.join(' – ')})`;
        cls = me[r.winner] && !me[1 - r.winner] ? 'win' : !me[r.winner] && me[1 - r.winner] ? 'lose' : 'draw';
      }
      const dq = (r.dq || []).map((d, i) => d ? `P${i}: ${d}` : null).filter(Boolean);
      if (dq.length) text += '  —  ' + dq.join(' | ');
      text += hint;
      $('result').textContent = text; $('result').className = cls;
      $('status').textContent = `finished in ${state.frames.length} turns`;
      renderConsole();
    } else if (ev.type === 'error') {
      $('result').textContent = ev.message; $('result').className = 'lose';
      if (ev.compileLog) { state.logs.push({ turn: 0, text: ev.compileLog }); setTab('log'); }
      $('status').textContent = 'error';
    }
  }

  // ---------- playback ----------
  function goTo(i) {
    if (!state.frames.length) return;
    state.idx = Math.max(0, Math.min(state.frames.length - 1, i));
    state.follow = state.running && state.idx === state.frames.length - 1;
    updateControls(); draw(); renderConsole();
  }
  function togglePlay() { state.playing ? stopPlay() : startPlay(); }
  function startPlay() {
    if (state.idx >= state.frames.length - 1) state.idx = 0;
    $('play').textContent = '⏸';
    state.playing = setInterval(() => { if (state.idx >= state.frames.length - 1) return stopPlay(); goTo(state.idx + 1); }, +$('speed').value);
  }
  function stopPlay() { clearInterval(state.playing); state.playing = null; $('play').textContent = '▶'; }
  function updateControls() {
    $('slider').max = Math.max(0, state.frames.length - 1); $('slider').value = state.idx;
    $('turn').textContent = `turn ${state.frames.length ? state.idx + 1 : 0} / ${state.frames.length}`;
  }

  // ---------- rendering ----------
  function draw() {
    const canvas = $('viewer');
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const viewer = state.meta && window.CGViewers && window.CGViewers[state.meta.viewer];
    const frame = state.frames[state.idx];
    const info = { playerColors: PLAYER_COLORS, playerNames: state.names.map((n, i) => `P${i} ${n}`) };
    if (!viewer || !state.static) {
      ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#8a94ab'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(state.running ? 'starting…' : 'Press ▶ Play (Ctrl+Enter) to run a match', w / 2, h / 2);
      $('hud').innerHTML = ''; return;
    }
    viewer.render(ctx, w, h, state.static, frame && frame.frame, info);
    const hud = viewer.hud ? viewer.hud(state.static, frame && frame.frame, info) : [];
    $('hud').innerHTML = hud.map((l, i) => `<span class="${i < 2 ? 'p' + i : ''}">${esc(l)}</span>`).join('\n');
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function renderConsole() {
    const c = $('console');
    const PANELS = { arena: 'arena', tests: 'testsPanel', review: 'reviewPanel' };
    for (const [tab, id] of Object.entries(PANELS)) $(id).style.display = state.tab === tab ? 'block' : 'none';
    c.style.display = PANELS[state.tab] ? 'none' : 'block';
    if (PANELS[state.tab]) return;
    const frame = state.frames[state.idx];
    if (state.tab === 'log') {
      c.innerHTML = state.logs.filter(l => l.turn <= state.idx + 1).map(l => `<span class="dim">[${l.turn}]</span> ${esc(l.text)}`).join('\n') || '<span class="dim">no log yet</span>';
      c.scrollTop = c.scrollHeight; return;
    }
    if (!frame) { c.innerHTML = '<span class="dim">run a match to see output</span>'; return; }
    if (state.tab === 'io') {
      c.innerHTML = frame.actors.map(a => `<span class="dim">── P${a.player} turn ${a.turnNo} input ──</span>\n${esc(a.input.join('\n')) || '<span class="dim">(none)</span>'}\n<span class="dim">── P${a.player} output (${a.ms} ms) ──</span>\n<span class="out">${esc(a.output.join('\n'))}</span>${a.error ? `\n<span class="err">${esc(a.error)}</span>` : ''}`).join('\n\n');
      return;
    }
    // Console Pn: the player's last entries up to the selected frame; the most recent one is bright.
    // In alternating-turn games a player acts every other frame, so we walk back by entries, not frames.
    const p = +state.tab.slice(-1);
    const entries = [];
    for (let i = state.idx; i >= 0 && entries.length < 6; i--) {
      for (const a of state.frames[i].actors) if (a.player === p) entries.push({ a, frame: i + 1 });
    }
    entries.reverse();
    const lines = [];
    entries.forEach((e, k) => {
      const cur = k === entries.length - 1;
      const { a } = e;
      lines.push(`<span class="dim">── turn ${a.turnNo} · frame ${e.frame} (${a.ms} ms) ──</span>`);
      if (a.stderr) lines.push(cur ? esc(a.stderr.trimEnd()) : `<span class="dim">${esc(a.stderr.trimEnd())}</span>`);
      lines.push(`<span class="out">> ${esc(a.output.join(' | '))}</span>`);
      if (a.extraOutput) lines.push(`<span class="err">⚠ ${a.extraOutput} extra stdout line(s) from the previous turn were ignored: print exactly one answer per turn (debug goes to stderr)</span>`);
      if (a.error) lines.push(`<span class="err">${esc(a.error)}</span>`);
    });
    c.innerHTML = lines.join('\n') || '<span class="dim">no output from this player yet</span>';
    c.scrollTop = c.scrollHeight;
  }

  // ---------- arena pool: saved versions + bosses, Elo ladder ----------
  function playerSpec(v) {
    if (v === 'me') return { type: 'user', lang: state.lang.id, source: getCode(), name: `My code (${state.lang.name})` };
    if (v.startsWith('pool:')) return { type: 'pool', id: v.slice(5) };
    return { type: 'boss', id: v.slice(5) };
  }
  function refreshOpponents() {
    const versions = (state.board || []).filter(r => r.kind === 'version');
    const opts = `<option value="me">My code</option>`
      + state.game.bosses.map(b => `<option value="boss:${b.id}">${esc(b.name)}</option>`).join('')
      + (versions.length ? `<optgroup label="My saved versions">` + versions.map(r => `<option value="${r.key}">${esc(r.name)} (${r.rating})</option>`).join('') + `</optgroup>` : '');
    for (const id of ['p0', 'p1']) { const cur = $(id).value; $(id).innerHTML = opts; if ([...$(id).options].some(o => o.value === cur)) $(id).value = cur; }
    const sel = $('arenaOpp'); const curOpp = sel.value;
    sel.innerHTML = `<option value="all">All (bosses + my versions)</option><option value="bosses">Bosses only</option><option value="pool">My versions only</option>`
      + (state.board || []).map(r => `<option value="${r.key}">${esc(r.name)} only</option>`).join('');
    if ([...sel.options].some(o => o.value === curOpp)) sel.value = curOpp;
    const cand = $('arenaCand'); const curCand = cand.value;
    cand.innerHTML = `<option value="me">Current code (unrated)</option>` + versions.map(r => `<option value="${r.key}">${esc(r.name)} (rated)</option>`).join('');
    if ([...cand.options].some(o => o.value === curCand)) cand.value = curCand;
    const tc = $('testCand'); const curTc = tc.value;
    tc.innerHTML = `<option value="me">Current code</option>` + versions.map(r => `<option value="${r.key}">${esc(r.name)}${r.tests ? ` (${r.tests.passed}/${r.tests.total})` : ''}</option>`).join('');
    if ([...tc.options].some(o => o.value === curTc)) tc.value = curTc;
    renderVersions(versions);
  }
  async function loadArena() {
    try {
      const data = await (await fetch(`/api/arena/pool?game=${encodeURIComponent(state.game.id)}`)).json();
      state.board = data.leaderboard || [];
    } catch { state.board = []; }
    refreshOpponents(); renderBoard();
  }
  function renderBoard() {
    const rows = state.board || [];
    $('arenaBoard').innerHTML = `<tr><th>#</th><th>name</th><th>rating</th><th>games</th><th>W-L-D</th><th></th></tr>` + rows.map((r, i) =>
      `<tr><td class="dim">${i + 1}</td><td>${esc(r.name)}${r.kind === 'version' ? ` <span class="dim">${esc(r.lang)} · ${new Date(r.created).toLocaleString()}</span>` : ' <span class="dim">boss</span>'}</td><td>${r.rating}</td><td>${r.games}</td><td><span class="win">${r.wins}</span>-<span class="loss">${r.losses}</span>-<span class="draw">${r.draws}</span></td><td>${r.kind === 'version' ? `<button class="secondary tiny" data-load="${r.key}">set as P1</button> <button class="secondary tiny" data-del="${r.id}">delete</button>` : ''}</td></tr>`).join('');
    $('arenaBoard').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Delete this saved version and its rating?')) return;
      const res = await (await fetch('/api/arena/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, id: b.dataset.del }) })).json();
      state.board = res.leaderboard || []; refreshOpponents(); renderBoard();
    });
    $('arenaBoard').querySelectorAll('[data-load]').forEach(b => b.onclick = () => { $('p1').value = b.dataset.load; $('status').textContent = 'Player 1 set to that version: press ▶ Play to watch a match against it'; });
  }
  // solo puzzles: saved versions with their last full-suite score; load one back into the editor
  function renderVersions(versions) {
    if (!$('versionsTable')) return;
    $('versionsTable').innerHTML = versions.length
      ? `<tr><th>version</th><th>tests</th><th>saved</th><th></th></tr>` + versions.map(r => `<tr><td>${esc(r.name)} <span class="dim">${esc(r.lang)}</span></td><td>${r.tests ? `<span class="${r.tests.passed === r.tests.total ? 'win' : 'loss'}">${r.tests.passed}/${r.tests.total}</span>` : '<span class="dim">not run</span>'}</td><td class="dim">${new Date(r.created).toLocaleString()}</td><td><button class="secondary tiny" data-edit="${r.id}">open in editor</button> <button class="secondary tiny" data-del="${r.id}">delete</button></td></tr>`).join('')
      : `<tr><td class="dim">No saved versions yet. "Save as version…" keeps your code with its test score.</td></tr>`;
    $('versionsTable').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Delete this saved version?')) return;
      const res = await (await fetch('/api/arena/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, id: b.dataset.del }) })).json();
      state.board = res.leaderboard || []; refreshOpponents(); renderBoard();
    });
    $('versionsTable').querySelectorAll('[data-edit]').forEach(b => b.onclick = async () => {
      const res = await fetch(`/api/arena/source?game=${encodeURIComponent(state.game.id)}&id=${encodeURIComponent(b.dataset.edit)}`);
      if (!res.ok) { $('status').textContent = 'could not load that version'; return; }
      const v = await res.json();
      if (v.lang !== state.lang.id) { $('lang').value = v.lang; state.lang = state.languages.find(l => l.id === v.lang) || state.lang; }
      if (!confirm(`Replace the editor content (${state.lang.name}) with "${v.name}"?`)) return;
      setCode(v.source, state.lang.monaco); saveCode();
      $('status').textContent = `loaded version "${v.name}" into the editor`;
    });
  }
  async function saveVersion() {
    const name = prompt('Name for this version (e.g. "v3 sonar tracker"):', `v${(state.board || []).filter(r => r.kind === 'version').length + 1}`);
    if (name === null) return;
    const res = await (await fetch('/api/arena/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, lang: state.lang.id, source: getCode(), name }) })).json();
    if (res.error) { $('arenaError').textContent = res.error; $('status').textContent = res.error; return; }
    $('arenaError').textContent = '';
    state.board = res.leaderboard || []; refreshOpponents(); renderBoard();
    $('arenaStatus').textContent = $('status').textContent = `saved "${res.entry.name}"`;
    if (state.game.kind === 'solo') $('testCand').value = 'pool:' + res.entry.id;   // next "Run all tests" scores this version
  }
  async function runArena() {
    if (state.arenaRunning) return;
    let seed;
    try { seed = seedValue(); } catch (e) { $('arenaError').textContent = e.message; return; }
    state.arenaRunning = true; $('arenaRun').disabled = true; $('arenaStop').disabled = false; $('arenaError').textContent = ''; $('arenaPatterns').innerHTML = '';
    const games = Math.max(1, Math.min(100, +$('arenaGames').value || 4));
    const candidate = $('arenaCand').value === 'me' ? playerSpec('me') : $('arenaCand').value;
    const results = new Map();   // opponent key -> {name, wins, losses, draws, games:[outcome...]}
    const render = () => {
      $('arenaResults').innerHTML = `<tr><th>opponent</th><th>W-L-D</th><th>win rate</th><th>games (as P0/P1 alternating)</th></tr>` + [...results.values()].map(r =>
        `<tr><td>${esc(r.name)}</td><td><span class="win">${r.wins}</span>-<span class="loss">${r.losses}</span>-<span class="draw">${r.draws}</span></td><td><span class="bar" style="width:${Math.round(60 * r.wins / Math.max(1, r.wins + r.losses + r.draws))}px"></span> ${Math.round(100 * r.wins / Math.max(1, r.wins + r.losses + r.draws))}%</td><td>${r.games.map(g => `<span class="${g.outcome}" title="${esc(g.title)}">${g.outcome === 'win' ? 'W' : g.outcome === 'loss' ? 'L' : g.outcome === 'draw' ? 'D' : '!'}</span>`).join(' ')}</td></tr>`).join('');
    };
    render();
    const ctrl = state.arenaAbort = new AbortController();
    let done = 0;
    try {
      const res = await fetch('/api/arena/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, candidate, opponents: $('arenaOpp').value, games, seed, league: (state.game.leagues || []).length ? $('league').value : null, timeoutMultiplier: +$('tmult').value || 1 }), signal: ctrl.signal });
      await readStream(res, ev => {
        if (ev.type === 'match') {
          const r = results.get(ev.opponent) || { name: ev.name, wins: 0, losses: 0, draws: 0, games: [] };
          if (ev.outcome === 'win') r.wins++; else if (ev.outcome === 'loss') r.losses++; else if (ev.outcome === 'draw') r.draws++;
          r.games.push({ outcome: ev.outcome, title: `game ${ev.game + 1} seed ${ev.seed || ''} as P${ev.side}: ${ev.outcome}${ev.scores ? ' ' + ev.scores.join('-') : ''}${ev.dq && ev.dq.length ? ' | ' + ev.dq.join(' | ') : ''}${ev.message ? ' ' + ev.message : ''}` });
          results.set(ev.opponent, r); done++;
          $('arenaStatus').textContent = `${done} games played…`; render();
        } else if (ev.type === 'summary') {
          state.board = ev.leaderboard || []; refreshOpponents(); renderBoard();
          const losses = (ev.perOpponent || []).reduce((a, o) => a + o.losses, 0);
          $('arenaPatterns').innerHTML = patternsHtml(ev.lossPatterns, losses, 'losses', 'Patterns in your losses') + patternsHtml(ev.patterns, ev.total.played, 'games', 'Patterns in all your games');
          $('arenaStatus').textContent = `${ev.aborted ? 'stopped: ' : ''}${ev.candidate}: ${ev.total.wins}-${ev.total.losses}-${ev.total.draws} over ${ev.total.played} games` + (ev.rated ? ' (ratings updated)' : ' (unsaved code is not rated)');
        } else if (ev.type === 'error') {
          $('arenaError').textContent = ev.message + (ev.compileLog ? '\n' + ev.compileLog : '');
        }
      });
    } catch (e) {
      if (e.name === 'AbortError') $('arenaStatus').textContent = 'stopped'; else $('arenaError').textContent = e.message;
    } finally {
      state.arenaRunning = false; state.arenaAbort = null; $('arenaRun').disabled = false; $('arenaStop').disabled = true;
    }
  }

  // ---------- review: what went wrong, with a jump to the turn ----------
  function renderReview() {
    const items = state.review || [];
    const tabBtn = document.querySelector('.tabs button[data-tab=review]');
    const mistakes = items.filter(x => x.kind === 'mistake').length;
    tabBtn.textContent = items.length ? `Review (${mistakes || items.length})` : 'Review';
    tabBtn.classList.toggle('alert', mistakes > 0);
    const icon = k => k === 'mistake' ? '<span class="loss">✘</span>' : k === 'warning' ? '<span class="draw">!</span>' : '<span class="win">·</span>';
    $('reviewList').innerHTML = items.length
      ? items.map((r, i) => `<div class="ritem">${icon(r.kind)} ${r.player !== null && r.player !== undefined && state.game.kind !== 'solo' ? `<span class="pill p${r.player}">P${r.player}</span> ` : ''}${esc(r.message)}${r.turn ? ` <button class="secondary tiny" data-jump="${r.turn}">go to turn ${r.turn}</button>` : ''}</div>`).join('')
      : `<span class="dim">${state.result ? 'Nothing to report for this game.' : 'Run a match: the review lists the decisions that cost the game, risky timings and stray output.'}</span>`;
    $('reviewList').querySelectorAll('[data-jump]').forEach(b => b.onclick = () => { stopPlay(); goTo(Number(b.dataset.jump) - 1); });
  }

  // ---------- patterns: the same mistake across many games (same logic as server/engine/match.js) ----------
  const RANK = { mistake: 0, warning: 1, tip: 2 };
  function summarizePatterns(games) {
    const by = new Map();
    for (const g of games) {
      const seen = new Set();
      for (const it of g.review || []) {
        if (it.player !== null && it.player !== undefined && g.side !== undefined && it.player !== g.side) continue;
        const code = it.code || 'other';
      if (/-summary$/.test(code)) continue;   // per-game summaries are not mistakes
        const p = by.get(code) || { code, kind: it.kind, games: 0, total: 0, example: it.message };
        p.total++; if (!seen.has(code)) { seen.add(code); p.games++; }
        if (it.kind === 'mistake') p.kind = 'mistake';
        by.set(code, p);
      }
    }
    return [...by.values()].sort((a, b) => (RANK[a.kind] ?? 3) - (RANK[b.kind] ?? 3) || b.games - a.games);
  }
  function patternsHtml(list, n, unit, title) {
    const shown = (list || []).filter(p => p.games >= 2 || n === 1).slice(0, 8);
    if (!shown.length) return '';
    const icon = k => k === 'mistake' ? '<span class="loss">✘</span>' : k === 'warning' ? '<span class="draw">!</span>' : '<span class="win">·</span>';
    return `<h4>${esc(title)}</h4>` + shown.map(p => `<div class="ritem">${icon(p.kind)} <b>${esc(p.code)}</b> <span class="dim">in ${p.games}/${n} ${unit}</span><br><span class="dim">e.g.</span> ${esc(p.example)}</div>`).join('');
  }

  // ---------- solo puzzles: test cases, like CodinGame's "Play all testcases" ----------
  function recordTest(id, events) {
    const end = events.find(e => e.type === 'end'), err = events.find(e => e.type === 'error');
    const r = end ? end.result : null;
    state.testResults[id] = { events, passed: !!(r && r.passed), message: r ? r.message : err ? err.message : 'stopped', turns: events.filter(e => e.type === 'frame').length, name: (events.find(e => e.type === 'start') || {}).test?.name || id, aborted: !r || r.aborted };
    renderTests();
  }
  function testIds() {
    const ids = (state.game.tests || []).map(t => t.id);
    const extra = state.game.hasGenerator ? Math.max(0, Math.min(50, +$('randomCount').value || 0)) : 0;
    let seed = '1'; try { seed = seedValue(); } catch {}
    for (let i = 0; i < extra; i++) ids.push(`random:${(BigInt(seed) + BigInt(i)).toString()}`);
    return ids;
  }
  function renderTests() {
    if (!state.game || state.game.kind !== 'solo') return;
    $('randomRow').style.display = state.game.hasGenerator ? '' : 'none';
    const ids = testIds();
    const res = state.testResults || {};
    const done = ids.filter(id => res[id] && !res[id].aborted);
    const passed = done.filter(id => res[id].passed).length;
    $('testsSummary').textContent = done.length ? `${passed}/${ids.length} passed` : '';
    $('testsSummary').className = done.length === ids.length && passed === ids.length ? 'win' : done.length ? 'loss' : '';
    $('testsTable').innerHTML = `<tr><th></th><th>test</th><th>result</th><th>turns</th></tr>` + ids.map((id, i) => {
      const t = (state.game.tests || []).find(t => t.id === id);
      const r = res[id];
      const mark = !r ? '<span class="dim">○</span>' : r.running ? '<span class="draw">…</span>' : r.passed ? '<span class="win">✔</span>' : '<span class="loss">✘</span>';
      return `<tr class="trow" data-test="${esc(id)}"><td>${mark}</td><td>${i + 1}. ${esc(t ? t.name : `Random level (seed ${id.slice(7)})`)}</td><td>${r && !r.running ? esc(r.message) : ''}</td><td>${r && !r.running ? r.turns : ''}</td></tr>`;
    }).join('');
    const reviewed = ids.filter(id => res[id] && res[id].events).map(id => ({ review: ((res[id].events.find(e => e.type === 'end') || {}).review) || [], side: 0 }));
    $('testsPatterns').innerHTML = reviewed.length > 1 ? patternsHtml(summarizePatterns(reviewed), reviewed.length, 'tests', 'Patterns across tests (the same mistake in several tests)') : '';
    $('testsTable').querySelectorAll('.trow').forEach(row => row.onclick = () => {
      const r = (state.testResults || {})[row.dataset.test];
      if (r && r.events && !state.running) loadReplay(r.events);
      else if (!state.running) run({ test: row.dataset.test });
    });
  }
  async function runAllTests() {
    if (state.running) return;
    state.stopTests = false;
    $('runTests').disabled = true; $('stopTests').disabled = false;
    state.testResults = {};
    const ids = testIds();
    const candidate = $('testCand').value;
    renderTests();
    for (const id of ids) {
      if (state.stopTests) break;
      state.testResults[id] = { running: true };
      renderTests();
      await run({ test: id, candidate });
    }
    $('runTests').disabled = false; $('stopTests').disabled = true;
    renderTests();
    // a saved version keeps its score on the designed tests (random levels change with the seed)
    const designed = (state.game.tests || []).map(t => t.id);
    if (candidate.startsWith('pool:') && !state.stopTests && designed.every(id => state.testResults[id] && !state.testResults[id].aborted)) {
      const passed = designed.filter(id => state.testResults[id].passed).length;
      try {
        const res = await (await fetch('/api/arena/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, id: candidate.slice(5), passed, total: designed.length }) })).json();
        if (res.leaderboard) { state.board = res.leaderboard; refreshOpponents(); renderBoard(); }
      } catch {}
    }
    // show the first failed test, like CodinGame does
    const firstFail = ids.find(id => state.testResults[id] && !state.testResults[id].passed && state.testResults[id].events);
    if (firstFail) loadReplay(state.testResults[firstFail].events);
  }
  // replay recorded events through the normal event handler
  function loadReplay(events) {
    stopPlay();
    state.follow = true;
    for (const ev of events) onEvent(ev);
    state.follow = false;
    state.idx = Math.max(0, state.frames.length - 1);
    updateControls(); draw(); renderConsole();
  }

  init();
})();
