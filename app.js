/*jshint globalstrict:true, devel:true */
/*global require, module, exports, process, __dirname */
"use strict";

/**
 * Module dependencies.
 */

var express = require('express'),
    consolidate = require('consolidate'),
    swig = require('swig'),
    routes = require('./routes'),
    query = require('./routes/query'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.engine('tpl', consolidate.swig);

    app.configure('production', function() {
        swig.init({root: path.join(__dirname, 'views'), allowErrors: true});
    });

    app.configure('development', function(){
        swig.init({root: path.join(__dirname, 'views'), allowErrors: true, cache: false});
    });
    app.set('views', __dirname + '/views');
    app.set('view engine', 'tpl');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/query', query.run);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err) {
    console.error("Uncaught exception: ", err);
    if(err.stack) console.error(err.stack);
});