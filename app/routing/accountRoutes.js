var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res) {
    res.redirect('/users/login');
});

router.get('/login', function(req, res) {
    res.render('index');
});

router.get('/signup', function(req, res) {
    res.render('signup');
});

router.post('/reg', passport.authenticate('signup', {
        successRedirect: '/users/account',
        failureRedirect: '/users/signup'
    })
);

router.post('/login', passport.authenticate('signin', {
        successRedirect: '/users/account',
        failureRedirect: '/users/signup'
    })
);

router.get('/account', function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.error = 'Please sign in!';
    res.redirect('/users/login');
}, function(req, res) {
    res.send('account page');
});

router.get('/logout', function(req, res){
    var name = req.user.username;
    console.log("LOGGIN OUT " + req.user.username)
    req.logout();
    res.redirect('/');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

module.exports = router;