{% extends 'dashboard.tpl' %}

{% block body %}
<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
  <h1 class="page-header">Ad-hoc query</h1>

  <form class="form-horizontal parameters-form" role="form">
    <div class="form-group">
      <label class="col-md-1 control-label connectionString" for="connectionString">Connection</label>
      <div class="col-md-5">
        <input type="text" name="connectionString" class="form-control connectionString" placeholder="postgres://user:password@host/db" />
      </div>
    </div>
    <div class="form-group">
      <label class="col-md-1 control-label" for="query">Query</label>
      <div class="col-md-11">
        <textarea name="query" class="form-control query" placeholder="SELECT * FROM table"></textarea>
      </div>
    </div>
    <div class="form-group">
      <div class="col-md-11 col-md-offset-1">
        <button type="submit" class="btn btn-success run">Run</button>
        <button type="button" class="btn btn-primary configure-chart" disabled>Chart</button>
      </div>
    </div>
  </form>

  <h2 class="sub-header">Results</h2>
  <div class="table-responsive">
    <table class="table table-striped results">
      <thead>
        <tr>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  </div>
</div>
{% endblock %}

{% block footer %}
<div class="modal fade" id="chartModal" tabindex="-1" role="dialog" aria-labelledby="chartModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="chartModalLabel">Chart settings</h4>
      </div>
      <div class="modal-body">
        <form role="form">
          <div class="form-group">
            <label for="chartType">Chart type</label>
            <select class="form-control" id="chartType">
              <option value="" default>(No chart)</option>
              <option value="Line">Line chart</option>
              <option value="Area">Area chart</option>
              <option value="Bar">Bar chart</option>
              <option value="Donut">Donut chart</option>
            </select>
          </div>
          <div class="form-group">
            <label for="xkey">Keys (X axis)</label>
            <select class="form-control" id="xkey">
              <!-- populate with keys -->
            </select>
          </div>
          <div class="form-group">
            <label for="ykeys">Series (Y axis)</label>
            <select multiple class="form-control" id="ykeys">
              <!-- populate with keys -->
            </select>
          </div>
          <div class="form-group">
            <label for="goals">Goal lines (horizontal) &mdash; line and area chart only</label>
            <input type="text" class="form-control" id="goals" placeholder="1.0, -0.5" />
          </div>
          <div class="form-group">
            <label for="events">Event lines vertical &mdash; line and area chart only</label>
            <input type="text" class="form-control" id="events" placeholder="2014-01-01, 2014-02-01" />
          </div>
          <div class="checkbox">
            <label>
              <input id="smoothLines" type="checkbox" checked /> Smooth lines (line and area chart only)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input id="parseTime" type="checkbox" checked /> Time series (line and area chart only)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input id="stacked" type="checkbox" /> Stacked (bar chart only)
            </label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
      </div>
    </div>
  </div>
</div>
{% endblock %}

{% block scripts %}
<script type="text/javascript">

/** State **/

var currentData = null,
    currentChartSettings = null,
    storage = localStorage;

/** Local storage **/

$(".connectionString").val(storage.connectionString || "");
$(".connectionString").change(function() {
  storage.connectionString = $(this).val();
});

$(".query").val(storage.query || "");
$(".query").change(function() {
  storage.query = $(this).val();
});

currentChartSettings = storage.chartSettings? JSON.parse(storage.chartSettings) : null;

/** Execute query **/

$(".run").click(function(event) {
  event.preventDefault();

  var connectionString = $(".connectionString").val(),
      query = $(".query").val();

  if(!connectionString || !query) {
    return;
  }

  $.post("/query", {
    connectionString: connectionString,
    query: query
  })
  .done(function(data, status, xhr) {
    currentData = data;

    $(".configure-chart").prop('disabled', false);

    renderTable(data);
    renderChart(data);
  })
  .fail(function(xhr, status, error) {
    alert(xhr.responseText);

    $(".configure-chart").prop('disabled', true);
  });

});

/** Configure chart **/

$("#chartType").select2();
$("#xkey").select2();
$("#ykeys").select2();

$(".configure-chart").click(function(event) {
  event.preventDefault();
  $("#chartModal").modal();
});

$("#chartModal").on('shown.bs.modal', function(event) {
  // Populate xkey and ykeys arrays from current fields
  $("#xkey").empty();
  $("#ykeys").empty();

  if(currentData) {
    currentData.fields.forEach(function(field) {
      $("#xkey").append('<option val="' + field.name + '">' + field.name + '</option>');
      $("#ykeys").append('<option val="' + field.name + '">' + field.name + '</option>');
    });
  }

  updateChartSettings(currentChartSettings);
});

$("#chartModal").on('hidden.bs.modal', function(event) {
  currentChartSettings = getChartSettings();
  storage.chartSettings = JSON.stringify(currentChartSettings);

  renderChart();
});

function getChartSettings() {
  return {
    type: $("#chartType").val()? $("#chartType").val() : null,
    xkey: $("#xkey").val(),
    ykeys: $("#ykeys").val(),
    goals: $("#goals").val()? $("#goals").val().split(',').map(function(e) { return e.trim(); }) : [],
    events: $("#events").val()? $("#events").val().split(',').map(function(e) { return e.trim(); }): [],
    smoothLines: $("#smoothLines:checked").length > 0,
    parseTime: $("#parseTime:checked").length > 0,
    stacked: $("#stacked:checked").length > 0
  };
}

function updateChartSettings(settings) {
  $("#chartType").val(settings.type);
  $("#xkey").select2('val', settings.xkey);
  $("#ykeys").select2('val', settings.ykeys);
  $("#goals").val(settings.goals? settings.goals.join(", ") : "");
  $("#events").val(settings.events? settings.events.join(", ") : "");
  $("#smoothLines").prop('checked', settings.smoothLines !== undefined? settings.smoothLines : true);
  $("#parseTime").prop('checked', settings.parseTime !== undefined? settings.parseTime : true);
  $("#stacked").prop('checked', settings.stacked !== undefined? settings.stacked : false);
}

/** Render table **/

function renderTable(data) {
  $(".results thead tr").empty();
  $(".results tbody").empty();

  data.fields.forEach(function(field) {
    $(".results thead tr").append("<th>" + field.name + "</th>");
  });

  data.rows.forEach(function(row) {
    var tr = $("<tr></tr>");
    data.fields.forEach(function(field) {
      var val = row[field.name];

      if(field.dataTypeID === 1082) {
        val = moment(val).format("MM/DD/YYYY");
      }

      tr.append("<td>" + val + "</td>");
    });
    $(".results tbody").append(tr);
  });
}

/** Render chart **/

function renderChart(data) {

  // TODO: Render Morris chart

}

</script>
{% endblock %}
