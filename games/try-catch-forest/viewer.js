// Try Catch Forest viewer. Contract: CGViewers[<viewer id>].render(ctx, width, height, staticInfo, frame, info)
window.CGViewers = window.CGViewers || {};
window.CGViewers['try-catch-forest'] = {
  render(ctx, cw, ch, st, frame, info) {
    const R = st.radius || 8000, s = Math.min(cw, ch) / (2 * R + 400), ox = cw / 2, oy = ch / 2;
    const X = x => ox + x * s, Y = y => oy + y * s;
    const colors = info.playerColors;
    const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(X(x), Y(y), Math.max(1, r * s), 0, 2 * Math.PI); };
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#13251a'; circle(0, 0, R); ctx.fill();
    ctx.strokeStyle = '#2f5a3c'; ctx.lineWidth = 2; ctx.stroke();
    for (const t of st.trees || []) { ctx.fillStyle = '#1f6b3a'; circle(t.x, t.y, t.r); ctx.fill(); ctx.strokeStyle = '#2f8f52'; ctx.lineWidth = 1; ctx.stroke(); }
    if (!frame) return;
    // clouds
    for (const c of frame.clouds) {
      ctx.globalAlpha = 0.28; ctx.fillStyle = '#c9d1e0'; circle(c.x, c.y, st.smokeRadius || 1900); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.strokeStyle = colors[c.owner]; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c9d1e0'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(c.life), X(c.x), Y(c.y));
      ctx.globalAlpha = 1;
    }
    // nets of this turn
    const byId = {}; for (const u of frame.units) byId[u.id] = u;
    for (const e of frame.events || []) {
      if (e.type !== 'net') continue;
      const o = byId[e.by]; if (!o) continue;
      ctx.strokeStyle = colors[o.owner]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(e.x1), Y(e.y1)); ctx.lineTo(X(e.x2), Y(e.y2)); ctx.stroke();
      ctx.lineWidth = 1; circle(e.x2, e.y2, 250); ctx.stroke();
      if (!e.hits.length) { ctx.fillStyle = '#8a94ab'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(e.tree ? 'tree' : e.decoy ? 'decoy' : 'miss', X(e.x2), Y(e.y2) - 10); }
    }
    // decoys
    for (const d of frame.decoys) { ctx.strokeStyle = colors[d.owner]; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); circle(d.x, d.y, st.unitRadius || 220); ctx.stroke(); ctx.setLineDash([]); }
    // units
    const dashed = new Set((frame.events || []).filter(e => e.type === 'dash').map(e => e.by));
    for (const u of frame.units) {
      if (u.gone) continue;
      const r = Math.max(4, (st.unitRadius || 220) * s);
      ctx.beginPath(); ctx.arc(X(u.x), Y(u.y), r, 0, 2 * Math.PI);
      if (u.ghost) { ctx.globalAlpha = 0.35; ctx.strokeStyle = colors[u.owner]; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1; continue; }
      ctx.fillStyle = colors[u.owner]; ctx.fill();
      if (dashed.has(u.id)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      if (u.immob > 0) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(X(u.x) - r - 3, Y(u.y) - r - 3, 2 * r + 6, 2 * r + 6); ctx.stroke(); }
      ctx.fillStyle = '#111'; ctx.font = `bold ${Math.max(8, r * 1.1)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(u.id), X(u.x), Y(u.y));
    }
    // catches of this turn
    for (const e of frame.events || []) {
      if (e.type !== 'catch') continue;
      const h = byId[e.by]; ctx.strokeStyle = h ? colors[h.owner] : '#fff'; ctx.lineWidth = 3;
      const x = X(e.x), y = Y(e.y);
      ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke();
    }
    // who hunts whom
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (let p = 0; p < 3; p++) { ctx.fillStyle = colors[p]; ctx.fillText(`P${p} hunts P${(p + 1) % 3}`, 8, 8 + 14 * p); }
  },
  hud(st, frame, info) {
    if (!frame) return [];
    const lines = frame.scores.map((sc, p) => {
      const alive = frame.units.filter(u => u.owner === p && !u.ghost).length;
      return `${info.playerNames[p]}: ${sc} catch${sc === 1 ? '' : 'es'}, ${alive}/${st.unitsPerPlayer} units${frame.out[p] ? ' (out)' : ''}, nets ${frame.pools[p][0]} smokes ${frame.pools[p][1]} decoys ${frame.pools[p][2]}`;
    });
    for (const e of frame.events || []) {
      if (e.type === 'catch') lines.push(`unit ${e.by} catches unit ${e.unit}`);
      else if (e.type === 'net') lines.push(`unit ${e.by} throws a net: ${e.hits.length ? 'holds ' + e.hits.join(', ') : e.tree ? 'stopped by a tree' : e.decoy ? 'hits a decoy' : 'no hit'}`);
      else if (e.type === 'smoke') lines.push(`unit ${e.by} deploys smoke`);
      else if (e.type === 'decoy') lines.push(`unit ${e.by} sends a decoy`);
    }
    return lines;
  },
};
