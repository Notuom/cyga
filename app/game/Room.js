var Acronym = require(__base + "game/Acronym");

/**
 * Room in which a game is played. Keeps information about an upcoming or ongoing game session.
 * @constructor
 */
var Room = function Room(code, turns) {
  this.code = code;
  this.turns = turns;
  this.players = [];
  this.acronyms = Acronym.getRandomAcronyms(turns);
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

/**
 * Minimum number of players to start a game.
 * @type {number}
 */
Room.MIN_PLAYERS = 3;

/**
 * Maximum number of players in a game.
 * @type {number}
 */
Room.MAX_PLAYERS = 8;

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
Room.prototype.players = null;

/**
 * Number of turns to be played in this game.
 * @type {number}
 */
Room.prototype.turns = 0;

/**
 * Current round of the game.
 * @type {number}
 */
Room.prototype.round = 0;

/**
 * List of all acronyms that will be played during this game.
 * @type {Acronym[]}
 */
Room.prototype.acronyms = null;

/**
 * Current acronym being played in the round.
 * @type {Acronym}
 */
Room.prototype.acronym = null;

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

/**
 * @returns {boolean} true if the room has enough players to start.
 */
Room.prototype.hasMinPlayers = function hasMinPlayers() {
  return this.players.length >= Room.MIN_PLAYERS;
};

/**
 * @returns {boolean} true if the room does not exceed the player limit to start.
 */
Room.prototype.hasMaxPlayers = function hasMaxPlayers() {
  return this.players.length <= Room.MAX_PLAYERS;
};

/**
 * Go to the next round (increment round number, get random acronym
 */
Room.prototype.nextRound = function nextRound() {
  this.round++;
  this.acronym = this.acronyms.pop();
};

module.exports = Room;
