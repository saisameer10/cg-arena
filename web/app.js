(() => {
  const $ = id => document.getElementById(id);
  const PLAYER_COLORS = ['#ff8a3d', '#4fa3ff'];
  const state = { games: [], languages: [], game: null, lang: null, frames: [], static: null, meta: null, names: [], idx: 0, playing: null, running: false, abort: null, result: null, tab: 'console0', follow: true, logs: [] };
  let editor = null, editorReady = null;

  // ---------- editor ----------
  function initEditor() {
    editorReady = new Promise(resolve => {
      const fallback = () => { $('fallback').style.display = 'block'; editor = null; resolve(); };
      if (!window.require) return fallback();
      const t = setTimeout(fallback, 8000);
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs' } });
      window.require(['vs/editor/editor.main'], () => {
        clearTimeout(t);
        editor = monaco.editor.create($('monaco'), { value: '', language: 'python', theme: 'vs-dark', automaticLayout: true, fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
        editor.onDidChangeModelContent(() => saveCode());
        resolve();
      }, fallback);
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
  function saveCode() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(codeKey(), getCode()); } catch {} }, 300); }
  function loadCode(forceStarter) {
    let code = null;
    if (!forceStarter) { try { code = localStorage.getItem(codeKey()); } catch {} }
    if (code === null) code = state.game.starters[state.lang.id] || `# no starter for ${state.lang.name} in ${state.game.name}\n`;
    setCode(code, state.lang.monaco);
  }
  $('fallback').addEventListener('input', saveCode);

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
    $('game').onchange = selectGame;
    $('lang').onchange = () => { state.lang = state.languages.find(l => l.id === $('lang').value); try { localStorage.setItem('cg-arena:lang', state.lang.id); } catch {} loadCode(false); };
    $('run').onclick = run;
    $('stop').onclick = () => state.abort && state.abort.abort();
    $('reset').onclick = () => { if (confirm('Replace your code with the starter code?')) loadCode(true); saveCode(); };
    $('first').onclick = () => goTo(0);
    $('prev').onclick = () => goTo(state.idx - 1);
    $('next').onclick = () => goTo(state.idx + 1);
    $('play').onclick = togglePlay;
    $('slider').oninput = () => goTo(+$('slider').value);
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b)); renderConsole(); });
    document.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); run(); } });
    window.addEventListener('resize', draw);
    new ResizeObserver(draw).observe($('viewer'));
  }

  function selectGame() {
    state.game = state.games.find(g => g.id === $('game').value);
    state.lang = state.languages.find(l => l.id === $('lang').value) || state.languages[0];
    try { localStorage.setItem('cg-arena:game', state.game.id); } catch {}
    $('statement').innerHTML = window.marked ? marked.parse(state.game.statement) : `<pre>${state.game.statement.replace(/</g, '&lt;')}</pre>`;
    const opts = `<option value="me">My code</option>` + state.game.bosses.map(b => `<option value="boss:${b.id}">${b.name}</option>`).join('');
    $('p0').innerHTML = opts; $('p1').innerHTML = opts;
    $('p0').value = 'me'; $('p1').value = state.game.bosses.length ? 'boss:' + state.game.bosses[0].id : 'me';
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

  // ---------- running a match ----------
  async function run() {
    if (state.running) return;
    const players = ['p0', 'p1'].map(id => {
      const v = $(id).value;
      return v === 'me' ? { type: 'user', lang: state.lang.id, source: getCode(), name: `My code (${state.lang.name})` } : { type: 'boss', id: v.slice(5) };
    });
    state.running = true; state.frames = []; state.result = null; state.logs = []; state.idx = 0; state.follow = true;
    stopPlay();
    $('run').disabled = true; $('stop').disabled = false; $('status').textContent = 'starting…';
    $('result').textContent = ''; $('result').className = '';
    const ctrl = state.abort = new AbortController();
    try {
      const res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: state.game.id, players, seed: +$('seed').value || 1, timeoutMultiplier: +$('tmult').value || 1 }), signal: ctrl.signal });
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); if (line.trim()) onEvent(JSON.parse(line)); }
      }
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
      state.static = ev.static; state.meta = ev.game; state.names = ev.players; state.frames = []; state.logs = [];
      $('status').textContent = `running (seed ${ev.seed})`;
      updateControls(); draw();
    } else if (ev.type === 'frame') {
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
      if (r.winner === null || r.winner === undefined) { text = `Draw  (scores ${r.scores.join(' – ')})`; cls = 'draw'; }
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
      if (ev.compileLog) { state.logs.push({ turn: 0, text: ev.compileLog }); state.tab = 'log'; renderConsole(); }
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
    const frame = state.frames[state.idx];
    if (state.tab === 'log') {
      c.innerHTML = state.logs.filter(l => l.turn <= state.idx + 1).map(l => `<span class="dim">[${l.turn}]</span> ${esc(l.text)}`).join('\n') || '<span class="dim">no log yet</span>';
      c.scrollTop = c.scrollHeight; return;
    }
    if (!frame) { c.innerHTML = '<span class="dim">run a match to see output</span>'; return; }
    if (state.tab === 'io') {
      c.innerHTML = frame.actors.map(a => `<span class="dim">── P${a.player} input ──</span>\n${esc(a.input.join('\n')) || '<span class="dim">(none)</span>'}\n<span class="dim">── P${a.player} output (${a.ms} ms) ──</span>\n<span class="out">${esc(a.output.join('\n'))}</span>${a.error ? `\n<span class="err">${esc(a.error)}</span>` : ''}`).join('\n\n');
      return;
    }
    const p = +state.tab.slice(-1);
    // show stderr of this frame plus the previous frames so the panel has context
    const lines = [];
    for (let i = Math.max(0, state.idx - 8); i <= state.idx; i++) {
      for (const a of state.frames[i].actors) {
        if (a.player !== p) continue;
        const cur = i === state.idx;
        lines.push(`<span class="dim">── turn ${i + 1} (${a.ms} ms) ──</span>`);
        if (a.stderr) lines.push(cur ? esc(a.stderr.trimEnd()) : `<span class="dim">${esc(a.stderr.trimEnd())}</span>`);
        lines.push(`<span class="out">> ${esc(a.output.join(' | '))}</span>`);
        if (a.error) lines.push(`<span class="err">${esc(a.error)}</span>`);
      }
    }
    c.innerHTML = lines.join('\n') || '<span class="dim">no output from this player yet</span>';
    c.scrollTop = c.scrollHeight;
  }

  init();
})();
