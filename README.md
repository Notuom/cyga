# LOG515 - CYGA (Can You Guess the Acronym)

CYGA requiert [Node.js](https://nodejs.org/). Installez Node.js et npm (fourni avec Node.js) sur votre système avant de procéder.

## Installation des dépendances

Pour installer les dépendances `npm` de l'application :

```
npm install
```

Cette tâche doit être faite avant toute autre manipulation.

## Exécution de l'application

Pour exécuter l'application :

```
npm start
```

## Génération de la documentation

Pour générer la documentation avec JSDoc :

```
npm run doc
```

La documentation sera disponible via le fichier out/index.html.

## Tests unitaires

Pour exécuter les tests unitaires avec Mocha :

```
npm test
```

## Notes

* Pour exécuter l'application, une connexion internet doit être disponible pour que l'application puisse se connecter à la base de données PostgreSQL sur Heroku. Sinon, une source PostgreSQL doit être fournie dans le fichier app/config.js.
