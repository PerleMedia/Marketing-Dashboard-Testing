/****************************
** Initialize Page and API **
****************************/

gapi.analytics.ready(function() { 
  
  // Authorize the user immediately if the user has already granted access.
  // If no access has been created, render an authorize button inside the
  // element with the ID "embed-api-auth-container".
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: developerClientID
  });

  // Charts to render on load
  renderWeeklySessions();
  renderWeeklyConversions();
  renderTopCitiesWeekChart();
  renderTopDevicesWeekChart();
  renderSessionsOverTime();
  renderTopBrowsersChart();
  renderTopCountriesChart();
  renderTopDevicesChart();

  // Set week to default date and add date range selector  
  var customDateRange = {
    'start-date': '7daysAgo',
    'end-date': 'today'
  };

  var dateRangeSelector = new gapi.analytics.ext.DateRangeSelector({
    container: 'date-range-selector-container'
  })
  .set(customDateRange)
  .execute();

  dateRangeSelector.on('change', function(data) {
    var datefield = document.getElementById('from-dates');
    datefield.textContent = data['start-date'] + ' - ' + data['end-date'];

    // Charts to rerender when new dates are selected
    renderSessionsOverTime(data['start-date'], data['end-date']);
    renderTopBrowsersChart(data['start-date'], data['end-date']);
    renderTopCountriesChart(data['start-date'], data['end-date']);
    renderTopDevicesChart(data['start-date'], data['end-date']);
  });

/****************************
*** Google Analytics Data ***
****************************/
  
  /** Compare this week's and last week's sessions **/
  function renderWeeklySessions() {

    var thisWeek = query({
      'ids': analyticsViewID,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': '7daysAgo',
      'end-date': 'today'
    });

    var lastWeek = query({
      'ids': analyticsViewID,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': '14daysAgo',
      'end-date': '8daysAgo'
    });

    Promise.all([thisWeek, lastWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var labels = results[1].rows.map(function(row) { return +row[0]; });
      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      // Set chart styles
      var data = {
        labels : labels,
        datasets : [
          {
            label: 'Last Week',
            fillColor : hexToRgbA(colorGray, .5),
            strokeColor : hexToRgbA(colorGray, 1),
            pointColor : hexToRgbA(colorGray, 1),
            pointStrokeColor : '#fff',
            data : data2
          },
          {
            label: 'This Week',
            fillColor : hexToRgbA(colorBlue, .5),
            strokeColor : hexToRgbA(colorBlue, 1),
            pointColor : hexToRgbA(colorBlue, 1),
            pointStrokeColor : '#fff',
            data : data1
          }
        ]
      };

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-1-container')).Line(data);
      generateLegend('legend-1-container', data.datasets);
    });
  }

  /** Compare this week's and last week's conversions **/
  function renderWeeklyConversions() {

    var thisWeek = query({
      'ids': analyticsViewID,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:goalCompletionsAll',
      'start-date': '7daysAgo',
      'end-date': 'today'
    });

    var lastWeek = query({
      'ids': analyticsViewID,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:goalCompletionsAll',
      'start-date': '14daysAgo',
      'end-date': '8daysAgo'
    });

    Promise.all([thisWeek, lastWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var labels = results[1].rows.map(function(row) { return +row[0]; });
      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      // Set chart styles
      var data = {
        labels : labels,
        datasets : [
          {
            label: 'Last Week',
            fillColor : hexToRgbA(colorGray, .5),
            strokeColor : hexToRgbA(colorGray, 1),
            pointColor : hexToRgbA(colorGray, 1),
            pointStrokeColor : '#fff',
            data : data2
          },
          {
            label: 'This Week',
            fillColor : hexToRgbA(colorBlue, .5),
            strokeColor : hexToRgbA(colorBlue, 1),
            pointColor : hexToRgbA(colorBlue, 1),
            pointStrokeColor : '#fff',
            data : data1
          }
        ]
      };

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-2-container')).Line(data);
      generateLegend('legend-2-container', data.datasets);
    });
  }

  /** Top cities this week **/
  function renderTopCitiesWeekChart() {
    query({
      'ids': analyticsViewID,
      'dimensions': 'ga:city',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': 5,
      'start-date': '7daysAgo',
      'end-date': 'today',
      'filters': 'ga:city!=(not set)'
    })
    .then(function(response) {

      var data = [];

      // Set chart styles
      var colors = [color1, color2, color3, color4, color5];

      response.rows.forEach(function(row, i) {
        data.push({
          label: row[0],
          value: +row[1],
          color: colors[i]
        });
      });

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-3-container')).Doughnut(data);
      generateLegend('legend-3-container', data);
    });
  }

  /** Top devices this week **/
  function renderTopDevicesWeekChart() {
    query({
      'ids': analyticsViewID,
      'dimensions': 'ga:deviceCategory',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': 5,
      'start-date': '7daysAgo',
      'end-date': 'today'
    })
    .then(function(response) {

      var data = [];

      // Set chart styles
      var colors = [color1, color2, color3, color4, color5];

      response.rows.forEach(function(row, i) {
        data.push({
          label: row[0],
          value: +row[1],
          color: colors[i]
        });
      });

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-4-container')).Doughnut(data);
      generateLegend('legend-4-container', data);
    });
  }

  /** Total sessions in given time period (selected by datepicker) **/
  function renderSessionsOverTime(startDate, endDate) {

    var thisWeek = query({
      'ids': analyticsViewID,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': startDate,
      'end-date': endDate
    });
    
    Promise.all([thisWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var labels = results[0].rows.map(function(row) { return +row[0]; });

      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      // Set chart styles
      var data = {
        labels : labels,
        datasets : [
          {
            label: 'This Week',
            fillColor : 'rgba(151,187,205,0.5)',
            strokeColor : 'rgba(151,187,205,1)',
            pointColor : 'rgba(151,187,205,1)',
            pointStrokeColor : '#fff',
            data : data1
          }
        ]
      };

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-12-container')).Line(data);
      generateLegend('legend-12-container', data.datasets);
    });
  }

  /** Top browsers in given time period (selected by datepicker) **/
  function renderTopBrowsersChart(startDate, endDate) {

    query({
      'ids': analyticsViewID,
      'dimensions': 'ga:browser',
      'metrics': 'ga:pageviews',
      'sort': '-ga:pageviews',
      'max-results': 8,
      'start-date': startDate,
      'end-date': endDate
    })
    .then(function(response) {

      var data = [];

      // Set chart styles
      var colors = [color1, color2, color3, color4, color5];

      response.rows.forEach(function(row, i) {
        data.push({ value: +row[1], color: colors[i], label: row[0] });
      });

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-31-container')).Doughnut(data);
      generateLegend('legend-31-container', data);
    });
  }

  /** Top countries in given time period (selected by datepicker) **/
  function renderTopCountriesChart(startDate, endDate) {
    query({
      'ids': analyticsViewID,
      'dimensions': 'ga:country',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': 8,
      'start-date': startDate,
      'end-date': endDate
    })
    .then(function(response) {

      var data = [];

      // Set chart styles
      var colors = ['#4D5360','#949FB1','#D4CCC5','#E2EAE9','#F7464A'];

      response.rows.forEach(function(row, i) {
        data.push({
          label: row[0],
          value: +row[1],
          color: colors[i]
        });
      });

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-41-container')).Doughnut(data);
      generateLegend('legend-41-container', data);
    });
  }

  /** Top devices in given time period (selected by datepicker) **/
  function renderTopDevicesChart(startDate, endDate) {
    query({
      'ids': analyticsViewID,
      'dimensions': 'ga:deviceCategory',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': 5,
      'start-date': startDate,
      'end-date': endDate
    })
    .then(function(response) {

      var data = [];

      // Set chart styles
      var colors = ['#4D5360','#949FB1','#D4CCC5','#E2EAE9','#F7464A'];

      response.rows.forEach(function(row, i) {
        data.push({
          label: row[0],
          value: +row[1],
          color: colors[i]
        });
      });

      // Insert chart and legend into specified containers
      new Chart(makeCanvas('chart-51-container')).Doughnut(data);
      generateLegend('legend-51-container', data);
    });
  }

