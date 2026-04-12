// ── Pixel Ocean Generator ─────────────────────────────────
// Generates a pixelated animated ocean background for grid cells.

const Ocean = (() => {
  // Palette: dark moody ocean — easy on the eyes
  const DEEP = [
    '#04101e', '#051322', '#061626', '#07192a',
    '#050f1c', '#061220', '#071524', '#040e1a',
  ];
  const MID = [
    '#0a1e38', '#0b2240', '#0c2648', '#0d2a50',
    '#091c34', '#0a203c', '#0b2444',
  ];
  const LIGHT = [
    '#0e3058', '#103460', '#123868', '#143c70',
    '#0d2e54', '#0f325c', '#113664',
  ];
  const FOAM = [
    '#164070', '#184478', '#1a4880', '#1c4c88',
    '#153e6c', '#174274', '#19467c',
  ];
  const SPARKLE = [
    '#1e5090', '#205498', '#2258a0', '#1a4c88',
  ];

  const PIXEL_SIZE = 4; // each "pixel" is 4x4 CSS pixels

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Generate a unique pixel water tile for a cell
  function generateCellBackground(cellSize) {
    const canvas = document.createElement('canvas');
    const pixels = Math.ceil(cellSize / PIXEL_SIZE);
    canvas.width = pixels;
    canvas.height = pixels;
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < pixels; y++) {
      for (let x = 0; x < pixels; x++) {
        const rand = Math.random();
        const waveOffset = Math.sin((x + y) * 0.8) * 0.15;
        const val = rand + waveOffset;

        if (val > 0.92) {
          ctx.fillStyle = pick(SPARKLE);
        } else if (val > 0.78) {
          ctx.fillStyle = pick(FOAM);
        } else if (val > 0.5) {
          ctx.fillStyle = pick(LIGHT);
        } else if (val > 0.25) {
          ctx.fillStyle = pick(MID);
        } else {
          ctx.fillStyle = pick(DEEP);
        }

        ctx.fillRect(x, y, 1, 1);
      }
    }

    return canvas.toDataURL();
  }

  // Apply ocean backgrounds to all grid cells in a container
  function applyToGrid(gridElement) {
    const cells = gridElement.querySelectorAll('.grid-cell');
    const cellSize = cells[0]?.offsetWidth || 36;

    cells.forEach(cell => {
      // Don't override hit/miss/ship visuals
      if (!cell.classList.contains('hit') &&
          !cell.classList.contains('miss') &&
          !cell.classList.contains('sunk') &&
          !cell.classList.contains('hit-own')) {
        const bg = generateCellBackground(cellSize);
        cell.style.backgroundImage = `url(${bg})`;
        cell.style.backgroundSize = '100% 100%';
        cell.dataset.oceanBg = bg; // store for restoration
      }
    });
  }

  // Animate: subtly shift some cells every few seconds
  let animFrames = [];

  function startAnimation(gridElement) {
    stopAnimation();

    function tick() {
      const cells = gridElement.querySelectorAll('.grid-cell');
      const cellSize = cells[0]?.offsetWidth || 36;

      // Pick 8-12 random cells to "ripple"
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * cells.length);
        const cell = cells[idx];
        if (cell &&
            !cell.classList.contains('hit') &&
            !cell.classList.contains('miss') &&
            !cell.classList.contains('sunk') &&
            !cell.classList.contains('hit-own') &&
            !cell.classList.contains('ship')) {
          const bg = generateCellBackground(cellSize);
          cell.style.backgroundImage = `url(${bg})`;
          cell.dataset.oceanBg = bg;
        }
      }

      animFrames.push(setTimeout(tick, 800 + Math.random() * 400));
    }

    animFrames.push(setTimeout(tick, 1000));
  }

  function stopAnimation() {
    animFrames.forEach(clearTimeout);
    animFrames = [];
  }

  // Apply to all visible grids
  function applyToAllGrids() {
    document.querySelectorAll('.grid').forEach(grid => {
      applyToGrid(grid);
    });
  }

  return {
    applyToGrid,
    startAnimation,
    stopAnimation,
    applyToAllGrids,
    generateCellBackground,
  };
})();
