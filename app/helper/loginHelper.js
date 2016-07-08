var bcrypt = require('bcryptjs');
var DatabaseManager = require(__base + 'database/DatabaseManager');
var db = new DatabaseManager();

//used in signup strategy
exports.localReg = function (email, username, password) {
    var hash = bcrypt.hashSync(password, 8);
    var user = {
        "username": username,
        "password": hash,
        "email": email
    };

    if (db.isUsernameTaken(user.username) == false) {
        db.insertNewUser(user);
    }

    //return false;
};

//used in signin strategy
exports.localAuth = function (username, password) {

};