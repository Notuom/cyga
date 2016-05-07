var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//
// Pages statiques
//
server.listen(port, function() {
  console.log('Le serveur ecoute sur le port %d', port);
});
app.use(express.static(__dirname + '/public'));

//
// Gestion des utilisateurs
//
var utilisateurs = [];

// Vérifier si un nom d'utilisateur existe déjà dans la liste
function utilisateurExiste(username) {
  return utilisateurs.indexOf(username) !== -1;
}

// Ajouter un utilisateur à la liste d'utilisateurs
function ajouterUtilisateur(username) {
  utilisateurs.push(username);
}

//
// Gestion des salles
//
var SALLE_STATUT_ATTENTE = 0;
var SALLE_STATUT_ACTIF = 1;
var salles = {};

// Constructeur de Salle ("classe")
function Salle(code) {
  this.statut = SALLE_STATUT_ATTENTE;
  this.code = code;
  this.utilisateurs = [];
}

// Ajouter un utilisateur à la salle
Salle.prototype.ajouterUtilisateur = function(username) {
  this.utilisateurs.push(username);
};

// Ajouter une salle à la liste
function ajouterSalle(salle) {
  salles[salle.code] = salle;
}

// Supprimer une salle par code
function supprimerSalle(code) {
  delete salles[code];
}

// Vérifier si une salle existe
function salleExiste(code) {
  for (var i = 0; i < salles.length; i++) {
    if (salles[i].code === code) {
      return true;
    }
  }
  return false;
}

// Enlever l'utilisateur de la liste et de la salle
function supprimerUtilisateur(salle, username) {
  utilisateurs.splice(utilisateurs.indexOf(username), 1);
  salle.utilisateurs.splice(salle.utilisateurs.indexOf(username), 1);
}

//
// WebSockets
//
io.on('connection', function(socket) {

  // L'utilisateur est-il enregistré par son username?
  socket.username = false;
  socket.admin = false;
  var utilisateurEnregistre = false;

  // L'utilisateur s'enregistre (entre son nom d'utilisateur)
  socket.on('utilisateur connexion demande', function(username) {
    console.log('"utilisateur connexion demande" reçu avec username=' + username);
    if (!utilisateurExiste(username)) {
      ajouterUtilisateur(username);
      socket.username = username;
      socket.emit('utilisateur connexion succes');
      console.log("Utilisateur ajouté.");
    } else {
      socket.emit('utilisateur connexion erreur', "Le nom d'utilisateur est déjà pris.");
      console.log("Utilisateur rejeté.");
    }
  });

  // L'utilisateur créé une nouvelle salle
  socket.on('salle creer demande', function() {
    console.log('"salle creer demande" reçu');

    // Générer un code alphanumérique de 4 caractères qui n'existe pas déjà
    var caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";
    var code;
    do {
      code = "";
      for (var i = 0; i < 4; i++) {
        code += car = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
    } while (salleExiste(code));

    var salle = new Salle(code);
    salle.ajouterUtilisateur(socket.username);
    ajouterSalle(salle);
    console.log('Salle créée avec code=' + code);
    console.log(salles);

    socket.admin = true;
    socket.codeSalle = code;
    socket.salle = salle;
    socket.join(code);

    socket.emit("salle attente initialisation", {
      admin: true,
      code: salle.code,
      utilisateurs: salle.utilisateurs
    });
  });

  // L'utilisateur rejoint une salle existante
  socket.on('salle joindre demande', function(code) {
    code = code.toUpperCase();

    // Salle existe
    if (code in salles) {

      // Salle est en attente
      if (salles[code].statut === SALLE_STATUT_ATTENTE) {
        socket.admin = false;
        socket.codeSalle = code;
        socket.salle = salles[code];
        socket.salle.ajouterUtilisateur(socket.username);
        socket.join(code);

        socket.emit("salle attente initialisation", {
          admin: false,
          code: code,
          utilisateurs: socket.salle.utilisateurs
        });

        socket.to(code).emit("salle attente update", socket.salle.utilisateurs);
      }

      // Salle est commencée
      else {
        socket.emit("salle attente erreur", "La partie est déjà commencée!");
      }
    }

    // Salle n'existe pas
    else {
      socket.emit("salle attente erreur", "La partie n'existe pas.");
    }
  });

  // Déconnexion de l'utilisateur (géré automatiquement par cocket.io)
  socket.on('disconnect', function() {
    console.log('Déconnexion pour username=' + socket.username);
    if (socket.username !== false && "salle" in socket) {
      supprimerUtilisateur(socket.salle, socket.username);
      console.log("Utilisateurs", utilisateurs);

      if (socket.salle.utilisateurs.length === 0) {
        console.log("Dernier utilisateur de la salle code=" + socket.codeSalle + ". Suppression de la salle.");
        delete salles[socket.codeSalle];
        console.log(salles);
      }
    }
  });
});
