/*jshint globalstrict:true, devel:true */
/*global jQuery, moment, localStorage, _, window */

"use strict";

(function($, _, moment, localStorage) {

    /** Storage **/

    var Storage = function(name, manager, data) {
        if(data) {
            _.extend(this, data);
        }

        this._name = name;
        this._manager = manager;
    };

    Storage.prototype.save = function() {
        this._manager.saveStorage(this._name, _.omit(this, ['_name', '_manager', 'save']));
    };

    var StorageManager = function() {
        this.storage = localStorage;
    };

    StorageManager.prototype.getStorage = function(name) {
        var data = this.storage[name]? JSON.parse(this.storage[name]) : {};
        return new Storage(name, this, data);
    };

    StorageManager.prototype.saveStorage = function(name, data) {
        this.storage[name] = JSON.stringify(data);
    };

    StorageManager.prototype.deleteStorage = function(name) {
        delete this.storage[name];
    };

    /** Analysis model **/

    var Analysis = function(storage) {
        this.storage = storage;

        this.connectionString = null;
        this.query = null;
        this.chartSettings = null;

        this.currentData = null;
    };

    Analysis.prototype.load = function() {
        this.connectionString = this.storage.connectionString || "";
        this.query = this.storage.query || "";
        this.chartSettings = this.storage.chartSettings;
    };

    Analysis.prototype.save = function() {
        this.storage.connectionString = this.connectionString;
        this.storage.query = this.query;
        this.storage.chartSettings = this.chartSettings;

        this.storage.save();
    };

    Analysis.prototype.runQuery = function() {
        var self = this,
            deferred = $.Deferred();

        $.post("/query", {
            connectionString: self.connectionString,
            query: self.query
        })
        .done(function(data, status, xhr) {
            self.currentData = data;
            deferred.resolve(data);
        })
        .fail(function(xhr, status, error) {
            deferred.reject(xhr.responseText)    ;
        });

        return deferred;
    };

    /** View **/
    var AnalysisView = function(context, analysis) {
        this.$el = $(context);

        this.analysis = analysis;
    };

    AnalysisView.prototype.$ = function(selector) {
        return this.$el.find(selector);
    };

    AnalysisView.prototype.bindEvents = function()  {
        var self = this;

        self.$(".connectionString").change(function() {
            self.analysis.connectionString = $(this).val();
        });

        self.$(".query").change(function() {
            self.analysis.query = $(this).val();
        });

        self.$(".run").click(function(e) {
            e.preventDefault();
            self.runQuery();
        });

        self.$(".configure-chart").click(function(event) {
            event.preventDefault();
            $(".chartModal").modal();
        });

        self.$(".chartModal").on('shown.bs.modal', function(event) {
          self.renderChartSettings();
        });

        self.$(".chartModal").on('hidden.bs.modal', function(event) {
            self.saveChartSettings();
            self.analysis.save();

            self.renderChart();
        });
    };

    AnalysisView.prototype.initialize = function() {
        var self = this;

        self.$(".connectionString").val(self.analysis.connectionString);
        self.$(".query").val(self.analysis.query);

        if(self.analysis.chartSettings) {
            self.renderChartSettings();
        }

        function currentDataKeys() {
            return self.analysis.currentData?
                {results: self.analysis.currentData.fields.map(function(e) { return {id: e.name, text: e.name}; })}
                : [];
        }

        self.$(".chartType").select2();
        self.$(".xkey").select2({data: currentDataKeys});
        self.$(".ykeys").select2({data: currentDataKeys, multiple: true});
    };

    AnalysisView.prototype.runQuery = function() {
        var self = this;

        self.analysis.runQuery()
        .done(function(data) {
            self.$(".configure-chart").prop('disabled', false);

            self.analysis.save();
            self.renderTable();
            self.renderChart();
        })
        .fail(function(error) {
            alert(error);
            self.$(".configure-chart").prop('disabled', true);
        });

    };

    AnalysisView.prototype.renderTable = function() {
        var self = this,
            data = self.analysis.currentData;

        if(!data) {
            return;
        }

        self.$(".results thead tr").empty();
        self.$(".results tbody").empty();

        data.fields.forEach(function(field) {
            self.$(".results thead tr").append("<th>" + field.name + "</th>");
        });

        data.rows.forEach(function(row) {
            var tr = $("<tr></tr>");
            data.fields.forEach(function(field) {
                var val = row[field.name];

                if(field.dataTypeID === 1082) { // date columns
                    val = moment(val).format("MM/DD/YYYY");
                }

                tr.append("<td>" + val + "</td>");
            });

            self.$(".results tbody").append(tr);
        });
    };

    AnalysisView.prototype.renderChart = function() {
        var self = this,
            data = self.analysis.currentData,
            settings = self.analysis.chartSettings;

        // TODO: Render chart
    };

    AnalysisView.prototype.saveChartSettings = function() {
        var self = this;

        self.analysis.chartSettings = {
            type: self.$(".chartType").select2('val')? self.$(".chartType").select2('val') : null,
            xkey: self.$(".xkey").select2('val'),
            ykeys: self.$(".ykeys").select2('val'),
            goals: self.$(".goals").val()? self.$(".goals").val().split(',').map(function(e) { return e.trim(); }) : [],
            events: self.$(".events").val()? self.$(".events").val().split(',').map(function(e) { return e.trim(); }): [],
            smoothLines: self.$(".smoothLines:checked").length > 0,
            parseTime: self.$(".parseTime:checked").length > 0,
            stacked: self.$(".stacked:checked").length > 0
        };
    };

    AnalysisView.prototype.renderChartSettings = function() {
        var self = this,
            data = self.analysis.currentData,
            settings = self.analysis.chartSettings;

        if(!settings) {
            return;
        }

        self.$(".chartType").select2('val', settings.type);
        self.$(".xkey").select2('val', settings.xkey);
        self.$(".ykeys").select2('val', settings.ykeys);
        self.$(".goals").val(settings.goals? settings.goals.join(", ") : "");
        self.$(".events").val(settings.events? settings.events.join(", ") : "");
        self.$(".smoothLines").prop('checked', settings.smoothLines !== undefined? settings.smoothLines : true);
        self.$(".parseTime").prop('checked', settings.parseTime !== undefined? settings.parseTime : true);
        self.$(".stacked").prop('checked', settings.stacked !== undefined? settings.stacked : false);
    };

    /** Export **/

    if(!window.Analysator) {
        window.Analysator = {};
    }

    window.Analysator.StorageManager = StorageManager;
    window.Analysator.Analysis = Analysis;
    window.Analysator.AnalysisView = AnalysisView;

})(jQuery, _, moment, localStorage);