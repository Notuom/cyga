var util = require('util');
var pg = require('pg');
pg.defaults.ssl = true;

var config = require(__base + 'config');
var Acronym = require(__base + 'game/Acronym');
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

module.exports = DatabaseManager;
