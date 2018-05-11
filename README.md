# CYGA (Can You Guess the Acronym)

## How to play

CYGA is a browser game for up to 8 players. The goal of the game is to come up with the best meaning for acronyms. Each turn, an acronym is shown. Players must submit their meaning and submit it. Then, players must vote for another player's acronym - it could be the one that makes the most sense or the funniest one! After a set number of turns, the game ends and the player with the most votes wins.

A demo is available on a free Heroku-hosted server: [log515-cyga.herokuapp.com](https://log515-cyga.herokuapp.com). In order to start a game, one of the players must create an account (no verification needed) and create a new room. Then, players can join the room and play.

## Credits

This game was made as a school project for the Software Engineering Project Management class at [École de technologie supérieure](https://www.etsmtl.ca/) in 2016.

Contributors (alphabetical order):

* Guillame Chevalier
* Kevin Jacques
* Olivier Lalonde
* Karl Thibault

## Technology

CYGA is built on [Node.js](https://nodejs.org/) and uses a PostgreSQL database in order to store acronyms, accounts and scores.

### Installing and running

First, install dependencies:

```
npm install
```

Then, start the app:

```
npm start
```

You should configure an environment variable with a valid PostgreSQL connection string.

### Generating documentation

You can generate JSDoc for the project:

```
npm run doc
```

Documentation will be available in `out/index.html`.

### Unit tests

You can run unit tests (uses Mocha):

```
npm test
```

### Database setup

* Run migrationScript.sql on your empty PostgreSQL database
* Create an environment variable named `DATABASE_URL` containing the full connection string (i.e. `postgres://...`)
