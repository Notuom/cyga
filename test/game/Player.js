var Player = require(__base + 'game/Player');

describe('Player', function () {
  describe('#constructor', function () {
    it('should initialize username correctly', function () {
      var testUsername = 'username',
        player = new Player(testUsername);

      player.username.should.equal(testUsername);
    });
  });

});
