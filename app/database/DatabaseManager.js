var util = require('util');
var pg = require('pg');
var query = require('pg-query');
pg.defaults.ssl = true;

var config = require(__base + 'config');
var Acronym = require(__base + 'game/Acronym');

query.connectionParameters =  config.databaseUrl;
/*
 * Public methods
 */
/**
 * @constructor
 */
var DatabaseManager = function DatabaseManager() {
};

/**
 * Get an array of Acronym objects and return it through the callback parameter.
 * @param size number of acronyms to get
 * @param callback callback with an "acronyms" parameter which is an array of Acronym objects
 */
DatabaseManager.prototype.getRandomAcronyms = function getRandomAcronyms(size, callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  client.query(util.format('SELECT acronym, definition FROM log515_cyga.acronym ORDER BY random() LIMIT %d', size), function (err, result) {
    if (err) {
      throw err;
    } else {
      var acronyms = result.rows.map(function (row) {
        return new Acronym(row.acronym, row.definition);
      });
      callback(acronyms);
    }
  });
};

/**
 * Return true or false if the username exist in the DB
 * @param username
 * @return boolean
 */
DatabaseManager.prototype.isUsernameTaken = function isUsernameTaken(username) {
  query.first('SELECT username FROM log515_cyga.users WHERE username LIKE $1', username, function(err, result) {
    return result.length == 0;
  });
};

/**
 * Insert new user in the DB
 * @param user
 */
DatabaseManager.prototype.insertNewUser = function insertNewUser(user) {
  query('INSERT INTO users FROM log515_cyga.users (username, password, email, usertype) VALUES ($1, $2, $3, user)', [user.username, user.password, user.email], function(err, result) {
    console.log(result);
  });
};

module.exports = DatabaseManager;
