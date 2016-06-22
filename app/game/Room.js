/**
 * Room in which a game is played. A unique code is generated in the code field.
 * @constructor
 */
var Room = function Room(code) {
  this.code = code;
};

/*
 * Constants
 */
/**
 * Room status is "waiting" when the game has not been started
 * @type {number}
 */
Room.STATUS_WAITING = 0;

/**
 * Room status is "active" when the game has been started
 * @type {number}
 */
Room.STATUS_ACTIVE = 1;

/**
 * All of the alphanumerical characters which can be used in a room code.
 * @type {string}
 */
Room.ROOM_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";

/*
 * Public fields
 */
/**
 * Room's current status, defaults to WAITING
 * @type {number}
 */
Room.prototype.status = Room.STATUS_WAITING;

/**
 * Room's code which must be 4 alphanumerical characters and unique for managing via GameManager
 * @type {string}
 */
Room.prototype.code = null;

/**
 * Room's current players playing or waiting.
 * @see Player
 * @type {Array}
 */
Room.prototype.players = [];

/*
 * Public methods
 */
/**
 * Add a user to the room by username
 * @param username of the player
 */
Room.prototype.addPlayer = function addPlayer(username) {
  this.players.push(username);
};

/**
 * Remove a user from the room
 * @param username
 */
Room.prototype.removePlayer = function removePlayer(username) {
  this.players.splice(this.players.indexOf(username), 1);
};

/**
 * Returns true if a player with the specified username exists in the room.
 * @param username
 * @returns {boolean}
 */
Room.prototype.playerExists = function playerExists(username) {
  return this.players.indexOf(username) !== -1;
};

module.exports = Room;
