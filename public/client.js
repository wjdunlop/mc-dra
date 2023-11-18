$(function() {
  console.log('hello world :o');

  function submitForm(endpoint, listId) {
    $('form.' + endpoint).submit(function(event) {
      event.preventDefault();
      var resource = $('form.' + endpoint + ' input[placeholder="resource"]').val();
      var amount = $('form.' + endpoint + ' input[placeholder="amount"]').val();
      var byWhomForWhom = $('form.' + endpoint + ' input[placeholder="' + (endpoint === 'intakes' ? 'by whom' : 'for whom') + '"]').val();

      var data = {
        resource: resource,
        amount: amount,
        byWhomForWhom: byWhomForWhom
      };

      $.post('/' + endpoint + '?' + $.param(data), function() {
        $('<li></li>').text(resource + ' - ' + amount + ' - ' + byWhomForWhom).appendTo('ul#' + listId);
        $('form.' + endpoint + ' input').val('');
        $('form.' + endpoint + ' input').focus();
      });
    });
  }

  submitForm('intake', 'intakes');
  submitForm('need', 'needs');
  submitForm('want', 'wants');

  // Fetch existing intakes
  $.get('/intake', function(intakes) {
    intakes.forEach(function(intake) {
      $('<li></li>').text(intake.resource + ' - ' + intake.amount + ' - ' + intake.byWhomForWhom).appendTo('ul#intakes');
    });
  });

  // Fetch existing needs
  $.get('/need', function(needs) {
    needs.forEach(function(need) {
      $('<li></li>').text(need.resource + ' - ' + need.amount + ' - ' + need.byWhomForWhom).appendTo('ul#needs');
    });
  });

  // Fetch existing wants
  $.get('/want', function(wants) {
    wants.forEach(function(want) {
      $('<li></li>').text(want.resource + ' - ' + want.amount + ' - ' + want.byWhomForWhom).appendTo('ul#wants');
    });
  });
});