/****************************
** Chart.js Init and Style **
****************************/

  /**
   * Extend the Embed APIs `gapi.analytics.report.Data` component to
   * return a promise the is fulfilled with the value returned by the API.
   * @param {Object} params The request parameters.
   * @return {Promise} A promise.
   */
  function query(params) {
    return new Promise(function(resolve, reject) {
      var data = new gapi.analytics.report.Data({query: params});
      data.once('success', function(response) { resolve(response); })
          .once('error', function(response) { reject(response); })
          .execute();
    });
  }


  /**
   * Create a new canvas inside the specified element. Set it to be the width
   * and height of its container.
   * @param {string} id The id attribute of the element to host the canvas.
   * @return {RenderingContext} The 2D canvas context.
   */
  function makeCanvas(id) {
    var container = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
  }


  /**
   * Create a visual legend inside the specified element based off of a
   * Chart.js dataset.
   * @param {string} id The id attribute of the element to host the legend.
   * @param {Array.<Object>} items A list of labels and colors for the legend.
   */
  function generateLegend(id, items) {
    var legend = document.getElementById(id);
    legend.innerHTML = items.map(function(item) {
      var color = item.color || item.fillColor;
      var label = item.label;
      return '<li><i style="background:' + color + '"></i>' +
          escapeHtml(label) + '</li>';
    }).join('');
  }


  // Set some global Chart.js defaults.
  Chart.defaults.global.animationSteps = 60;
  Chart.defaults.global.animationEasing = 'easeInOutQuart';
  Chart.defaults.global.responsive = true;
  Chart.defaults.global.maintainAspectRatio = false;


  /**
   * Escapes a potentially unsafe HTML string.
   * @param {string} str An string that may contain HTML entities.
   * @return {string} The HTML-escaped string.
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

});


//Additional scripts
function hexToRgbA(hex, alpha){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + alpha + ')';
  }
  throw new Error('Bad Hex');
}

document.getElementById('site-title').innerHTML = siteAddress;