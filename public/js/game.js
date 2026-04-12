// ── Game State & Logic ────────────────────────────────────

const SHIPS = [
  { name: 'Carrier',    size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser',    size: 3 },
  { name: 'Submarine',  size: 3 },
  { name: 'Destroyer',  size: 2 },
  { name: 'Patrol 1',   size: 1 },
  { name: 'Patrol 2',   size: 1 },
  { name: 'Patrol 3',   size: 1 },
  { name: 'Patrol 4',   size: 1 },
  { name: 'Patrol 5',   size: 1 },
];

const Game = (() => {
  let myBoard = createEmptyBoard();
  let placedShips = [];         // { name, size, row, col, orientation }
  let selectedShip = null;      // reference to SHIPS entry being placed
  let selectedOrientation = 'horizontal';
  let isMyTurn = false;
  let myShipsAlive = 5;
  let enemyShipsAlive = 5;
  let targetBoard = createEmptyBoard();  // tracks our shots: 'hit', 'miss', 'sunk'

  function createEmptyBoard() {
    return Array.from({ length: 10 }, () => Array(10).fill(null));
  }

  function reset() {
    myBoard = createEmptyBoard();
    placedShips = [];
    selectedShip = null;
    selectedOrientation = 'horizontal';
    isMyTurn = false;
    myShipsAlive = 10;
    enemyShipsAlive = 10;
    targetBoard = createEmptyBoard();
  }

  function canPlace(shipSize, row, col, orientation, excludeName) {
    const cells = [];
    for (let i = 0; i < shipSize; i++) {
      const r = orientation === 'horizontal' ? row : row + i;
      const c = orientation === 'horizontal' ? col + i : col;
      if (r < 0 || r >= 10 || c < 0 || c >= 10) return null;

      const existing = myBoard[r][c];
      if (existing !== null && existing !== excludeName) return null;
      cells.push({ r, c });
    }
    return cells;
  }

  function placeShip(name, size, row, col, orientation) {
    // Remove if already placed
    removeShip(name);

    const cells = canPlace(size, row, col, orientation);
    if (!cells) return false;

    for (const { r, c } of cells) {
      myBoard[r][c] = name;
    }
    placedShips.push({ name, size, row, col, orientation });
    return true;
  }

  function removeShip(name) {
    const idx = placedShips.findIndex(s => s.name === name);
    if (idx === -1) return;
    const ship = placedShips[idx];
    for (let i = 0; i < ship.size; i++) {
      const r = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
      const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
      if (myBoard[r][c] === name) myBoard[r][c] = null;
    }
    placedShips.splice(idx, 1);
  }

  function clearAllShips() {
    myBoard = createEmptyBoard();
    placedShips = [];
  }

  function randomPlacement() {
    clearAllShips();
    for (const ship of SHIPS) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 200) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        placed = placeShip(ship.name, ship.size, row, col, orientation);
        attempts++;
      }
    }
  }

  function allShipsPlaced() {
    return placedShips.length === SHIPS.length;
  }

  function getPlacedShips() {
    return [...placedShips];
  }

  function getShipAt(row, col) {
    const name = myBoard[row]?.[col];
    if (!name) return null;
    return placedShips.find(s => s.name === name) || null;
  }

  // Rotate a placed ship in-place (around its origin cell)
  function rotateShipAt(row, col) {
    const ship = getShipAt(row, col);
    if (!ship) return false;
    if (ship.size === 1) return false; // no point rotating 1-tile ships

    const newOrientation = ship.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    // Remove the ship temporarily
    removeShip(ship.name);

    // Try placing at same origin with new orientation
    const cells = canPlace(ship.size, ship.row, ship.col, newOrientation);
    if (cells) {
      placeShip(ship.name, ship.size, ship.row, ship.col, newOrientation);
      return true;
    }

    // Failed — put it back
    placeShip(ship.name, ship.size, ship.row, ship.col, ship.orientation);
    return false;
  }

  return {
    get myBoard() { return myBoard; },
    get targetBoard() { return targetBoard; },
    get selectedShip() { return selectedShip; },
    set selectedShip(v) { selectedShip = v; },
    get selectedOrientation() { return selectedOrientation; },
    set selectedOrientation(v) { selectedOrientation = v; },
    get isMyTurn() { return isMyTurn; },
    set isMyTurn(v) { isMyTurn = v; },
    get myShipsAlive() { return myShipsAlive; },
    set myShipsAlive(v) { myShipsAlive = v; },
    get enemyShipsAlive() { return enemyShipsAlive; },
    set enemyShipsAlive(v) { enemyShipsAlive = v; },

    SHIPS,
    createEmptyBoard,
    reset,
    canPlace,
    placeShip,
    removeShip,
    clearAllShips,
    randomPlacement,
    allShipsPlaced,
    getPlacedShips,
    getShipAt,
    rotateShipAt,
  };
})();
