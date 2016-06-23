// Bootstrapping
global.__base = __dirname + '/app/';
var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Game classes
var GameManager = require(__base + 'game/GameManager');
var Room = require(__base + 'game/Room');

var game = new GameManager();

// Database class
var DatabaseManager = require(__base + 'database/DatabaseManager');

var db = new DatabaseManager();
//
// Static HTTP server
//
server.listen(port, function () {
  console.log('Server listening on port %d', port);
});
app.use(express.static(__dirname + '/public'));


//
// WebSockets server
//
io.on('connection', function (socket) {
  socket.username = false;
  socket.admin = false;

  // Register player
  socket.on('user_connection_request', function (username) {
    console.log('"user_connection_request" received with username=' + username);

    if (!game.playerExists(username)) {
      game.addPlayer(username);
      socket.username = username;
      socket.emit('user_connection_success');
    } else {
      socket.emit('user_connection_error', "Username is already taken.");
      console.log("User rejected (username already exists).");
    }
  });

  // Create new room
  socket.on('room_create_request', function () {
    console.log('"room_create_request" received');

    var room = game.createRoom();
    room.addPlayer(socket.username);

    socket.admin = true;
    socket.room = room;
    socket.join(room.code);

    socket.emit("room_waiting_init", {
      admin: true,
      code: room.code,
      players: room.players
    });
  });

  // Join room
  socket.on('room_join_request', function (code) {
    code = code.toUpperCase();

    // Room exists
    if (code in game.rooms) {

      // Room is waiting
      if (game.rooms[code].status === Room.STATUS_WAITING) {
        socket.admin = false;
        socket.room = game.rooms[code];
        socket.room.addPlayer(socket.username);
        socket.join(code);

        socket.emit("room_waiting_init", {
          admin: false,
          code: code,
          players: socket.room.players
        });

        socket.to(code).emit("room_waiting_update", socket.room.players);
      }

      // Room is started
      else {
        socket.emit("room_waiting_error", "The game is already started!");
      }
    }

    // Room does not exist
    else {
      socket.emit("room_waiting_error", "The room does not exist.");
    }
  });

  // Disconnect (managed by socket.io)
  socket.on('disconnect', function () {
    console.log('Déconnection pour username=' + socket.username);
    if (socket.username !== false) {

      // Remove player from game
      game.removePlayer(socket.username);

      // Disconnected connection had a room attached to it
      if ("room" in socket) {

        // Remove player from room
        socket.room.removePlayer(socket.username);
        console.log("Room players", game.players);

        // Send update to room players if in waiting state
        if (socket.room.status === Room.STATUS_WAITING) {
          // TODO give host to other player or remove game if host leaves?
          socket.to(socket.room.code).emit("room_waiting_update", socket.room.players);
        }

        // If this was the last player in room, delete room
        if (socket.room.players.length === 0) {
          console.log("Last player for room with code=" + socket.room.code);
          game.deleteRoom(socket.room.code);
        }
      }
    }
  });


});
