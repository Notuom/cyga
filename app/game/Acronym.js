/**
 * An acronym with an id, a title and a description
 * @constructor
 */
var Acronym = function Acronym(id, name, description) {
  this.id = id;
  this.name = name;
  this.description = description;
};

/*
 * Instance fields
 */
/**
 * Acronym id
 * @type {string}
 */
Acronym.prototype.id = "";

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
