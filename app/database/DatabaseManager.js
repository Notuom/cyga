var config = require(__base + 'config');
var pg = require('pg');
pg.defaults.ssl = true;
/*
 * Public methods
 */
/**
 * @constructor
 */
var DatabaseManager = function DatabaseManager() {

};

DatabaseManager.prototype.getAcronyms = function getAcronyms(callback) {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  client.query('SELECT acronym, definition FROM log515_cyga.acronym;', function(err, result) {
      if(err)
        callback(err, null);
      else
        callback(null, result.rows);
    });
};

DatabaseManager.prototype.listTables = function listTables() {
  var client = new pg.Client(config.databaseUrl);
  client.connect();
  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function (row) {
      console.log(JSON.stringify(row));
    });
  /*pg.connect(config.databaseUrl, function (err, client) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('Connected to postgres! Getting schemas...');

    client
      .query('SELECT table_schema,table_name FROM information_schema.tables;')
      .on('row', function (row) {
        console.log(JSON.stringify(row));
      });
  });*/
};

module.exports = DatabaseManager;
