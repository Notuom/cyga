// Database class
var DatabaseManager = require(__base + 'database/DatabaseManager');
var db = new DatabaseManager();

var adminSockets = function adminSockets(socket) {
  // Update database to reflect acronym modifications
  socket.on('update_acronyms', function (acronyms) {
    deleteArray = [];
    insertArray = [];
    updateArray = [];
    for (i = 0; i < acronyms.length; i++) {
      switch (acronyms[i][0]) {
        case 'UPDATE':
          updateArray.push([acronyms[i][1], acronyms[i][2]]);
          break;
        case 'INSERT':
          insertArray.push([acronyms[i][1], acronyms[i][2]]);
          break;
        case 'DELETE':
          deleteArray.push(acronyms[i][1]);
          break;
      }
    }
    if (insertArray.length > 0) db.insertAcronyms(insertArray);
    if (updateArray.length > 0) db.updateAcronyms(updateArray);
    if (deleteArray.length > 0) db.deleteAcronyms(deleteArray);
  });
};

module.exports = adminSockets;
