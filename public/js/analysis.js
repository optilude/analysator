/*jshint globalstrict:true, devel:true */
/*global jQuery, moment, localStorage, _, bootbox, Morris, window */

"use strict";

(function($, _, moment, bootbox, Morris, localStorage) {

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

    /** Storage manager **/
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

    StorageManager.prototype.listStorages = function() {
        return _.keys(this.storage).sort();
    };

    /** Analysis model **/
    var Analysis = function(name, storage) {
        this.name = name;
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

    Analysis.prototype.clone = function(newName, newStorage) {
        var analysis = new Analysis(newName, newStorage);

        analysis.connectionString = this.connectionString;
        analysis.query = this.query;
        analysis.chartSettings = this.chartSettings;
        analysis.currentData = this.currentData;

        return analysis;
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

    /** Analysis view **/
    var AnalysisView = function(context, storageManager, initialAnalysis) {
        this.$el = $(context);

        this.storageManager = storageManager;
        this.loadAnalysis(initialAnalysis);
    };

    AnalysisView.prototype.loadAnalysis = function(name) {
        this.analysis = new Analysis(name, this.storageManager.getStorage(name));
        this.analysis.load();
    };

    AnalysisView.prototype.$ = function(selector) {
        return this.$el.find(selector);
    };

    AnalysisView.prototype.bindEvents = function()  {
        var self = this;

        self.$(".sidebar").on('click', 'a', function(e) {
            e.preventDefault();
            var name = $(this).attr('data-analysis');

            self.loadAnalysis(name);
            self.initialize();
        });

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
            self.renderChart();
        });

        self.$(".save").click(function(e) {
            e.preventDefault();
            self.analysis.save();
        });

        self.$(".save-as").click(function(e) {
            e.preventDefault();
            self.saveAs();
        });

        self.$(".delete").click(function(e) {
            e.preventDefault();
            self.deleteAnalysis();
        });

        function currentDataKeys() {
            return self.analysis.currentData?
                {results: self.analysis.currentData.fields.map(function(e) { return {id: e.name, text: e.name}; })}
                : [];
        }

        self.$(".chartType").select2();
        self.$(".xkey").select2({data: currentDataKeys});
        self.$(".ykeys").select2({data: currentDataKeys, multiple: true});
    };

    AnalysisView.prototype.initialize = function() {
        var self = this;

        self.renderNavigation();

        self.$(".connectionString").val(self.analysis.connectionString);
        self.$(".query").val(self.analysis.query);

        if(self.analysis.chartSettings) {
            self.renderChartSettings();
        }

        self.renderTable();
        self.renderChart();
    };

    AnalysisView.prototype.runQuery = function() {
        var self = this;

        self.analysis.runQuery()
        .done(function(data) {
            self.$(".configure-chart").prop('disabled', false);
            self.$(".save-as").prop('disabled', false);

            self.renderTable();
            self.renderChart();
        })
        .fail(function(error) {
            alert(error);
            self.$(".configure-chart").prop('disabled', true);
            self.$(".save-as").prop('disabled', true);
        });
    };

    AnalysisView.prototype.clearTable = function(first_argument) {
        var self = this;

        self.$(".results thead tr").empty();
        self.$(".results tbody").empty();
    };

    AnalysisView.prototype.renderTable = function() {
        var self = this,
            data = self.analysis.currentData;

        self.clearTable();

        if(!data) {
            return;
        }

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

        if(!settings || !settings.type || !data || !data.rows) {
            self.$(".chart-container").hide();
            return;
        }

        self.$(".chart-container").show();
        self.$(".chart-area").empty();

        var Chart = Morris[settings.type];
        new Chart(_.extend({}, settings, {
            element: self.$('.chart-area'),
            data: data.rows,
            labels: settings.ykeys,
            hideHover: 'auto',
            dateFormat: settings.parseTime? function(d) { return moment(d).format("DD/MM/YYYY"); } : null,
            xLabelAngle: 45
        }));

    };

    AnalysisView.prototype.saveChartSettings = function() {
        var self = this;

        self.analysis.chartSettings = {
            type: self.$(".chartType").select2('val')? self.$(".chartType").select2('val') : null,
            xkey: self.$(".xkey").select2('val'),
            ykeys: self.$(".ykeys").select2('val'),
            goals: self.$(".goals").val()? self.$(".goals").val().split(',').map(function(e) { return e.trim(); }) : [],
            events: self.$(".events").val()? self.$(".events").val().split(',').map(function(e) { return e.trim(); }): [],
            preUnits: self.$(".preUnits").val(),
            postUnits: self.$(".postUnits").val(),
            smoothLines: self.$(".smoothLines:checked").length > 0,
            parseTime: self.$(".parseTime:checked").length > 0,
            stacked: self.$(".stacked:checked").length > 0
        };
    };

    AnalysisView.prototype.renderChartSettings = function() {
        var self = this,
            data = self.analysis.currentData,
            settings = self.analysis.chartSettings || {};

        self.$(".chartType").select2('val', settings.type);
        self.$(".xkey").select2('val', settings.xkey);
        self.$(".ykeys").select2('val', settings.ykeys);
        self.$(".goals").val(settings.goals? settings.goals.join(", ") : "");
        self.$(".events").val(settings.events? settings.events.join(", ") : "");
        self.$(".preUnits").val(settings.preUnits);
        self.$(".postUnits").val(settings.postUnits);
        self.$(".smoothLines").prop('checked', settings.smoothLines !== undefined? settings.smoothLines : true);
        self.$(".parseTime").prop('checked', settings.parseTime !== undefined? settings.parseTime : true);
        self.$(".stacked").prop('checked', settings.stacked !== undefined? settings.stacked : false);
    };

    AnalysisView.prototype.renderNavigation = function() {
        var self = this,
            $sidebar = self.$(".nav-sidebar.saved-analyses");

        $sidebar.empty();

        self.storageManager.listStorages().forEach(function(name) {
            if(name === 'default') {
                return;
            }

            $sidebar.append("<li><a data-analysis='" + name + "' href='#'>" + name + "</a></li>");
        });

        self.$(".sidebar .active").removeClass('active');
        self.$(".sidebar a[data-analysis='" + self.analysis.name + "']").parent().addClass('active');
    };

    AnalysisView.prototype.saveAs = function() {
        var self = this;

        bootbox.prompt("Please choose a name", function(newName) {
            if(!newName) {
                return;
            }

            self.analysis = self.analysis.clone(newName, self.storageManager.getStorage(newName));
            self.analysis.save();

            self.renderNavigation();
        });
    };

    AnalysisView.prototype.deleteAnalysis = function() {
        var self = this,
            name = self.analysis.name;

        bootbox.confirm("Are you sure you want to delete the analysis '" + name + "'?", function(result) {
            if(result) {
                self.storageManager.deleteStorage(name);

                self.analysis = new Analysis('default', self.storageManager.getStorage('default'));
                self.analysis.load();

                self.initialize();
            }
        });
    };

    /** Export **/

    if(!window.Analysator) {
        window.Analysator = {};
    }

    window.Analysator.StorageManager = StorageManager;
    window.Analysator.Analysis = Analysis;
    window.Analysator.AnalysisView = AnalysisView;

})(jQuery, _, moment, bootbox, Morris, localStorage);