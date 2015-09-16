(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, S, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  size: 10,
  stopping_time: 5,
  pace: 100,
  space: 2
};

S.lane_length = 10;

Lane = (function() {
  function Lane(beg, end, direction) {
    var a, b, ref, ref1;
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.at_intersection = false;
    a = {
      x: this.beg.pos.x,
      y: this.beg.pos.y
    };
    b = {
      x: this.end.pos.x,
      y: this.end.pos.y
    };
    switch (this.direction) {
      case 'up':
        a.x++;
        b.x++;
        a.y -= 2;
        b.y += 2;
        break;
      case 'right':
        a.x += 2;
        b.x -= 2;
        a.y++;
        b.y++;
        break;
      case 'down':
        a.x--;
        b.x--;
        a.y += 2;
        b.y -= 2;
        break;
      case 'left':
        a.x -= 2;
        b.x += 2;
        a.y--;
        b.y--;
    }
    ref = [a, b], this.a = ref[0], this.b = ref[1];
    this.scale = d3.scale.linear().domain([0, S.lane_length]).range([a, b]);
    ref1 = this.end, this.row = ref1.row, this.col = ref1.col;
    this.cars = [];
  }

  Lane.prototype.receive = function(car) {
    return this.cars.unshift(car);
  };

  Lane.prototype.remove = function(car) {
    return this.cars.splice(this.cars.indexOf(car));
  };

  Lane.prototype.get_coords = function(loc) {
    return this.scale(loc);
  };

  return Lane;

})();

Car = (function() {
  function Car(lane1) {
    this.lane = lane1;
    this.id = _.uniqueId('car-');
    this.loc = this._loc = _.random(2, 5);
    this.stopped = 0;
    this.move_final();
    this.lane.receive(this);
    this.set_at_intersection(false);
    this.color = _.sample(['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5']);
  }

  Car.prototype.set_at_intersection = function(bool) {
    return this.at_intersection = bool;
  };

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.move = function() {
    var cars, next_car;
    if (this.at_intersection) {
      return;
    }
    if (this.stopped > 0) {
      this.stopped--;
      return;
    }
    cars = this.lane.cars;
    next_car = cars[cars.indexOf(this) + 1];
    if (!next_car) {
      this._loc++;
      return;
    }
    if ((next_car.loc - this.loc) >= S.space) {
      this._loc++;
      return;
    }
    return this.stop();
  };

  Car.prototype.move_final = function() {
    var coords;
    this.loc = this._loc;
    coords = this.lane.get_coords(this.loc);
    return this.x = coords.x, this.y = coords.y, coords;
  };

  Car.prototype.turn = function(new_lane) {
    this.lane.remove(this);
    this.lane = new_lane;
    this.lane.receive(this);
    return this.loc = this._loc = 0;
  };

  return Car;

})();

