<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>{% block title %}Analysator{% endblock %}</title>

    <link href="/components/bootstrap/dist/css/bootstrap.css" type="text/css" rel="stylesheet">
    <link href="/components/morrisjs/morris.css" type="text/css" rel="stylesheet">
    <link href="/components/select2/select2.css" type="text/css" rel="stylesheet">
    <link href="/components/select2/select2-bootstrap.css" type="text/css" rel="stylesheet">
    <link href="/css/style.css" type="text/css" rel="stylesheet">

    {% block head %}{% endblock %}

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>

  <body {% block bodyclass %}{% endblock %}>

    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Analysator</a>
        </div>
      </div>
    </div>

    {% block content %}{% endblock %}

    {% block footer %}{% endblock %}

    <script type="text/javascript" src="/components/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="/components/underscore/underscore.js"></script>
    <script type="text/javascript" src="/components/momentjs/moment.js"></script>
    <script type="text/javascript" src="/components/select2/select2.js"></script>
    <script type="text/javascript" src="/components/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="/components/raphael/raphael.js"></script>
    <script type="text/javascript" src="/components/morrisjs/morris.js"></script>

    {% block scripts %}{% endblock %}

  </body>
</html>