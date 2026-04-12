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

function createTrackingBoard() {
  return Array.from({ length: 10 }, () => Array(10).fill(null));
}

// ── Socket.io Logic ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('create-room', (callback) => {
    const code = generateRoomCode();
    const room = {
      code,
      players: {
        [socket.id]: {
          board: createEmptyBoard(),
          ships: [],
          ready: false,
          hits: 0
        }
      },
      turn: null,
      phase: 'placement',
      winner: null
    };
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    socket.playerIndex = 0;
    callback({ success: true, code, playerIndex: 0 });
    console.log(`Room ${code} created by ${socket.id}`);
  });

  socket.on('join-room', (code, callback) => {
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
      board: createEmptyBoard(),
      ships: [],
      ready: false,
      hits: 0
    };
    socket.join(code);
    socket.roomCode = code;
    socket.playerIndex = 1;
    callback({ success: true, code, playerIndex: 1 });

    // Notify the other player
    socket.to(code).emit('opponent-joined');
    console.log(`${socket.id} joined room ${code}`);
  });

  socket.on('place-ships', (shipData, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room || !room.players[socket.id]) return;

    const player = room.players[socket.id];
    const board = createEmptyBoard();

    // Validate and place each ship
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

    // Check if both players are ready
    const playerIds = Object.keys(room.players);
    if (playerIds.length === 2 && playerIds.every(id => room.players[id].ready)) {
      room.phase = 'battle';
      room.turn = playerIds[Math.floor(Math.random() * 2)];

      for (const pid of playerIds) {
        const isMyTurn = pid === room.turn;
        io.to(pid).emit('game-start', { myTurn: isMyTurn });
      }
      console.log(`Room ${socket.roomCode}: battle started, turn: ${room.turn}`);
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
      // It's a hit
      const shipName = cell;
      opponentBoard[row][col] = 'hit';
      room.players[socket.id].hits++;
      result = 'hit';

      // Check if this ship is sunk
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

      // Check for win (22 total ship cells: 5+4+3+3+2+1+1+1+1+1)
      if (room.players[socket.id].hits >= 22) {
        room.phase = 'finished';
        room.winner = socket.id;
        io.to(socket.id).emit('game-over', { won: true });
        io.to(opponentId).emit('game-over', { won: false });
        console.log(`Room ${socket.roomCode}: ${socket.id} wins!`);
      }
    } else {
      opponentBoard[row][col] = 'miss';
      result = 'miss';
    }

    // Send result to the attacker
    callback({
      success: true,
      result,
      row,
      col,
      sunkShip: sunkShip ? { name: sunkShip.name, size: sunkShip.size, row: sunkShip.row, col: sunkShip.col, orientation: sunkShip.orientation } : null
    });

    // Notify the defender
    io.to(opponentId).emit('incoming-fire', {
      row,
      col,
      result,
      sunkShip: sunkShip ? sunkShip.name : null
    });

    // Switch turns (unless game over)
    if (room.phase === 'battle') {
      room.turn = opponentId;
      io.to(socket.id).emit('turn-update', { myTurn: false });
      io.to(opponentId).emit('turn-update', { myTurn: true });
    }
  });

  socket.on('send-chat', (msg) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    socket.to(socket.roomCode).emit('chat-message', {
      sender: 'opponent',
      text: msg.substring(0, 200)
    });
  });

  socket.on('request-rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    socket.to(socket.roomCode).emit('rematch-requested');
  });

  socket.on('accept-rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    // Reset both players
    for (const pid of Object.keys(room.players)) {
      room.players[pid] = {
        board: createEmptyBoard(),
        ships: [],
        ready: false,
        hits: 0
      };
    }
    room.phase = 'placement';
    room.turn = null;
    room.winner = null;

    io.to(socket.roomCode).emit('rematch-start');
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        socket.to(socket.roomCode).emit('opponent-disconnected');
        // Clean up room after a delay
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          rooms.delete(socket.roomCode);
          console.log(`Room ${socket.roomCode} deleted (empty)`);
        }
      }
    }
  });
});

// ── Cleanup stale rooms every 30 minutes ────────────────────
setInterval(() => {
  const now = Date.now();
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
