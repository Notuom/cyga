// Bootstrapping
global.__base = __dirname + '/app/';
var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Game classes
var GameManager = require(__base + 'game/GameManager');
var Acronym = require(__base + 'game/Acronym');
var Room = require(__base + 'game/Room');
var Player = require(__base + 'game/Player');

// Singleton instances
var manager = new GameManager();

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
  socket.player = null;
  socket.admin = false;

  // Register player
  socket.on('user_connection_request', function (username) {
    console.log('"user_connection_request" received with username=' + username);

    // Username does not exist yet in any game
    if (!manager.playerExists(username)) {
      manager.addPlayer(username);
      socket.player = new Player(username);
      socket.emit('user_connection_success');
    }

    // Username already exists
    else {
      socket.emit('generic_error', "Username " + username + " is already taken. Please select another username.");
      console.log("User rejected (username already exists).");
    }
  });

  // Create new room
  socket.on('room_create_request', function (turns) {
    console.log('"room_create_request" received');

    var room = manager.createRoom(turns);
    room.addPlayer(socket.player);
    console.log(room);

    socket.admin = true;
    socket.room = room;
    socket.join(room.code);

    socket.emit("room_waiting_init", {
      admin: true,
      code: room.code,
      players: room.players,
      turns: turns
    });
  });

  // Join room
  socket.on('room_join_request', function (code) {
    code = code.toUpperCase();

    // Room exists
    if (code in manager.rooms) {

      // Room has room for new a player
      if (manager.rooms[code].players.length < Room.MAX_PLAYERS) {

        // Room is waiting
        if (manager.rooms[code].status === Room.STATUS_WAITING) {
          socket.admin = false;
          socket.room = manager.rooms[code];
          socket.room.addPlayer(socket.player);
          socket.join(code);

          socket.emit("room_waiting_init", {
            admin: false,
            code: code,
            players: socket.room.players,
            turns: socket.room.turns
          });

          socket.to(code).emit("room_waiting_update", socket.room.players);
        }

        // Room is started
        else {
          socket.emit("generic_error", "The game is already started!");
        }
      }

      // Room has the maximum number of players
      else {
        socket.emit("generic_error", "The game has too many players.");
      }
    }

    // Room does not exist
    else {
      socket.emit("generic_error", "The room does not exist.");
    }
  });

  // Start 1st game round
  socket.on('room_start_request', function () {
    console.log('"room_start_request" received');

    // Player is admin
    if (socket.admin) {

      // Enough players
      if (socket.room.hasMinPlayers() && socket.room.hasMaxPlayers()) {
        socket.room.nextRound();

        // Send round update to all in room
        socket.nsp.to(socket.room.code).emit("room_start_round", {
          round: socket.room.round,
          acronym: socket.room.acronym.name
        });
      }

      // Not enough players / too many (shouldn't happen...)
      else {
        socket.emit("generic_error", "The number of players in the room has to be between " +
          Room.MIN_PLAYERS + " and " + Room.MAX_PLAYERS + ".");
      }
    }

    // Player is not admin
    else {
      socket.emit("generic_error", "Only the host can start the game.");
    }
  });

  // Receive description from player
  socket.on('room_round_description', function (description) {
    console.log('"room_round_description" received with description=' + description);
    socket.player.answer = description;
    if (socket.room.allPlayersAnswered()) {

      // Send voting start with all player descriptions. This is not secure as the username is sent along.
      socket.nsp.to(socket.room.code).emit("room_start_vote", socket.room.players.map(function (player) {
        return {username: player.username, answer: player.answer};
      }));
    }
  });

  // Disconnect (managed by socket.io, can happen anytime)
  socket.on('disconnect', function () {
    if (socket.player !== null) {
      console.log('Déconnection pour username=' + socket.player.username);

      // Remove player from games
      manager.removePlayer(socket.player.username);

      // Disconnected connection had a room attached to it
      if ("room" in socket) {

        // Remove player from room
        socket.room.removePlayer(socket.player);
        console.log("Room players", manager.players);

        // Send update to room players if in waiting state
        if (socket.room.status === Room.STATUS_WAITING) {
          // TODO give host to other player or remove game if host leaves?
          socket.to(socket.room.code).emit("room_waiting_update", socket.room.players);
        }
        // TODO send event if in-game too?

        // If this was the last player in room, delete room
        if (socket.room.players.length === 0) {
          console.log("Last player for room with code=" + socket.room.code);
          manager.deleteRoom(socket.room.code);
        }
      }
    }
  });


});
