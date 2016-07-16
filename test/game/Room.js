var Acronym = require(__base + 'game/Acronym');
var Room = require(__base + 'game/Room');

describe('Room', function () {

  describe('#constructor', function () {
    it('should initialize parameters correctly', function () {
      var testCode = 'ABCD',
        testTurns = 10,
        acronyms = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZA', 'BCD'],
        room = new Room(testCode, testTurns, acronyms);

      room.code.should.equal(testCode);
      room.turns.should.equal(testTurns);
      room.players.length.should.equal(0);
      room.acronyms.should.equal(acronyms);
    });
  });

  describe('#addPlayer', function () {
    it('should add a player to the players list', function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.players.length.should.equal(1);
      room.players[0].should.equal(playerName);
    });

    it("it shouldn't add the same player twice", function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.addPlayer(playerName);
      room.players.length.should.equal(1);
    })
  });

  describe('#removePlayer', function () {
    it('should remove an existing player from the players list', function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.players.length.should.equal(1);

      room.removePlayer(playerName);
      room.players.length.should.equal(0);
    });

    it("shouldn't do anything when removing a player not in the players list", function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.removePlayer('Alice');
      room.players.length.should.equal(1);
    });
  });

  describe('#playerExists', function () {
    it('should return true if player is present', function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.playerExists(playerName).should.be.true();
    });

    it('should return false if player is not present', function () {
      var playerName = 'Bob',
        room = new Room();

      room.addPlayer(playerName);
      room.playerExists('Alice').should.be.false();
    });
  });

  describe('#hasMinPlayers', function () {
    it('should return true if the room has the minimum number of players required to start', function () {
      var room = new Room();

      for (var i = 1; i <= Room.MIN_PLAYERS; i++) {
        room.addPlayer(i);
      }
      room.hasMinPlayers().should.be.true();
    });

    it('should return false if the room does not have the minimum number of players required to start', function () {
      var room = new Room();

      for (var i = 1; i < Room.MIN_PLAYERS; i++) {
        room.addPlayer(i);
      }
      room.hasMinPlayers().should.be.false();
    });
  });

  describe('#hasMaxPlayers', function () {
    it('should return true if the room has under the maximum number of players required to start', function () {
      var room = new Room();

      // Add only one
      room.addPlayer("1");
      room.hasMaxPlayers().should.be.true();
    });

    it('should return true if the room has exactly the maximum number of players required to start', function () {
      var room = new Room();

      // Add exactly enough
      for (var i = 1; i <= Room.MAX_PLAYERS; i++) {
        room.addPlayer(i);
      }
      room.hasMaxPlayers().should.be.true();
    });

    it('should return false if the room has above the maximum number of players required to start', function () {
      var room = new Room();

      // Add one above max
      for (var i = 0; i <= Room.MAX_PLAYERS; i++) {
        room.addPlayer(i);
      }
      room.hasMaxPlayers().should.be.false();
    });
  });

  describe('#nextRound', function () {
    it('should increment the current round', function () {
      var room = new Room('ABCD', 10, ['a']);

      room.round.should.equal(0);
      room.nextRound();
      room.round.should.equal(1);
    });

    it('should pick the next acronym and remove it from the list', function () {
      var acronyms = ['a', 'b', 'c'],
        nextAcronym = acronyms[0],
        room = new Room('ABCD', 10, acronyms);

      room.nextRound();
      room.acronym.should.equal(nextAcronym);
      room.acronyms.length.should.equal(2);
    });
  });

  describe('#getRoundStartMessage', function () {
    it('should return current round and acronym name', function () {
      var acronyms = [new Acronym(1, 'ABC')],
        room = new Room('ABCD', 10, acronyms);

      room.nextRound();
      var roundStartMessage = room.getRoundStartMessage();
      roundStartMessage.round.should.equal(room.round);
      roundStartMessage.acronym.should.equal(room.acronym.name);
    });
  });


});
