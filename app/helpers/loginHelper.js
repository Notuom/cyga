var bcrypt = require('bcryptjs');
var DatabaseManager = require(__base + 'database/DatabaseManager');
var db = new DatabaseManager();
var Q = require('q');

//used in signup strategy
exports.localReg = function (username, password) {
    var deferred = Q.defer();
    var hash = bcrypt.hashSync(password, 8);
    var user = {
        "username": username,
        "password": hash
    };
    console.log(db.isUsernameTaken(user.username));
    if (db.isUsernameTaken(user.username) == false) {
        db.insertNewUser(user);
        deferred.resolve(user);
    } else {
        deferred.resolve(false);
    }
    return deferred.promise;
};

//used in signin strategy
exports.localAuth = function (username, password) {

};