var config = require(__base + 'config');
var pg = require('pg');
/*
 * Public methods
 */
/**
 * GameManager handles rooms within the server.
 * @constructor
 */
function DatabaseManager() {
  this.listTables();
};

DatabaseManager.prototype.listTables = function listTables() {
  console.log('Connecting to postgres.');
  pg.defaults.ssl = true;
  pg.connect(config.database.database, function(err, client) {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log('Connected to postgres! Getting schemas...');

      client
          .query('SELECT table_schema,table_name FROM information_schema.tables;')
          .on('row', function(row) {
              console.log(JSON.stringify(row));
          });
  });
}

module.exports = DatabaseManager;