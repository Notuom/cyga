$(function () {
  var socket = io();
  var username = false;
  var answer = "";
  var updates= [];

  $('#update-acronyms').on('click', function() {
    socket.emit('update_acronyms', updates);
    $('#reload-page-form').submit();
  });

  $('.delete-acronym').on('click', function() {
    $row = $(this).parents('tr');
    id = $row.attr('id');
    $row.addClass('deleted');
    updates.push(['DELETE', id]);
  });

  $('#add-acronym').on('click', function() {
    $('#edit-acronym-action').val('insert');
    acronymEditPanelVisible(true);
  });

  $('.edit-acronym').on('click', function() {
    $this = $(this);
    $parentRow = $this.parents('tr');
    id = $parentRow.attr('id');

    $('#edit-acronym-action').val('edit');
    $('#edit-acronym-id').val(id);
    updateAcronymChanges(
      $parentRow.children('.acronym-name').html(),
      $parentRow.children('.acronym-definition').html()
    );
    acronymEditPanelVisible(true);
  });

  $('#cancel-acronym-changes').on('click', function() {
    clearAcronymChanges();
    acronymEditPanelVisible(false);
  });

  $('#acronym-changes-form').submit(function(event) {
    event.preventDefault();
    definition = $('#edit-definition-input').val().toLowerCase();

    if($('#edit-acronym-action').val() == 'insert') {
      acronym = $('#edit-acronym-input').val().toUpperCase();
      updates.push(['INSERT', acronym, definition]);
      insertInTable(acronym, definition);
    }else if($('#edit-acronym-action').val() == 'edit') {
      id = $('#edit-acronym-id').val();
      $('#edit-acronym-id').val('');
      updates.push(['UPDATE', id, definition]);
      updateTable(id, definition);
    }

    clearAcronymChanges();
    acronymEditPanelVisible(false);

  });
});

function acronymEditPanelVisible(show) {
  if($('#edit-acronym-action').val() == 'insert') {
    clearAcronymChanges();
    $('#acronym-edit-panel .panel-heading').html('Add an acronym');
  }else if($('#edit-acronym-action').val() == 'edit')
    $('#acronym-edit-panel .panel-heading').html('Modify an acronym');

  if(show)
    $('#acronym-edit-panel').addClass('show');
  else
    $('#acronym-edit-panel').removeClass('show');
}

function updateAcronymChanges(acronym, definition) {
  $('#edit-acronym-input').val(acronym);
  $('#edit-acronym-input').attr('disabled', 'disabled');
  $('#edit-definition-input').val(definition);
}

function clearAcronymChanges() {
  $('#edit-acronym-input').val("");
  $('#edit-acronym-input').removeAttr('disabled');
  $('#edit-definition-input').val("");
}

function updateTable(id, definition) {
  $('tr#' + id).addClass('updated');
  $('tr#' + id + " .acronym-definition").html(definition);
}

function insertInTable(acronyme, definition) {
  $('#adminAcronymEdit table tbody').prepend('<tr class="created"><td width="10%" class="acronym-name">' + acronyme + '</td>' +
    '<td class="acronym-definition">' + definition + '</td></tr>');
}


