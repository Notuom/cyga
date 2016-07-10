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
        "password": hash,
        "type" : "user"
    };
    console.log("password length : " + user.password.length);
    db.isUsernameTaken(user.username)
      .then(function(isTaken){
          console.log("username pris : "+isTaken);
        if (isTaken) {
            deferred.resolve(false);
        } else {
            db.insertNewUser(user)
              .then(function(user){
                  deferred.resolve(user);
              });
        }
      });
    return deferred.promise;
};

//used in signin strategy
exports.localAuth = function (username, password) {
    var deferred = Q.defer();
    db.getUserByUsername(username)
      .then(function(result){
          console.log(result);
        if (result) {
            var hash = result.password;
            console.log(hash);
            console.log(bcrypt.compareSync(password, hash));
            if (bcrypt.compareSync(password, hash)) {
                deferred.resolve(result);
            } else {
                console.log("Password don't match");
                deferred.resolve(false);
            }
        } else {
            deferred.resolve(false);
        }
      });
    return deferred.promise;
};