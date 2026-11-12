// The Bridge - Episode 2 viewer: a window around the bikes plus a minimap of the whole road.
window.CGViewers = window.CGViewers || {};
window.CGViewers.bridge = {
  COLORS: ['#ff8a3d', '#4fa3ff', '#6fe08a', '#d77bff'],
  render(ctx, cw, ch, st, frame) {
    const L = st.L;
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, cw, ch);
    const bikes = frame ? frame.bikes : null;
    const live = bikes ? bikes.filter(b => b.alive) : [];
    const focusX = live.length ? live[0].x : bikes && bikes.length ? Math.max(...bikes.map(b => b.x)) : 0;
    const W = Math.min(L + 4, 36);                                   // cells visible
    const start = Math.max(0, Math.min(focusX - 6, L + 4 - W));
    const cell = cw / W;
    const roadTop = 28, laneH = Math.min((ch * 0.68 - roadTop) / 4, cell * 1.4);
    // road
    for (let y = 0; y < 4; y++) for (let i = 0; i < W; i++) {
      const x = start + i, px = i * cell, py = roadTop + y * laneH;
      const finish = x >= L;
      const hole = !finish && st.road[y][x] === '0';
      ctx.fillStyle = finish ? '#1d3b2a' : hole ? '#000' : '#3a4050';
      ctx.fillRect(px + 1, py + 1, cell - 2, laneH - 2);
      if (hole) { ctx.strokeStyle = '#ff8a3d55'; ctx.strokeRect(px + 2.5, py + 2.5, cell - 5, laneH - 5); }
    }
    // x labels
    ctx.fillStyle = '#8a94ab'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < W; i++) if ((start + i) % 5 === 0) ctx.fillText(String(start + i), i * cell + cell / 2, roadTop - 6);
    if (L >= start && L < start + W) { ctx.fillStyle = '#6fe08a'; ctx.fillText('FINISH', (L - start) * cell + 24, roadTop - 6); }
    if (!bikes) return;
    // last move: line from previous to current position
    if (frame.prev) frame.prev.forEach((p, i) => {
      const b = bikes[i];
      if (p.x === b.x && p.y === b.y) return;
      ctx.strokeStyle = this.COLORS[i] + '99'; ctx.lineWidth = 2; ctx.setLineDash(frame.cmd === 'JUMP' ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo((p.x - start) * cell + cell / 2, roadTop + p.y * laneH + laneH / 2);
      ctx.lineTo((b.x - start) * cell + cell / 2, roadTop + b.y * laneH + laneH / 2);
      ctx.stroke(); ctx.setLineDash([]);
    });
    bikes.forEach((b, i) => {
      const px = (b.x - start) * cell + cell / 2, py = roadTop + b.y * laneH + laneH / 2;
      if (px < 0 || px > cw) return;
      const r = Math.min(cell, laneH) * 0.36;
      if (b.alive) { ctx.fillStyle = this.COLORS[i]; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); }
      else {
        ctx.strokeStyle = '#ff4040'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px - r, py - r); ctx.lineTo(px + r, py + r); ctx.moveTo(px + r, py - r); ctx.lineTo(px - r, py + r); ctx.stroke();
      }
    });
    // minimap
    const mTop = roadTop + 4 * laneH + 18, mH = Math.min(36, ch - mTop - 8), sx = cw / (L + 4);
    if (mH > 8) {
      ctx.fillStyle = '#3a4050'; ctx.fillRect(0, mTop, cw, mH);
      ctx.fillStyle = '#000';
      for (let y = 0; y < 4; y++) for (let x = 0; x < L; x++) if (st.road[y][x] === '0') ctx.fillRect(x * sx, mTop + y * mH / 4, Math.max(1, sx), mH / 4);
      ctx.fillStyle = '#1d3b2a'; ctx.fillRect(L * sx, mTop, 4 * sx, mH);
      ctx.strokeStyle = '#f2b134'; ctx.lineWidth = 1; ctx.strokeRect(start * sx, mTop - 1, W * sx, mH + 2);
      bikes.forEach((b, i) => { ctx.fillStyle = b.alive ? this.COLORS[i] : '#ff4040'; ctx.fillRect(b.x * sx - 1, mTop + b.y * mH / 4, 3, mH / 4); });
    }
  },
  hud(st, frame) {
    if (!frame) return [`Road length ${st.L}, ${st.M} bike(s), at least ${st.V} must cross`];
    const alive = frame.bikes.filter(b => b.alive).length;
    const x = frame.bikes.find(b => b.alive) || frame.bikes[0];
    const lines = [`turn ${frame.turn}/50   ${frame.cmd || ''}   speed ${frame.speed}   X ${x.x}/${st.L}   bikes ${alive}/${st.M} (need ${st.V})`];
    if (frame.outcome) lines.push((frame.outcome.passed ? '✔ ' : '✘ ') + frame.outcome.message);
    return lines;
  },
};
