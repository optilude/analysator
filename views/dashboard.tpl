{% extends 'layout.tpl' %}

{% block content %}
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-2 col-md-2 sidebar">
          <ul class="nav nav-sidebar">
            <li class="active"><a href="/">Query</a></li>
        </div>

        {% block body %}
        {% endblock %}

      </div>
    </div>
{% endblock %}