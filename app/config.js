// Local configuration file that is used when .env is not used (for local development)
var config = {};

config.port = process.env.PORT
  || 8080;
config.databaseUrl = process.env.DATABASE_URL
  || "postgres://***REMOVED***";

module.exports = config;
