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

// Session + Login
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var loginHelper = require(__base + 'helpers/loginHelper');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//
// Static HTTP server
//
server.listen(config.port, function () {
  console.log('Server listening on http://localhost:%d/', config.port);
});

// Session and login
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: 'test', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

app.set('views', __base + 'views/');
app.set('view engine', 'pug');

//
// Routing HTTP server and views
//
app.use(express.static(__dirname + '/public'));
app.use('/users', accountRoutes);
app.use('/admin', adminRoutes);


//========================= Passport Strategy ===============================
// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

passport.use('signup', new LocalStrategy(
    {passReqToCallback : true},
    function(req, username, password, done) {
      console.log('test signup');
      console.log('test username : ' + username);
      console.log('test password : ' + password);
      loginHelper.localReg(username, password)
       .then(function (user) {
       if (user) {
         console.log("REGISTERED: " + user.username);
         req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
         done(null, user);
       }
       if (!user) {
         console.log("COULD NOT REGISTER");
         req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
         done(null, user);
       }
       })
       .fail(function (err){
         console.log(err.body);
       });
    }
));

passport.use('signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    console.log("login test");
    loginHelper.localAuth(username, password)
      .then(function (user) {
        if (user) {
          console.log("LOGGED IN AS: " + user.username);
          req.session.success = 'You are successfully logged in ' + user.username + '!';
          done(null, user);
        }
        if (!user) {
          console.log("COULD NOT LOG IN");
          req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
          done(null, user);
        }
      })
      .fail(function (err){
        console.log(err.body);
      });
  }
));
//===========================================================================

//
// WebSockets server
//
io.on('connection', function (socket) {
  gameSockets(socket);
  adminSockets(socket);
});
