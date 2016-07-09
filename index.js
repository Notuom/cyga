// Bootstrapping
global.__base = __dirname + '/app/';
var config = require(__base + 'config');

// Server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Routing handlers
var accountRoutes = require(__base + '/routing/accountRoutes');
var adminRoutes = require(__base + '/routing/adminRoutes');

// Socket handlers
var adminSockets = require(__base + '/socket/adminSockets');
var gameSockets = require(__base + '/socket/gameSockets');

//
// Static HTTP server
//
server.listen(config.port, function () {
  console.log('Server listening on http://localhost:%d/', config.port);
});
app.use(express.static(__dirname + '/public'));

//
// Routing HTTP server and views
//
app.use('/users', accountRoutes);
app.use('/admin', adminRoutes);
app.set('views', __base + 'views/');
app.set('view engine', 'pug');

//
// WebSockets server
//
io.on('connection', function (socket) {
  gameSockets(socket);
  adminSockets(socket);
});
