var express = require('express');
var router = express.Router();
var DatabaseManager = require('../database/DatabaseManager');

router.get('/', function(req, res) {
  res.redirect('/acronym');
});

router.get('/acronym', function(req, res) {
  var db = new DatabaseManager();
  db.getAcronyms(function (acronyms) {
    res.render('adminAcronym', { acronyms: acronyms});
  });
});

module.exports = router;