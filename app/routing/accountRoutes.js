var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
    res.redirect('/users/login');
});

router.get('/login', function(req, res) {
    res.render('index');
});

router.get('/account', function(req, res) {
    res.send('account page');
});

module.exports = router;