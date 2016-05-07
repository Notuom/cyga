$(function () {
  var socket = io();
  var username = false;
  var utilisateurs = [];

  //
  // Interactions avec la page par l'utilisateur
  //

  // Connexion (entrée du nom)
  $("#connexion-form").submit(function (event) {
    event.preventDefault();
    console.info("Envoi de la connexion...");

    var username = $("#connexion-username").val();
    if (username.trim() !== "") {
      socket.emit("utilisateur connexion demande", username);
    } else {
      alert("Veuillez entrer un pseudonyme.");
    }
  });

  // Joindre une salle existante
  $("#salle-joindre-form").submit(function (event) {
    event.preventDefault();
    console.info("Envoi de la demande pour joindre la salle...");

    var code = $("#salle-joindre-code").val();
    if (code.trim() !== "") {
      socket.emit("salle joindre demande", code);
    } else {
      alert("Veuillez entrer un code de salle.");
    }
  });

  // Créer une nouvelle salle
  $("#salle-creer").click(function(event) {
    event.preventDefault();
    console.info("Envoi de la demande pour créer une salle");

    socket.emit("salle creer demande");
  });

  //
  // Écouteurs WebSockets
  //

  // Le serveur accepte la connexion, afficher le formulaire de salle
  socket.on("utilisateur connexion succes", function () {
    console.info('"utilisateur connexion succes" reçu');
    $(".panneau").hide();
    $("#salle-joindre-form").show();
  });

  // Le serveur n'accepte pas la connexion, afficher l'erreur
  socket.on("utilisateur connexion erreur", function (erreur) {
    console.info('"utilisateur connexion erreur" reçu');
    alert(erreur);
  });

  // Le serveur accepte la création de salle, afficher le dashboard avec le code
  socket.on("salle attente initialisation", function(data) {
    console.info('"salle attente initialisation" reçu');
    $(".panneau").hide();
    $("#salle-attente-form").show();

    $("#code-salle").text(data.code);
    rafraichirUtilisateurs(data.utilisateurs);

    if (data.admin) {
      $("#salle-attente-go").show();
    }
  });

  // Un nouvel utilisateur s'est connecté à la salle - rafraichir la liste
  socket.on("salle attente update", function (utilisateurs) {
    console.info('"salle attente update" reçu');
    rafraichirUtilisateurs(utilisateurs);
  });

  // La salle demandée ne peut être rejoint
  socket.on("salle attente erreur", function (erreur) {
    console.info('"salle attente erreur" reçu');
    alert(erreur);
  });

  // Déconnexion
  socket.on('disconnect', function () {
    console.info('"disconnect" reçu');
    $(".panneau").hide();
    $("#deconnexion-panel").show();
  });
});

//
// Fonctions helper
//

// Rafraichir la liste d'utilisateurs dans la salle d'attente
function rafraichirUtilisateurs(utilisateurs) {
  $("#salle-attente-utilisateurs").empty();
  for (var i = 0; i < utilisateurs.length; i++) {
    $("<tr><td>" + utilisateurs[i] + "</td></tr>")
      .appendTo($("#salle-attente-utilisateurs"));
  }
}
