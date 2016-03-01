d3.json('teammates.json', function(err, teammates) {
  if (err) {
    return d3.select('.js-display').append('p').text('There was an error retrieving the data');
  }

  var data = teammates.teammates;
  var display = d3.select('.js-display');

  var visual = d3.chart.visual()
    .data(data)
  visual(display);
});
