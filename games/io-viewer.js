// Shared viewer for classic input/output puzzles: input, expected output and your output side by side.
window.CGViewers = window.CGViewers || {};
window.CGViewers.io = {
  render(ctx, cw, ch, st, frame) {
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, cw, ch);
    const pad = 12, colW = (cw - pad * 4) / 3, lineH = 16, top = 46;
    const o = frame && frame.outcome;
    ctx.font = 'bold 16px sans-serif'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = !o ? '#8a94ab' : o.passed ? '#6fe08a' : '#ff6a6a';
    ctx.fillText(!o ? 'Waiting for output…' : o.passed ? '✔ Success' : '✘ Failure', pad, 12);
    const cols = [['Input', st.input || []], ['Expected', st.expected || []], ['Your output', (frame && frame.got) || []]];
    const maxLines = Math.floor((ch - top - pad) / lineH) - 1;
    ctx.font = '12px Consolas, monospace';
    cols.forEach(([title, lines], c) => {
      const x = pad + c * (colW + pad);
      ctx.fillStyle = '#f2b134'; ctx.fillText(title, x, top - 18);
      lines.slice(0, maxLines).forEach((l, i) => {
        const wrong = c === 2 && frame && frame.mismatch && frame.mismatch.line === i + 1;
        if (wrong) { ctx.fillStyle = 'rgba(255,80,80,0.25)'; ctx.fillRect(x - 3, top + i * lineH - 1, colW, lineH); }
        ctx.fillStyle = wrong ? '#ff9a9a' : '#d9e0ee';
        let s = String(l); while (s.length > 3 && ctx.measureText(s).width > colW - 6) s = s.slice(0, -2);
        ctx.fillText(s === String(l) ? s : s + '…', x, top + i * lineH);
      });
      if (lines.length > maxLines) { ctx.fillStyle = '#8a94ab'; ctx.fillText(`… ${lines.length - maxLines} more line(s)`, x, top + maxLines * lineH); }
    });
  },
  hud(st, frame) {
    const o = frame && frame.outcome;
    return o ? [o.message] : [];
  },
};
