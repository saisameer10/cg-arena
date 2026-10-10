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
  function renderStatement() {
    if (!state.game) return;
    $('statement').innerHTML = window.marked ? marked.parse(state.game.statement) : `<pre style="white-space:pre-wrap">${esc(state.game.statement)}</pre>`;
  }

  function selectGame() {
    state.game = state.games.find(g => g.id === $('game').value);
    state.lang = state.languages.find(l => l.id === $('lang').value) || state.languages[0];
    try { localStorage.setItem('cg-arena:game', state.game.id); } catch {}
    renderStatement();
    state.board = [];
    refreshOpponents();
    $('p0').value = 'me'; $('p1').value = state.game.bosses.length ? 'boss:' + state.game.bosses[0].id : 'me';
    loadArena();
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
  async function run() {
    if (state.running) return;
    let seed;
    try { seed = seedValue(); } catch (e) { $('result').textContent = e.message; $('result').className = 'lose'; return; }
    const players = ['p0', 'p1'].map(id => playerSpec($(id).value));
    state.running = true; state.frames = []; state.result = null; state.logs = []; state.idx = 0; state.follow = true;
    stopPlay();
    $('run').disabled = true; $('stop').disabled = false; $('status').textContent = 'starting…';
    $('result').textContent = ''; $('result').className = '';
    const ctrl = state.abort = new AbortController();
    try {
      const res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, players, seed, league: (state.game.leagues || []).length ? $('league').value : null, timeoutMultiplier: +$('tmult').value || 1 }), signal: ctrl.signal });
      await readStream(res, onEvent);
    } catch (e) {
      if (e.name !== 'AbortError') { $('result').textContent = 'Error: ' + e.message; $('result').className = 'lose'; }
      else $('status').textContent = 'stopped';
    } finally {
      state.running = false; state.abort = null;
      $('run').disabled = false; $('stop').disabled = true;
      if (!state.result) $('status').textContent = $('status').textContent === 'stopped' ? 'stopped' : '';
    }
  }
  function onEvent(ev) {
    if (ev.type === 'start') {
      state.static = ev.static; state.meta = ev.game; state.names = ev.players; state.frames = []; state.logs = []; state.turnCount = [0, 0];
      $('status').textContent = `running (seed ${ev.seed}${ev.league ? ', ' + ev.league : ''})`;
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
      const me = ['p0', 'p1'].map(id => $(id).value === 'me');
      let text, cls;
      if (r.aborted) { text = 'Stopped'; cls = 'draw'; }
      else if (r.winner === null || r.winner === undefined) { text = `Draw  (scores ${r.scores.join(' – ')})`; cls = 'draw'; }
      else {
        text = `P${r.winner} ${state.names[r.winner]} wins  (scores ${r.scores.join(' – ')})`;
        cls = me[r.winner] && !me[1 - r.winner] ? 'win' : !me[r.winner] && me[1 - r.winner] ? 'lose' : 'draw';
      }
      const dq = (r.dq || []).map((d, i) => d ? `P${i}: ${d}` : null).filter(Boolean);
      if (dq.length) text += '  —  ' + dq.join(' | ');
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
    const arenaTab = state.tab === 'arena';
    $('arena').style.display = arenaTab ? 'block' : 'none';
    c.style.display = arenaTab ? 'none' : 'block';
    if (arenaTab) return;
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
  async function saveVersion() {
    const name = prompt('Name for this version (e.g. "v3 sonar tracker"):', `v${(state.board || []).filter(r => r.kind === 'version').length + 1}`);
    if (name === null) return;
    const res = await (await fetch('/api/arena/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, lang: state.lang.id, source: getCode(), name }) })).json();
    if (res.error) { $('arenaError').textContent = res.error; return; }
    $('arenaError').textContent = '';
    state.board = res.leaderboard || []; refreshOpponents(); renderBoard();
    $('arenaStatus').textContent = `saved "${res.entry.name}"`;
  }
  async function runArena() {
    if (state.arenaRunning) return;
    let seed;
    try { seed = seedValue(); } catch (e) { $('arenaError').textContent = e.message; return; }
    state.arenaRunning = true; $('arenaRun').disabled = true; $('arenaStop').disabled = false; $('arenaError').textContent = '';
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

  init();
})();
