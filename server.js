const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  // iOS Safari needs polling first — websocket upgrade fails on some networks
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  allowUpgrades: true,
  upgradeTimeout: 30000
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Game State ──────────────────────────────────────────────
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms.has(code));
  return code;
}

function createEmptyBoard() {
  return Array.from({ length: 10 }, () => Array(10).fill(null));
}

function getOpponentId(room, myId) {
  return Object.keys(room.players).find(id => id !== myId);
}

// ── Session Recovery ────────────────────────────────────────
// Map playerToken → { roomCode, playerName } for reconnection
const sessions = new Map();

function generateToken() {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}

// ── Socket.io Logic ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  // ── Reconnect with token ──────────────────────────────
  socket.on('rejoin', ({ token }, callback) => {
    const session = sessions.get(token);
    if (!session) return callback({ success: false });

    const room = rooms.get(session.roomCode);
    if (!room) {
      sessions.delete(token);
      return callback({ success: false });
    }

    // Find old player entry (might be under old socket.id)
    const oldId = Object.keys(room.players).find(id =>
      room.players[id].name === session.playerName
    );

    if (!oldId) return callback({ success: false });

    // Cancel grace timer for the old socket
    if (room._graceTimers && room._graceTimers[oldId]) {
      clearTimeout(room._graceTimers[oldId]);
      delete room._graceTimers[oldId];
    }

    // Move player data to new socket.id
    if (oldId !== socket.id) {
      room.players[socket.id] = room.players[oldId];
      delete room.players[oldId];
    }

    socket.join(session.roomCode);
    socket.roomCode = session.roomCode;
    socket.playerToken = token;

    // Notify opponent
    socket.to(session.roomCode).emit('opponent-reconnected');

    callback({
      success: true,
      roomCode: session.roomCode,
      phase: room.phase,
      name: session.playerName
    });
    console.log(`${session.playerName} reconnected to room ${session.roomCode}`);
  });

  socket.on('create-room', ({ name, timer }, callback) => {
    const code = generateRoomCode();
    const room = {
      code,
      players: {
        [socket.id]: {
          name: name || 'Player 1',
          board: createEmptyBoard(),
          ships: [],
          ready: false,
          hits: 0,
          wins: 0
        }
      },
      turn: null,
      phase: 'placement',
      winner: null,
      timerSeconds: timer || 0,
      turnTimer: null,
      rematchVotes: new Set()
    };
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    const token = generateToken();
    socket.playerToken = token;
    sessions.set(token, { roomCode: code, playerName: name || 'Player 1' });
    callback({ success: true, code, token });
    console.log(`Room ${code} created by ${name || socket.id}`);
  });

  socket.on('join-room', ({ code, name }, callback) => {
    code = code.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, error: 'Room not found.' });
    }

    const playerIds = Object.keys(room.players);
    if (playerIds.length >= 2) {
      return callback({ success: false, error: 'Room is full.' });
    }

    room.players[socket.id] = {
      name: name || 'Player 2',
      board: createEmptyBoard(),
      ships: [],
      ready: false,
      hits: 0,
      wins: 0
    };
    socket.join(code);
    socket.roomCode = code;

    const opponentId = playerIds[0];
    const opponentName = room.players[opponentId].name;

    const token = generateToken();
    socket.playerToken = token;
    sessions.set(token, { roomCode: code, playerName: name || 'Player 2' });

    callback({
      success: true,
      code,
      token,
      opponentName,
      timerSeconds: room.timerSeconds
    });

    socket.to(code).emit('opponent-joined', { name: name || 'Player 2' });
    console.log(`${name || socket.id} joined room ${code}`);
  });

  socket.on('place-ships', (shipData, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room || !room.players[socket.id]) return;

    const player = room.players[socket.id];
    const board = createEmptyBoard();

    for (const ship of shipData) {
      const { name, size, row, col, orientation } = ship;
      const cells = [];

      for (let i = 0; i < size; i++) {
        const r = orientation === 'horizontal' ? row : row + i;
        const c = orientation === 'horizontal' ? col + i : col;

        if (r < 0 || r >= 10 || c < 0 || c >= 10) {
          return callback({ success: false, error: `${name} goes off the grid.` });
        }
        if (board[r][c] !== null) {
          return callback({ success: false, error: `${name} overlaps another ship.` });
        }
        cells.push({ r, c });
      }

      for (const cell of cells) {
        board[cell.r][cell.c] = name;
      }
    }

    player.board = board;
    player.ships = shipData;
    player.ready = true;

    const playerIds = Object.keys(room.players);
    if (playerIds.length === 2 && playerIds.every(id => room.players[id].ready)) {
      room.phase = 'battle';
      room.turn = playerIds[Math.floor(Math.random() * 2)];

      for (const pid of playerIds) {
        const opId = playerIds.find(id => id !== pid);
        io.to(pid).emit('game-start', {
          myTurn: pid === room.turn,
          myName: room.players[pid].name,
          opponentName: room.players[opId].name,
          myWins: room.players[pid].wins,
          opponentWins: room.players[opId].wins,
          timerSeconds: room.timerSeconds
        });
      }
      startTurnTimer(room);
      console.log(`Room ${socket.roomCode}: battle started`);
    } else {
      callback({ success: true, waiting: true });
      socket.to(socket.roomCode).emit('opponent-ready');
    }
  });

  socket.on('fire', ({ row, col }, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'battle') return;
    if (room.turn !== socket.id) {
      return callback({ success: false, error: 'Not your turn.' });
    }

    clearTurnTimer(room);

    const opponentId = getOpponentId(room, socket.id);
    if (!opponentId) return;

    const opponentBoard = room.players[opponentId].board;
    const cell = opponentBoard[row][col];

    if (cell === 'hit' || cell === 'miss') {
      return callback({ success: false, error: 'Already fired there.' });
    }

    let result;
    let sunkShip = null;

    if (cell !== null) {
      const shipName = cell;
      opponentBoard[row][col] = 'hit';
      room.players[socket.id].hits++;
      result = 'hit';

      const shipDef = room.players[opponentId].ships.find(s => s.name === shipName);
      if (shipDef) {
        let isSunk = true;
        for (let i = 0; i < shipDef.size; i++) {
          const r = shipDef.orientation === 'horizontal' ? shipDef.row : shipDef.row + i;
          const c = shipDef.orientation === 'horizontal' ? shipDef.col + i : shipDef.col;
          if (opponentBoard[r][c] !== 'hit') {
            isSunk = false;
            break;
          }
        }
        if (isSunk) sunkShip = shipDef;
      }

      if (room.players[socket.id].hits >= 22) {
        endGame(room, socket.id);
      }
    } else {
      opponentBoard[row][col] = 'miss';
      result = 'miss';
    }

    callback({
      success: true,
      result,
      row,
      col,
      sunkShip: sunkShip ? { name: sunkShip.name, size: sunkShip.size, row: sunkShip.row, col: sunkShip.col, orientation: sunkShip.orientation } : null
    });

    io.to(opponentId).emit('incoming-fire', {
      row, col, result,
      sunkShip: sunkShip ? sunkShip.name : null
    });

    if (room.phase === 'battle') {
      if (result === 'miss') {
        room.turn = opponentId;
        io.to(socket.id).emit('turn-update', { myTurn: false });
        io.to(opponentId).emit('turn-update', { myTurn: true });
      } else {
        io.to(socket.id).emit('turn-update', { myTurn: true });
        io.to(opponentId).emit('turn-update', { myTurn: false });
      }
      startTurnTimer(room);
    }
  });

  // ── Surrender ─────────────────────────────────────────
  socket.on('surrender', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'battle') return;

    const opponentId = getOpponentId(room, socket.id);
    if (!opponentId) return;

    const surrenderName = room.players[socket.id]?.name || 'Player';
    console.log(`Room ${socket.roomCode}: ${surrenderName} surrendered`);

    // Opponent wins
    endGame(room, opponentId, surrenderName + ' surrendered!');
  });

  // ── Chat ──────────────────────────────────────────────
  socket.on('send-chat', (msg) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    const player = room.players[socket.id];
    const senderName = player ? player.name : 'Unknown';
    socket.to(socket.roomCode).emit('chat-message', {
      sender: senderName,
      text: msg.substring(0, 200)
    });
  });

  // ── Rematch (proper 2-player vote system) ─────────────
  socket.on('vote-rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'finished') return;

    room.rematchVotes.add(socket.id);
    const opponentId = getOpponentId(room, socket.id);

    if (room.rematchVotes.size >= 2) {
      // Both voted — start rematch
      room.rematchVotes.clear();
      resetRoomForRematch(room);
      io.to(socket.roomCode).emit('rematch-start');
      console.log(`Room ${socket.roomCode}: rematch starting`);
    } else {
      // Notify opponent
      if (opponentId) {
        io.to(opponentId).emit('rematch-requested');
      }
      // Confirm to voter
      socket.emit('rematch-voted');
    }
  });

  // ── Disconnect (with grace period for mobile reconnection) ──
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    const roomCode = socket.roomCode;
    const playerId = socket.id;
    const playerToken = socket.playerToken;

    if (!roomCode) return;
    const room = rooms.get(roomCode);
    if (!room || !room.players[playerId]) return;

    const playerName = room.players[playerId].name;

    // Notify opponent they may have disconnected
    socket.to(roomCode).emit('opponent-may-disconnect', { name: playerName });

    // Grace period — 30 seconds to reconnect before removing
    const graceTimer = setTimeout(() => {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Check if player reconnected (would be under a new socket.id with same name)
      const stillHere = Object.values(room.players).some(p => p.name === playerName);
      // Check if the exact old socket.id is still in the room (means they didn't reconnect)
      const oldPlayerStillThere = room.players[playerId];

      if (!oldPlayerStillThere) return; // Already reconnected under new id

      // Player really gone — handle it
      if (room.phase === 'battle') {
        const remainingId = getOpponentId(room, playerId);
        if (remainingId && room.players[remainingId]) {
          endGame(room, remainingId, `${playerName} disconnected`);
        }
      }

      io.to(roomCode).emit('opponent-disconnected');

      delete room.players[playerId];
      room.rematchVotes.delete(playerId);
      if (Object.keys(room.players).length === 0) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (empty)`);
      }
    }, 30000); // 30 second grace period

    // Store grace timer so reconnect can cancel it
    if (!room._graceTimers) room._graceTimers = {};
    room._graceTimers[playerId] = graceTimer;

    // Keep session token for reconnection
    if (playerToken) {
      setTimeout(() => sessions.delete(playerToken), 120000);
    }
  });
});

// ── Helper: End game with a winner ──────────────────────────
function endGame(room, winnerId, reason) {
  room.phase = 'finished';
  room.winner = winnerId;
  room.players[winnerId].wins++;
  clearTurnTimer(room);
  room.rematchVotes.clear();

  const playerIds = Object.keys(room.players);
  for (const pid of playerIds) {
    const opId = playerIds.find(id => id !== pid);
    io.to(pid).emit('game-over', {
      won: pid === winnerId,
      myWins: room.players[pid].wins,
      opponentWins: room.players[opId].wins,
      reason: reason || null
    });
  }
}

// ── Helper: Reset room for rematch ──────────────────────────
function resetRoomForRematch(room) {
  clearTurnTimer(room);
  for (const pid of Object.keys(room.players)) {
    room.players[pid].board = createEmptyBoard();
    room.players[pid].ships = [];
    room.players[pid].ready = false;
    room.players[pid].hits = 0;
  }
  room.phase = 'placement';
  room.turn = null;
  room.winner = null;
}

// ── Turn Timer Logic ────────────────────────────────────────
function startTurnTimer(room) {
  clearTurnTimer(room);
  if (!room.timerSeconds || room.timerSeconds <= 0) return;
  if (room.phase !== 'battle' || !room.turn) return;

  const playerIds = Object.keys(room.players);
  for (const pid of playerIds) {
    io.to(pid).emit('timer-start', { seconds: room.timerSeconds });
  }

  room.turnTimer = setTimeout(() => {
    if (room.phase !== 'battle') return;

    const currentPlayer = room.turn;
    const opponentId = playerIds.find(id => id !== currentPlayer);
    if (!opponentId) return;

    room.turn = opponentId;
    io.to(currentPlayer).emit('turn-update', { myTurn: false, timeout: true });
    io.to(opponentId).emit('turn-update', { myTurn: true, timeout: false });

    const timedOutName = room.players[currentPlayer]?.name || 'Player';
    io.to(room.code).emit('timer-expired', { name: timedOutName });

    startTurnTimer(room);
  }, room.timerSeconds * 1000);
}

function clearTurnTimer(room) {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
}

// ── Cleanup stale rooms every 30 minutes ────────────────────
setInterval(() => {
  for (const [code, room] of rooms) {
    if (Object.keys(room.players).length === 0) {
      rooms.delete(code);
    }
  }
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Battleship server running on port ${PORT}`);
});
