/* =========================================
   SafeSip — Cyclic Voltammogram Chart
   ========================================= */
(function () {
  const canvas = document.getElementById('voltamChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = 420;
  const H = canvas.height = 300;

  // Generate voltammogram curves
  function ghbCurve(v) {
    // GHB shows oxidation peak around +0.6V
    const base = Math.sin(v * Math.PI) * 0.3;
    const peak = v > 0.4 && v < 0.75 ? Math.exp(-Math.pow((v - 0.58) / 0.08, 2)) * 0.85 : 0;
    const noise = (Math.random() - 0.5) * 0.02;
    return base + peak + noise;
  }

  function safeCurve(v) {
    const base = Math.sin(v * Math.PI) * 0.12;
    const noise = (Math.random() - 0.5) * 0.015;
    return base + noise;
  }

  const voltages = [];
  const ghbData = [];
  const safeData = [];
  for (let i = 0; i <= 100; i++) {
    const v = i / 100;
    voltages.push(v);
    ghbData.push(ghbCurve(v));
    safeData.push(safeCurve(v));
  }

  function toX(v) { return 48 + v * (W - 72); }
  function toY(current, min, max) { return H - 40 - ((current - min) / (max - min)) * (H - 70); }

  const allVals = [...ghbData, ...safeData];
  const minV = Math.min(...allVals) - 0.05;
  const maxV = Math.max(...allVals) + 0.05;

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    // Horizontal grid
    for (let i = 0; i <= 4; i++) {
      const y = 30 + i * (H - 70) / 4;
      ctx.beginPath();
      ctx.moveTo(44, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }
    // Vertical grid
    for (let i = 0; i <= 5; i++) {
      const x = 48 + i * (W - 72) / 5;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, H - 36);
      ctx.stroke();
    }
  }

  function drawAxes() {
    ctx.strokeStyle = 'rgba(136,153,187,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(48, 20);
    ctx.lineTo(48, H - 36);
    ctx.lineTo(W - 20, H - 36);
    ctx.stroke();

    ctx.fillStyle = 'rgba(136,153,187,0.7)';
    ctx.font = '10px DM Mono, monospace';
    ctx.textAlign = 'center';
    // X labels
    const xLabels = ['-0.6V', '-0.2V', '+0.2V', '+0.6V', '+1.0V', '+1.2V'];
    for (let i = 0; i <= 5; i++) {
      const x = 48 + i * (W - 72) / 5;
      ctx.fillText(xLabels[i], x, H - 18);
    }
    // Y label
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Current (μA)', 0, 0);
    ctx.restore();
  }

  function drawCurve(data, color, label, animated, progress) {
    const count = Math.floor(data.length * (animated ? progress : 1));
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const x = toX(voltages[i]);
      const y = toY(data[i], minV, maxV);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    if (!animated || progress >= 1) {
      // Legend dot
      const lx = W - 130 + (label === 'Safe Drink' ? 0 : 0);
      ctx.beginPath();
      ctx.arc(W - 140, label === 'GHB' ? 30 : 50, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = 'rgba(232,237,248,0.8)';
      ctx.font = '11px Space Grotesk, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, W - 130, label === 'GHB' ? 34 : 54);
    }
  }

  function drawPeakAnnotation(progress) {
    if (progress < 0.65) return;
    const peakX = toX(0.58);
    const peakY = toY(0.85, minV, maxV) - 5;
    const alpha = Math.min(1, (progress - 0.65) / 0.15);

    ctx.strokeStyle = `rgba(255,58,92,${alpha * 0.6})`;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX, H - 36);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255,58,92,${alpha})`;
    ctx.font = 'bold 10px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GHB peak', peakX, peakY - 8);
    ctx.fillText('+0.58V', peakX, peakY - 20);
  }

  // Animated draw
  let start = null;
  const duration = 2400;

  function animate(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);

    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawAxes();
    drawCurve(safeData, 'rgba(0,255,178,0.7)', 'Safe Drink', true, progress);
    drawCurve(ghbData, 'rgba(255,58,92,0.9)', 'GHB', true, progress);
    drawPeakAnnotation(progress);

    if (progress < 1) requestAnimationFrame(animate);
  }

  // Start animation when in view
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(animate);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(canvas);
})();
