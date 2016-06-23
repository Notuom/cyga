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
  $("#room-create").click(function(event) {
    event.preventDefault();
    console.info("Sending room_create_request...");

    socket.emit("room_create_request", parseInt($("#room-create-turns").val()));
  });

  // Start game
  $("#room-waiting-form").submit(function (event) {
    event.preventDefault();
    console.info("Sending room_start_request...");

    socket.emit("room_start_request");
  });

  /*
   * WebSockets listeners
   */
  // Server accepted connection, show join/create form
  socket.on("user_connection_success", function () {
    console.info('"user_connection_success" received');
    $(".game-panel").hide();
    $("#room-join-form").show();
    $("#room-join-code").focus();
  });

  // Server accepted room creation, show waiting panel
  socket.on("room_waiting_init", function(data) {
    console.info('"room_waiting_init" received with code=', data.code, ', admin=', data.admin);
    $(".game-panel").hide();
    $("#room-waiting-form").show();

    $(".room-code").text(data.code);
    $("#game-round-turns").text(data.turns);
    refreshPlayers(data.players);

    $("#room-waiting-go").toggle(data.admin === true);
  });

  // New user added  to current room
  socket.on("room_waiting_update", function (players) {
    console.info('"room_waiting_update" received');
    refreshPlayers(players);
  });

  // Start new game round
  socket.on("room_start_round", function(data) {
    console.info('"room_start_round" received');
    $(".game-panel").hide();

    $("#game-round-round").text(data.round);
    $("#game-round-acronym").text(data.acronym);
    $("#game-round-panel").show();
  });

  // Receive generic error from server, alert it
  socket.on("generic_error", function (error) {
    console.info('"generic_error" received : ' + error);
    alert(error);
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
    $("<tr><td>" + players[i].username + "</td></tr>")
      .appendTo($("#room-waiting-players"));
  }
}
