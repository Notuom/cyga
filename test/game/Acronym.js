var Acronym = require(__base + 'game/Acronym');

describe('Acronym', function () {
  describe('#constructor', function () {
    it('should initialize parameters correctly', function () {
      var testId = 1,
        testName = 'ABC',
        testDescription = 'Alpha Beta Chestnut',
        acronym = new Acronym(testId, testName, testDescription);

      acronym.id.should.equal(testId);
      acronym.name.should.equal(testName);
      acronym.description.should.equal(testDescription);
    })
  });
});
