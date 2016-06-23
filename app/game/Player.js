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
 * Player's current score
 * @type {number}
 */
Player.prototype.score = 0;

/**
 * Player's answer to the latest question
 * @type {string}
 */
Player.prototype.answer = null;

module.exports = Player;
