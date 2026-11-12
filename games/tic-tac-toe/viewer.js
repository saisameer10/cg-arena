// Ultimate Tic-Tac-Toe viewer. Contract: CGViewers[<viewer id>].render(ctx, width, height, staticInfo, frame, info)
// Player 0 is X, player 1 is O (as on CodinGame). Boards where the next player may move are highlighted; the
// last move is ringed; won boards show a big mark; row and column numbers are the protocol coordinates.
window.CGViewers = window.CGViewers || {};
window.CGViewers.uttt = {
  render(ctx, cw, ch, st, frame, info) {
    const N = st.size || 9;
    const colors = info.playerColors;
    ctx.fillStyle = '#0b0f1a';
    ctx.fillRect(0, 0, cw, ch);
    const margin = 22;
    const cell = Math.floor(Math.min((cw - margin - 8) / N, (ch - margin - 8) / N));
    if (cell <= 4) return;
    const ox = Math.floor((cw - cell * N + margin) / 2), oy = Math.floor((ch - cell * N + margin) / 2);
    const big = N === 9;
    // highlight of the boards the next player may play in
    if (frame && big && frame.next !== null && frame.active) {
      ctx.fillStyle = frame.next === 0 ? 'rgba(255,138,61,0.13)' : 'rgba(79,163,255,0.13)';
      for (const b of frame.active) ctx.fillRect(ox + (b % 3) * 3 * cell, oy + ((b / 3) | 0) * 3 * cell, 3 * cell, 3 * cell);
    } else if (frame && !big && frame.next !== null) {
      ctx.fillStyle = frame.next === 0 ? 'rgba(255,138,61,0.08)' : 'rgba(79,163,255,0.08)';
      ctx.fillRect(ox, oy, 3 * cell, 3 * cell);
    }
    // coordinates
    ctx.fillStyle = '#8a94ab'; ctx.font = `${Math.max(9, Math.min(13, cell * 0.35))}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < N; i++) {
      ctx.fillText(String(i), ox + i * cell + cell / 2, oy - margin / 2);
      ctx.fillText(String(i), ox - margin / 2, oy + i * cell + cell / 2);
    }
    // grid
    for (let i = 0; i <= N; i++) {
      const thick = big ? i % 3 === 0 : (i === 0 || i === N);
      ctx.strokeStyle = thick ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.14)';
      ctx.lineWidth = thick ? 2.5 : 1;
      ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + N * cell); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + N * cell, oy + i * cell); ctx.stroke();
    }
    if (!frame) return;
    const mark = (ch0, x, y, size, color, width) => {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      const h = size * 0.32;
      ctx.beginPath();
      if (ch0 === 'X') { ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h); ctx.moveTo(x + h, y - h); ctx.lineTo(x - h, y + h); }
      else ctx.arc(x, y, h, 0, Math.PI * 2);
      ctx.stroke();
    };
    // small marks
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = frame.cells[r * N + c];
      if (v === '.') continue;
      const closed = big && frame.boards && frame.boards[((r / 3) | 0) * 3 + ((c / 3) | 0)] !== '.';
      ctx.globalAlpha = closed ? 0.35 : 1;
      mark(v, ox + c * cell + cell / 2, oy + r * cell + cell / 2, cell, colors[v === 'X' ? 0 : 1], Math.max(1.5, cell * 0.09));
      ctx.globalAlpha = 1;
    }
    // won / full boards
    if (big && frame.boards) for (let b = 0; b < 9; b++) {
      const s = frame.boards[b];
      if (s === '.') continue;
      const x = ox + (b % 3) * 3 * cell, y = oy + ((b / 3) | 0) * 3 * cell;
      if (s === '=') { ctx.fillStyle = 'rgba(140,140,140,0.25)'; ctx.fillRect(x + 2, y + 2, 3 * cell - 4, 3 * cell - 4); continue; }
      ctx.fillStyle = s === 'X' ? 'rgba(255,138,61,0.16)' : 'rgba(79,163,255,0.16)';
      ctx.fillRect(x + 2, y + 2, 3 * cell - 4, 3 * cell - 4);
      mark(s, x + 1.5 * cell, y + 1.5 * cell, 3 * cell, colors[s === 'X' ? 0 : 1], Math.max(3, cell * 0.28));
    }
    // last move
    if (frame.last) {
      const { row, col } = frame.last;
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
      ctx.strokeRect(ox + col * cell + 3, oy + row * cell + 3, cell - 6, cell - 6);
    }
    // winning line (of boards, or of cells on the 3x3 board)
    if (frame.line) {
      const unit = big ? 3 * cell : cell;
      const ctr = i => [ox + (i % 3) * unit + unit / 2, oy + ((i / 3) | 0) * unit + unit / 2];
      const [a, b] = [ctr(frame.line[0]), ctr(frame.line[2])];
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(3, cell * 0.15); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.lineCap = 'butt';
    }
    if (frame.event && frame.event.error) {
      ctx.fillStyle = 'rgba(255,64,64,0.9)'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`P${frame.event.player} eliminated: ${String(frame.event.error).slice(0, 60)}`, cw / 2, ch - 10);
    }
  },
  // Text lines shown beside the canvas for the current frame.
  hud(st, frame, info) {
    if (!frame) return [];
    const names = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
    const lines = [0, 1].map(p => {
      const sym = p === 0 ? 'X' : 'O';
      const last = frame.last && frame.last.player === p ? ` last ${frame.last.row} ${frame.last.col}` : '';
      const boards = st.size === 9 ? ` boards ${frame.boardsWon[p]}` : '';
      const msg = frame.messages && frame.messages[p] ? ` "${frame.messages[p]}"` : '';
      return `${info.playerNames[p]} (${sym}): score ${frame.scores[p]}${boards}${last}${msg}`;
    });
    const ev = frame.event;
    if (ev && ev.error) lines.push(`P${ev.player} eliminated: ${ev.error}`);
    else if (ev && ev.won) lines.push(`P${ev.player} wins${ev.board !== undefined ? ` (the ${names[ev.board]} board completes a line)` : ''}`);
    else if (ev && ev.board !== undefined) lines.push(`P${ev.player} won the ${names[ev.board]} board`);
    if (ev && ev.full) lines.push(st.size === 9 ? 'every board is closed: most boards won decides' : 'board full: draw');
    if (frame.next !== null) {
      const where = st.size !== 9 ? '' : frame.active.length === 1 ? ` in the ${names[frame.active[0]]} board` : ' anywhere (free choice)';
      lines.push(`next: P${frame.next}${where}, ${frame.validCount} valid actions`);
    }
    return lines;
  },
};
