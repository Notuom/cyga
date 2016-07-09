var Acronym = require(__base + "game/Acronym");

/**
 * Room in which a game is played. Keeps information about an upcoming or ongoing game session.
 * @constructor
 */
var Room = function Room(code, turns, acronyms) {
  this.code = code;
  this.turns = turns;
  this.players = [];
  this.acronyms = acronyms;
};

/*
 * Constants
 */
/**
 * Room status is "waiting" when the game has not been started
 * Room status is "active" when the game has been started
 * @type {number}
 */
Room.STATUS_WAITING = 0;
Room.STATUS_ACTIVE = 1;

/**
 * Room phases.
 * PHASE_NOT_STARTED : When room is not started. (STATUS_WAITING)
 * PHASE_DESCRIPTION : Waiting for player descriptions
 * PHASE_VOTE : Waiting for player votes
 * PHASE_TALLY : Showing tally
 * @type {number}
 */
Room.PHASE_NOT_STARTED = 0;
Room.PHASE_DESCRIPTION = 1;
Room.PHASE_VOTE = 2;
Room.PHASE_TALLY = 3;

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

/**
 * Time in seconds for a player to enter a description.
 * Add a few seconds to the actual time limit to account for small client-side discrepencies
 * @type {number}
 */
Room.DESCRIPTION_TIME_LIMIT = 65;

/*
 * Public fields
 */
/**
 * Room's current status, defaults to WAITING
 * @type {number}
 */
Room.prototype.status = Room.STATUS_WAITING;

/**
 * Room's current phase, defaults to NOT_STARTED
 * @type {number}
 */
Room.prototype.phase = Room.PHASE_NOT_STARTED;

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

/**
 * Timeout object when waiting for player descriptions
 * @type number I think?
 */
Room.prototype.timeout = null;

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
  this.resetRound();
  this.round++;
  this.acronym = this.acronyms.pop();
};

/**
 * JSON message which is sent when a round starts.
 * @returns {{round: number, acronym: string}}
 */
Room.prototype.getRoundStartMessage = function getRoomStartMessage() {
  return {
    round: this.round,
    acronym: this.acronym.name
  };
};

/**
 * @returns {boolean} true if all players have answered and we can proceed to vote
 */
Room.prototype.allPlayersAnswered = function allPlayersAnswered() {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].answer === null)
      return false;
  }
  return true;
};

/**
 * @returns {Number} get the total number of players within the room
 */
Room.prototype.getAllCurrentPlayers = function getAllCurrentPlayers() {
  return this.players.length;
};

/**
 * @returns {Number} get the total number of players within the room
 */
Room.prototype.getMaxPlayers = function getMaxPlayers() {
  return Room.MAX_PLAYERS;
};

/**
 * Set the room as active when you start the game
 */
Room.prototype.startRounds = function startRounds() {
  this.status = Room.STATUS_ACTIVE;

};

/**
 * Returns a list of descriptions for display on client when beginning vote.
 * @returns {string[]} answers for which plaeyers can vote
 */
Room.prototype.getPlayerDescriptions = function getPlayerDescriptions() {
  return this.players.map(function (player) {
    // Get player answers in array
    return player.answer;
  }).filter(function (answer, index, self) {
    // Remove duplicates TODO might not be necessary if we don't let people have the same answer
    return answer !== null && index == self.indexOf(answer);
  });
};

/**
 * Add a vote to a player corresponding to an answer
 * @param vote textual value of the answer for which a vote must be added
 */
Room.prototype.addVoteForAnswer = function addVoteForAnswer(vote) {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].answer === vote) {
      this.players[i].gameScore++;
      this.players[i].roundScore++;
    }
  }
};

/**
 * @returns {boolean} true if all players have answered and we can proceed to tally
 */
Room.prototype.allPlayersVoted = function allPlayersVoted() {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].vote === null)
      return false;
  }
  return true;
};

/**
 * Reset player answers when voting ends
 */
Room.prototype.resetRound = function resetRound() {
  for (var i = 0; i < this.players.length; i++) {
    this.players[i].roundScore = 0;
    this.players[i].answer = null;
    this.players[i].vote = null;
  }
};

/**
 * Set a timer for all players to enter description
 * @param callback function to execute when timer expires
 */
Room.prototype.startTimeout = function startTimeout(callback) {
  this.timeout = setTimeout(callback, Room.DESCRIPTION_TIME_LIMIT * 1000);
};

/**
 * Stop the timer for players to enter their description, useful when all players have played within time limit
 */
Room.prototype.stopTimeout = function stopTimeout() {
  clearTimeout(this.timeout);
};

/**
 * Return tally from current round and game for display on the client
 * @returns {Array|*}
 */
Room.prototype.getTally = function getTally() {
  return this.players.map(function (player) {
    return {
      username: player.username,
      answer: player.answer,
      roundScore: player.roundScore,
      gameScore: player.gameScore
    };
  });
};

/**
 * @returns {boolean} true if game is ended (nextRound has been called and rounds exceed maximum turns)
 */
Room.prototype.isGameEnded = function isGameEnded() {
  return this.round > this.turns;
};

module.exports = Room;
