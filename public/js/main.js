// ── UI Controller & Main Entry ────────────────────────────

const UI = (() => {
  // DOM refs
  const screens = {
    home: document.getElementById('screen-home'),
    lobby: document.getElementById('screen-lobby'),
    faction: document.getElementById('screen-faction'),
    placement: document.getElementById('screen-placement'),
    battle: document.getElementById('screen-battle'),
    gameover: document.getElementById('screen-gameover'),
  };

  const els = {
    btnCreate: document.getElementById('btn-create'),
    btnJoin: document.getElementById('btn-join'),
    inputCode: document.getElementById('input-code'),
    homeError: document.getElementById('home-error'),
    lobbyCode: document.getElementById('lobby-code'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    shipDock: document.getElementById('ship-dock'),
    placementGrid: document.getElementById('placement-grid'),
    btnClear: document.getElementById('btn-clear'),
    btnRandom: document.getElementById('btn-random'),
    btnReady: document.getElementById('btn-ready'),
    placementStatus: document.getElementById('placement-status'),
    targetGrid: document.getElementById('target-grid'),
    oceanGrid: document.getElementById('ocean-grid'),
    turnIndicator: document.getElementById('turn-indicator'),
    statShips: document.getElementById('stat-ships-left'),
    statEnemy: document.getElementById('stat-enemy-ships'),
    battleLog: document.getElementById('battle-log'),
    gridTabs: document.getElementById('grid-tabs'),
    targetSection: document.getElementById('target-section'),
    oceanSection: document.getElementById('ocean-section'),
    gameoverIcon: document.getElementById('gameover-icon'),
    gameoverTitle: document.getElementById('gameover-title'),
    gameoverSubtitle: document.getElementById('gameover-subtitle'),
    btnRematch: document.getElementById('btn-rematch'),
    btnHome: document.getElementById('btn-home'),
    rematchStatus: document.getElementById('rematch-status'),
    toast: document.getElementById('toast'),
  };

  // ── Screen Navigation ───────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ── Toast ───────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3000);
  }

  // ── Grid Builder ────────────────────────────────────
  function buildGrid(container, onClick) {
    container.innerHTML = '';
    // Corner
    const corner = document.createElement('div');
    corner.className = 'grid-header';
    container.appendChild(corner);

    // Column headers
    for (let c = 0; c < 10; c++) {
      const h = document.createElement('div');
      h.className = 'grid-header';
      h.textContent = String.fromCharCode(65 + c);
      container.appendChild(h);
    }

    // Rows
    for (let r = 0; r < 10; r++) {
      // Row header
      const rh = document.createElement('div');
      rh.className = 'grid-header';
      rh.textContent = r + 1;
      container.appendChild(rh);

      for (let c = 0; c < 10; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        if (onClick) {
          cell.addEventListener('click', () => onClick(r, c, cell));
        }
        container.appendChild(cell);
      }
    }
  }

  function getCell(grid, row, col) {
    return grid.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  }

  // ── Ship Dock ───────────────────────────────────────
  let dragGhost = null;
  let dragShip = null;
  let isDragging = false;

  function buildShipDock() {
    els.shipDock.innerHTML = '';
    Game.SHIPS.forEach(ship => {
      const div = document.createElement('div');
      div.className = 'dock-ship';
      div.dataset.name = ship.name;
      div.dataset.size = ship.size;

      const svgDef = getShipSVG(ship.name);
      const svgW = Math.max(ship.size, 1) * 28;
      const svgH = 28;

      const svgContainer = document.createElement('div');
      svgContainer.className = 'dock-ship-svg';
      svgContainer.style.width = svgW + 'px';
      svgContainer.style.height = svgH + 'px';
      if (svgDef) svgContainer.innerHTML = svgDef.svg(svgW, svgH);
      div.appendChild(svgContainer);

      const label = document.createElement('span');
      label.className = 'ship-name';
      label.textContent = `${getShipLabel(ship.name)} (${ship.size})`;
      div.appendChild(label);

      // Click to select (tap on mobile as fallback)
      div.addEventListener('click', (e) => {
        if (isDragging) return;
        selectShipFromDock(ship, div);
      });

      // Drag start (mouse)
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(ship, div, e.clientX, e.clientY);
      });

      // Drag start (touch)
      div.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrag(ship, div, touch.clientX, touch.clientY);
      }, { passive: true });

      els.shipDock.appendChild(div);
    });
  }

  function startDrag(ship, dockEl, startX, startY) {
    // Select the ship
    els.shipDock.querySelectorAll('.dock-ship').forEach(d => d.classList.remove('selected'));
    dockEl.classList.remove('placed');
    dockEl.classList.add('selected');
    Game.removeShip(ship.name);
    refreshPlacementGrid();
    Game.selectedShip = ship;
    if (!Game.selectedOrientation) Game.selectedOrientation = 'horizontal';
    updateReadyButton();

    isDragging = false;

    // Create ghost
    const svgDef = getShipSVG(ship.name);
    const cellSize = getCell(els.placementGrid, 0, 0)?.offsetWidth || 36;
    const isH = Game.selectedOrientation === 'horizontal';
    const gW = isH ? ship.size * cellSize : cellSize;
    const gH = isH ? cellSize : ship.size * cellSize;

    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';
    dragGhost.style.width = gW + 'px';
    dragGhost.style.height = gH + 'px';
    dragGhost.style.left = (startX - gW / 2) + 'px';
    dragGhost.style.top = (startY - gH / 2) + 'px';
    if (svgDef) dragGhost.innerHTML = svgDef.svg(gW, gH);
    document.body.appendChild(dragGhost);

    dragShip = ship;

    const onMove = (cx, cy) => {
      isDragging = true;
      dragGhost.style.left = (cx - gW / 2) + 'px';
      dragGhost.style.top = (cy - gH / 2) + 'px';

      // Show preview on grid
      const cellUnder = getCellFromPoint(cx, cy);
      if (cellUnder) {
        handlePlacementHover(+cellUnder.dataset.row, +cellUnder.dataset.col);
      } else {
        clearPreview();
      }
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    };

    const onEnd = (cx, cy) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);

      if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
      }
      clearPreview();

      if (!isDragging) {
        // It was just a click, not a drag — selection already done
        isDragging = false;
        return;
      }

      isDragging = false;

      // Try to place at the cell under cursor
      const cellUnder = getCellFromPoint(cx, cy);
      if (cellUnder) {
        const row = +cellUnder.dataset.row;
        const col = +cellUnder.dataset.col;
        placeSelectedShip(row, col);
      }
    };

    const onMouseUp = (e) => onEnd(e.clientX, e.clientY);
    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      onEnd(t.clientX, t.clientY);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
  }

  function getCellFromPoint(x, y) {
    const elements = document.elementsFromPoint(x, y);
    return elements.find(el => el.classList.contains('grid-cell') && el.closest('#placement-grid')) || null;
  }

  function selectShipFromDock(ship, el) {
    // If already selected, toggle orientation
    if (Game.selectedShip && Game.selectedShip.name === ship.name) {
      Game.selectedOrientation = Game.selectedOrientation === 'horizontal' ? 'vertical' : 'horizontal';
      showToast(`${getShipLabel(ship.name)}: ${Game.selectedOrientation}`);
      return;
    }

    els.shipDock.querySelectorAll('.dock-ship').forEach(d => d.classList.remove('selected'));
    el.classList.remove('placed');
    el.classList.add('selected');

    Game.removeShip(ship.name);
    refreshPlacementGrid();

    Game.selectedShip = ship;
    Game.selectedOrientation = 'horizontal';
    updateReadyButton();
  }

  function placeSelectedShip(row, col) {
    if (!Game.selectedShip) return false;

    const placed = Game.placeShip(
      Game.selectedShip.name,
      Game.selectedShip.size,
      row, col,
      Game.selectedOrientation
    );

    if (placed) {
      SoundManager.playPlace();
      const dockEl = els.shipDock.querySelector(`[data-name="${Game.selectedShip.name}"]`);
      if (dockEl) {
        dockEl.classList.remove('selected');
        dockEl.classList.add('placed');
      }
      Game.selectedShip = null;
      refreshPlacementGrid();
      updateReadyButton();
      // Re-apply ocean to new empty cells
      requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
      return true;
    } else {
      showToast('Invalid placement');
      return false;
    }
  }

  // ── Placement Grid ──────────────────────────────────
  let previewCells = [];

  function handlePlacementClick(row, col) {
    if (!Game.selectedShip) {
      // Click a placed ship to rotate it in-place
      const existing = Game.getShipAt(row, col);
      if (existing) {
        if (existing.size === 1) {
          showToast('Patrol boats don\'t need rotation');
          return;
        }
        const rotated = Game.rotateShipAt(row, col);
        if (rotated) {
          SoundManager.playPlace();
          refreshPlacementGrid();
          requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
          showToast(`${getShipLabel(existing.name)} rotated`);
        } else {
          showToast('Can\'t rotate — not enough space');
        }
        return;
      }
      return;
    }

    placeSelectedShip(row, col);
  }

  function handlePlacementHover(row, col) {
    clearPreview();
    if (!Game.selectedShip) return;

    const cells = Game.canPlace(
      Game.selectedShip.size, row, col,
      Game.selectedOrientation,
      Game.selectedShip.name
    );

    if (cells) {
      cells.forEach(({ r, c }) => {
        const cell = getCell(els.placementGrid, r, c);
        if (cell) {
          cell.classList.add('preview-valid');
          previewCells.push(cell);
        }
      });
    } else {
      for (let i = 0; i < Game.selectedShip.size; i++) {
        const r = Game.selectedOrientation === 'horizontal' ? row : row + i;
        const c = Game.selectedOrientation === 'horizontal' ? col + i : col;
        if (r >= 0 && r < 10 && c >= 0 && c < 10) {
          const cell = getCell(els.placementGrid, r, c);
          if (cell) {
            cell.classList.add('preview-invalid');
            previewCells.push(cell);
          }
        }
      }
    }
  }

  function clearPreview() {
    previewCells.forEach(c => {
      c.classList.remove('preview-valid', 'preview-invalid');
    });
    previewCells = [];
  }

  function refreshPlacementGrid() {
    // Clear all ship classes
    els.placementGrid.querySelectorAll('.grid-cell').forEach(cell => {
      cell.className = 'grid-cell';
    });
    // Remove old overlays
    els.placementGrid.querySelectorAll('.ship-overlay').forEach(o => o.remove());

    // Redraw placed ships
    for (const ship of Game.getPlacedShips()) {
      // Mark cells as occupied (for hit detection / coloring)
      for (let i = 0; i < ship.size; i++) {
        const r = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        const cell = getCell(els.placementGrid, r, c);
        if (cell) cell.classList.add('ship');
      }
      // Add SVG overlay
      addShipOverlay(els.placementGrid, ship);
    }
  }

  function addShipOverlay(grid, ship) {
    const firstCell = getCell(grid, ship.row, ship.col);
    if (!firstCell) return;

    const gridRect = grid.getBoundingClientRect();
    const cellRect = firstCell.getBoundingClientRect();
    const cellSize = cellRect.width;
    const gap = 1; // grid gap

    const isH = ship.orientation === 'horizontal';
    const spanW = isH ? ship.size * (cellSize + gap) - gap : cellSize;
    const spanH = isH ? cellSize : ship.size * (cellSize + gap) - gap;

    const overlay = document.createElement('div');
    overlay.className = 'ship-overlay';
    overlay.dataset.shipName = ship.name;
    overlay.style.position = 'absolute';
    overlay.style.left = (cellRect.left - gridRect.left) + 'px';
    overlay.style.top = (cellRect.top - gridRect.top) + 'px';
    overlay.style.width = spanW + 'px';
    overlay.style.height = spanH + 'px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '5';

    const svgDef = getShipSVG(ship.name);
    if (svgDef) {
      overlay.innerHTML = svgDef.svg(spanW, spanH);
    }

    grid.appendChild(overlay);
  }

  function updateReadyButton() {
    els.btnReady.disabled = !Game.allShipsPlaced();
  }

  function setPlacementStatus(msg) {
    els.placementStatus.textContent = msg;
  }

  // ── Battle Grid ─────────────────────────────────────
  function handleTargetClick(row, col) {
    if (!Game.isMyTurn) {
      showToast('Wait for your turn');
      return;
    }

    if (Game.targetBoard[row][col]) {
      showToast('Already fired there');
      return;
    }

    SoundManager.playFire();

    SocketHandler.fire(row, col, (response) => {
      if (!response.success) {
        showToast(response.error);
        return;
      }

      Game.targetBoard[row][col] = response.result;
      const cell = getCell(els.targetGrid, row, col);

      if (response.result === 'hit') {
        cell.classList.add('hit');
        SoundManager.playHit();
        addLog(`HIT at ${SocketHandler.coordLabel(row, col)}!`, 'hit-log');

        if (response.sunkShip) {
          Game.enemyShipsAlive--;
          updateStats();
          SoundManager.playSunk();
          addLog(`You sunk their ${response.sunkShip.name}!`, 'sunk-log');
          showToast(`You sunk their ${response.sunkShip.name}!`);
          // Mark all cells of the sunk ship
          markSunkShipOnTarget(response.sunkShip);
        }
      } else {
        cell.classList.add('miss');
        SoundManager.playMiss();
        addLog(`Miss at ${SocketHandler.coordLabel(row, col)}.`, 'miss-log');
      }
    });
  }

  function markSunkShipOnTarget(ship) {
    for (let i = 0; i < ship.size; i++) {
      const r = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
      const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
      const cell = getCell(els.targetGrid, r, c);
      if (cell) {
        cell.classList.remove('hit');
        cell.classList.add('sunk');
      }
      Game.targetBoard[r][c] = 'sunk';
    }
  }

  function markOceanCell(row, col, result) {
    const cell = getCell(els.oceanGrid, row, col);
    if (!cell) return;
    if (result === 'hit') {
      cell.classList.add('hit-own');
    } else {
      cell.classList.add('miss');
    }
  }

  function buildOceanBattleGrid() {
    buildGrid(els.oceanGrid, null);
    // Paint my ships with SVG overlays
    for (const ship of Game.getPlacedShips()) {
      for (let i = 0; i < ship.size; i++) {
        const r = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        const cell = getCell(els.oceanGrid, r, c);
        if (cell) cell.classList.add('ship');
      }
      addShipOverlay(els.oceanGrid, ship);
    }
  }

  // ── Turn & Stats ────────────────────────────────────
  function updateTurnIndicator(myTurn) {
    if (myTurn) {
      els.turnIndicator.textContent = 'YOUR TURN — FIRE!';
      els.turnIndicator.className = 'turn-indicator my-turn';
    } else {
      els.turnIndicator.textContent = 'ENEMY\'S TURN…';
      els.turnIndicator.className = 'turn-indicator waiting';
    }
  }

  function updateStats() {
    els.statShips.textContent = `Ships: ${Game.myShipsAlive}`;
    els.statEnemy.textContent = `Enemy: ${Game.enemyShipsAlive}`;
  }

  // ── Battle Log ──────────────────────────────────────
  function addLog(msg, cls) {
    const div = document.createElement('div');
    div.className = `log-entry ${cls || ''}`;
    div.textContent = `> ${msg}`;
    els.battleLog.appendChild(div);
    els.battleLog.scrollTop = els.battleLog.scrollHeight;
  }

  // ── Screen Transitions ──────────────────────────────
  function goToLobby(code) {
    SocketHandler.roomCode = code;
    els.lobbyCode.textContent = code;
    showScreen('lobby');
  }

  function goToFaction() {
    // Build mini previews for each faction card
    ['pirate', 'navy'].forEach(faction => {
      const container = document.getElementById(`preview-${faction}`);
      if (!container) return;
      container.innerHTML = '';
      const ships = ShipFactions[faction].ships;
      for (const key of ['Carrier', 'Destroyer', 'Patrol']) {
        const def = ships[key];
        if (!def) continue;
        const w = key === 'Patrol' ? 24 : key === 'Carrier' ? 60 : 36;
        const h = 22;
        const el = document.createElement('div');
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.innerHTML = def.svg(w, h);
        container.appendChild(el);
      }
    });
    showScreen('faction');
  }

  function goToPlacement() {
    Game.reset();
    buildGrid(els.placementGrid, handlePlacementClick);
    // Add hover listeners
    els.placementGrid.querySelectorAll('.grid-cell').forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        handlePlacementHover(+cell.dataset.row, +cell.dataset.col);
      });
      cell.addEventListener('mouseleave', clearPreview);
    });
    buildShipDock();
    updateReadyButton();
    setPlacementStatus('');
    showScreen('placement');
    // Paint the ocean after the grid is visible
    requestAnimationFrame(() => {
      Ocean.applyToGrid(els.placementGrid);
      Ocean.startAnimation(els.placementGrid);
    });
  }

  function goToBattle(myTurn) {
    buildGrid(els.targetGrid, handleTargetClick);
    buildOceanBattleGrid();
    Game.myShipsAlive = 10;
    Game.enemyShipsAlive = 10;
    updateStats();
    updateTurnIndicator(myTurn);
    els.battleLog.innerHTML = '<div class="log-entry system">Battle stations! Awaiting orders, Commander.</div>';

    // Reset mobile tabs
    els.targetSection.classList.remove('hidden');
    els.oceanSection.classList.remove('active');
    const tabs = els.gridTabs.querySelectorAll('.tab');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');

    showScreen('battle');
    // Paint ocean on both battle grids
    requestAnimationFrame(() => {
      Ocean.applyToGrid(els.targetGrid);
      Ocean.applyToGrid(els.oceanGrid);
      Ocean.startAnimation(els.targetGrid);
    });
  }

  function goToGameOver(won) {
    Ocean.stopAnimation();
    els.gameoverIcon.textContent = won ? '🏆' : '💀';
    els.gameoverTitle.textContent = won ? 'VICTORY!' : 'DEFEAT';
    els.gameoverTitle.className = won ? 'win' : 'lose';
    els.gameoverSubtitle.textContent = won
      ? 'All enemy ships destroyed. Well played, Commander!'
      : 'Your fleet has been destroyed. Better luck next time.';
    els.rematchStatus.textContent = '';
    showScreen('gameover');
  }

  function showRematchStatus(msg) {
    els.rematchStatus.textContent = msg;
  }

  // ── Event Bindings ──────────────────────────────────
  function init() {
    SocketHandler.connect();

    // Home: Create
    els.btnCreate.addEventListener('click', () => {
      els.homeError.textContent = '';
      SocketHandler.createRoom((res) => {
        if (res.success) {
          SocketHandler.roomCode = res.code;
          SocketHandler.playerIndex = res.playerIndex;
          goToLobby(res.code);
        } else {
          els.homeError.textContent = 'Failed to create room.';
        }
      });
    });

    // Home: Join
    els.btnJoin.addEventListener('click', () => {
      const code = els.inputCode.value.trim().toUpperCase();
      if (code.length !== 4) {
        els.homeError.textContent = 'Enter a 4-character room code.';
        return;
      }
      els.homeError.textContent = '';
      SocketHandler.joinRoom(code, (res) => {
        if (res.success) {
          SocketHandler.roomCode = res.code;
          SocketHandler.playerIndex = res.playerIndex;
          goToFaction();
        } else {
          els.homeError.textContent = res.error;
        }
      });
    });

    // Allow Enter key to join
    els.inputCode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') els.btnJoin.click();
    });

    // Faction select
    document.querySelectorAll('.faction-card').forEach(card => {
      card.addEventListener('click', () => {
        const faction = card.dataset.faction;
        setFaction(faction);
        showToast(`${ShipFactions[faction].icon} ${ShipFactions[faction].name} fleet selected!`);
        goToPlacement();
      });
    });

    // Lobby: Copy code
    els.btnCopyCode.addEventListener('click', () => {
      navigator.clipboard.writeText(els.lobbyCode.textContent).then(() => {
        showToast('Code copied!');
      }).catch(() => {
        showToast('Copy failed — select manually');
      });
    });

    // Placement: Clear
    els.btnClear.addEventListener('click', () => {
      Game.clearAllShips();
      Game.selectedShip = null;
      refreshPlacementGrid();
      buildShipDock();
      updateReadyButton();
    });

    // Placement: Random
    els.btnRandom.addEventListener('click', () => {
      Game.randomPlacement();
      Game.selectedShip = null;
      refreshPlacementGrid();
      // Mark all dock ships as placed
      els.shipDock.querySelectorAll('.dock-ship').forEach(d => {
        d.classList.remove('selected');
        d.classList.add('placed');
      });
      updateReadyButton();
    });

    // Placement: Ready
    els.btnReady.addEventListener('click', () => {
      if (!Game.allShipsPlaced()) return;
      els.btnReady.disabled = true;
      setPlacementStatus('Locking in positions…');

      SocketHandler.sendShips(Game.getPlacedShips(), (res) => {
        if (res && res.success && res.waiting) {
          setPlacementStatus('Waiting for opponent to finish placement…');
        } else if (res && !res.success) {
          setPlacementStatus(res.error);
          els.btnReady.disabled = false;
        }
      });
    });

    // Battle: Mobile tab toggle
    els.gridTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const which = tab.dataset.tab;
      els.gridTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (which === 'target') {
        els.targetSection.classList.remove('hidden');
        els.oceanSection.classList.remove('active');
      } else {
        els.targetSection.classList.add('hidden');
        els.oceanSection.classList.add('active');
      }
    });

    // Game Over: Rematch
    els.btnRematch.addEventListener('click', () => {
      SocketHandler.requestRematch();
      SocketHandler.acceptRematch();
      showRematchStatus('Requesting rematch…');
    });

    // Game Over: Home
    els.btnHome.addEventListener('click', () => {
      window.location.reload();
    });
  }

  return {
    init,
    showToast,
    goToLobby,
    goToFaction,
    goToPlacement,
    goToBattle,
    goToGameOver,
    markOceanCell,
    updateTurnIndicator,
    updateStats,
    addLog,
    setPlacementStatus,
    showRematchStatus,
  };
})();

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', UI.init);
