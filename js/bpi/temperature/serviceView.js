/*  This file is part of BeakPi.

    BeakPi is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    BeakPi is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with BeakPi.  If not, see <http://www.gnu.org/licenses/>. */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/when",
  "dojo/dom-attr",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "bpi/utils/util",
  "dojox/timing",
  "dojox/charting/Chart",
  "dojox/charting/axis2d/Default",
  "dojox/charting/plot2d/StackedLines",
  "dojox/charting/themes/Julie",
  "dojo/text!./templates/serviceView.html"
],

function(declare, lang, array, when, domAttr, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, util, timing, Chart, Default, StackedLines, Julie, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,
    intervalCurrentPlaying: new timing.Timer(1500),

    load: function() {
      when(util.getStoredTemps(), lang.hitch(this, function(res){
        var tempArray = [];
        console.log(res.rows);
        array.forEach(res.rows, lang.hitch(this, function (val) {
          tempArray.push(val.value.replace(/[^0-9.]+/g, ''));
        }));
        var c = new Chart("stacked");
        c.addPlot("default", {type: StackedLines})
        c.addAxis("x", {fixLower: "major", fixUpper: "major"})
        c.addAxis("y", {vertical: true, fixLower: "major", fixUpper: "major", min: 60})
        c.setTheme(Julie)
        //c.addSeries("Series 1", [1, 2, 3, 4, 5])

        c.addSeries("Series 2", tempArray, {stroke: {color: "red"}})
        c.render();
            
      }));
      
      when(this._updateCurrentTemp(), lang.hitch(this, function() {
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this._updateCurrentTemp();
        });
      }));
      this.intervalCurrentPlaying.start();
    },

    unload: function() {
      this.intervalCurrentPlaying.stop();
    },

    _updateCurrentTemp: function() {
      when(util.command("sudo usbtenkiget -T f"), lang.hitch(this, function(res) {
        domAttr.set(this._serviceView, "innerHTML", "Current Temperature: " + res);
      }));
      return;
      }
  });
});