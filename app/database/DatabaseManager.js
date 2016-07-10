var util = require('util');
var pg = require('pg');
var query = require('pg-query');
var Q = require('q');
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
      client.end();
    }
  });
};

/**
 * Return true or false if the username exist in the DB
 * @param username
 * @return boolean
 */
DatabaseManager.prototype.isUsernameTaken = function isUsernameTaken(username) {
  var deferred = Q.defer();
  query.first('SELECT username FROM log515_cyga.users WHERE username LIKE $1', username, function(err, result) {
    deferred.resolve(typeof(result) !== "undefined");
  });
  return deferred.promise;
};

/**
 * Insert new user in the DB
 * @param user
 */
DatabaseManager.prototype.insertNewUser = function insertNewUser(user) {
  var deferred = Q.defer();
  query('INSERT INTO log515_cyga.users (username, password, usertype) VALUES ($1, $2, $3)', [user.username, user.password, user.type], function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log("result : " + result);
      deferred.resolve(user);
    }
  });
  return deferred.promise;
};

DatabaseManager.prototype.getUserByUsername = function getUserByUsername(username) {
  var deferred = Q.defer();
  query.first('SELECT userid, username, password, usertype as type FROM log515_cyga.users WHERE username LIKE $1', username, function(err, result) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      if (typeof(result) !== "undefined") {
        deferred.resolve(result);
      } else {
        deferred.resolve(false);
      }
    }
  });

  return deferred.promise;
};
module.exports = DatabaseManager;
