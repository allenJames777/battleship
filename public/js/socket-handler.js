// ── Socket.io Handler ─────────────────────────────────────

const SocketHandler = (() => {
  let socket = null;
  let roomCode = null;
  let playerIndex = null;

  function connect() {
    socket = io();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('opponent-joined', () => {
      UI.showToast('Opponent joined!');
      UI.goToFaction();
    });

    socket.on('opponent-ready', () => {
      UI.showToast('Opponent is ready!');
      UI.setPlacementStatus('Opponent ready — place your ships!');
    });

    socket.on('game-start', ({ myTurn }) => {
      Game.isMyTurn = myTurn;
      UI.goToBattle(myTurn);
    });

    socket.on('turn-update', ({ myTurn }) => {
      Game.isMyTurn = myTurn;
      UI.updateTurnIndicator(myTurn);
    });

    socket.on('incoming-fire', ({ row, col, result, sunkShip }) => {
      UI.markOceanCell(row, col, result);
      if (result === 'hit') {
        SoundManager.playHit();
        UI.addLog(`Enemy hit your ship at ${coordLabel(row, col)}!`, 'hit-log');
        if (sunkShip) {
          Game.myShipsAlive--;
          UI.updateStats();
          SoundManager.playSunk();
          UI.addLog(`Your ${sunkShip} was sunk!`, 'sunk-log');
          UI.showToast(`Your ${sunkShip} was sunk!`);
        }
      } else {
        SoundManager.playMiss();
        UI.addLog(`Enemy missed at ${coordLabel(row, col)}.`, 'miss-log');
      }
    });

    socket.on('game-over', ({ won }) => {
      if (won) {
        SoundManager.playWin();
      } else {
        SoundManager.playLose();
      }
      UI.goToGameOver(won);
    });

    socket.on('opponent-disconnected', () => {
      UI.showToast('Opponent disconnected.');
      UI.addLog('Opponent disconnected.', 'system');
    });

    socket.on('rematch-requested', () => {
      UI.showToast('Opponent wants a rematch!');
      UI.showRematchStatus('Opponent wants a rematch — click Rematch to accept.');
    });

    socket.on('rematch-start', () => {
      Game.reset();
      UI.goToFaction();
      UI.showToast('New game! Choose your side.');
    });
  }

  function createRoom(callback) {
    socket.emit('create-room', callback);
  }

  function joinRoom(code, callback) {
    socket.emit('join-room', code, callback);
  }

  function sendShips(ships, callback) {
    socket.emit('place-ships', ships, callback);
  }

  function fire(row, col, callback) {
    socket.emit('fire', { row, col }, callback);
  }

  function requestRematch() {
    socket.emit('request-rematch');
  }

  function acceptRematch() {
    socket.emit('accept-rematch');
  }

  function coordLabel(row, col) {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  }

  return {
    connect,
    createRoom,
    joinRoom,
    sendShips,
    fire,
    requestRematch,
    acceptRematch,
    get roomCode() { return roomCode; },
    set roomCode(v) { roomCode = v; },
    get playerIndex() { return playerIndex; },
    set playerIndex(v) { playerIndex = v; },
    coordLabel,
  };
})();
