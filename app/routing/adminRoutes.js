var express = require('express');
var router = express.Router();
var DatabaseManager = require('../database/DatabaseManager');

router.get('/acronym', function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.type == 'admin') {
    return next();
  }
  req.session.error = 'Your are not authorize to view this page!';
  res.redirect('/users/account');
}, function (req, res) {
  var db = new DatabaseManager();
  db.getAcronyms(function (acronyms) {
    res.render('adminAcronym', {acronyms: acronyms, user: req.user});
  });
});

module.exports = router;
