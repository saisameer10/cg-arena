// Generic viewer, used by any challenge that has no viewer.js yet: shows the turn's state as text
// (the referee's getFrame() and getStaticInfo()), so a new challenge is playable before it has graphics.
window.CGViewers = window.CGViewers || {};
window.CGViewers.generic = {
  render(ctx, cw, ch, st, frame, info) {
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, cw, ch);
    ctx.font = '12px Consolas, monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    const lines = [];
    const dump = (obj, indent, depth) => {
      if (lines.length > 200) return;
      for (const [k, v] of Object.entries(obj || {})) {
        if (v && typeof v === 'object' && !Array.isArray(v) && depth < 2) { lines.push([indent + k + ':', '#f2b134']); dump(v, indent + '  ', depth + 1); continue; }
        let s = Array.isArray(v) && v.every(x => typeof x === 'string') && v.length > 1 ? null : JSON.stringify(v);
        if (s === null) { lines.push([indent + k + ':', '#f2b134']); v.slice(0, 40).forEach(row => lines.push([indent + '  ' + row, '#d9e0ee'])); continue; }
        if (s && s.length > 160) s = s.slice(0, 157) + '…';
        lines.push([indent + k + ': ' + s, '#d9e0ee']);
      }
    };
    lines.push(['This challenge has no viewer yet: its state is shown as text.', '#8a94ab']);
    if (frame) { lines.push(['turn state', '#6fe08a']); dump(frame, '  ', 0); }
    lines.push(['static information', '#6fe08a']); dump(st, '  ', 0);
    const lh = 15;
    lines.slice(0, Math.floor((ch - 10) / lh)).forEach(([t, c], i) => { ctx.fillStyle = c; ctx.fillText(t, 10, 8 + i * lh); });
  },
  hud(st, frame, info) {
    if (!frame) return [];
    const nums = Object.entries(frame).filter(([, v]) => typeof v === 'number' || typeof v === 'string').slice(0, 6).map(([k, v]) => `${k}: ${v}`);
    return nums.length ? [nums.join('   ')] : [];
  },
};
