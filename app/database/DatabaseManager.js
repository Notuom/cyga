var config = require(__base + 'config');
var pg = require('pg');
pg.defaults.ssl = true;
/*
 * Public methods
 */
/**
 * GameManager handles rooms within the server.
 * @constructor
 */
var DatabaseManager = function DatabaseManager() {

};

DatabaseManager.prototype.listTables = function listTables() {
  pg.connect(config.databaseUrl, function (err, client) {
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
  });
};

module.exports = DatabaseManager;
