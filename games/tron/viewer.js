// Tron viewer. Contract: CGViewers[<viewer id>].render(ctx, width, height, staticInfo, frame, info)
window.CGViewers = window.CGViewers || {};
window.CGViewers.tron = {
  render(ctx, cw, ch, st, frame, info) {
    const W = st.width, H = st.height;
    const cell = Math.floor(Math.min(cw / W, ch / H));
    const ox = Math.floor((cw - cell * W) / 2), oy = Math.floor((ch - cell * H) / 2);
    ctx.fillStyle = '#0b0f1a';
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(ox + x * cell + 0.5, oy); ctx.lineTo(ox + x * cell + 0.5, oy + H * cell); ctx.stroke(); }
    for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(ox, oy + y * cell + 0.5); ctx.lineTo(ox + W * cell, oy + y * cell + 0.5); ctx.stroke(); }
    if (!frame) return;
    const colors = info.playerColors;
    frame.players.forEach((p, i) => {
      if (!p.alive) return;
      ctx.fillStyle = colors[i];
      ctx.globalAlpha = 0.55;
      for (const [x, y] of p.trail) ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
      ctx.globalAlpha = 1;
      ctx.fillRect(ox + p.x * cell, oy + p.y * cell, cell, cell);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(9, cell * 0.6)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i), ox + p.x * cell + cell / 2, oy + p.y * cell + cell / 2);
    });
    frame.players.forEach((p, i) => {
      if (p.alive) return;
      ctx.strokeStyle = colors[i]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox + p.x * cell + 3, oy + p.y * cell + 3); ctx.lineTo(ox + (p.x + 1) * cell - 3, oy + (p.y + 1) * cell - 3);
      ctx.moveTo(ox + (p.x + 1) * cell - 3, oy + p.y * cell + 3); ctx.lineTo(ox + p.x * cell + 3, oy + (p.y + 1) * cell - 3); ctx.stroke();
    });
  },
  // Text lines shown beside the canvas for the current frame.
  hud(st, frame, info) {
    if (!frame) return [];
    return frame.players.map((p, i) => `${info.playerNames[i]}: ${p.alive ? `(${p.x}, ${p.y}) ${p.lastMove || ''}` : 'dead'}`);
  },
};
