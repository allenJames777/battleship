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
    targetSection: document.getElementById('target-section'),
    oceanSection: document.getElementById('ocean-section'),
    gameoverIcon: document.getElementById('gameover-icon'),
    gameoverTitle: document.getElementById('gameover-title'),
    gameoverSubtitle: document.getElementById('gameover-subtitle'),
    btnRematch: document.getElementById('btn-rematch'),
    btnHome: document.getElementById('btn-home'),
    rematchStatus: document.getElementById('rematch-status'),
    toast: document.getElementById('toast'),
    // New feature elements
    inputName: document.getElementById('input-name'),
    selectTimer: document.getElementById('select-timer'),
    btnHowToPlay: document.getElementById('btn-how-to-play'),
    modalRules: document.getElementById('modal-rules'),
    btnCloseRules: document.getElementById('btn-close-rules'),
    scoreboard: document.getElementById('scoreboard'),
    scoreMyName: document.getElementById('score-my-name'),
    scoreOppName: document.getElementById('score-opp-name'),
    scoreMyWins: document.getElementById('score-my-wins'),
    scoreOppWins: document.getElementById('score-opp-wins'),
    timerBarContainer: document.getElementById('timer-bar-container'),
    timerBar: document.getElementById('timer-bar'),
    timerText: document.getElementById('timer-text'),
    chatPanel: document.getElementById('chat-panel'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    btnChatSend: document.getElementById('btn-chat-send'),
    btnChatToggle: document.getElementById('btn-chat-toggle'),
    btnChatClose: document.getElementById('btn-chat-close'),
    gameoverScore: document.getElementById('gameover-score'),
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
      const unit = 20;
      const svgW = Math.max(ship.size, 1) * unit;
      const svgH = unit;

      const svgContainer = document.createElement('div');
      svgContainer.className = 'dock-ship-svg';
      svgContainer.style.width = svgW + 'px';
      svgContainer.style.height = svgH + 'px';
      if (svgDef) {
        const dockUid = Math.random().toString(36).substring(2, 6);
        svgContainer.innerHTML = makeIdsUnique(svgDef.svg(svgW, svgH), dockUid);
      }
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
    const cellSize = getCellSize();
    const isH = Game.selectedOrientation === 'horizontal';
    const gW = isH ? ship.size * cellSize : cellSize;
    const gH = isH ? cellSize : ship.size * cellSize;

    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';
    dragGhost.style.width = gW + 'px';
    dragGhost.style.height = gH + 'px';
    dragGhost.style.left = (startX - gW / 2) + 'px';
    dragGhost.style.top = (startY - gH / 2) + 'px';
    if (svgDef) {
      const ghostUid = Math.random().toString(36).substring(2, 6);
      dragGhost.innerHTML = makeIdsUnique(svgDef.svg(gW, gH), ghostUid);
    }
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
      // Click a placed ship to pick it up for repositioning
      const existing = Game.getShipAt(row, col);
      if (existing) {
        // Pick it up — put it back in the dock for re-placement
        const shipDef = Game.SHIPS.find(s => s.name === existing.name);
        Game.selectedOrientation = existing.orientation;
        Game.removeShip(existing.name);
        Game.selectedShip = shipDef;

        // Update dock visuals
        const dockEl = els.shipDock.querySelector(`[data-name="${existing.name}"]`);
        if (dockEl) {
          dockEl.classList.remove('placed');
          dockEl.classList.add('selected');
        }

        refreshPlacementGrid();
        requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
        updateReadyButton();
        showToast(`${getShipLabel(existing.name)} picked up — click to rotate, click grid to place`);
        return;
      }
      return;
    }

    // If clicking on the same spot, try to rotate instead
    const existingAtTarget = Game.getShipAt(row, col);
    if (existingAtTarget && existingAtTarget.name === Game.selectedShip.name) {
      // This shouldn't happen since we removed it, but just in case
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
    // Remove old overlays from the overlay container
    const oc = els.placementGrid.parentElement.querySelector('.overlay-container');
    if (oc) oc.innerHTML = '';

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

  // ── Ship Overlay System ──────────────────────────────
  // Overlays are absolutely positioned inside a wrapper div
  // that sits on top of the grid. Position is calculated from
  // actual rendered cell positions — always accurate.

  function addShipOverlay(grid, ship) {
    // Get or create the overlay container for this grid
    let container = grid.parentElement.querySelector('.overlay-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'overlay-container';
      grid.parentElement.style.position = 'relative';
      grid.parentElement.appendChild(container);
    }

    const overlay = document.createElement('div');
    overlay.className = 'ship-overlay';
    overlay.dataset.shipName = ship.name;
    overlay.dataset.shipSize = ship.size;
    overlay.dataset.shipRow = ship.row;
    overlay.dataset.shipCol = ship.col;
    overlay.dataset.shipOrientation = ship.orientation;
    overlay.dataset.gridId = grid.id;
    container.appendChild(overlay);

    positionOverlay(overlay, grid);
  }

  function positionOverlay(overlay, grid) {
    const row = +overlay.dataset.shipRow;
    const col = +overlay.dataset.shipCol;
    const size = +overlay.dataset.shipSize;
    const isH = overlay.dataset.shipOrientation === 'horizontal';
    const name = overlay.dataset.shipName;

    if (!grid) grid = document.getElementById(overlay.dataset.gridId);
    if (!grid) return;

    const firstCell = getCell(grid, row, col);
    if (!firstCell) return;

    // Get last cell of the ship
    const lastR = isH ? row : row + size - 1;
    const lastC = isH ? col + size - 1 : col;
    const lastCell = getCell(grid, lastR, lastC);
    if (!lastCell) return;

    const gridParent = grid.parentElement;
    const parentRect = gridParent.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    const x = firstRect.left - parentRect.left;
    const y = firstRect.top - parentRect.top;
    const w = lastRect.right - firstRect.left;
    const h = lastRect.bottom - firstRect.top;

    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
    overlay.style.width = w + 'px';
    overlay.style.height = h + 'px';

    // SVG templates draw ships horizontally (bow right, stern left).
    // For vertical ships: render SVG in a horizontal inner div, then rotate the whole thing.
    // IMPORTANT: Make gradient IDs unique to avoid SVG ID collisions across multiple grids.
    const svgDef = getShipSVG(name);
    if (svgDef) {
      const uid = Math.random().toString(36).substring(2, 6);
      let svgHtml;

      if (isH || size === 1) {
        svgHtml = svgDef.svg(w, h);
        // Make gradient/filter IDs unique
        svgHtml = makeIdsUnique(svgHtml, uid);
        overlay.innerHTML = svgHtml;
        overlay.style.transform = '';
        overlay.style.transformOrigin = '';
      } else {
        svgHtml = svgDef.svg(h, w);
        svgHtml = makeIdsUnique(svgHtml, uid);
        const inner = document.createElement('div');
        inner.style.width = h + 'px';
        inner.style.height = w + 'px';
        inner.style.position = 'absolute';
        inner.style.top = ((h - w) / 2) + 'px';
        inner.style.left = (-(h - w) / 2) + 'px';
        inner.style.transform = 'rotate(90deg)';
        inner.innerHTML = svgHtml;
        overlay.innerHTML = '';
        overlay.appendChild(inner);
        overlay.style.transform = '';
        overlay.style.transformOrigin = '';
      }
    }
  }

  // Make SVG gradient/filter IDs unique to prevent cross-SVG collisions
  function makeIdsUnique(svgStr, uid) {
    // Find all id="xxx" definitions and url(#xxx) references, append uid
    const idRegex = /id="([^"]+)"/g;
    const ids = new Set();
    let match;
    while ((match = idRegex.exec(svgStr)) !== null) {
      ids.add(match[1]);
    }
    for (const id of ids) {
      const newId = id + '_' + uid;
      svgStr = svgStr.split(`id="${id}"`).join(`id="${newId}"`);
      svgStr = svgStr.split(`url(#${id})`).join(`url(#${newId})`);
    }
    return svgStr;
  }

  // Reposition all overlays (called on resize and view toggle)
  function repositionAllOverlays() {
    document.querySelectorAll('.ship-overlay').forEach(overlay => {
      positionOverlay(overlay, null);
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(repositionAllOverlays, 100);
  });

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
    // Clear any old overlay container
    const oc = els.oceanGrid.parentElement.querySelector('.overlay-container');
    if (oc) oc.innerHTML = '';
    for (const ship of Game.getPlacedShips()) {
      for (let i = 0; i < ship.size; i++) {
        const r = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        const cell = getCell(els.oceanGrid, r, c);
        if (cell) cell.classList.add('ship');
      }
      // Don't add overlays yet — ocean grid starts hidden.
      // They'll be added when user clicks "My Fleet".
    }
  }

  // ── Turn & Stats ────────────────────────────────────
  function updateTurnIndicator(myTurn) {
    if (myTurn) {
      els.turnIndicator.textContent = 'YOUR TURN — FIRE!';
      els.turnIndicator.className = 'turn-indicator my-turn';
      els.targetSection.classList.remove('locked');
    } else {
      els.turnIndicator.textContent = 'ENEMY\'S TURN…';
      els.turnIndicator.className = 'turn-indicator waiting';
      els.targetSection.classList.add('locked');
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
    // Add hover + right-click listeners
    els.placementGrid.querySelectorAll('.grid-cell').forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        handlePlacementHover(+cell.dataset.row, +cell.dataset.col);
      });
      cell.addEventListener('mouseleave', clearPreview);
      // Drag placed ships from the grid to reposition
      cell.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // left click only
        const row = +cell.dataset.row;
        const col = +cell.dataset.col;
        const existing = Game.getShipAt(row, col);
        if (existing && !Game.selectedShip) {
          e.preventDefault();
          e.stopPropagation();
          const shipDef = Game.SHIPS.find(s => s.name === existing.name);
          Game.selectedOrientation = existing.orientation;
          Game.removeShip(existing.name);
          refreshPlacementGrid();
          requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
          updateReadyButton();
          // Start drag with this ship
          const dockEl = els.shipDock.querySelector(`[data-name="${existing.name}"]`);
          if (dockEl) {
            dockEl.classList.remove('placed');
            dockEl.classList.add('selected');
          }
          startDrag(shipDef, dockEl, e.clientX, e.clientY);
        }
      });
      cell.addEventListener('touchstart', (e) => {
        const row = +cell.dataset.row;
        const col = +cell.dataset.col;
        const existing = Game.getShipAt(row, col);
        if (existing && !Game.selectedShip) {
          const touch = e.touches[0];
          const shipDef = Game.SHIPS.find(s => s.name === existing.name);
          Game.selectedOrientation = existing.orientation;
          Game.removeShip(existing.name);
          refreshPlacementGrid();
          requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
          updateReadyButton();
          const dockEl = els.shipDock.querySelector(`[data-name="${existing.name}"]`);
          if (dockEl) {
            dockEl.classList.remove('placed');
            dockEl.classList.add('selected');
          }
          startDrag(shipDef, dockEl, touch.clientX, touch.clientY);
        }
      }, { passive: true });
      // Right-click to rotate placed ship in-place
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const row = +cell.dataset.row;
        const col = +cell.dataset.col;
        const existing = Game.getShipAt(row, col);
        if (existing && existing.size > 1) {
          const rotated = Game.rotateShipAt(row, col);
          if (rotated) {
            SoundManager.playPlace();
            refreshPlacementGrid();
            requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
            showToast(`${getShipLabel(existing.name)} rotated`);
          } else {
            showToast('Can\'t rotate — not enough space');
          }
        }
      });
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
    Ocean.stopAnimation();
    buildGrid(els.targetGrid, handleTargetClick);
    buildOceanBattleGrid();
    Game.myShipsAlive = 10;
    Game.enemyShipsAlive = 10;
    updateStats();
    updateTurnIndicator(myTurn);
    els.battleLog.innerHTML = '<div class="log-entry system">Battle stations! Awaiting orders, Commander.</div>';

    // Show target grid by default (Enemy Waters)
    els.targetSection.classList.add('active-view');
    els.oceanSection.classList.remove('active-view');
    document.getElementById('btn-view-target').classList.add('active');
    document.getElementById('btn-view-ocean').classList.remove('active');

    showScreen('battle');
    requestAnimationFrame(() => {
      Ocean.applyToGrid(els.targetGrid);
      Ocean.startAnimation(els.targetGrid);

      // Ocean grid overlays will be added when "My Fleet" is first clicked
      // (grid must be visible for accurate positioning)
      els._oceanOverlaysAdded = false;
    });
  }

  function goToGameOver(won, myName, oppName, myWins, oppWins, reason) {
    Ocean.stopAnimation();
    clearTimerInterval();
    els.gameoverIcon.textContent = won ? '🏆' : '💀';
    els.gameoverTitle.textContent = won ? 'VICTORY!' : 'DEFEAT';
    els.gameoverTitle.className = won ? 'win' : 'lose';

    let subtitle;
    if (reason) {
      subtitle = reason;
    } else if (won) {
      subtitle = 'All enemy ships destroyed. Well played, Commander!';
    } else {
      subtitle = 'Your fleet has been destroyed. Better luck next time.';
    }
    els.gameoverSubtitle.textContent = subtitle;

    if (myName && oppName) {
      els.gameoverScore.textContent = `${myName}: ${myWins} — ${oppWins}: ${oppName}`;
    }
    els.rematchStatus.textContent = '';
    els.btnRematch.disabled = false;
    els.chatPanel.classList.remove('open');
    showScreen('gameover');
  }

  function showRematchStatus(msg) {
    els.rematchStatus.textContent = msg;
  }

  // ── Scoreboard ──────────────────────────────────────
  function updateScoreboard(myName, oppName, myWins, oppWins) {
    els.scoreMyName.textContent = myName;
    els.scoreOppName.textContent = oppName;
    els.scoreMyWins.textContent = myWins;
    els.scoreOppWins.textContent = oppWins;
  }

  // ── Timer ───────────────────────────────────────────
  let timerInterval = null;
  let timerTotalSeconds = 0;

  function initTimer(seconds) {
    timerTotalSeconds = seconds;
    els.timerBarContainer.style.display = seconds > 0 ? '' : 'none';
  }

  function startTimerBar(seconds) {
    clearTimerInterval();
    if (!seconds || seconds <= 0) return;
    els.timerBarContainer.style.display = '';

    let remaining = seconds;
    els.timerBar.style.width = '100%';
    els.timerBar.className = 'timer-bar';
    els.timerText.textContent = remaining;

    timerInterval = setInterval(() => {
      remaining--;
      if (remaining < 0) remaining = 0;
      const pct = (remaining / seconds) * 100;
      els.timerBar.style.width = pct + '%';
      els.timerText.textContent = remaining;

      if (pct <= 20) els.timerBar.className = 'timer-bar danger';
      else if (pct <= 50) els.timerBar.className = 'timer-bar warning';
      else els.timerBar.className = 'timer-bar';

      if (remaining <= 0) clearTimerInterval();
    }, 1000);
  }

  function clearTimerInterval() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ── Chat ────────────────────────────────────────────
  let chatUnread = 0;
  let chatPopupTimer = null;

  function addChatMessage(sender, text, isMine) {
    const div = document.createElement('div');
    div.className = `chat-msg ${isMine ? 'mine' : 'theirs'}`;
    div.innerHTML = `<span class="msg-sender">${sender}</span>${text}`;
    els.chatMessages.appendChild(div);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  }

  function showChatNotification() {
    // If chat panel is open, no notification needed
    if (els.chatPanel.classList.contains('open')) return;

    chatUnread++;
    updateChatBadge();

    // Show popup briefly
    const existing = document.querySelector('.chat-popup');
    if (existing) existing.remove();

    const lastMsg = els.chatMessages.lastElementChild;
    if (lastMsg) {
      const popup = document.createElement('div');
      popup.className = 'chat-popup';
      popup.innerHTML = lastMsg.innerHTML;
      document.body.appendChild(popup);
      clearTimeout(chatPopupTimer);
      chatPopupTimer = setTimeout(() => popup.remove(), 3000);
    }
  }

  function updateChatBadge() {
    let badge = els.btnChatToggle.querySelector('.chat-badge');
    if (chatUnread > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'chat-badge';
        els.btnChatToggle.appendChild(badge);
      }
      badge.textContent = chatUnread;
    } else if (badge) {
      badge.remove();
    }
  }

  // ── Event Bindings ──────────────────────────────────
  function init() {
    SocketHandler.connect();

    // How to Play
    els.btnHowToPlay.addEventListener('click', () => {
      els.modalRules.style.display = 'flex';
    });
    els.btnCloseRules.addEventListener('click', () => {
      els.modalRules.style.display = 'none';
    });
    els.modalRules.addEventListener('click', (e) => {
      if (e.target === els.modalRules) els.modalRules.style.display = 'none';
    });

    // Home: Create
    els.btnCreate.addEventListener('click', () => {
      els.homeError.textContent = '';
      const name = els.inputName.value.trim() || 'Player 1';
      const timer = parseInt(els.selectTimer.value) || 0;
      SocketHandler.createRoom(name, timer, (res) => {
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
      const name = els.inputName.value.trim() || 'Player 2';
      SocketHandler.joinRoom(code, name, (res) => {
        if (res.success) {
          SocketHandler.roomCode = res.code;
          SocketHandler.playerIndex = res.playerIndex;
          if (res.opponentName) SocketHandler.opponentName = res.opponentName;
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
      requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
    });

    // Placement: Random
    els.btnRandom.addEventListener('click', () => {
      Game.randomPlacement();
      Game.selectedShip = null;
      refreshPlacementGrid();
      els.shipDock.querySelectorAll('.dock-ship').forEach(d => {
        d.classList.remove('selected');
        d.classList.add('placed');
      });
      updateReadyButton();
      requestAnimationFrame(() => Ocean.applyToGrid(els.placementGrid));
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

    // Battle: View toggle (single grid with toggle button)
    const btnViewTarget = document.getElementById('btn-view-target');
    const btnViewOcean = document.getElementById('btn-view-ocean');

    btnViewTarget.addEventListener('click', () => {
      els.targetSection.classList.add('active-view');
      els.oceanSection.classList.remove('active-view');
      btnViewTarget.classList.add('active');
      btnViewOcean.classList.remove('active');
    });

    btnViewOcean.addEventListener('click', () => {
      els.oceanSection.classList.add('active-view');
      els.targetSection.classList.remove('active-view');
      btnViewOcean.classList.add('active');
      btnViewTarget.classList.remove('active');
      // Add overlays on first view (grid is now visible for positioning)
      requestAnimationFrame(() => {
        if (!els._oceanOverlaysAdded) {
          els._oceanOverlaysAdded = true;
          for (const ship of Game.getPlacedShips()) {
            addShipOverlay(els.oceanGrid, ship);
          }
          Ocean.applyToGrid(els.oceanGrid);
        } else {
          repositionAllOverlays();
        }
      });
    });

    // Game Over: Rematch (vote system — both must click)
    els.btnRematch.addEventListener('click', () => {
      SocketHandler.voteRematch();
      showRematchStatus('Waiting for opponent…');
      els.btnRematch.disabled = true;
    });

    // Game Over: Home
    els.btnHome.addEventListener('click', () => {
      window.location.reload();
    });

    // ── Chat ──────────────────────────────────────────
    els.btnChatToggle.addEventListener('click', () => {
      els.chatPanel.classList.toggle('open');
      if (els.chatPanel.classList.contains('open')) {
        chatUnread = 0;
        updateChatBadge();
        els.chatInput.focus();
        // Remove popup
        const popup = document.querySelector('.chat-popup');
        if (popup) popup.remove();
      }
    });

    els.btnChatClose.addEventListener('click', () => {
      els.chatPanel.classList.remove('open');
    });

    els.btnChatSend.addEventListener('click', () => {
      const msg = els.chatInput.value.trim();
      if (!msg) return;
      SocketHandler.sendChat(msg);
      els.chatInput.value = '';
    });

    els.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') els.btnChatSend.click();
    });

    // ── Surrender ─────────────────────────────────────
    const modalSurrender = document.getElementById('modal-surrender');
    document.getElementById('btn-surrender').addEventListener('click', () => {
      modalSurrender.style.display = 'flex';
    });
    document.getElementById('btn-surrender-yes').addEventListener('click', () => {
      modalSurrender.style.display = 'none';
      SocketHandler.surrender();
    });
    document.getElementById('btn-surrender-no').addEventListener('click', () => {
      modalSurrender.style.display = 'none';
    });
    modalSurrender.addEventListener('click', (e) => {
      if (e.target === modalSurrender) modalSurrender.style.display = 'none';
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
    updateScoreboard,
    initTimer,
    startTimerBar,
    addChatMessage,
    showChatNotification,
  };
})();

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', UI.init);
