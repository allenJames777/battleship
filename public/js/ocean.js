// ── Pixel Ocean — single canvas background per grid ───────
// Instead of per-cell textures (too noisy), render one cohesive
// ocean canvas behind the entire grid. Subtle, dark, animated.

const Ocean = (() => {
  const PIXEL = 5; // pixel size for the retro look

  // Very dark, subtle ocean palette
  const COLORS = [
    { r: 4,  g: 16, b: 30 },   // abyss
    { r: 5,  g: 19, b: 34 },   // deep
    { r: 7,  g: 22, b: 40 },   // deep mid
    { r: 9,  g: 26, b: 48 },   // mid
    { r: 11, g: 30, b: 54 },   // mid light
    { r: 14, g: 36, b: 62 },   // light (rare)
    { r: 18, g: 42, b: 72 },   // foam (very rare)
  ];

  // Shared offscreen canvas
  let sharedCanvas = null;
  let sharedCtx = null;
  let animTimers = [];

  function getColor(val) {
    if (val > 0.95) return COLORS[6];
    if (val > 0.85) return COLORS[5];
    if (val > 0.65) return COLORS[4];
    if (val > 0.45) return COLORS[3];
    if (val > 0.28) return COLORS[2];
    if (val > 0.12) return COLORS[1];
    return COLORS[0];
  }

  function renderOcean(w, h, time) {
    if (!sharedCanvas) {
      sharedCanvas = document.createElement('canvas');
      sharedCtx = sharedCanvas.getContext('2d');
    }

    const pw = Math.ceil(w / PIXEL);
    const ph = Math.ceil(h / PIXEL);
    sharedCanvas.width = pw;
    sharedCanvas.height = ph;

    const imageData = sharedCtx.createImageData(pw, ph);
    const data = imageData.data;

    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        // Perlin-ish noise via layered sin waves
        const wave1 = Math.sin((x * 0.3) + (y * 0.2) + time * 0.5) * 0.3;
        const wave2 = Math.sin((x * 0.15) + (y * 0.4) + time * 0.3) * 0.2;
        const wave3 = Math.sin((x * 0.5) + (y * 0.1) + time * 0.8) * 0.15;
        const noise = (Math.sin(x * 12.9898 + y * 78.233 + time * 2.0) * 43758.5453) % 1;
        const jitter = Math.abs(noise) * 0.15;

        const val = 0.35 + wave1 + wave2 + wave3 + jitter;
        const clamped = Math.max(0, Math.min(1, val));
        const color = getColor(clamped);

        const idx = (y * pw + x) * 4;
        data[idx]     = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }

    sharedCtx.putImageData(imageData, 0, 0);
    return sharedCanvas.toDataURL();
  }

  function applyToGrid(gridElement) {
    // Calculate the inner grid area (excluding headers)
    const firstCell = gridElement.querySelector('.grid-cell[data-row="0"][data-col="0"]');
    const lastCell = gridElement.querySelector('.grid-cell[data-row="9"][data-col="9"]');
    if (!firstCell || !lastCell) return;

    const gridRect = gridElement.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    const oceanW = lastRect.right - firstRect.left;
    const oceanH = lastRect.bottom - firstRect.top;
    const offsetX = firstRect.left - gridRect.left;
    const offsetY = firstRect.top - gridRect.top;

    const dataUrl = renderOcean(oceanW, oceanH, 0);

    // Apply as grid background
    gridElement.style.backgroundImage = `url(${dataUrl})`;
    gridElement.style.backgroundSize = `${oceanW}px ${oceanH}px`;
    gridElement.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    gridElement.style.backgroundRepeat = 'no-repeat';
    gridElement.style.imageRendering = 'pixelated';

    // Make cells transparent so ocean shows through
    gridElement.querySelectorAll('.grid-cell').forEach(cell => {
      if (!cell.classList.contains('hit') &&
          !cell.classList.contains('miss') &&
          !cell.classList.contains('sunk') &&
          !cell.classList.contains('hit-own') &&
          !cell.classList.contains('ship')) {
        cell.style.background = 'transparent';
      }
    });
  }

  function startAnimation(gridElement) {
    stopAnimation();
    let time = 0;

    function tick() {
      time += 0.08;

      const firstCell = gridElement.querySelector('.grid-cell[data-row="0"][data-col="0"]');
      const lastCell = gridElement.querySelector('.grid-cell[data-row="9"][data-col="9"]');
      if (!firstCell || !lastCell) return;

      const gridRect = gridElement.getBoundingClientRect();
      const firstRect = firstCell.getBoundingClientRect();
      const lastRect = lastCell.getBoundingClientRect();

      const oceanW = lastRect.right - firstRect.left;
      const oceanH = lastRect.bottom - firstRect.top;
      const offsetX = firstRect.left - gridRect.left;
      const offsetY = firstRect.top - gridRect.top;

      const dataUrl = renderOcean(oceanW, oceanH, time);
      gridElement.style.backgroundImage = `url(${dataUrl})`;
      gridElement.style.backgroundSize = `${oceanW}px ${oceanH}px`;
      gridElement.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

      // Keep non-ship/non-hit cells transparent
      gridElement.querySelectorAll('.grid-cell').forEach(cell => {
        if (!cell.classList.contains('hit') &&
            !cell.classList.contains('miss') &&
            !cell.classList.contains('sunk') &&
            !cell.classList.contains('hit-own') &&
            !cell.classList.contains('ship')) {
          cell.style.background = 'transparent';
        }
      });

      animTimers.push(setTimeout(tick, 1500)); // slow, gentle update
    }

    animTimers.push(setTimeout(tick, 500));
  }

  function stopAnimation() {
    animTimers.forEach(clearTimeout);
    animTimers = [];
  }

  return { applyToGrid, startAnimation, stopAnimation };
})();
