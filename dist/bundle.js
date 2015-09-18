(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ctrl, Intersection, S, Traffic, _, signalDer, visDer;

_ = require('lodash');

S = require('./settings');

Intersection = (function() {
  function Intersection(row1, col1) {
    var left_right, up_down;
    this.row = row1;
    this.col = col1;
    this.id = _.uniqueId('intersection-');
    this.lanes = {};
    up_down = [];
    left_right = [];
    this.cars_waiting = {
      up: up_down,
      down: up_down,
      left: left_right,
      right: left_right,
      up_down: up_down,
      left_right: left_right
    };
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
    this.signal = new Signal;
  }

  Intersection.prototype.receive = function(car) {
    car.set_at_intersection(true);
    return this.cars_waiting[car.lane.direction].push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane.direction] = lane;
  };

  Intersection.prototype.turn_car = function(c) {
    var new_lane, ref;
    new_lane = this.lanes[c.turns[0]];
    if (new_lane.is_free()) {
      _.remove(cars, c);
      c.turns.shift();
      if ((ref = c.lane) != null) {
        ref.remove(c);
      }
      c.set_lane(new_lane);
      return new_lane.receive(c);
    }
  };

  Intersection.prototype.tick = function() {
    var cars;
    this.signal.tick();
    cars = this.cars_waiting[this.signal.direction];
    return _.forEach(cars, this.turn_car);
  };

  return Intersection;

})();

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.directions = ['up', 'right', 'down', 'left'];

  Traffic.prototype.setup = function() {
    var dir, i, j, k, l, lane, len, ref, ref1, ref2, results, results1;
    ref = [[], []], this.intersections = ref[0], this.lanes = ref[1];
    this.grid = (function() {
      results = [];
      for (var k = 0, ref1 = S.size; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var k, ref1, results;
        return (function() {
          results = [];
          for (var k = 0, ref1 = S.size; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--){ results.push(k); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
          return intersection;
        });
      };
    })(this));
    ref2 = this.intersections;
    results1 = [];
    for (l = 0, len = ref2.length; l < len; l++) {
      i = ref2[l];
      results1.push((function() {
        var len1, m, ref3, results2;
        ref3 = this.directions;
        results2 = [];
        for (m = 0, len1 = ref3.length; m < len1; m++) {
          dir = ref3[m];
          j = (function() {
            var ref4, ref5;
            switch (dir) {
              case 'up':
                return (ref4 = this.grid[i.row - 1]) != null ? ref4[i.col] : void 0;
              case 'right':
                return this.grid[i.row][i.col + 1];
              case 'down':
                return (ref5 = this.grid[i.row + 1]) != null ? ref5[i.col] : void 0;
              case 'left':
                return this.grid[i.row][i.col - 1];
            }
          }).call(this);
          if (j) {
            this.lanes.push((lane = new Lane(i, j, dir)));
            results2.push(i.set_beg_lane(lane));
          } else {
            results2.push(void 0);
          }
        }
        return results2;
      }).call(this));
    }
    return results1;
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    return _.invoke(this.lanes, 'tick');
  };

  return Traffic;

})();

Ctrl = (function() {
  function Ctrl(scope1, el1) {
    this.scope = scope1;
    this.el = el1;
    this.paused = true;
    this.scope.S = S;
    this.scope.traffic = new Traffic;
  }

  Ctrl.prototype.place_car = function(car) {
    return "translate(" + car.x + "," + car.y + ")";
  };

  Ctrl.prototype.place_intersection = function(d) {
    return "translate(" + d.pos.x + "," + d.pos.y + ")";
  };

  Ctrl.prototype.place_lane = function(d) {
    return "M " + d.a.x + "," + d.a.y + " L " + d.b.x + "," + d.b.y;
  };

  Ctrl.prototype.click = function(val) {
    if (!val) {
      return this.play();
    }
  };

  Ctrl.prototype.pause = function() {
    return this.paused = true;
  };

  Ctrl.prototype.tick = function() {
    return d3.timer((function(_this) {
      return function() {
        _this.scope.traffic.tick();
        _this.scope.$evalAsync();
        if (!_this.paused) {
          _this.tick();
        }
        return true;
      };
    })(this), S.pace);
  };

  Ctrl.prototype.play = function() {
    this.pause();
    d3.timer.flush();
    this.paused = false;
    return this.tick();
  };

  return Ctrl;

})();

