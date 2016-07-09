/**
 * Player in the game
 * @constructor
 */
var Player = function Player(username) {
  this.username = username;
};

/**
 * Player's username
 * @type {string}
 */
Player.prototype.username = null;

/**
 * Player's current score for this round
 * @type {number}
 */
Player.prototype.roundScore = 0;

/**
 * Player's current score for this game
 * @type {number}
 */
Player.prototype.gameScore = 0;

/**
 * Player's answer to the latest question
 * @type {string}
 */
Player.prototype.answer = null;

/**
 * Is player the host of this game?
 * @type {boolean}
 */
Player.prototype.admin = false;

/**
 * Player's current vote for this round
 * @type {string}
 */
Player.prototype.vote = null;

module.exports = Player;
