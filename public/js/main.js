$(function () {
  var socket = io();
  var username = false;
  var players = [];

  /*
   * User interactions
   */

  // Connection
  $("#connection-form").submit(function (event) {
    event.preventDefault();
    console.info("Sending connection...");

    var username = $("#connection-username").val();
    if (username.trim() !== "") {
      socket.emit("user_connection_request", username);
    } else {
      alert("Please enter a username.");
    }
  });

  // Join room
  $("#room-join-form").submit(function (event) {
    event.preventDefault();
    console.info("Sending room_join_request...");

    var code = $("#room-join-code").val();
    if (code.trim() !== "") {
      socket.emit("room_join_request", code);
    } else {
      alert("Please enter a room code.");
    }
  });

  // Create new room
  $("#salle-creer").click(function(event) {
    event.preventDefault();
    console.info("Sending room_create_request...");

    socket.emit("room_create_request");
  });

  /*
   * WebSockets listeners
   */

  // Server accepted connection, show join/create form
  socket.on("user_connection_success", function () {
    console.info('"user_connection_success" received');
    $(".game-panel").hide();
    $("#room-join-form").show();
  });

  // Server did not accept connection, show error
  socket.on("user_connection_error", function (erreur) {
    console.info('"user_connection_error" received');
    alert(erreur);
  });

  // Server accepted room creation, show waiting panel
  socket.on("room_waiting_init", function(data) {
    console.info('"room_waiting_init" received with code=', data.code, ', admin=', data.admin);
    $(".game-panel").hide();
    $("#room-waiting-form").show();

    $("#room-code").text(data.code);
    refreshPlayers(data.players);

    if (data.admin === true) {
      $("#room-waiting-go").show();
    } else {
      $("#room-waiting-go").hide();
    }
  });

  // New user added  to current room
  socket.on("room_waiting_update", function (players) {
    console.info('"room_waiting_update" reçu');
    refreshPlayers(players);
  });

  // Requested room cannot be joined
  socket.on("room_waiting_error", function (erreur) {
    console.info('"room_waiting_error" reçu');
    alert(erreur);
  });

  // Disconnected from socket server
  socket.on('disconnect', function () {
    console.info('"disconnect" reçu');
    $(".game-panel").hide();
    $("#disconnect-panel").show();
  });
});

/*
 * Helper functions
 */

// Rafraichir la liste d'players dans la salle d'attente
function refreshPlayers(players) {
  $("#room-waiting-players").empty();
  for (var i = 0; i < players.length; i++) {
    $("<tr><td>" + players[i] + "</td></tr>")
      .appendTo($("#room-waiting-players"));
  }
}