visDer = function() {
  var directive;
  return directive = {
    scope: {},
    controllerAs: 'vm',
    templateUrl: './dist/vis.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

signalDer = function() {
  var directive;
  return directive = {
    scope: {
      direction: '='
    },
    link: function(scope, el, attr) {
      var signals;
      signals = d3.select(el[0]).selectAll('signals').data(['up_down', 'left_right', 'up_down', 'left_right']).enter().append('rect').attr({
        width: 1.2,
        height: .6,
        "class": 'signal',
        y: -1.2,
        x: -.6,
        transform: function(d, i) {
          return "rotate(" + (90 * i) + ")";
        }
      });
      return scope.$watch('direction', function(newVal) {
        return signals.classed('on', function(d) {
          return d === newVal;
        });
      });
    }
  };
};

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./mfd":6,"./settings":7,"angular-animate":undefined,"angular-material":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 250,
      height: 250,
      m: {
        t: 10,
        l: 40,
        r: 15,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, S.rush_length * 1.2]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars]).range([this.height, 0]);
    this.lineEn = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEn);
      };
    })(this));
    this.lineEx = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEx);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.ex = function() {
    return this.lineEx(this.cum);
  };

  Ctrl.prototype.en = function() {
    return this.lineEn(this.cum);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      cum: '='
    },
    templateUrl: './dist/chart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":7,"d3":undefined,"lodash":undefined}],3:[function(require,module,exports){
var angular, d3, der;

d3 = require('d3');

angular = require('angular');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      d3Der: '=',
      tran: '='
    },
    link: function(scope, el, attr) {
      var hasTransitioned, sel, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      hasTransitioned = false;
      return scope.$watch('d3Der', function(v) {
        if (scope.tran && hasTransitioned) {
          hasTransitioned = true;
          return sel.transition(u).attr(v).call(scope.tran);
        } else {
          hasTransitioned = true;
          return sel.attr(v);
        }
      }, true);
    }
  };
};

module.exports = der;



},{"angular":undefined,"d3":undefined}],4:[function(require,module,exports){
module.exports = function($parse) {
  return function(scope, el, attr) {
    return d3.select(el[0]).datum($parse(attr.datum)(scope));
  };
};



},{}],5:[function(require,module,exports){
'use strict';
Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};



},{}],6:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 250,
      height: 250,
      m: {
        t: 10,
        l: 40,
        r: 18,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, S.num_cars * .8]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars * .55]).range([this.height, 0]);
    this.line = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.n);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.f);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.d = function() {
    return this.line(this.memory);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      memory: '='
    },
    templateUrl: './dist/mfdChart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":7,"d3":undefined,"lodash":undefined}],7:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

require('./helpers');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cars: 250,
      time: 0,
      space: 5,
      pace: 15,
      stopping_time: 6,
      distance: 60,
      beta: .5,
      gamma: 2,
      rush_length: 250,
      frequency: 8,
      rl: 1000,
      phase: 50,
      green: .5,
      wish: 150,
      num_signals: 10,
      day: 0,
      offset: 0
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.rl, this.rl / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.rl]).range([0, 360]);
  }

  Settings.prototype.advance = function() {
    return this.time++;
  };

  Settings.prototype.reset_time = function() {
    this.day++;
    return this.time = 0;
  };

  return Settings;

})();

