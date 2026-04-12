const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
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

// ── Socket.io Logic ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

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
      timerSeconds: timer || 0, // 0 = no timer
      turnTimer: null
    };
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    socket.playerIndex = 0;
    callback({ success: true, code, playerIndex: 0 });
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
    socket.playerIndex = 1;

    // Send opponent info
    const opponentId = playerIds[0];
    const opponentName = room.players[opponentId].name;

    callback({
      success: true,
      code,
      playerIndex: 1,
      opponentName,
      timerSeconds: room.timerSeconds
    });

    // Notify the other player with joiner's name
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

      // Send game-start with names and scores
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
      // Start turn timer
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

    // Clear turn timer
    clearTurnTimer(room);

    const opponentId = Object.keys(room.players).find(id => id !== socket.id);
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
        if (isSunk) {
          sunkShip = shipDef;
        }
      }

      // Check for win (22 total ship cells)
      if (room.players[socket.id].hits >= 22) {
        room.phase = 'finished';
        room.winner = socket.id;
        room.players[socket.id].wins++;

        const playerIds = Object.keys(room.players);
        for (const pid of playerIds) {
          const opId = playerIds.find(id => id !== pid);
          io.to(pid).emit('game-over', {
            won: pid === socket.id,
            myWins: room.players[pid].wins,
            opponentWins: room.players[opId].wins
          });
        }
        console.log(`Room ${socket.roomCode}: ${room.players[socket.id].name} wins!`);
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
      row,
      col,
      result,
      sunkShip: sunkShip ? sunkShip.name : null
    });

    // Switch turns only on MISS
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

  // ── Rematch ───────────────────────────────────────────
  socket.on('request-rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    socket.to(socket.roomCode).emit('rematch-requested');
  });

  socket.on('accept-rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    clearTurnTimer(room);

    for (const pid of Object.keys(room.players)) {
      room.players[pid].board = createEmptyBoard();
      room.players[pid].ships = [];
      room.players[pid].ready = false;
      room.players[pid].hits = 0;
      // wins persist across rematches
    }
    room.phase = 'placement';
    room.turn = null;
    room.winner = null;

    io.to(socket.roomCode).emit('rematch-start');
  });

  // ── Disconnect ────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        clearTurnTimer(room);
        socket.to(socket.roomCode).emit('opponent-disconnected');
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          rooms.delete(socket.roomCode);
          console.log(`Room ${socket.roomCode} deleted (empty)`);
        }
      }
    }
  });
});

// ── Turn Timer Logic ────────────────────────────────────────
function startTurnTimer(room) {
  clearTurnTimer(room);
  if (!room.timerSeconds || room.timerSeconds <= 0) return;
  if (room.phase !== 'battle' || !room.turn) return;

  // Notify both players timer started
  const playerIds = Object.keys(room.players);
  for (const pid of playerIds) {
    io.to(pid).emit('timer-start', { seconds: room.timerSeconds });
  }

  room.turnTimer = setTimeout(() => {
    if (room.phase !== 'battle') return;

    const currentPlayer = room.turn;
    const opponentId = playerIds.find(id => id !== currentPlayer);
    if (!opponentId) return;

    // Time's up — skip turn
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
