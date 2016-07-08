// Bootstrapping
global.__base = __dirname + '/app/';
var config = require(__base + 'config');
var express = require('express');
var app = express();
var router = express.Router();
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

// Routing
var accountRoutes = require(__base + '/routing/accountRoutes');
var adminRoutes = require(__base + '/routing/adminRoutes');

//
// Static HTTP server
//
server.listen(config.port, function () {
  console.log('Server listening on http://localhost:%d/', config.port);
});
app.use(express.static(__dirname + '/public'));
app.use('/users',accountRoutes);
app.use('/admin',adminRoutes);

app.set('views', __base + 'views/');
app.set('view engine', 'pug');

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
      socket.join("lobby");

      // Create each room in the lobby (HTML)
      var allRooms = manager.getAllRooms();
      allRooms.forEach(function (room) {
        var currentRoom = {
          status: room.status,
          code: room.code,
          current_players: room.getAllCurrentPlayers(),
          max_player: room.getMaxPlayers()
        };
        socket.emit('show_lobby', currentRoom);
      });

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

    // Get a number of unique random acronyms corresponding to the number of turns from the database
    db.getRandomAcronyms(turns, function (acronyms) {
      var room = manager.createRoom(acronyms.length, acronyms);
      room.addPlayer(socket.player);
      console.log(room);

      socket.admin = true;
      socket.room = room;

      socket.nsp.to("lobby").emit("add_room_to_lobby", {
        code: room.code,
        max_player: room.getMaxPlayers(),
        current_players: room.getAllCurrentPlayers()
      });

      socket.join(room.code);

      socket.emit("room_waiting_init", {
        admin: true,
        code: room.code,
        players: room.players,
        turns: turns
      });
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

          // Refresh the lobby list
          manager.refreshLobby(socket);
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
        socket.room.startRounds();
        socket.room.nextRound();

        // Send round update to all in room
        socket.nsp.to(socket.room.code).emit("room_start_round", socket.room.getRoundStartMessage());

        // Refresh the lobby list
        manager.refreshLobby(socket);
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

    // TODO : if two players have the same answer at the moment it could be problematic?
    // it should just vote for both but is problematic if all players have the exact same answer. (very much an edge case, nobody cares)
    socket.player.answer = description;
    if (socket.room.allPlayersAnswered()) {

      // Send voting start with all player descriptions.
      socket.nsp.to(socket.room.code).emit("room_start_vote", socket.room.getPlayerDescriptions());
    }
  });

  // Receive vote from player
  socket.on('room_round_vote', function (vote) {
    console.log('"room_round_vote" received with vote=' + vote);
    socket.player.vote = vote;

    // Add player score
    socket.room.addVoteForAnswer(vote);

    // If this is the last player to vote on this round
    if (socket.room.allPlayersVoted()) {

      // Compute tally for this round
      var tally = socket.room.getTally();
      var description = socket.room.acronym.description;

      // Reset player answers and votes for next round
      socket.room.nextRound();

      // Game is ended: send message to show that was the last round, delete room
      if (socket.room.isGameEnded()) {

        // Send tally while also indicating the game has ended
        socket.nsp.to(socket.room.code).emit("room_end", tally, description);

        // Make all clients leave room
        console.log(socket.nsp.to(socket.room.code));
        var roomSockets = socket.nsp.to(socket.room.code).sockets;
        for (var roomSocket in roomSockets) {
          if (roomSockets.hasOwnProperty(roomSocket)) {
            roomSockets[roomSocket].player.score = 0;
            roomSockets[roomSocket].player.gameScore = 0;
            roomSockets[roomSocket].leave(socket.room.code);
          }
        }

        // Delete room from game manager
        manager.deleteRoom(socket.room.code);
        manager.refreshLobby(socket);
      }

      // Game is not ended: send message to show tally and set a timeout to begin next round
      else {
        // Send tally to client
        // TODO send real description too
        socket.nsp.to(socket.room.code).emit("room_show_tally", tally, description);

        // Set a time out for when the tally should stop being shown
        setTimeout(function timeoutRoomTally() {
          socket.nsp.to(socket.room.code).emit("room_start_round", socket.room.getRoundStartMessage());
        }, GameManager.TALLY_DISPLAY_DELAY);
      }
    }
  });

  // Disconnect (managed by socket.io, can happen anytime)
  socket.on('disconnect', function () {
    if (socket.player !== null) {
      console.log('Disconnect for username=' + socket.player.username);

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

        // Refresh the lobby list
        manager.refreshLobby(socket);
      }
    }
  });

  //Update database to reflect acronym modifications
  socket.on('update_acronyms', function(acronyms) {
    deleteArray = [];
    insertArray = [];
    updateArray = [];
    for(i = 0 ; i < acronyms.length ; i++) {
      switch (acronyms[i][0]) {
        case 'UPDATE':
          updateArray.push([acronyms[i][1],acronyms[i][2]]);
          break;
        case 'INSERT':
          insertArray.push([acronyms[i][1],acronyms[i][2]]);
          break;
        case 'DELETE':
          deleteArray.push(acronyms[i][1]);
          break;
      }
    }
    if(insertArray.length > 0)db.insertAcronyms(insertArray);
    if(updateArray.length > 0)db.updateAcronyms(updateArray);
    if(deleteArray.length > 0)db.deleteAcronyms(deleteArray);
  });
});
