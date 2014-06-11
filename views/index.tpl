{% extends 'dashboard.tpl' %}

{% block body %}
<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
  <h1 class="page-header">Overview</h1>

  <div id="val">(chart here)</div>

  <h2 class="sub-header">Section title</h2>
  <div class="table-responsive">
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Header</th>
          <th>Header</th>
          <th>Header</th>
          <th>Header</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1,001</td>
          <td>Lorem</td>
          <td>ipsum</td>
          <td>dolor</td>
          <td>sit</td>
        </tr>
        <tr>
          <td>1,002</td>
          <td>amet</td>
          <td>consectetur</td>
          <td>adipiscing</td>
          <td>elit</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
{% endblock %}

{% block scripts %}
<script type="text/javascript">


$.post("/query", {
    query: 'SELECT COUNT(*) AS val FROM changes'
})
.done(function(data, status, xhr) {

    $("#val").text(_.keys(data[0]));

});

</script>
{% endblock %}
