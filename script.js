// Begin Analytics Embed
gapi.analytics.ready(function() {

  /**
   * Authorize the user immediately if the user has already granted access.
   * If no access has been created, render an authorize button inside the
   * element with the ID "embed-api-auth-container".
   */
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: '862258600110-jkk79eng4i9rpldoi6l8pj8t576b6gju.apps.googleusercontent.com'
  });
  
  
  /**
   * Store a set of common DataChart config options since they're shared by
   * both of the charts we're about to make.
   */
  var commonConfig = {
    query: {
      metrics: 'ga:sessions',
      dimensions: 'ga:date'
    },
    chart: {
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  };
  
  
  /**
   * Query params representing the first chart's date range.
   */
  var dateRange1 = {
    'start-date': '14daysAgo',
    'end-date': '8daysAgo'
  };
  
  
  /**
   * Query params representing the second chart's date range.
   */
  var dateRange2 = {
    'start-date': '7daysAgo',
    'end-date': 'yesterday'
  };
  
  
  /**
   * Create a new ViewSelector2 instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container',
  }).execute();
  
  
  /**
   * Create a new DateRangeSelector instance to be rendered inside of an
   * element with the id "date-range-selector-1-container", set its date range
   * and then render it to the page.
   */
  var dateRangeSelector1 = new gapi.analytics.ext.DateRangeSelector({
    container: 'date-range-selector-1-container'
  })
  .set(dateRange1)
  .execute();
  
  
  /**
   * Create a new DateRangeSelector instance to be rendered inside of an
   * element with the id "date-range-selector-2-container", set its date range
   * and then render it to the page.
   */
  var dateRangeSelector2 = new gapi.analytics.ext.DateRangeSelector({
    container: 'date-range-selector-2-container'
  })
  .set(dateRange2)
  .execute();
  
  
  /**
   * Create a new DataChart instance with the given query parameters
   * and Google chart options. It will be rendered inside an element
   * with the id "data-chart-1-container".
   */

  

  var dataChart1 = new gapi.analytics.googleCharts.DataChart(commonConfig)
      .set({query: dateRange1})
      .set({chart: {container: 'data-chart-1-container'}});
  
  
  /**
   * Create a new DataChart instance with the given query parameters
   * and Google chart options. It will be rendered inside an element
   * with the id "data-chart-2-container".
   */
  var dataChart2 = new gapi.analytics.googleCharts.DataChart(commonConfig)
      .set({query: dateRange2})
      .set({chart: {container: 'data-chart-2-container'}});
  
  
  /**
   * Register a handler to run whenever the user changes the view.
   * The handler will update both dataCharts as well as updating the title
   * of the dashboard.
   */
  viewSelector.on('viewChange', function(data) {
    dataChart1.set({query: {ids: data.ids}}).execute();
    dataChart2.set({query: {ids: data.ids}}).execute();
  
    var title = document.getElementById('view-name');
    title.textContent = data.property.name + ' (' + data.view.name + ')';
  });
  
  
  /**
   * Register a handler to run whenever the user changes the date range from
   * the first datepicker. The handler will update the first dataChart
   * instance as well as change the dashboard subtitle to reflect the range.
   */
  dateRangeSelector1.on('change', function(data) {
    dataChart1.set({query: data}).execute();
  
    // Update the "from" dates text.
    var datefield = document.getElementById('from-dates');
    datefield.textContent = data['start-date'] + '&mdash;' + data['end-date'];
  });
  
  
  /**
   * Register a handler to run whenever the user changes the date range from
   * the second datepicker. The handler will update the second dataChart
   * instance as well as change the dashboard subtitle to reflect the range.
   */
  dateRangeSelector2.on('change', function(data) {
    dataChart2.set({query: data}).execute();
  
    // Update the "to" dates text.
    var datefield = document.getElementById('to-dates');
    datefield.textContent = data['start-date'] + '&mdash;' + data['end-date'];
  });



// testing chart.js
function renderWeekOverWeekChart(ids) {

  // Adjust `now` to experiment with different days, for testing only...
  var now = moment(); // .subtract(3, 'day');

  var thisWeek = query({
    'ids': ids,
    'dimensions': 'ga:date,ga:nthDay',
    'metrics': 'ga:sessions',
    'start-date': moment(now).subtract(1, 'day').day(0).format('YYYY-MM-DD'),
    'end-date': moment(now).format('YYYY-MM-DD')
  });

  var lastWeek = query({
    'ids': ids,
    'dimensions': 'ga:date,ga:nthDay',
    'metrics': 'ga:sessions',
    'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week')
        .format('YYYY-MM-DD'),
    'end-date': moment(now).subtract(1, 'day').day(6).subtract(1, 'week')
        .format('YYYY-MM-DD')
  });

  Promise.all([thisWeek, lastWeek]).then(function(results) {

    var data1 = results[0].rows.map(function(row) { return +row[2]; });
    var data2 = results[1].rows.map(function(row) { return +row[2]; });
    var labels = results[1].rows.map(function(row) { return +row[0]; });

    labels = labels.map(function(label) {
      return moment(label, 'YYYYMMDD').format('ddd');
    });

    var data = {
      labels : labels,
      datasets : [
        {
          label: 'Last Week',
          fillColor : 'rgba(220,220,220,0.5)',
          strokeColor : 'rgba(220,220,220,1)',
          pointColor : 'rgba(220,220,220,1)',
          pointStrokeColor : '#fff',
          data : data2
        },
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

    new Chart(makeCanvas('chart-3-container')).Line(data);
    generateLegend('legend-3-container', data.datasets);
  });
}

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



  
  });