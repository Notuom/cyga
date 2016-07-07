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
  $("#room-join-form").on("click", 'button.room-join', function (event) {
    event.preventDefault();
    var t = $(this);
    var code = t.data("room");
    if (code.trim() !== "") {
      console.info("Sending room_join_request...");
      socket.emit("room_join_request", code);
    } else {
      alert("There is an error with this room, please pick another one.");
    }
  });

  // Create new room
  $("#room-join-form").submit(function (event) {
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

  // Replay
  $("#btn-replay").click(function (event) {
    event.preventDefault();
    $(".game-panel").hide();
    $("#game-over-container").hide();
    $("#room-join-form").show();
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

  // Receive a room for showing in the lobby
  socket.on("show_lobby", function (data) {
    // Show only room that have not been started
    if (data.status == 0) {
      var li = createHtmlRoom(data.code, data.current_players, data.max_player);
      $("#room-list").append(li);
      changeNumberofRooms();
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
    var li = createHtmlRoom(data.code, data.current_players, data.max_player);
    $("#room-list").append(li);
    changeNumberofRooms();
  });

  // New user added  to current room
  socket.on("room_waiting_update", function (players) {
    console.info('"room_waiting_update" received');
    refreshPlayers(players);
  });

  // Start new game round
  socket.on("room_start_round", function (data) {
    console.info('"room_start_round" received');
    $("#game-round-tally-container, .game-panel, .game-round-acronym-description").hide();

    $(".game-round-round").text(data.round);
    $(".game-round-acronym").text(data.acronym);
    $("#game-round-form, #game-round-description-container").show();
    $("#game-round-description, #game-round-submit").prop("disabled", false);
    $("#game-round-description").val("").focus();
  });

  // Start voting
  socket.on("room_start_vote", function (data) {
    console.info("room_start_vote received");
    console.log(data);
    $("#game-round-description-container").hide();
    var container$ = $("#game-round-voting-container");
    container$.empty().show();
    for (var i = 0; i < data.length; i++) {
      if (data[i] !== answer) {
        $('<button type="button" class="list-group-item">' + data[i] + '</button>')
          .click(function (event) {
            if (!$(this).hasClass("disabled")) {
              $("#game-round-voting-container .list-group-item").addClass("disabled");
              $(this).append('<span class="badge"><i class="glyphicon glyphicon-ok"></i></span>');

              console.info("Sending room_round_vote...", $(this).data("answer"));
              socket.emit("room_round_vote", $(this).data("answer"));
            }
          })
          .data("answer", data[i])
          .appendTo(container$);
      }
    }
  });

  // Show tally
  socket.on("room_show_tally", function (tally, description) {
    showTally(tally, description, false);
  });

  // Game is over: show final tally, declare winner
  socket.on("room_end", function (tally, description) {
    showTally(tally, description, true);
  });

  // Empty the Lobby
  socket.on("empty_lobby_rooms", function () {
    console.info('"empty_lobby_rooms" receive');
    $("#room-list").empty();
    changeNumberofRooms();
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
// Modifier le nombre de salle dans la liste
function changeNumberofRooms() {
  $("#number-of-rooms").text($("#room-list li").length);
}

// Create the HTML for the room in lobby
function createHtmlRoom(code, current, max) {
  var li = $('<li id="' + code + '" class="list-group-item"></li>');
  var button = $('<button type="button" data-room="' + code + '" name="room-join" class="room-join btn btn-sm btn-success pull-right"></button>');
  var icon = '<i class="glyphicon glyphicon-arrow-right"></i> Join this room';
  var roomCode = '<span class="room-join-code">' + code + '</span>';
  var minPlayer = '<span class="label label-default label-pill pull-xs-right min-players">' + current + '</span>  /  ';
  var maxPlayer = '<span class="label label-default label-pill pull-xs-right max-player">' + max + '</span>';
  button.append(icon);
  li.append(roomCode, minPlayer, maxPlayer, button);
  return li;
}

// Show room tally after round or when game is over
function showTally(tally, description, isGameOver) {
  $(".game-round-acronym-description").text(description).show();
  $("#game-round-voting-container").hide();
  $("#game-round-tally-container").show();
  var container$ = $("#game-round-tally");
  container$.empty();

  // Sort by score
  tally.sort(function (a, b) {
    return a.gameScore < b.gameScore;
  });

  // Display scores
  for (var i = 0; i < tally.length; i++) {
    var tr$ = $('<tr></tr>').data("tally", tally[i]);
    tr$.append('<td>' + tally[i].username + '</td>');
    tr$.append('<td>' + tally[i].answer + '</td>');
    tr$.append('<td>' + tally[i].roundScore + '</td>');
    tr$.append('<td>' + tally[i].gameScore + '</td>');
    tr$.appendTo(container$);
  }

  if (isGameOver) {

    // Find which element has max score
    var max$;
    container$.find("tr").each(function () {
      if (typeof max$ === "undefined") {
        max$ = $(this);
      } else if ($(this).data("tally").gameScore > max$.gameScore) {
        max$ = $(this);
      }
    });

    // Assign a nice star icon to the winner
    max$.find("td").eq(0).prepend('<i class="glyphicon glyphicon-star winner-icon"></i>');

    // Show their glorious name under the game-over prompt
    $("#game-over-container").show();
    $("#game-over-winner").text(max$.data("tally").username);
  }
}
