var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res) {
    res.redirect('/users/login');
});

router.get('/login', function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.render('index');
}, function(req, res) {
  res.redirect('/users/account');
});

router.get('/signup', function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.render('signup');
}, function(req, res) {
  res.redirect('/users/account');
});

router.post('/reg', passport.authenticate('signup', {
        successRedirect: '/users/account',
        failureRedirect: '/users/signup'
    })
);

router.post('/signin', passport.authenticate('signin', {
        successRedirect: '/users/account',
        failureRedirect: '/users/login'
    })
);

router.get('/account', function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.error = 'Please sign in!';
    res.redirect('/users/login');
}, function(req, res) {
  res.render('account', {user : req.user});
});

router.get('/logout', function(req, res){
    var name = req.user.username;
    console.log("LOGGIN OUT " + req.user.username)
    req.logout();
    req.session.notice = "You have successfully been logged out " + name + "!";
    res.redirect('/users/login');
});

module.exports = router;