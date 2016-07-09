var util = require('util');
var pg = require('pg');
async = require("async");
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

DatabaseManager.prototype.getAcronyms = function getAcronyms(callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  client.query(util.format('SELECT acronymid, acronym, definition FROM log515_cyga.acronym ORDER BY acronym ASC'), function (err, result) {
    if (err) {
      throw err;
    } else {
      var acronyms = result.rows.map(function (row) {
        return new Acronym(row.acronymid, row.acronym, row.definition);
      });
      callback(acronyms);
    }
  });
};

DatabaseManager.prototype.insertAcronyms = function insertAcronyms(acronyms, callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  sql = 'INSERT INTO log515_cyga.acronym (acronym, definition) VALUES ($1,$2)';
  async.map(acronyms,function(row,cb){
    client.query(sql, row,function(err, response)
    {
      if (!err)
      {
        cb(err,response);
      }
    });
  },function(err,res)
  {
    client.end();
  });
};

DatabaseManager.prototype.updateAcronyms = function updateAcronyms(acronyms, callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  sql = 'UPDATE log515_cyga.acronym SET definition = $2 WHERE acronymid = $1';
  async.map(acronyms,function(row,cb){
    client.query(sql, row,function(err, response)
    {
      if (!err)
      {
        cb(err,response);
      }
    });
  },function(err,res)
  {
    client.end();
  });
};

DatabaseManager.prototype.deleteAcronyms = function deleteAcronyms(acronyms, callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  sql = 'DELETE FROM log515_cyga.acronym WHERE acronymid = ';
  async.map(acronyms,function(row,cb){
    client.query(sql + row,function(err, response)
    {
      if (!err)
      {
        cb(err,response);
      }
    });
  },function(err,res)
  {
    client.end();
  });
};


module.exports = DatabaseManager;
