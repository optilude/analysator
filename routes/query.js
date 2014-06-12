/*jshint globalstrict:true, devel:true */
/*global require, module, exports, process, __dirname */
"use strict";


var pg = require('pg');

/*
 * GET a query result.
 *
 * Super evil mega security hole.
 */

exports.run = function(req, res){

    // forgive me...
    var connectionString = req.body.connectionString,
        query = req.body.query || "";

    query = query.trim();

    if(query.toLowerCase().indexOf("select") !== 0 || (query.indexOf(";") > 0 && query.indexOf(";") !== query.length -1)) {
        res.send(403, "Only single SELECT queries are permitted.");
    }

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.error(err);
            res.send(500, "Could not connect to pool");
            return;
        }

        client.query(query, function(err, result) {
            done();

            if (err) {
                console.error(err);
                res.send(500, err.toString());
                return;
            }

            res.send(200, result);
        });
    });

};
