// Shadows of the Knight - Episode 1 viewer: the building with the windows the hints still allow (amber),
// Batman's jumps, and the bombs (red, debug only: your bot never sees them). A zoom panel follows the
// allowed region once it is small compared with the building.
window.CGViewers = window.CGViewers || {};
window.CGViewers['shadows-knight-1'] = {
  render(ctx, cw, ch, st, frame) {
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, cw, ch);
    const f = frame || { batman: st.start, prev: null, region: st.region, bomb: st.bomb, path: [st.start], dir: st.dir, used: 0 };
    const all = { x0: 0, x1: st.W - 1, y0: 0, y1: st.H - 1 };
    // zoom viewport: region + Batman + bombs, padded, when that is much smaller than the building
    const xs = [f.region[0], f.region[1], f.batman[0], f.bomb[0]], ys = [f.region[2], f.region[3], f.batman[1], f.bomb[1]];
    let zx0 = Math.min(...xs), zx1 = Math.max(...xs), zy0 = Math.min(...ys), zy1 = Math.max(...ys);
    const padX = Math.max(2, Math.round((zx1 - zx0 + 1) * 0.25)), padY = Math.max(2, Math.round((zy1 - zy0 + 1) * 0.25));
    const zoom = { x0: Math.max(0, zx0 - padX), x1: Math.min(st.W - 1, zx1 + padX), y0: Math.max(0, zy0 - padY), y1: Math.min(st.H - 1, zy1 + padY) };
    const showZoom = (zoom.x1 - zoom.x0 + 1) * 4 < st.W || (zoom.y1 - zoom.y0 + 1) * 4 < st.H;
    const top = 22, pad = 10;
    if (showZoom) {
      const wide = cw >= ch;
      const a = wide ? { x: pad, y: top, w: cw * 0.5 - pad * 1.5, h: ch - top - pad } : { x: pad, y: top, w: cw - pad * 2, h: (ch - top) * 0.5 - pad * 1.5 };
      const b = wide ? { x: cw * 0.5 + pad / 2, y: top, w: cw * 0.5 - pad * 1.5, h: ch - top - pad } : { x: pad, y: top + (ch - top) * 0.5, w: cw - pad * 2, h: (ch - top) * 0.5 - pad * 1.5 };
      const ra = this.view(ctx, a, all, st, f, `building ${st.W} x ${st.H}`);
      this.view(ctx, b, zoom, st, f, `zoom: X ${zoom.x0}..${zoom.x1}, Y ${zoom.y0}..${zoom.y1}`);
      // show where the zoom is on the full view
      ctx.strokeStyle = '#8a94ab'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      const p0 = ra.at(zoom.x0 - 0.5, zoom.y0 - 0.5), p1 = ra.at(zoom.x1 + 0.5, zoom.y1 + 0.5);
      ctx.strokeRect(p0[0], p0[1], Math.max(2, p1[0] - p0[0]), Math.max(2, p1[1] - p0[1]));
      ctx.setLineDash([]);
    } else this.view(ctx, { x: pad, y: top, w: cw - pad * 2, h: ch - top - pad }, all, st, f, `building ${st.W} x ${st.H}`);
  },

  // draws windows vp.x0..x1 x vp.y0..y1 into box; returns { at(x, y) -> screen point of a window centre }
  view(ctx, outer, vp, st, f, title) {
    const box = { x: outer.x + 30, y: outer.y, w: Math.max(10, outer.w - 30), h: Math.max(10, outer.h - 12) };   // room for the Y and X labels
    const nW = vp.x1 - vp.x0 + 1, nH = vp.y1 - vp.y0 + 1;
    const s = Math.min(box.w / nW, box.h / nH);
    const dw = Math.max(nW * s, Math.min(box.w, 24)), dh = Math.max(nH * s, Math.min(box.h, 24));
    const cwx = dw / nW, cwy = dh / nH;
    const ox = box.x + (box.w - dw) / 2, oy = box.y + (box.h - dh) / 2;
    const at = (x, y) => [ox + (x - vp.x0 + 0.5) * cwx, oy + (y - vp.y0 + 0.5) * cwy];
    ctx.save();
    ctx.beginPath(); ctx.rect(ox - 1, oy - 1, dw + 2, dh + 2); ctx.clip();
    ctx.fillStyle = '#1b2030'; ctx.fillRect(ox, oy, dw, dh);                     // ruled out by the hints
    const r = f.region;
    const rx0 = Math.max(r[0], vp.x0), rx1 = Math.min(r[1], vp.x1), ry0 = Math.max(r[2], vp.y0), ry1 = Math.min(r[3], vp.y1);
    const inRegion = rx0 <= rx1 && ry0 <= ry1;
    if (inRegion) {
      const a = at(rx0 - 0.5, ry0 - 0.5), b = at(rx1 + 0.5, ry1 + 0.5);
      ctx.fillStyle = 'rgba(242,177,52,0.22)'; ctx.fillRect(a[0], a[1], Math.max(1.5, b[0] - a[0]), Math.max(1.5, b[1] - a[1]));
    }
    // individual windows when they are big enough to see
    if (cwx >= 5 && cwy >= 5 && nW * nH <= 30000) {
      for (let y = vp.y0; y <= vp.y1; y++) for (let x = vp.x0; x <= vp.x1; x++) {
        const c = at(x, y);
        const lit = x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3];
        ctx.fillStyle = lit ? '#f2b13466' : '#2c3346';
        ctx.fillRect(c[0] - cwx * 0.32, c[1] - cwy * 0.32, cwx * 0.64, cwy * 0.64);
      }
    }
    if (inRegion) {
      const a = at(rx0 - 0.5, ry0 - 0.5), b = at(rx1 + 0.5, ry1 + 0.5);
      ctx.strokeStyle = '#f2b134'; ctx.lineWidth = 1.5; ctx.strokeRect(a[0], a[1], Math.max(1.5, b[0] - a[0]), Math.max(1.5, b[1] - a[1]));
    }
    // jumps so far
    const path = f.path || [];
    ctx.strokeStyle = '#4fa3ff88'; ctx.lineWidth = 1.5; ctx.beginPath();
    path.forEach((p, i) => { const c = at(p[0], p[1]); if (i) ctx.lineTo(c[0], c[1]); else ctx.moveTo(c[0], c[1]); });
    ctx.stroke();
    const rad = Math.max(3, Math.min(9, Math.min(cwx, cwy) * 0.4));
    path.forEach((p, i) => { if (i === path.length - 1) return; const c = at(p[0], p[1]); ctx.fillStyle = i === 0 ? '#8a94ab' : '#4fa3ff99'; ctx.fillRect(c[0] - 2, c[1] - 2, 4, 4); });
    if (f.prev) {                                                                 // the last jump, solid
      const a = at(f.prev[0], f.prev[1]), b = at(f.batman[0], f.batman[1]);
      ctx.strokeStyle = '#4fa3ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // bombs (debug view: hidden from the bot)
    const bc = at(f.bomb[0], f.bomb[1]);
    ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bc[0] - rad, bc[1]); ctx.lineTo(bc[0], bc[1] - rad); ctx.lineTo(bc[0] + rad, bc[1]); ctx.lineTo(bc[0], bc[1] + rad); ctx.closePath(); ctx.stroke();
    // Batman
    const bm = at(f.batman[0], f.batman[1]);
    ctx.fillStyle = f.outcome && f.outcome.passed ? '#6fe08a' : '#4fa3ff'; ctx.strokeStyle = '#0b0f1a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bm[0], bm[1], rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#3a4050'; ctx.lineWidth = 1; ctx.strokeRect(ox - 0.5, oy - 0.5, dw + 1, dh + 1);
    // labels
    ctx.fillStyle = '#8a94ab'; ctx.font = '11px sans-serif'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillText(title, outer.x, outer.y - 7);
    const ly = oy + dh + 11;                        // X range under the drawing
    if (vp.x0 === vp.x1) { ctx.textAlign = 'center'; ctx.fillText(`X ${vp.x0}`, ox + dw / 2, ly); }
    else { ctx.fillText(String(vp.x0), ox, ly); ctx.textAlign = 'right'; ctx.fillText(String(vp.x1), ox + dw, ly); }
    ctx.textAlign = 'right'; ctx.fillText(String(vp.y0), ox - 3, oy + 9);        // Y range left of it
    if (vp.y1 !== vp.y0) ctx.fillText(String(vp.y1), ox - 3, oy + dh);
    return { at };
  },

  hud(st, frame) {
    const words = { U: 'up', UR: 'up-right', R: 'right', DR: 'down-right', D: 'down', DL: 'down-left', L: 'left', UL: 'up-left' };
    const reg = r => `X ${r[0] === r[1] ? r[0] : r[0] + '..' + r[1]}, Y ${r[2] === r[3] ? r[2] : r[2] + '..' + r[3]}`;
    const size = r => (r[1] - r[0] + 1) * (r[3] - r[2] + 1);
    const tags = `${st.evasive ? 'moving bombs' : st.randomBomb ? 'bombs placed by the seed' : 'fixed bombs'}`;
    if (!frame) return [`Building ${st.W} x ${st.H}, ${st.N} jumps, Batman on (${st.start[0]},${st.start[1]}), first hint ${st.dir} (${words[st.dir]})`, `allowed: ${reg(st.region)} (${size(st.region)} windows; a perfect search needs ${st.need} jumps at most)   ${tags}`];
    const lines = [`jump ${frame.used}/${st.N}   Batman (${frame.batman[0]},${frame.batman[1]})   hint ${frame.dir ? `${frame.dir} (${words[frame.dir]})` : 'found'}   bombs (${frame.bomb[0]},${frame.bomb[1]}) ${st.evasive ? '[moving]' : ''}`];
    if (frame.dir) lines.push(`allowed: ${reg(frame.region)} (${size(frame.region)} windows)   worst case ${frame.need} more jump(s), ${frame.jumpsLeft} left${frame.need > frame.jumpsLeft ? '  -> no longer a sure win' : ''}`);
    if (frame.outcome) lines.push((frame.outcome.passed ? '✔ ' : '✘ ') + frame.outcome.message);
    return lines;
  },
};
