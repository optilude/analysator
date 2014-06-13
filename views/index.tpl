{% extends 'layout.tpl' %}

{% block bodyclass %}analysator-main{% endblock %}

{% block content %}
<div class="container-fluid">
  <div class="row">
    <div class="col-sm-2 col-md-2 sidebar">
      <ul class="nav nav-sidebar">
        <li class="active"><a href="/">Query</a></li>
    </div>
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
  </div>
</div>
{% endblock %}

{% block footer %}
<div class="modal fade chartModal" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title">Chart settings</h4>
      </div>
      <div class="modal-body">
        <form role="form">
          <div class="form-group">
            <label for="chartType">Chart type</label>
            <select class="form-control chartType">
              <option value="" default>(No chart)</option>
              <option value="Line">Line chart</option>
              <option value="Area">Area chart</option>
              <option value="Bar">Bar chart</option>
              <option value="Donut">Donut chart</option>
            </select>
          </div>
          <div class="form-group">
            <label for="xkey">Keys (X axis)</label>
            <input type="hidden" class="form-control xkey" />
          </div>
          <div class="form-group">
            <label for="ykeys">Series (Y axis)</label>
            <input type="hidden" class="form-control ykeys" />
          </div>
          <div class="form-group">
            <label for="goals">Goal lines (horizontal) &mdash; line and area chart only</label>
            <input type="text" class="form-control goals"placeholder="1.0, -0.5" />
          </div>
          <div class="form-group">
            <label for="events">Event lines vertical &mdash; line and area chart only</label>
            <input type="text" class="form-control events" placeholder="2014-01-01, 2014-02-01" />
          </div>
          <div class="checkbox">
            <label>
              <input class="smoothLines" type="checkbox" checked /> Smooth lines (line and area chart only)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input class="parseTime" type="checkbox" checked /> Time series (line and area chart only)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input class="stacked" type="checkbox" /> Stacked (bar chart only)
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
<script type="text/javascript" src="/js/analysis.js"></script>
<script type="text/javascript">

  var storageManager = new Analysator.StorageManager(),
      storage = storageManager.getStorage('default'),
      analysis = new Analysator.Analysis(storage),
      view = new Analysator.AnalysisView(".analysator-main", analysis);

  analysis.load();
  view.bindEvents();
  view.initialize();

</script>
{% endblock %}
