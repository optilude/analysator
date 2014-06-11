{% extends 'layout.tpl' %}

{% block content %}
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
          <ul class="nav nav-sidebar">
            <li class="active"><a href="#">Overview</a></li>
            <!-- <li><a href="#">Reports</a></li>
            <li><a href="#">Analytics</a></li>
            <li><a href="#">Export</a></li> -->
          </ul>
        </div>

        {% block body %}
        {% endblock %}

      </div>
    </div>
{% endblock %}