Intersection = (function() {
  function Intersection(row1, col1) {
    this.row = row1;
    this.col = col1;
    this.id = _.uniqueId('intersection-');
    this.lanes = {};
    this.cars = [];
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
  }

  Intersection.prototype.receive = function(car) {
    car.set_at_intersection(true);
    return this.cars.push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane.direction] = lane;
  };

  Intersection.prototype.tick = function() {
    var car, lane;
    if (this.cars.length > 0) {
      lane = _.sample(_.values(this.lanes));
      if (lane.cars.length > 0) {
        if (lane.cars[0].loc === 0) {
          return;
        }
      }
      car = this.cars.shift();
      car.set_at_intersection(false);
      return car.turn(lane);
    }
  };

  return Intersection;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    this.el = el;
    this.paused = true;
    this.scope.S = S;
    this.setup();
  }

  Ctrl.prototype.setup = function() {
    var dir, directions, i, j, k, l, lane, len, len1, m, ref, ref1, ref2, results;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.grid = ref[2];
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
          intersection = new Intersection(row, col);
          _this.intersections.push(intersection);
          return intersection;
        });
      };
    })(this));
    directions = ['up', 'right', 'down', 'left'];
    ref2 = this.intersections;
    for (l = 0, len = ref2.length; l < len; l++) {
      i = ref2[l];
      for (m = 0, len1 = directions.length; m < len1; m++) {
        dir = directions[m];
        j = (function() {
          var ref3, ref4;
          switch (dir) {
            case 'up':
              return (ref3 = this.grid[i.row - 1]) != null ? ref3[i.col] : void 0;
            case 'right':
              return this.grid[i.row][i.col + 1];
            case 'down':
              return (ref4 = this.grid[i.row + 1]) != null ? ref4[i.col] : void 0;
            case 'left':
              return this.grid[i.row][i.col - 1];
          }
        }).call(this);
        if (j) {
          this.lanes.push((lane = new Lane(i, j, dir)));
          i.set_beg_lane(lane);
        }
      }
    }
    return this.cars = (function() {
      var len2, n, ref3, results1;
      ref3 = this.lanes;
      results1 = [];
      for (n = 0, len2 = ref3.length; n < len2; n++) {
        lane = ref3[n];
        results1.push(new Car(lane));
      }
      return results1;
    }).call(this);
  };

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
        var car, i, k, l, len, len1, len2, m, ref, ref1, ref2;
        ref = _this.cars;
        for (k = 0, len = ref.length; k < len; k++) {
          car = ref[k];
          car.move();
        }
        ref1 = _this.cars;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          car = ref1[l];
          car.move_final();
          if (car.loc === S.lane_length && !car.at_intersection) {
            car.lane.end.receive(car);
          }
        }
        ref2 = _this.intersections;
        for (m = 0, len2 = ref2.length; m < len2; m++) {
          i = ref2[m];
          i.tick();
        }
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./mfd":6,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLElBQUEsRUFBTSxFQUFOO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxJQUFBLEVBQU0sR0FGTjtFQUdBLEtBQUEsRUFBTyxDQUhQOzs7QUFLRCxDQUFDLENBQUMsV0FBRixHQUFnQjs7QUFFVjtFQUNRLGNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQ1osUUFBQTtJQURhLElBQUMsQ0FBQSxNQUFEO0lBQUssSUFBQyxDQUFBLE1BQUQ7SUFBSyxJQUFDLENBQUEsWUFBRDtJQUN2QixJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWDtJQUNOLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBRW5CLENBQUEsR0FDQztNQUFB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RUYsQ0FDTixTQURNLEVBRU4sU0FGTSxFQUdOLFNBSE0sRUFJTixTQUpNLEVBS04sU0FMTSxFQU1OLFNBTk0sQ0FGRTtJQVdWLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDUixDQUFDLE1BRE8sQ0FDQSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsRUFBSixDQURBLENBRVIsQ0FBQyxLQUZPLENBRUQsQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUZDO0VBL0JFOztxQkFtQ1osT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROztxQkFFVCxVQUFBLEdBQVksU0FBQTtJQUNYLElBQUMsQ0FBQSxHQUFEO1dBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtFQUZHOzs7Ozs7QUFJYixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5TID1cblx0c2l6ZTogMTBcblx0c3RvcHBpbmdfdGltZTogNVxuXHRwYWNlOiAxMDBcblx0c3BhY2U6IDJcblxuUy5sYW5lX2xlbmd0aCA9IDEwXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBhdF9pbnRlcnNlY3Rpb24gPSBmYWxzZVxuXG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55IFxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0W0BhLEBiXSA9IFthLGJdXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cblx0XHR7QHJvdyxAY29sfSA9IEBlbmRcblxuXHRcdEBjYXJzID0gW11cblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblxuXHRyZW1vdmU6IChjYXIpLT5cblx0XHRAY2Fycy5zcGxpY2UgQGNhcnMuaW5kZXhPZiBjYXJcblxuXHRnZXRfY29vcmRzOiAobG9jKS0+XG5cdFx0QHNjYWxlIGxvY1xuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAbGFuZSktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2Nhci0nXG5cdFx0QGxvYyA9IEBfbG9jID0gXy5yYW5kb20gMiw1XG5cdFx0QHN0b3BwZWQgPSAwXG5cdFx0QG1vdmVfZmluYWwoKVxuXHRcdEBsYW5lLnJlY2VpdmUgdGhpc1xuXHRcdEBzZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0QGNvbG9yID0gXy5zYW1wbGUgWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdHNldF9hdF9pbnRlcnNlY3Rpb246IChib29sKS0+XG5cdFx0QGF0X2ludGVyc2VjdGlvbiA9IGJvb2xcblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdG1vdmU6IC0+XG5cdFx0aWYgQGF0X2ludGVyc2VjdGlvblxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAc3RvcHBlZD4wXG5cdFx0XHRAc3RvcHBlZC0tXG5cdFx0XHRyZXR1cm5cblxuXHRcdGNhcnMgPSBAbGFuZS5jYXJzXG5cblx0XHRuZXh0X2NhciA9IGNhcnNbY2Fycy5pbmRleE9mKHRoaXMpICsgMV1cblxuXHRcdGlmICFuZXh0X2NhclxuXHRcdFx0QF9sb2MrK1xuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiAobmV4dF9jYXIubG9jLUBsb2MpPj1TLnNwYWNlXG5cdFx0XHRAX2xvYysrXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzdG9wKClcblxuXHRtb3ZlX2ZpbmFsOiAtPlxuXHRcdEBsb2MgPSBAX2xvY1xuXHRcdGNvb3JkcyA9IEBsYW5lLmdldF9jb29yZHMgQGxvY1xuXHRcdHtAeCxAeX0gPSBjb29yZHNcblxuXHR0dXJuOiAobmV3X2xhbmUpIC0+IFxuXHRcdEBsYW5lLnJlbW92ZSB0aGlzXG5cdFx0QGxhbmUgPSBuZXdfbGFuZVxuXHRcdEBsYW5lLnJlY2VpdmUgdGhpc1xuXHRcdEBsb2MgPSBAX2xvYyA9IDBcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdEBsYW5lcyA9IHt9XG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IChAY29sKjEwMC9TLnNpemUpXG5cdFx0XHR5OiAoQHJvdyoxMDAvUy5zaXplKVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIHRydWVcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHNldF9iZWdfbGFuZTogKGxhbmUpLT5cblx0XHRAbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHRpY2s6IC0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoID4gMFxuXHRcdFx0bGFuZSA9IF8uc2FtcGxlIF8udmFsdWVzIEBsYW5lc1xuXHRcdFx0aWYgbGFuZS5jYXJzLmxlbmd0aD4wXG5cdFx0XHRcdGlmIGxhbmUuY2Fyc1swXS5sb2MgPT0gMFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FyID0gQGNhcnMuc2hpZnQoKVxuXHRcdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gZmFsc2Vcblx0XHRcdGNhci50dXJuIGxhbmVcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNldHVwKClcblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXMsQGdyaWRdID0gW1tdLFtdLFtdXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0aW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sXG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0ZGlyZWN0aW9ucyA9IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIChsYW5lID0gbmV3IExhbmUgaSxqLGRpcikgI2kgaXMgdGhlIGVuZFxuXHRcdFx0XHRcdGkuc2V0X2JlZ19sYW5lIGxhbmVcblx0XHRAY2FycyA9IChuZXcgQ2FyIGxhbmUgZm9yIGxhbmUgaW4gQGxhbmVzKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0IyBmb3IgbGFuZSBpbiBAbGFuZXNcblx0XHRcdFx0IyBcdGxhbmUuY2FycyA9IF8uc29ydEJ5IGxhbmUuY2FycywnbG9jJ1xuXG5cdFx0XHRcdGZvciBjYXIgaW4gQGNhcnNcblx0XHRcdFx0XHRjYXIubW92ZSgpXG5cblx0XHRcdFx0Zm9yIGNhciBpbiBAY2Fyc1xuXHRcdFx0XHRcdGNhci5tb3ZlX2ZpbmFsKClcblx0XHRcdFx0XHRpZiBjYXIubG9jID09KCBTLmxhbmVfbGVuZ3RoKSBhbmQgIWNhci5hdF9pbnRlcnNlY3Rpb25cblx0XHRcdFx0XHRcdGNhci5sYW5lLmVuZC5yZWNlaXZlIGNhclxuXG5cdFx0XHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRcdFx0aS50aWNrKClcblxuXG5cblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aCoxLjJdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAxNVxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
