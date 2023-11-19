var temporaryData = {
  intake: [],
  need: [],
  want: []
};

// Define the submitForm function outside the ready block
function submitForm(type, endpoint) {
  // Use event delegation to handle form submissions
  $('body').on('submit', 'form.' + endpoint + '-form', function(event) {
    console.log('submitting form.' + endpoint + '-form');
    event.preventDefault();

    var form = $(this);
    var formData = {
      resource: form.find('input#' + endpoint + '-resource').val(),
      amount: form.find('input#' + endpoint + '-amount').val(),
      byWhomForWhom: form.find('input#' + endpoint + '-whom').val()
    };

    addRow(type, formData);

    form.trigger('reset');
    form.find('input:first').focus();
  });
}

function commitTxn(type, endpoint) {
  $('#'+ type +'-commit-button').on('click', function() {
    console.log('Committing ' + temporaryData[type].length + type + ' transactions...');

    // Assuming you have a function to format data for the endpoint
    var formattedData = formatDataForEndpoint(type);
    console.log(formattedData)
    
    // Assuming you have an endpoint URL for committing transactions
    var commitEndpoint = '/commit/' + endpoint;

    // Send a POST request to the commit endpoint
    $.ajax({
      url: commitEndpoint,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formattedData),
      success: function(response) {
        console.log(type + ' transactions committed successfully:', response);
        
        // After successful commit, clear the temporary data and update the display
        temporaryData[type] = [];
        displayTemporaryData(type);
      },
      error: function(error) {
        console.error('Error committing ' + type + ' transactions:', error);
      }
    });
  });
}

// Example function to format data for the endpoint
function formatDataForEndpoint(type) {
  // Assuming the data structure matches the endpoint expectations
  return temporaryData[type];
}

// Define the addRow function
function addRow(type, formData) {

  var list = $('#' + type);
  var listItem = $('<li>' + formData.resource + ' (' + formData.amount + ') - ' + formData.byWhomForWhom + '<button class="delete-button">Delete</button></li>');

  // Add delete button click event
  listItem.find('.delete-button').click(function() {
    listItem.remove();
    updateTemporaryData(type, formData, 'delete');
  });

  list.append(listItem);
  updateTemporaryData(type, formData, 'add');
}

// Define the updateTemporaryData function
function updateTemporaryData(type, formData, action) {
  if (action === 'add') {
    console.log('adding to ' + type);
    temporaryData[type].push(formData);
    console.log('Temporary data');
    console.groupCollapsed(type);
    console.log(temporaryData[type].length);
  } else if (action === 'delete') {
    var index = temporaryData[type].findIndex(function(entry) {
      return (
        entry.resource === formData.resource &&
        entry.amount === formData.amount &&
        entry.byWhomForWhom === formData.byWhomForWhom
      );
    });

    if (index !== -1) {
      temporaryData[type].splice(index, 1);
    }
  } else if (action === 'deleteAll') {
    // Remove all entries for the given type
    temporaryData[type] = [];
  }

  updateCommitButtonVisibility();
  displayTemporaryData(type);
}

// Define the displayTemporaryData function
function displayTemporaryData(type) {
  console.log('displaying ' + type + ' temporary data...');

  var temporarySection = $('.txn-window #temporary-' + type + '-table tbody');
  console.log('#temporary-' + type + '-table');
  var dataList = temporaryData[type];

  temporarySection.empty(); // Clear the temporary section

  if (dataList.length > 0) {
      dataList.forEach(function (entry) {
          var row = $('<tr>');
          row.append('<td>' + entry.resource + '</td>');
          row.append('<td>' + entry.amount + '</td>');
          row.append('<td>' + entry.byWhomForWhom + '</td>');
          row.append('<td><button class="delete-button">Delete</button></td>');

          // Add delete button click event
          row.find('.delete-button').click(function () {
              row.remove();
              updateTemporaryData(type, entry, 'delete');
          });

          temporarySection.append(row);
      });
      console.log('appending rows...');
  } else {
      temporarySection.append('<tr><td colspan="4">No uncommitted ' + type + ' txns.</td></tr>');
  }
}

// Define the updateCommitButtonVisibility function
function updateCommitButtonVisibility() {
  var commitButton = $('#commit-button');
  var hasModifications = Object.values(temporaryData).some(function(data) {
    return data.length > 0;
  });

  commitButton.toggle(hasModifications);
}

$(document).ready(function() {
  console.log('Starting here...');

  displayTemporaryData('intake')
  displayTemporaryData('need')
  displayTemporaryData('want')

  // Set up form submissions
  submitForm('intake', 'intake');
  submitForm('need', 'need');
  submitForm('want', 'want');

  commitTxn('intake', 'intake')
  commitTxn('need', 'need')
  commitTxn('want', 'want')

  // Fetch summary
  fetchSummary();

  $('#intake-delete-all-button').click(function() {
    updateTemporaryData('intake', null, 'deleteAll');
  });

  $('#need-delete-all-button').click(function() {
    updateTemporaryData('need', null, 'deleteAll');
  });

  $('#want-delete-all-button').click(function() {
    updateTemporaryData('want', null, 'deleteAll');
  });

  // Add refresh button
  $('#refresh-button').click(function() {
    fetchSummary();
  });
});

// Define the fetchSummary function
function fetchSummary() {
  // Fetch summary data from the /summary endpoint
  $.get('/summary', function(summary) {
    displaySummaryTable('intakes-table', summary.intakes, 'Intakes');
    displaySummaryTable('needs-table', summary.needs, 'Needs');
    displaySummaryTable('wants-table', summary.wants, 'Wants');
  });
}

// Define the displaySummaryTable function
function displaySummaryTable(tableId, data, title) {
  var table = $('#' + tableId);
  table.empty();

  // Add table title
  $('<caption></caption>').text(title).appendTo(table);

  // Create and append table header
  var thead = $('<thead></thead>').appendTo(table);
  var headerRow = $('<tr><th>txn_id</th><th>Resource</th><th>Amount</th><th>Who</th></tr>').appendTo(thead);

  // Create and append table body
  var tbody = $('<tbody></tbody>').appendTo(table);

  data.forEach(function(entry) {
    var row = $('<tr><td>' + entry.txn_id + '</td><td>' + entry.resource + '</td><td>' + entry.amount + '</td><td>' + entry.byWhomForWhom + '</td></tr>').appendTo(tbody);
  });
}
