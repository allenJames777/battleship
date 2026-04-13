// ── Socket.io Handler ─────────────────────────────────────

const SocketHandler = (() => {
  let socket = null;
  let roomCode = null;
  let sessionToken = null;
  let myName = '';
  let opponentName = '';
  let myWins = 0;
  let opponentWins = 0;

  function connect() {
    socket = io({
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      // Start with polling (works on all browsers including iOS Safari)
      // then upgrade to websocket if available
      transports: ['polling', 'websocket']
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('reconnect', () => {
      console.log('Reconnected to server');
      // Try to rejoin the room with saved token
      if (sessionToken) {
        socket.emit('rejoin', { token: sessionToken }, (res) => {
          if (res.success) {
            UI.showToast('Reconnected to game!');
          } else {
            UI.showToast('Connection lost — could not rejoin.');
            sessionToken = null;
          }
        });
      } else {
        UI.showToast('Reconnected!');
      }
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
    });

    socket.on('opponent-joined', ({ name }) => {
      opponentName = name;
      UI.showToast(`${name} joined!`);
      UI.goToFaction();
    });

    socket.on('opponent-ready', () => {
      UI.showToast('Opponent is ready!');
      UI.setPlacementStatus('Opponent ready — place your ships!');
    });

    socket.on('game-start', (data) => {
      Game.isMyTurn = data.myTurn;
      myName = data.myName;
      opponentName = data.opponentName;
      myWins = data.myWins;
      opponentWins = data.opponentWins;
      UI.goToBattle(data.myTurn);
      UI.updateScoreboard(myName, opponentName, myWins, opponentWins);
      if (data.timerSeconds > 0) {
        UI.initTimer(data.timerSeconds);
      }
    });

    socket.on('turn-update', ({ myTurn, timeout }) => {
      Game.isMyTurn = myTurn;
      UI.updateTurnIndicator(myTurn);
      if (timeout) {
        UI.showToast("Time's up! Turn skipped.");
      }
    });

    socket.on('timer-start', ({ seconds }) => {
      UI.startTimerBar(seconds);
    });

    socket.on('timer-expired', ({ name }) => {
      UI.addLog(`${name} ran out of time!`, 'system');
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

    socket.on('game-over', ({ won, myWins: mw, opponentWins: ow, reason }) => {
      myWins = mw;
      opponentWins = ow;
      if (won) {
        SoundManager.playWin();
      } else {
        SoundManager.playLose();
      }
      UI.goToGameOver(won, myName, opponentName, myWins, opponentWins, reason);
    });

    socket.on('opponent-disconnected', () => {
      UI.showToast('Opponent disconnected.');
      UI.addLog('Opponent disconnected.', 'system');
    });

    // Rematch flow — proper vote system
    socket.on('rematch-requested', () => {
      UI.showToast('Opponent wants a rematch!');
      UI.showRematchStatus('Opponent wants a rematch — click Rematch to accept.');
    });

    socket.on('rematch-voted', () => {
      UI.showRematchStatus('Waiting for opponent…');
    });

    socket.on('rematch-start', () => {
      Game.reset();
      UI.goToFaction();
      UI.showToast('New game! Choose your side.');
    });

    // Chat
    socket.on('chat-message', ({ sender, text }) => {
      UI.addChatMessage(sender, text, false);
      UI.showChatNotification();
    });
  }

  function createRoom(name, timer, callback) {
    myName = name;
    socket.emit('create-room', { name, timer }, (res) => {
      if (res.success && res.token) sessionToken = res.token;
      callback(res);
    });
  }

  function joinRoom(code, name, callback) {
    myName = name;
    socket.emit('join-room', { code, name }, (res) => {
      if (res.success && res.token) sessionToken = res.token;
      callback(res);
    });
  }

  function sendShips(ships, callback) {
    socket.emit('place-ships', ships, callback);
  }

  function fire(row, col, callback) {
    socket.emit('fire', { row, col }, callback);
  }

  function sendChat(msg) {
    socket.emit('send-chat', msg);
    UI.addChatMessage(myName, msg, true);
  }

  function voteRematch() {
    socket.emit('vote-rematch');
  }

  function surrender() {
    socket.emit('surrender');
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
    sendChat,
    voteRematch,
    surrender,
    get roomCode() { return roomCode; },
    set roomCode(v) { roomCode = v; },
    get myName() { return myName; },
    get opponentName() { return opponentName; },
    set opponentName(v) { opponentName = v; },
    coordLabel,
  };
})();
