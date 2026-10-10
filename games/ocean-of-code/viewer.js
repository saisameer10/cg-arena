// Ocean of Code viewer (full information replay, like CodinGame's).
window.CGViewers = window.CGViewers || {};
window.CGViewers.ocean = {
  render(ctx, cw, ch, st, frame, info) {
    const W = st.width, H = st.height;
    const cell = Math.floor(Math.min(cw / W, ch / H));
    const ox = Math.floor((cw - cell * W) / 2), oy = Math.floor((ch - cell * H) / 2);
    const colors = info.playerColors;
    ctx.fillStyle = '#071a2b';
    ctx.fillRect(0, 0, cw, ch);
    // sector highlight for sonar / surface
    const ev = frame && frame.events;
    const hl = [];
    if (ev && ev.sonar) hl.push([ev.sonar.sector, ev.sonar.result === 'Y' ? 'rgba(80,220,120,0.18)' : 'rgba(255,255,255,0.08)']);
    if (ev && ev.surfaced) hl.push([ev.surfaced, 'rgba(255,200,60,0.2)']);
    for (const [s, color] of hl) {
      const sx = ((s - 1) % 3) * 5, sy = Math.floor((s - 1) / 3) * 5;
      ctx.fillStyle = color; ctx.fillRect(ox + sx * cell, oy + sy * cell, 5 * cell, 5 * cell);
    }
    // cells
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (st.map[y][x] === 'x') { ctx.fillStyle = '#6b5b3e'; ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2); }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(ox + x * cell + 0.5, oy); ctx.lineTo(ox + x * cell + 0.5, oy + H * cell); ctx.stroke(); }
    for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(ox, oy + y * cell + 0.5); ctx.lineTo(ox + W * cell, oy + y * cell + 0.5); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    for (let s = 0; s <= 3; s++) {
      ctx.beginPath(); ctx.moveTo(ox + s * 5 * cell, oy); ctx.lineTo(ox + s * 5 * cell, oy + H * cell); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, oy + s * 5 * cell); ctx.lineTo(ox + W * cell, oy + s * 5 * cell); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = `${cell * 1.2}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let s = 1; s <= 9; s++) ctx.fillText(String(s), ox + (((s - 1) % 3) * 5 + 2.5) * cell, oy + (Math.floor((s - 1) / 3) * 5 + 2.5) * cell);
    if (!frame) return;
    // trails, mines, subs
    frame.players.forEach((p, i) => {
      ctx.fillStyle = colors[i]; ctx.globalAlpha = 0.35;
      for (const k of p.visited) ctx.fillRect(ox + (k % W) * cell + 3, oy + Math.floor(k / W) * cell + 3, cell - 6, cell - 6);
      ctx.globalAlpha = 1;
      for (const [mx, my, active] of p.mines) {
        ctx.beginPath(); ctx.moveTo(ox + mx * cell + cell / 2, oy + my * cell + 4); ctx.lineTo(ox + mx * cell + cell - 4, oy + my * cell + cell / 2);
        ctx.lineTo(ox + mx * cell + cell / 2, oy + my * cell + cell - 4); ctx.lineTo(ox + mx * cell + 4, oy + my * cell + cell / 2); ctx.closePath();
        ctx.strokeStyle = colors[i]; ctx.lineWidth = 2; ctx.setLineDash(active === false ? [3, 3] : []); ctx.stroke(); ctx.setLineDash([]);
      }
    });
    frame.players.forEach((p, i) => {
      if (p.x < 0) return;
      ctx.fillStyle = colors[i];
      ctx.beginPath(); ctx.arc(ox + p.x * cell + cell / 2, oy + p.y * cell + cell / 2, cell * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `bold ${cell * 0.55}px sans-serif`;
      ctx.fillText(String(i), ox + p.x * cell + cell / 2, oy + p.y * cell + cell / 2);
      if (p.life <= 0) { ctx.strokeStyle = '#ff4040'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox + p.x * cell + cell / 2, oy + p.y * cell + cell / 2, cell * 0.48, 0, Math.PI * 2); ctx.stroke(); }
    });
    // explosions
    if (ev) for (const [x, y] of ev.explosions) {
      ctx.fillStyle = 'rgba(255,90,40,0.35)'; ctx.fillRect(ox + (x - 1) * cell, oy + (y - 1) * cell, 3 * cell, 3 * cell);
      ctx.fillStyle = 'rgba(255,200,40,0.8)'; ctx.beginPath(); ctx.arc(ox + x * cell + cell / 2, oy + y * cell + cell / 2, cell * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    if (ev && ev.mine) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(ox + ev.mine[0] * cell + 2, oy + ev.mine[1] * cell + 2, cell - 4, cell - 4); }
  },
  hud(st, frame, info) {
    if (!frame) return [];
    const lines = [];
    const cd = v => v < 0 ? '–' : v;
    frame.players.forEach((p, i) => {
      const hearts = '♥'.repeat(Math.max(0, p.life)) + '♡'.repeat(Math.max(0, 6 - Math.max(0, p.life)));
      lines.push(`${info.playerNames[i]}  ${hearts}  pos (${p.x},${p.y})  cd T${cd(p.cd.TORPEDO)} S${cd(p.cd.SONAR)} Si${cd(p.cd.SILENCE)} M${cd(p.cd.MINE)}  ${p.msg ? '“' + p.msg + '”' : ''}`);
    });
    if (frame.events) {
      const e = frame.events;
      if (e.error) lines.push(`P${e.player} loses: ${e.error}`);
      else lines.push(`P${e.player} played: ${e.orders}` + (e.sonar ? `  → sonar ${e.sonar.result}` : '') + (e.damage.some(d => d) ? `  damage [${e.damage.join(', ')}]` : '')
        + (e.skipped && e.skipped.length ? `  ⚠ skipped: ${e.skipped.join('; ')}` : ''));
    }
    return lines;
  },
};
