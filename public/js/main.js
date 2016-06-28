$(function () {
  var socket = io();
  var username = false;
  var answer = "";

  /*
   * User interactions
   */

  // Connection
  $("#connection-form").submit(function (event) {
    event.preventDefault();
    console.info("Sending connection...");

    username = $("#connection-username").val();
    if (username.trim() !== "") {
      socket.emit("user_connection_request", username);
    } else {
      alert("Please enter a username.");
    }
  });

  // Join room
  $("#room-join-form #room-join").click(function (event) {
    event.preventDefault();
    console.info("Sending room_join_request...");
    var t = $(this);
    var code = t.data("room");
    if (code.trim() !== "") {
      socket.emit("room_join_request", code);
    } else {
      alert("There is an error with this room, please pick another one.");
    }
  });

  // Create new room
  $("#room-create").click(function (event) {
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

  // Send description for game round
  $("#game-round-form").submit(function (event) {
    event.preventDefault();
    $("#game-round-description, #game-round-submit").prop("disabled", true);

    console.info("Sending room_round_description...");
    answer = $("#game-round-description").val();
    socket.emit("room_round_description", answer);
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
  
  socket.on("show_lobby", function (data) {
    if (data.status == 0) {
        createHtmlRoom(data.code, data.current_players, data.max_player);
     }
  });

  // Server accepted room creation, show waiting panel
  socket.on("room_waiting_init", function (data) {
    console.info('"room_waiting_init" received with code=', data.code, ', admin=', data.admin);
    $(".game-panel").hide();
    $("#room-waiting-form").show();

    $(".room-code").text(data.code);
    $(".game-round-turns").text(data.turns);
    refreshPlayers(data.players);

    $("#room-waiting-go").toggle(data.admin === true);
  });

  // New room added to lobby
  socket.on("add_room_to_lobby", function (data) {
    console.info('"add_room_to_lobby" received');
    createHtmlRoom(data.code, data.current_players, data.max_player);
  });

  // New user added  to current room
  socket.on("room_waiting_update", function (players) {
    console.info('"room_waiting_update" received');
    refreshPlayers(players);
  });

  // Start new game round
  socket.on("room_start_round", function (data) {
    console.info('"room_start_round" received');
    $(".game-panel").hide();

    $(".game-round-round").text(data.round);
    $(".game-round-acronym").text(data.acronym);
    $("#game-round-form").show();
  });

  // Start voting
  socket.on("room_start_vote", function (data) {
    console.info("room_start_vote received");
    console.log(data);
    $("#game-round-description-container").hide();
    var container$ = $("#game-round-voting-container");
    for (var i = 0; i < data.length; i++) {
      if (data[i].answer !== answer) {
        $('<button type="button" class="list-group-item">' + data[i].answer + '</button>')
          .click(function (event) {
            if (!$(this).hasClass("disabled")) {
              $("#game-round-voting-container .list-group-item").addClass("disabled");
              $(this).append('<span class="badge"><i class="glyphicon glyphicon-ok"></i></span>')

              console.info("Sending room_round_vote...");
              socket.emit("room_round_vote", $(this).data("answer"));
            }
          })
          .data("answer", data[i].answer)
          .appendTo(container$);
      }
    }
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

// Create the HTML for the room in lobby
function createHtmlRoom(code, current, max) {
  var li = $('<li id="'+code+'" class="list-group-item"></li>');
  var button = $('<button type="button" data-room="'+code+'" id="room-join" name="room-join" class="btn btn-sm btn-success pull-right"></button>');
  var icon = '<i class="glyphicon glyphicon-plus"></i>';
  var roomCode = '<span class="room-join-code">'+code+'</span>';
  var minPlayer = '<span class="label label-default label-pill pull-xs-right min-players">'+current+'</span>/';
  var maxPlayer = '<span class="label label-default label-pill pull-xs-right max-player">'+max+'</span>';
  button.append(icon);
  li.append(roomCode,minPlayer,maxPlayer,button);
  $("#room-list").append(li);
}

