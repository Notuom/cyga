/**
 * An acronym with a title and a description
 * @constructor
 */
var Acronym = function Acronym(name, description) {
  this.name = name;
  this.description = description;
};
/*
 * Static methods
 */
/**
 * Create a random acronyms list from the database
 * TODO: Implement database instead of local stuff.
 * @returns {Acronym[]}
 */
Acronym.getRandomAcronyms = function getRandomAcronyms(size) {
  var testData = [
    ["WTF", "What the fuck"],
    ["HTTP", "Hypertext Transfer Protocol"],
    ["WWF", "World Wide Fund for Nature"]
  ];
  var acronymList = [];
  for (var i = 0; i < size; i++) {
    var randomData = testData[Math.floor(Math.random() * testData.length)];
    acronymList.push(new Acronym(randomData[0], randomData[1]));
  }
  return acronymList;
};

/*
 * Instance fields
 */
/**
 * Acronym name (letters that the players need to define)
 * @type {string}
 */
Acronym.prototype.name = "";

/**
 * Acronym real definition
 * @type {string}
 */
Acronym.prototype.description = "";

module.exports = Acronym;
