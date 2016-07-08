var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
    res.redirect('/users/login');
});

router.get('/login', function(req, res) {
    res.render('index');
});

router.post('/reg', passport.authenticate('signup', {
        successRedirect: '/account',
        failureRedirect: '/signin'
    })
);

router.post('/login', passport.authenticate('signin', {
        successRedirect: '/account',
        failureRedirect: '/signin'
    })
);

router.get('/account', function(req, res) {
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