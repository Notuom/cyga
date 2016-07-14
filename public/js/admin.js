$(function () {
  var socket = io();
  var username = false;
  var answer = "";
  var updates= [];

  //Save the changes made in the DB
  $('#update-acronyms').on('click', function() {
    socket.emit('update_acronyms', updates);
    $('#reload-page-form').submit();
  });
  //Delete an acronym from the database
  $('.delete-acronym').on('click', function() {
    $row = $(this).parents('tr');
    id = $row.attr('id');
    $row.addClass('deleted');
    updates.push(['DELETE', id]);
  });
  //Add a new acronym
  $('#add-acronym').on('click', function() {
    $('#edit-acronym-action').val('insert');
    acronymEditPanelVisible(true);
  });
  //Update an acronym from the database
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
  //Cancel changes made in the acronym edition panel
  $('#cancel-acronym-changes').on('click', function(e) {
    e.preventDefault();
    clearAcronymChanges();
    acronymEditPanelVisible(false);
  });

  $('#acronym-changes-form').submit(function(event) {
    event.preventDefault();
    definition = $('#edit-definition-input').val().toLowerCase().trim();
    acronym = $('#edit-acronym-input').val().toUpperCase().trim();

    /* un des champs non remplis? */
    if(definition == '' || acronym == '') {
      alert('Please fill all fields.');
      return;
    }

    if($('#edit-acronym-action').val() == 'insert') {
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
/**
 * Show or hide and updates the acronym edition panel
 * @param show true: show panel.
 */
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

/**
 * Updates the acronym modification fields with parameters. Disables the Acronym field to avoid modification.
 * @param acronym
 * @param definition
 */
function updateAcronymChanges(acronym, definition) {
  $('#edit-acronym-input').val(acronym);
  $('#edit-acronym-input').attr('disabled', 'disabled');
  $('#edit-definition-input').val(definition);
}
/**
 * Clear the acronym modification fields.
 */
function clearAcronymChanges() {
  $('#edit-acronym-input').val("");
  $('#edit-acronym-input').removeAttr('disabled');
  $('#edit-definition-input').val("");
}
/**
 * Updates the HTML table reflecting the changes made by the user.
 * @param id
 * @param definition
 */
function updateTable(id, definition) {
  $('tr#' + id).addClass('updated');
  $('tr#' + id + " .acronym-definition").html(definition);
}
/**
 * Inserts the newly created acronym in the HTML table.
 * @param acronym
 * @param definition
 */
function insertInTable(acronyme, definition) {
  $('#adminAcronymEdit table tbody').prepend('<tr class="created"><td width="10%" class="acronym-name">' + acronyme + '</td>' +
    '<td class="acronym-definition">' + definition + '</td></tr>');
}