module.exports = new Settings();



},{"./helpers":5,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBRUU7RUFDTyxzQkFBQyxJQUFELEVBQU0sSUFBTjtBQUNYLFFBQUE7SUFEWSxJQUFDLENBQUEsTUFBRDtJQUFLLElBQUMsQ0FBQSxNQUFEO0lBQ2pCLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLFFBQUYsQ0FBVyxlQUFYO0lBQ04sSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULE9BQUEsR0FBVTtJQUNWLFVBQUEsR0FBYTtJQUNiLElBQUMsQ0FBQSxZQUFELEdBQ0M7TUFBQSxFQUFBLEVBQUksT0FBSjtNQUNBLElBQUEsRUFBTSxPQUROO01BRUEsSUFBQSxFQUFNLFVBRk47TUFHQSxLQUFBLEVBQU8sVUFIUDtNQUlBLE9BQUEsRUFBUyxPQUpUO01BS0EsVUFBQSxFQUFZLFVBTFo7O0lBT0QsSUFBQyxDQUFBLEdBQUQsR0FDQztNQUFBLENBQUEsRUFBRyxJQUFDLENBQUEsR0FBRCxHQUFLLEdBQUwsR0FBUyxDQUFDLENBQUMsSUFBZDtNQUNBLENBQUEsRUFBRyxJQUFDLENBQUEsR0FBRCxHQUFLLEdBQUwsR0FBUyxDQUFDLENBQUMsSUFEZDs7SUFHRCxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUk7RUFqQkg7O3lCQW1CWixPQUFBLEdBQVEsU0FBQyxHQUFEO0lBQ1AsR0FBRyxDQUFDLG1CQUFKLENBQXdCLElBQXhCO1dBQ0EsSUFBQyxDQUFBLFlBQWEsQ0FBQSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVQsQ0FBbUIsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztFQUZPOzt5QkFJUixZQUFBLEdBQWMsU0FBQyxJQUFEO1dBQ2IsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFJLENBQUMsU0FBTCxDQUFQLEdBQXlCO0VBRFo7O3lCQUdkLFFBQUEsR0FBVSxTQUFDLENBQUQ7QUFDUixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVI7SUFDbEIsSUFBRyxRQUFRLENBQUMsT0FBVCxDQUFBLENBQUg7TUFDQyxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxDQUFmO01BQ0EsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQUE7O1dBQ00sQ0FBRSxNQUFSLENBQWUsQ0FBZjs7TUFDQSxDQUFDLENBQUMsUUFBRixDQUFXLFFBQVg7YUFDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUFqQixFQUxEOztFQUZROzt5QkFTVixJQUFBLEdBQU0sU0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtJQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsWUFBYSxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUjtXQUNyQixDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsSUFBQyxDQUFBLFFBQWpCO0VBSEs7Ozs7OztBQUtEO0VBQ1EsaUJBQUEsR0FBQTs7b0JBRWIsVUFBQSxHQUFZLENBQUMsSUFBRCxFQUFNLE9BQU4sRUFBYyxNQUFkLEVBQXFCLE1BQXJCOztvQkFFWixLQUFBLEdBQU0sU0FBQTtBQUNMLFFBQUE7SUFBQSxNQUEwQixDQUFDLEVBQUQsRUFBSSxFQUFKLENBQTFCLEVBQUMsSUFBQyxDQUFBLHNCQUFGLEVBQWdCLElBQUMsQ0FBQTtJQUVqQixJQUFDLENBQUEsSUFBRCxHQUFROzs7O2tCQUFXLENBQUMsR0FBWixDQUFnQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsR0FBRDtBQUN2QixZQUFBO2VBQUE7Ozs7c0JBQVcsQ0FBQyxHQUFaLENBQWdCLFNBQUMsR0FBRDtBQUNmLGNBQUE7VUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsQ0FBQyxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLEdBQWIsRUFBaUIsR0FBakIsQ0FBcEIsQ0FBcEI7aUJBQ0E7UUFGZSxDQUFoQjtNQUR1QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7QUFLUjtBQUFBO1NBQUEsc0NBQUE7Ozs7QUFDQztBQUFBO2FBQUEsd0NBQUE7O1VBQ0MsQ0FBQTs7QUFBSSxvQkFBTyxHQUFQO0FBQUEsbUJBQ0UsSUFERjttRUFDNEIsQ0FBQSxDQUFDLENBQUMsR0FBRjtBQUQ1QixtQkFFRSxPQUZGO3VCQUVlLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQyxDQUFDLEdBQUYsQ0FBTyxDQUFBLENBQUMsQ0FBQyxHQUFGLEdBQU0sQ0FBTjtBQUY1QixtQkFHRSxNQUhGO21FQUc4QixDQUFBLENBQUMsQ0FBQyxHQUFGO0FBSDlCLG1CQUlFLE1BSkY7dUJBSWMsSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFDLENBQUMsR0FBRixDQUFPLENBQUEsQ0FBQyxDQUFDLEdBQUYsR0FBTSxDQUFOO0FBSjNCOztVQU1KLElBQUcsQ0FBSDtZQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLENBQUMsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQLEVBQVMsR0FBVCxDQUFaLENBQVo7MEJBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmLEdBRkQ7V0FBQSxNQUFBO2tDQUFBOztBQVBEOzs7QUFERDs7RUFSSzs7b0JBNEJOLElBQUEsR0FBTSxTQUFBO0lBQ0wsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsYUFBVixFQUF3QixNQUF4QjtXQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLEtBQVYsRUFBaUIsTUFBakI7RUFGSzs7Ozs7O0FBSUQ7RUFDTyxjQUFDLE1BQUQsRUFBUSxHQUFSO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFBTyxJQUFDLENBQUEsS0FBRDtJQUNuQixJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFQLEdBQVc7SUFDWCxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsSUFBSTtFQUhWOztpQkFLWixTQUFBLEdBQVcsU0FBQyxHQUFEO1dBQ1YsWUFBQSxHQUFhLEdBQUcsQ0FBQyxDQUFqQixHQUFtQixHQUFuQixHQUFzQixHQUFHLENBQUMsQ0FBMUIsR0FBNEI7RUFEbEI7O2lCQUdYLGtCQUFBLEdBQW9CLFNBQUMsQ0FBRDtXQUNuQixZQUFBLEdBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFuQixHQUFxQixHQUFyQixHQUF3QixDQUFDLENBQUMsR0FBRyxDQUFDLENBQTlCLEdBQWdDO0VBRGI7O2lCQUdwQixVQUFBLEdBQVksU0FBQyxDQUFEO1dBQ1gsSUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBVCxHQUFXLEdBQVgsR0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQWxCLEdBQW9CLEtBQXBCLEdBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBN0IsR0FBK0IsR0FBL0IsR0FBa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUQzQjs7aUJBR1osS0FBQSxHQUFPLFNBQUMsR0FBRDtJQUFTLElBQUcsQ0FBQyxHQUFKO2FBQWEsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUFiOztFQUFUOztpQkFDUCxLQUFBLEdBQU8sU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFELEdBQVU7RUFBYjs7aUJBQ1AsSUFBQSxHQUFNLFNBQUE7V0FDTCxFQUFFLENBQUMsS0FBSCxDQUFTLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUNQLEtBQUMsQ0FBQSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQWYsQ0FBQTtRQUNBLEtBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFBO1FBQ0EsSUFBRyxDQUFDLEtBQUMsQ0FBQSxNQUFMO1VBQWlCLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFBakI7O2VBQ0E7TUFKTztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVCxFQUtHLENBQUMsQ0FBQyxJQUxMO0VBREs7O2lCQVFOLElBQUEsR0FBTSxTQUFBO0lBQ0wsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUNBLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBVCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtXQUNWLElBQUMsQ0FBQSxJQUFELENBQUE7RUFKSzs7Ozs7O0FBTVAsTUFBQSxHQUFTLFNBQUE7QUFDUixNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsS0FBQSxFQUFPLEVBQVA7SUFDQSxZQUFBLEVBQWMsSUFEZDtJQUVBLFdBQUEsRUFBYSxpQkFGYjtJQUdBLFVBQUEsRUFBWSxDQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLElBQXZCLENBSFo7O0FBRk87O0FBT1QsU0FBQSxHQUFZLFNBQUE7QUFDWCxNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsS0FBQSxFQUNDO01BQUEsU0FBQSxFQUFVLEdBQVY7S0FERDtJQUVBLElBQUEsRUFBSyxTQUFDLEtBQUQsRUFBTyxFQUFQLEVBQVUsSUFBVjtBQUNKLFVBQUE7TUFBQSxPQUFBLEdBQVUsRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiLENBQ1QsQ0FBQyxTQURRLENBQ0UsU0FERixDQUVULENBQUMsSUFGUSxDQUVILENBQUMsU0FBRCxFQUFXLFlBQVgsRUFBd0IsU0FBeEIsRUFBa0MsWUFBbEMsQ0FGRyxDQUdULENBQUMsS0FIUSxDQUFBLENBSVQsQ0FBQyxNQUpRLENBSUQsTUFKQyxDQUtULENBQUMsSUFMUSxDQU1SO1FBQUEsS0FBQSxFQUFPLEdBQVA7UUFDQSxNQUFBLEVBQVEsRUFEUjtRQUVBLE9BQUEsRUFBTyxRQUZQO1FBR0EsQ0FBQSxFQUFHLENBQUMsR0FISjtRQUlBLENBQUEsRUFBRSxDQUFDLEVBSkg7UUFLQSxTQUFBLEVBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtpQkFDVixTQUFBLEdBQVMsQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFULEdBQWU7UUFETCxDQUxYO09BTlE7YUFjVixLQUFLLENBQUMsTUFBTixDQUFhLFdBQWIsRUFBeUIsU0FBQyxNQUFEO2VBQ3hCLE9BQ0MsQ0FBQyxPQURGLENBQ1UsSUFEVixFQUNnQixTQUFDLENBQUQ7aUJBQU0sQ0FBQSxLQUFHO1FBQVQsQ0FEaEI7TUFEd0IsQ0FBekI7SUFmSSxDQUZMOztBQUZVOztBQXVCWixPQUFPLENBQUMsTUFBUixDQUFlLFNBQWYsRUFBMkIsQ0FBQyxPQUFBLENBQVEsa0JBQVIsRUFBNkIsT0FBQSxDQUFRLGlCQUFSLENBQTdCLENBQUQsQ0FBM0IsQ0FDQyxDQUFDLFNBREYsQ0FDWSxRQURaLEVBQ3NCLE1BRHRCLENBRUMsQ0FBQyxTQUZGLENBRVksV0FGWixFQUV3QixTQUZ4QixDQUdDLENBQUMsU0FIRixDQUdZLE9BSFosRUFHcUIsT0FBQSxDQUFRLG9CQUFSLENBSHJCLENBSUMsQ0FBQyxTQUpGLENBSVksT0FKWixFQUlxQixPQUFBLENBQVEsb0JBQVIsQ0FKckIsQ0FLQyxDQUFDLFNBTEYsQ0FLWSxVQUxaLEVBS3dCLE9BQUEsQ0FBUSxZQUFSLENBTHhCLENBTUMsQ0FBQyxTQU5GLENBTVksVUFOWixFQU13QixPQUFBLENBQVEsT0FBUixDQU54Qjs7Ozs7QUM5SUEsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7QUFFRTtFQUNPLGNBQUMsS0FBRCxFQUFRLEVBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUNaLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsS0FBQSxFQUFPLEdBQVA7TUFDQSxNQUFBLEVBQVEsR0FEUjtNQUVBLENBQUEsRUFDQztRQUFBLENBQUEsRUFBRyxFQUFIO1FBQ0EsQ0FBQSxFQUFHLEVBREg7UUFFQSxDQUFBLEVBQUcsRUFGSDtRQUdBLENBQUEsRUFBRyxFQUhIO09BSEQ7S0FERDtJQVNBLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDTCxDQUFDLE1BREksQ0FDRyxDQUFDLENBQUQsRUFBRyxDQUFDLENBQUMsV0FBRixHQUFjLEdBQWpCLENBREgsQ0FFTCxDQUFDLEtBRkksQ0FFRSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsS0FBSixDQUZGO0lBSVAsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNOLENBQUMsTUFESyxDQUNFLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBQyxRQUFOLENBREYsQ0FFTixDQUFDLEtBRkssQ0FFQyxDQUFDLElBQUMsQ0FBQSxNQUFGLEVBQVUsQ0FBVixDQUZEO0lBSVAsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNULENBQUMsQ0FEUSxDQUNOLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURNLENBRVQsQ0FBQyxDQUZRLENBRU4sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxLQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRk07SUFJVixJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1QsQ0FBQyxDQURRLENBQ04sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxJQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE0sQ0FFVCxDQUFDLENBRlEsQ0FFTixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLEtBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGTTtJQUlWLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVixDQUFDLEtBRFMsQ0FDSCxJQUFDLENBQUEsR0FERSxDQUVWLENBQUMsTUFGUyxDQUVGLFFBRkUsQ0FHVixDQUFDLEtBSFMsQ0FHSCxDQUhHO0lBTVgsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNWLENBQUMsS0FEUyxDQUNILElBQUMsQ0FBQSxHQURFLENBRVYsQ0FBQyxNQUZTLENBRUYsTUFGRTtFQWhDQTs7aUJBcUNaLEVBQUEsR0FBSSxTQUFBO1dBQ0gsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsR0FBVDtFQURHOztpQkFFSixFQUFBLEdBQUksU0FBQTtXQUNILElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLEdBQVQ7RUFERzs7Ozs7O0FBR0wsR0FBQSxHQUFNLFNBQUE7QUFDTCxNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsZ0JBQUEsRUFBa0IsSUFBbEI7SUFDQSxZQUFBLEVBQWMsSUFEZDtJQUVBLEtBQUEsRUFDQztNQUFBLEdBQUEsRUFBSyxHQUFMO0tBSEQ7SUFJQSxXQUFBLEVBQWEsbUJBSmI7SUFLQSxVQUFBLEVBQVksQ0FBQyxRQUFELEVBQVcsVUFBWCxFQUF1QixJQUF2QixDQUxaOztBQUZJOztBQVNOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ3hEakIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUVWLEdBQUEsR0FBTSxTQUFDLE1BQUQ7QUFDTCxNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsUUFBQSxFQUFVLEdBQVY7SUFDQSxLQUFBLEVBQ0M7TUFBQSxLQUFBLEVBQU8sR0FBUDtNQUNBLElBQUEsRUFBTSxHQUROO0tBRkQ7SUFJQSxJQUFBLEVBQU0sU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLElBQVo7QUFDTCxVQUFBO01BQUEsR0FBQSxHQUFNLEVBQUUsQ0FBQyxNQUFILENBQVUsRUFBRyxDQUFBLENBQUEsQ0FBYjtNQUNOLENBQUEsR0FBSSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQTtNQUNYLGVBQUEsR0FBa0I7YUFDbEIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLEVBQ0csU0FBQyxDQUFEO1FBQ0QsSUFBRyxLQUFLLENBQUMsSUFBTixJQUFlLGVBQWxCO1VBQ0MsZUFBQSxHQUFrQjtpQkFDbEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxDQUFmLENBQ0MsQ0FBQyxJQURGLENBQ08sQ0FEUCxDQUVDLENBQUMsSUFGRixDQUVPLEtBQUssQ0FBQyxJQUZiLEVBRkQ7U0FBQSxNQUFBO1VBTUMsZUFBQSxHQUFrQjtpQkFDbEIsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFULEVBUEQ7O01BREMsQ0FESCxFQVVHLElBVkg7SUFKSyxDQUpOOztBQUZJOztBQXFCTixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUN4QmpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRDtTQUNoQixTQUFDLEtBQUQsRUFBUSxFQUFSLEVBQVksSUFBWjtXQUNDLEVBQUUsQ0FBQyxNQUFILENBQVUsRUFBRyxDQUFBLENBQUEsQ0FBYixDQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBWixDQUFBLENBQW1CLEtBQW5CLENBQXZCO0VBREQ7QUFEZ0I7Ozs7O0FDQWpCO0FBRUEsUUFBUSxDQUFBLFNBQUUsQ0FBQSxRQUFWLEdBQXFCLFNBQUMsSUFBRCxFQUFPLElBQVA7U0FDbkIsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDO0FBRG1COzs7OztBQ0ZyQixJQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUVFO0VBQ08sY0FBQyxLQUFELEVBQVEsRUFBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxLQUFBLEVBQU8sR0FBUDtNQUNBLE1BQUEsRUFBUSxHQURSO01BRUEsQ0FBQSxFQUNDO1FBQUEsQ0FBQSxFQUFHLEVBQUg7UUFDQSxDQUFBLEVBQUcsRUFESDtRQUVBLENBQUEsRUFBRyxFQUZIO1FBR0EsQ0FBQSxFQUFHLEVBSEg7T0FIRDtLQUREO0lBU0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNMLENBQUMsTUFESSxDQUNHLENBQUMsQ0FBRCxFQUFHLENBQUMsQ0FBQyxRQUFGLEdBQVcsRUFBZCxDQURILENBRUwsQ0FBQyxLQUZJLENBRUUsQ0FBQyxDQUFELEVBQUcsSUFBQyxDQUFBLEtBQUosQ0FGRjtJQUlQLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDTixDQUFDLE1BREssQ0FDRSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsUUFBRixHQUFXLEdBQWYsQ0FERixDQUVOLENBQUMsS0FGSyxDQUVDLENBQUMsSUFBQyxDQUFBLE1BQUYsRUFBVSxDQUFWLENBRkQ7SUFJUCxJQUFDLENBQUEsSUFBRCxHQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1AsQ0FBQyxDQURNLENBQ0osQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxDQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBREksQ0FFUCxDQUFDLENBRk0sQ0FFSixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLENBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGSTtJQUlSLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVixDQUFDLEtBRFMsQ0FDSCxJQUFDLENBQUEsR0FERSxDQUVWLENBQUMsTUFGUyxDQUVGLFFBRkUsQ0FHVixDQUFDLEtBSFMsQ0FHSCxDQUhHO0lBS1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNWLENBQUMsS0FEUyxDQUNILElBQUMsQ0FBQSxHQURFLENBRVYsQ0FBQyxNQUZTLENBRUYsTUFGRTtFQTNCQTs7aUJBK0JaLENBQUEsR0FBRyxTQUFBO1dBQUcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFDLENBQUEsTUFBUDtFQUFIOzs7Ozs7QUFHSixHQUFBLEdBQU0sU0FBQTtBQUNMLE1BQUE7U0FBQSxTQUFBLEdBQ0M7SUFBQSxnQkFBQSxFQUFrQixJQUFsQjtJQUNBLFlBQUEsRUFBYyxJQURkO0lBRUEsS0FBQSxFQUNDO01BQUEsTUFBQSxFQUFRLEdBQVI7S0FIRDtJQUlBLFdBQUEsRUFBYSxzQkFKYjtJQUtBLFVBQUEsRUFBWSxDQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLElBQXZCLENBTFo7O0FBRkk7O0FBU04sTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDaERqQixJQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osT0FBQSxDQUFRLFdBQVI7O0FBRU07RUFDTyxrQkFBQTtJQUNYLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsUUFBQSxFQUFVLEdBQVY7TUFDQSxJQUFBLEVBQU0sQ0FETjtNQUVBLEtBQUEsRUFBTyxDQUZQO01BR0EsSUFBQSxFQUFNLEVBSE47TUFJQSxhQUFBLEVBQWUsQ0FKZjtNQUtBLFFBQUEsRUFBVSxFQUxWO01BTUEsSUFBQSxFQUFNLEVBTk47TUFPQSxLQUFBLEVBQU8sQ0FQUDtNQVFBLFdBQUEsRUFBYSxHQVJiO01BU0EsU0FBQSxFQUFXLENBVFg7TUFVQSxFQUFBLEVBQUksSUFWSjtNQVdBLEtBQUEsRUFBTyxFQVhQO01BWUEsS0FBQSxFQUFPLEVBWlA7TUFhQSxJQUFBLEVBQU0sR0FiTjtNQWNBLFdBQUEsRUFBYSxFQWRiO01BZUEsR0FBQSxFQUFLLENBZkw7TUFnQkEsTUFBQSxFQUFRLENBaEJSO0tBREQ7SUFtQkEsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNULENBQUMsTUFEUSxDQUNELENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFVLElBQUMsQ0FBQSxFQUFYLEVBQWMsSUFBQyxDQUFBLEVBQUQsR0FBSSxDQUFsQixDQURDLENBRVQsQ0FBQyxLQUZRLENBRUYsQ0FDTixTQURNLEVBRU4sU0FGTSxFQUdOLFNBSE0sRUFJTixTQUpNLEVBS04sU0FMTSxFQU1OLFNBTk0sQ0FGRTtJQVdWLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDUixDQUFDLE1BRE8sQ0FDQSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsRUFBSixDQURBLENBRVIsQ0FBQyxLQUZPLENBRUQsQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUZDO0VBL0JFOztxQkFtQ1osT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROztxQkFFVCxVQUFBLEdBQVksU0FBQTtJQUNYLElBQUMsQ0FBQSxHQUFEO1dBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtFQUZHOzs7Ozs7QUFJYixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRAbGFuZXMgPSB7fVxuXHRcdHVwX2Rvd24gPSBbXVxuXHRcdGxlZnRfcmlnaHQgPSBbXVxuXHRcdEBjYXJzX3dhaXRpbmcgPSBcblx0XHRcdHVwOiB1cF9kb3duXG5cdFx0XHRkb3duOiB1cF9kb3duXG5cdFx0XHRsZWZ0OiBsZWZ0X3JpZ2h0XG5cdFx0XHRyaWdodDogbGVmdF9yaWdodFxuXHRcdFx0dXBfZG93bjogdXBfZG93blxuXHRcdFx0bGVmdF9yaWdodDogbGVmdF9yaWdodFxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gdHJ1ZVxuXHRcdEBjYXJzX3dhaXRpbmdbY2FyLmxhbmUuZGlyZWN0aW9uXS5wdXNoIGNhclxuXG5cdHNldF9iZWdfbGFuZTogKGxhbmUpLT5cblx0XHRAbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHR1cm5fY2FyOiAoYykgLT5cblx0XHRcdG5ld19sYW5lID0gQGxhbmVzW2MudHVybnNbMF1dXG5cdFx0XHRpZiBuZXdfbGFuZS5pc19mcmVlKClcblx0XHRcdFx0Xy5yZW1vdmUgY2FycywgY1xuXHRcdFx0XHRjLnR1cm5zLnNoaWZ0KClcblx0XHRcdFx0Yy5sYW5lPy5yZW1vdmUgY1xuXHRcdFx0XHRjLnNldF9sYW5lIG5ld19sYW5lXG5cdFx0XHRcdG5ld19sYW5lLnJlY2VpdmUgY1xuXG5cdHRpY2s6IC0+XG5cdFx0QHNpZ25hbC50aWNrKClcblx0XHRjYXJzID0gQGNhcnNfd2FpdGluZ1tAc2lnbmFsLmRpcmVjdGlvbl1cblx0XHRfLmZvckVhY2ggY2FycywgQHR1cm5fY2FyXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0ZGlyZWN0aW9uczogWyd1cCcsJ3JpZ2h0JywnZG93bicsJ2xlZnQnXVxuXG5cdHNldHVwOi0+XG5cdFx0W0BpbnRlcnNlY3Rpb25zLEBsYW5lc10gPSBbW10sW11dXG5cblx0XHRAZ3JpZCA9IFswLi5TLnNpemVdLm1hcCAocm93KT0+XG5cdFx0XHRbMC4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIChsYW5lID0gbmV3IExhbmUgaSxqLGRpcikgI2kgaXMgdGhlIGVuZFxuXHRcdFx0XHRcdGkuc2V0X2JlZ19sYW5lIGxhbmVcblx0XHQjIEBjYXJzID0gXG5cdFx0IyBAXG5cdFx0IyBsYW5lID0gXG5cdFx0XG5cdFx0IyBjYXIgPSBcblx0XHQjIEBjYXJzID0gXy5tYXAgQGxhbmVzWzg1Li44N10sIChsYW5lKS0+XG5cdFx0IyBcdHR1cm5zID0gXy5zYW1wbGUgWyd1cCcsJ3JpZ2h0JywnbGVmdCcsJ2Rvd24nXSwxMFxuXHRcdCMgXHRuZXcgQ2FyIGxhbmUsIHR1cm5zXG5cblx0dGljazogLT5cblx0XHRfLmludm9rZSBAaW50ZXJzZWN0aW9ucywndGljaydcblx0XHRfLmludm9rZSBAbGFuZXMsICd0aWNrJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5zaWduYWxEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRkaXJlY3Rpb246Jz0nXG5cdFx0bGluazooc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2lnbmFscyA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0QWxsICdzaWduYWxzJ1xuXHRcdFx0XHQuZGF0YSBbJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0JywndXBfZG93bicsJ2xlZnRfcmlnaHQnXVxuXHRcdFx0XHQuZW50ZXIoKVxuXHRcdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdHdpZHRoOiAxLjJcblx0XHRcdFx0XHRoZWlnaHQ6IC42XG5cdFx0XHRcdFx0Y2xhc3M6ICdzaWduYWwnXG5cdFx0XHRcdFx0eTogLTEuMlxuXHRcdFx0XHRcdHg6LS42XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAoZCxpKS0+XG5cdFx0XHRcdFx0XHRcInJvdGF0ZSgjezkwKml9KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAnZGlyZWN0aW9uJywobmV3VmFsKS0+XG5cdFx0XHRcdHNpZ25hbHNcblx0XHRcdFx0XHQuY2xhc3NlZCAnb24nLCAoZCktPiBkPT1uZXdWYWxcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ3NpZ25hbERlcicsc2lnbmFsRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGgqMS4yXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzXVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmVFbiA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUVuXG5cblx0XHRAbGluZUV4ID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRXhcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEBjdW1cblx0ZW46IC0+XG5cdFx0QGxpbmVFbiBAY3VtXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGN1bTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2FycyouOF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNTVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLm5cblx0XHRcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2FyczogMjUwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRzcGFjZTogNVxuXHRcdFx0cGFjZTogMTVcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDZcblx0XHRcdGRpc3RhbmNlOiA2MFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRydXNoX2xlbmd0aDogMjUwXG5cdFx0XHRmcmVxdWVuY3k6IDhcblx0XHRcdHJsOiAxMDAwXG5cdFx0XHRwaGFzZTogNTBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fc2lnbmFsczogMTBcblx0XHRcdGRheTogMFxuXHRcdFx0b2Zmc2V0OiAwXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBybCxAcmwvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBybF1cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
