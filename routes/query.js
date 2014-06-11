/*jshint globalstrict:true, devel:true */
/*global require, module, exports, process, __dirname */
"use strict";


var pg = require('pg'),
    config = require('../config');

var connection = {
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword
};

/*
 * GET a query result.
 *
 * Super evil mega security hole.
 */

exports.run = function(req, res){

    // forgive me...
    var query = req.body.query || "";

    if(query.toLowerCase().indexOf("select") !== 0 || query.indexOf(";") >= 0) {
        res.send(403, "Nein");
    }

    pg.connect(connection, function(err, client) {
        if (err) {
            pg.end();
            throw new Error(err);
        }

        client.query(query, function(err, result) {
            if (err) {
                pg.end();
                throw new Error(err);
            }

            res.send(200, result.rows);

        });
    });

};
