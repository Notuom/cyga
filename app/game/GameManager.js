var Room = require(__base + 'game/Room');

/*
 * Public methods
 */
/**
 * GameManager handles rooms within the server.
 * @constructor
 */
var GameManager = function RoomManager() {
  this.rooms = {};
  this.players = [];
};

/*
 * Constants
 */
GameManager.TALLY_DISPLAY_DELAY = 5000;

/*
 * Public fields
 */
/**
 * Map of all rooms by code.
 * @type {Array}
 */
GameManager.prototype.rooms = null;

/**
 * List of all players logged on the game.
 */
GameManager.prototype.players = null;

/*
 * Public methods
 */
/**
 * Create a new room to manage it.
 */
GameManager.prototype.createRoom = function createRoom(turns) {

  // Generate a new room code which doesn't exist
  var code;
  do {
    code = "";
    for (var i = 0; i < 4; i++) {
      code += Room.ROOM_CODE_CHARACTERS.charAt(Math.floor(Math.random() * Room.ROOM_CODE_CHARACTERS.length));
    }
  } while (this.roomExists(code));
  var room = new Room(code, turns);

  this.rooms[code] = room;

  console.log('Created room with code=' + code);
  return room;
};

/**
 * Delete an existing room by its code.
 * @param code
 */
GameManager.prototype.deleteRoom = function deleteRoom(code) {
  console.log("Deleting room with code=" + code);
  delete this.rooms[code];
  console.log(this.rooms);
};

/**
 * Returns true if a room with the specified code exists.
 * @param code
 * @returns {boolean}
 */
GameManager.prototype.roomExists = function roomExists(code) {
  for (var i = 0; i < this.rooms.length; i++) {
    if (this.rooms[i].code === code) {
      return true;
    }
  }
  return false;
};

/**
 * Add a user to the game by username
 * @param username of the player
 */
GameManager.prototype.addPlayer = function addPlayer(username) {
  console.log("Adding player with username=" + username);
  this.players.push(username);
  console.log(this.players);
};

/**
 * Remove a user from the game
 * @param username
 */
GameManager.prototype.removePlayer = function removePlayer(username) {
  this.players.splice(this.players.indexOf(username), 1);
};

/**
 * Returns true if a player with the specified username exists in the room.
 * @param username
 * @returns {boolean}
 */
GameManager.prototype.playerExists = function playerExists(username) {
  return this.players.indexOf(username) !== -1;
};

/**
 * Return all the room created in the games
 * @returns {Array}
 */
GameManager.prototype.getAllRooms = function getAllRooms() {
  var rooms = [];
  for (var key in this.rooms) {
    if (this.rooms.hasOwnProperty(key)) {
      rooms.push(this.rooms[key]);
    }
  }
  return rooms;
};

module.exports = GameManager;
