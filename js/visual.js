if (!d3.chart) {
  d3.chart = {};
}

d3.chart.visual = function() {
  var div,
      svg,
      xScale,
      xAxis,
      xAxisGroup,
      yScale,
      yAxis,
      yAxisGroup,
      nodes,
      nodesEnter,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  function todaysDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    return new Date(yyyy + '-' + mm + '-' + dd);
  }

  function age(birthdate) {
    var today = todaysDate();
    var bday = new Date(birthdate);
    var age = ((today - bday) / 31536000000).toFixed(2); // Milliseconds in a year

    return parseFloat(age);
  }

  function yearsAtWork(startdate) {
    var today = todaysDate();
    var startDay = new Date(startdate);
    var months = ((today - startDay) / 31536000000).toFixed(2); // Milleseconds in a year
    return parseFloat(months);
  }

  function chart(container) {
    div = container;

    // XScale Toggle Form
    var scaleForm = div.append('form');
    var scaleHeading = scaleForm.append('h3').text('Toggle');
    var scaleInputOne = scaleForm.append('div').classed('input', true);
    var scaleInputTwo = scaleForm.append('div').classed('input', true);

    scaleInputOne
      .append('input')
      .attr({
        type: 'radio',
        name: 'scale',
        id: 'age',
        checked: true
      })
    scaleInputOne.append('label')
      .attr('for', 'age')
      .text('Age')

    scaleInputTwo.append('input')
      .attr({
        type: 'radio',
        name: 'scale',
        id: 'experience'
      })
    scaleInputTwo.append('label')
      .attr('for', 'experience')
      .text('Years At FINE')

    // Sort Form aka yScale Toggle Form
    var sortForm = div.append('form');
    var sortHeading = sortForm.append('h3').text('Sort');
    var sortInputOne = sortForm.append('div').classed('input', true);
    var sortInputTwo = sortForm.append('div').classed('input', true);
    var sortInputThree = sortForm.append('div').classed('input', true);

    sortInputOne
      .append('input')
      .attr({
        type: 'radio',
        name: 'sort',
        id: 'alphabetical',
        checked: true
      })
    sortInputOne.append('label')
      .attr('for', 'alphabetical')
      .text('Alphabetical')

    sortInputTwo.append('input')
      .attr({
        type: 'radio',
        name: 'sort',
        id: 'by_age'
      })
    sortInputTwo.append('label')
      .attr('for', 'by_age')
      .text('By Age')

    sortInputThree.append('input')
      .attr({
        type: 'radio',
        name: 'sort',
        id: 'by_years'
      })
    sortInputThree.append('label')
      .attr('for', 'by_years')
      .text('By Years At FINE')

    svg = div.append('svg').classed('visual', true)
      .attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
      })
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    svg.append('g').classed('x axis-group', true)
      .attr('transform', 'translate(0,' + height +')')
    svg.append('g').classed('y axis-group', true)

    xScale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return age(d.birthdate); })])
      .range([0, width])

    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')

    yScale = d3.scale.ordinal()
      .domain(data.map(function(d) { return d.name; }))
      .rangeRoundBands([0, height], .1)

    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');

    update();
  }

  chart.update = update;

  function update() {
    nodes = svg.selectAll('.node')
      .data(data, function(d) { return d.id; })

    nodesEnter = nodes.enter()
      .append('g').classed('node', true)
      .attr('transform', function(d) { return 'translate(0,' + yScale(d.name) + ')'; })

    nodesEnter.append('rect').classed('node-rect', true)
      .attr({
        x: 0,
        width: 0,
        height: yScale.rangeBand()
      })
      .transition().delay(function(d,i) { return i * 100; })
      .attr('width', function(d) { return xScale(age(d.birthdate)); });

    nodes.exit().remove();

    // X Axis
    xAxisGroup = svg.select('.x.axis-group');
    xAxis(xAxisGroup);
    svg
      .append('text')
      .text('Years')
      .attr({
        'text-anchor': 'middle',
        'transform': 'translate(' + (width / 2) + ',' + (height + margin.bottom) + ')',
        'dy': '-.35em'
      })

    // Y Axis
    yAxisGroup = svg.select('.y.axis-group');
    yAxis(yAxisGroup);

    d3.selectAll('input[name="scale"]')
      .on('change', function() {
        toggle(d3.select(this).attr('id'));
      })

    d3.selectAll('input[name="sort"]')
      .on('change', function() {
        sortDevs(d3.select(this).attr('id'));
      })
  }

  function toggle(value) {
    var domain,
        property,
        fn;

    if (value === 'age') {
      domain = [0, d3.max(data, function(d) { return age(d.birthdate); })];
      property = 'birthdate';
      fn = age;
    } else {
      domain = [0, d3.max(data, function(d) { return yearsAtWork(d.startdate); })];
      property = 'startdate';
      fn = yearsAtWork;
    }

    xScale.domain(domain);
    xAxis.scale(xScale);
    xAxisGroup.transition().call(xAxis);
    d3.selectAll('.node-rect').transition().attr('width', function(d) { return xScale(fn(d[property])); });
  }

  function sortDevs(value) {
    var sorted;

    if (value === 'alphabetical') {
      sorted = data.sort(function(a,b) { return d3.ascending(a.name, b.name); });
    } else if (value === 'by_age') {
      sorted = data.sort(function(a,b) { return new Date(a.birthdate) - new Date(b.birthdate); });
    } else {
      sorted = data.sort(function(a,b) { return new Date(a.startdate) - new Date(b.startdate); });
    }

    chart.data(sorted);
    yScale.domain(sorted.map(function(d) { return d.name; }));
    yAxis.scale(yScale);
    yAxisGroup.transition().duration(500).call(yAxis);
    nodesEnter.transition().duration(500).attr('transform', function(d) { return 'translate(0,' + yScale(d.name) + ')'; });
  }

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  }

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  }

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  }

  return chart;
};
