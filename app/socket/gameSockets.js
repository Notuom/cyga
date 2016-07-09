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

var gameSockets = function gameSockets(socket) {
  socket.player = null;

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

      socket.player.admin = true;
      socket.room = room;

      socket.nsp.to("lobby").emit("add_room_to_lobby", {
        code: room.code,
        max_player: room.getMaxPlayers(),
        current_players: room.getAllCurrentPlayers()
      });

      socket.join(room.code);

      socket.emit("room_waiting_init", {
        admin: socket.player.admin,
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
          socket.player.admin = false;
          socket.room = manager.rooms[code];
          socket.room.addPlayer(socket.player);
          socket.join(code);

          socket.emit("room_waiting_init", {
            admin: socket.player.admin,
            code: code,
            players: socket.room.players,
            turns: socket.room.turns
          });

          socket.to(code).emit("room_waiting_update", socket.room.players);

          //Auto-start a game if room is full
          if (socket.room.players.length == socket.room.getMaxPlayers()) {
            startRoom(socket);
          }
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
    startRoom(socket);
  });

  // Receive description from player
  socket.on('room_round_description', function (description) {
    console.log('"room_round_description" received with description=' + description);

    // TODO : if two players have the same answer at the moment it could be problematic?
    // it should just vote for both but is problematic if all players have the exact same answer. (very much an edge case, nobody cares)
    socket.player.answer = description;
    if (socket.room.allPlayersAnswered()) {

      // Send voting start with all player descriptions.
      console.log("All players answered for room with code=" + socket.room.code);
      startVote(socket);
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
      startTally(socket);
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

        // We were waiting for this player to answer
        if (socket.room.phase === Room.PHASE_DESCRIPTION && socket.room.allPlayersAnswered()) {

          // Send voting start with all player descriptions.
          console.log("All players answered for room with code=" + socket.room.code);
          startVote(socket);
        }
        // We were waiting for this player to vote
        else if (socket.room.phase === Room.PHASE_VOTE && socket.room.allPlayersVoted()) {
          startTally(socket);
        }

        // Send update to room players if in waiting state
        if (socket.room.status === Room.STATUS_WAITING) {
          if (socket.player.admin) {
            console.log("Transfering host privileges for room code= " + socket.room.code
              + " to username=" + socket.room.players[0].username);
            socket.room.players[0].admin = true;
          }
          socket.to(socket.room.code).emit("room_waiting_update", socket.room.players);
        }

        // Game is started and there are not enough players left
        if (socket.room.status === Room.STATUS_ACTIVE && socket.room.players.length < Room.MIN_PLAYERS) {
          console.log("Not enough players remain for room with code=" + socket.room.code);
          socket.room.stopTimeout();
          socket.nsp.to(socket.room.code).emit("room_abrupt_end", "Last critical player has left the room. There aren't enough players left to continue the game. Please play again.");
          emptyRoom(socket);
          manager.deleteRoom(socket.room.code);
        }
        // Game is not started but nobody's left
        else if (socket.room.players.length === 0) {
          manager.deleteRoom(socket.room.code);
        }

        // Refresh the lobby list
        manager.refreshLobby(socket);
      }
    }
  });
};

/**
 * Start a room when the host decides to start or when the maximum number of players have joined.
 * @param socket socket.io socket instance
 */
function startRoom(socket) {
  console.log('"room_start_request" received');

  // Player is admin or the game can be auto-started due to max players reached
  if (socket.player.admin || socket.room.players.length == socket.room.getMaxPlayers()) {

    // Enough players
    if (socket.room.hasMinPlayers() && socket.room.hasMaxPlayers()) {
      socket.room.startRounds();
      socket.room.nextRound();

      // Send round update to all in room
      startRound(socket);

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
}

/**
 * Start the room's current round and keep a timeout for the round's time limit
 * @param socket socket.io socket instance
 */
function startRound(socket) {
  socket.room.phase = Room.PHASE_DESCRIPTION;
  socket.nsp.to(socket.room.code).emit("room_start_round", socket.room.getRoundStartMessage());
  socket.room.startTimeout(function roomDescriptionTimeout() {
    console.log("Description timeout expired for room with code=" + socket.room.code);
    startVote(socket);
  });
}

/**
 * Start the voting phase for a room when timeout expires or all players have descriptions
 * @param socket socket.io socket instance
 */
function startVote(socket) {
  // Stop description timeout before voting starts
  socket.room.stopTimeout();

  socket.room.phase = Room.PHASE_VOTE;
  var descriptions = socket.room.getPlayerDescriptions();

  // Descriptions have been entered, show voting screen
  if (descriptions.length > 0) {
    socket.nsp.to(socket.room.code).emit("room_start_vote", descriptions);
  }

  // No descriptions entered - come on lazy players! show tally directly.
  else {
    console.log("No description found in round, skip voting for room with code=" + socket.room.code);
    startTally(socket);
  }
}

/**
 * End voting phase when all players have voted
 * @param socket socket.io socket instance
 */
function startTally(socket) {
  socket.room.phase = Room.PHASE_TALLY;

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
    emptyRoom(socket);

    // Delete room from game manager and remove from lobby
    manager.deleteRoom(socket.room.code);
    manager.refreshLobby(socket);
  }

  // Game is not ended: send message to show tally and set a timeout to begin next round
  else {
    // Send tally to client
    socket.nsp.to(socket.room.code).emit("room_show_tally", tally, description);

    // Set a time out for when the tally should stop being shown
    setTimeout(function timeoutRoomTally() {
      startRound(socket);
    }, GameManager.TALLY_DISPLAY_DELAY);
  }
}

/**
 * Empty game room without removing players from the game manager, when the game is over
 * @param socket socket.io socket instance
 */
function emptyRoom(socket) {
  console.log("Emptying room and resetting players for room with code=" + socket.room.code);
  var roomSockets = socket.nsp.to(socket.room.code).sockets;
  for (var roomSocket in roomSockets) {
    if (roomSockets.hasOwnProperty(roomSocket)) {
      roomSockets[roomSocket].player.score = 0;
      roomSockets[roomSocket].player.gameScore = 0;
      roomSockets[roomSocket].leave(socket.room.code);
    }
  }
}
module.exports = gameSockets;
