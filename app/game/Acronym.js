/**
 * An acronym with a title and a description
 * @constructor
 */
var Acronym = function Acronym(name, description) {
  this.name = name;
  this.description = description;
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
