(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, S, Traffic, _, angular, d3, visDer;

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
    var a, b, ref;
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.length = S.lane_length - 1;
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
    this.cars = [];
  }

  Lane.prototype.is_free = function() {
    if (this.cars.length === 0) {
      return true;
    }
    return !(this.cars[0].loc === 0);
  };

  Lane.prototype.move_car = function(car) {
    car.advance();
    car.set_xy(this.scale(car.loc));
    if (car.loc === this.length) {
      return this.end.receive(car);
    }
  };

  Lane.prototype.tick = function() {
    return _.forEach(this.cars, (function(_this) {
      return function(car, i, k) {
        var next_car;
        if (car.at_intersection) {
          return;
        }
        if (car.stopped) {
          return car.subtract_stop();
        }
        if ((next_car = k[i + 1])) {
          if ((next_car.loc - car.loc) >= S.space) {
            return _this.move_car(car);
          }
          return car.stop();
        }
        return _this.move_car(car);
      };
    })(this));
  };

  Lane.prototype.receive = function(car) {
    car.set_at_intersection(false);
    car.stopped = 0;
    this.cars.unshift(car);
    car.reset_loc();
    return car.set_xy(this.scale(car.loc));
  };

  Lane.prototype.remove = function(car) {
    return this.cars.splice(this.cars.indexOf(car));
  };

  return Lane;

})();

Car = (function() {
  function Car(lane1) {
    var ref;
    this.lane = lane1;
    this.id = _.uniqueId('car-');
    this.stopped = 0;
    this.lane.receive(this);
    this.set_at_intersection(false);
    ref = this.lane.scale((this.loc = _.random(2, 5))), this.x = ref.x, this.y = ref.y;
    this.color = _.sample(this.colors);
  }

  Car.prototype.subtract_stop = function() {
    return this.stopped--;
  };

  Car.prototype.colors = ['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5'];

  Car.prototype.set_at_intersection = function(at_intersection) {
    this.at_intersection = at_intersection;
  };

  Car.prototype.set_lane = function(lane1) {
    this.lane = lane1;
  };

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.advance = function() {
    return this.loc++;
  };

  Car.prototype.set_xy = function(pos) {
    return this.x = pos.x, this.y = pos.y, pos;
  };

  Car.prototype.reset_loc = function() {
    return this.loc = 0;
  };

  return Car;

})();

Intersection = (function() {
  function Intersection(row1, col1) {
    this.row = row1;
    this.col = col1;
    this.id = _.uniqueId('intersection-');
    this.lanes = {};
    this.cars_waiting = [];
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
  }

  Intersection.prototype.receive = function(car) {
    car.set_at_intersection(true);
    return this.cars_waiting.push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane.direction] = lane;
  };

  Intersection.prototype.turn_car = function(car, lane) {
    car.lane.remove(car);
    car.set_lane(lane);
    return lane.receive(car);
  };

  Intersection.prototype.tick = function() {
    var lane;
    if (this.cars_waiting.length > 0) {
      lane = _.sample(_.values(this.lanes));
      if (lane.is_free()) {
        return this.turn_car(this.cars_waiting.shift(), lane);
      }
    }
  };

  return Intersection;

})();

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.directions = ['up', 'right', 'down', 'left'];

  Traffic.prototype.setup = function() {
    var dir, i, j, l, lane, len, len1, m, n, ref, ref1, ref2, ref3, results;
    ref = [[], []], this.intersections = ref[0], this.lanes = ref[1];
    this.grid = (function() {
      results = [];
      for (var l = 0, ref1 = S.size; 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var l, ref1, results;
        return (function() {
          results = [];
          for (var l = 0, ref1 = S.size; 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results.push(l); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
          return intersection;
        });
      };
    })(this));
    ref2 = this.intersections;
    for (m = 0, len = ref2.length; m < len; m++) {
      i = ref2[m];
      ref3 = this.directions;
      for (n = 0, len1 = ref3.length; n < len1; n++) {
        dir = ref3[n];
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
          i.set_beg_lane(lane);
        }
      }
    }
    return this.cars = _.map(_.sample(this.lanes, 30), function(lane) {
      return new Car(lane);
    });
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    return _.invoke(this.lanes, 'tick');
  };

  return Traffic;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    this.el = el;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLElBQUEsRUFBTSxFQUFOO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxJQUFBLEVBQU0sR0FGTjtFQUdBLEtBQUEsRUFBTyxDQUhQOzs7QUFLRCxDQUFDLENBQUMsV0FBRixHQUFnQjs7QUFFVjtFQUNRLGNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQ1osUUFBQTtJQURhLElBQUMsQ0FBQSxNQUFEO0lBQUssSUFBQyxDQUFBLE1BQUQ7SUFBSyxJQUFDLENBQUEsWUFBRDtJQUN2QixJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWDtJQUNOLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLFdBQUYsR0FBYztJ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LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuUyA9XG5cdHNpemU6IDEwXG5cdHN0b3BwaW5nX3RpbWU6IDVcblx0cGFjZTogMTAwXG5cdHNwYWNlOiAyXG5cblMubGFuZV9sZW5ndGggPSAxMFxuXG5jbGFzcyBMYW5lXG5cdGNvbnN0cnVjdG9yOiAoQGJlZyxAZW5kLEBkaXJlY3Rpb24pLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdsYW5lLSdcblx0XHRAbGVuZ3RoID0gUy5sYW5lX2xlbmd0aC0xXG5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnkgXG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRbQGEsQGJdID0gW2EsYl1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGhdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblxuXHRcdEBjYXJzID0gW11cblxuXHRpc19mcmVlOi0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoPT0wXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdCEoQGNhcnNbMF0ubG9jPT0wKVxuXG5cdG1vdmVfY2FyOiAoY2FyKS0+XG5cdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdGNhci5zZXRfeHkgQHNjYWxlIGNhci5sb2Ncblx0XHRpZiBjYXIubG9jID09IEBsZW5ndGhcblx0XHRcdEBlbmQucmVjZWl2ZSBjYXJcblxuXHR0aWNrOiAtPlxuXHRcdF8uZm9yRWFjaCBAY2FycywoY2FyLGksayk9PlxuXHRcdFx0aWYgY2FyLmF0X2ludGVyc2VjdGlvblxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGlmIGNhci5zdG9wcGVkXG5cdFx0XHRcdHJldHVybiBjYXIuc3VidHJhY3Rfc3RvcCgpXG5cdFx0XHRpZiAobmV4dF9jYXI9a1tpKzFdKVxuXHRcdFx0XHRpZiAobmV4dF9jYXIubG9jLWNhci5sb2MpPj1TLnNwYWNlXG5cdFx0XHRcdFx0cmV0dXJuIEBtb3ZlX2NhciBjYXJcblx0XHRcdFx0cmV0dXJuIGNhci5zdG9wKClcblx0XHRcdEBtb3ZlX2NhciBjYXJcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gZmFsc2Vcblx0XHRjYXIuc3RvcHBlZCA9IDBcblx0XHRAY2Fycy51bnNoaWZ0IGNhclxuXHRcdGNhci5yZXNldF9sb2MoKVxuXHRcdGNhci5zZXRfeHkgQHNjYWxlIGNhci5sb2NcblxuXHRyZW1vdmU6IChjYXIpLT5cblx0XHRAY2Fycy5zcGxpY2UgQGNhcnMuaW5kZXhPZiBjYXJcblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOiAoQGxhbmUpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdEBzdG9wcGVkID0gMFxuXHRcdEBsYW5lLnJlY2VpdmUgdGhpc1xuXHRcdEBzZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0e0B4LEB5fSA9IEBsYW5lLnNjYWxlIChAbG9jID0gXy5yYW5kb20gMiw1KVxuXHRcdEBjb2xvciA9IF8uc2FtcGxlIEBjb2xvcnNcblxuXHRzdWJ0cmFjdF9zdG9wOi0+XG5cdFx0QHN0b3BwZWQtLVxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdHNldF9hdF9pbnRlcnNlY3Rpb246IChAYXRfaW50ZXJzZWN0aW9uKS0+XG5cblx0c2V0X2xhbmU6IChAbGFuZSktPlxuXG5cdHN0b3A6IC0+XG5cdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWUgXG5cblx0YWR2YW5jZTotPlxuXHRcdEBsb2MrK1xuXG5cdHNldF94eTogKHBvcyktPlxuXHRcdHtAeCxAeX0gPSBwb3NcblxuXHRyZXNldF9sb2M6IC0+XG5cdFx0QGxvYz0wXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRAbGFuZXMgPSB7fVxuXHRcdEBjYXJzX3dhaXRpbmcgPSBbXVxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gdHJ1ZVxuXHRcdEBjYXJzX3dhaXRpbmcucHVzaCBjYXJcblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGxhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHR0dXJuX2NhcjooY2FyLGxhbmUpLT5cblx0XHRjYXIubGFuZS5yZW1vdmUgY2FyXG5cdFx0Y2FyLnNldF9sYW5lIGxhbmVcblx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cblx0dGljazogLT5cblx0XHRpZiBAY2Fyc193YWl0aW5nLmxlbmd0aCA+IDBcblx0XHRcdGxhbmUgPSBfLnNhbXBsZSBfLnZhbHVlcyBAbGFuZXNcblx0XHRcdGlmIGxhbmUuaXNfZnJlZSgpXG5cdFx0XHRcdEB0dXJuX2NhciBAY2Fyc193YWl0aW5nLnNoaWZ0KCksbGFuZVxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXNdID0gW1tdLFtdXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZSA9IG5ldyBMYW5lIGksaixkaXIpICNpIGlzIHRoZSBlbmRcblx0XHRcdFx0XHRpLnNldF9iZWdfbGFuZSBsYW5lXG5cdFx0QGNhcnMgPSBfLm1hcCBfLnNhbXBsZShAbGFuZXMsMzApLCAobGFuZSktPm5ldyBDYXIgbGFuZVxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5pbnZva2UgQGludGVyc2VjdGlvbnMsJ3RpY2snXG5cdFx0Xy5pbnZva2UgQGxhbmVzLCAndGljaydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdHRydWVcblx0XHRcdCwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdGQzLnRpbWVyLmZsdXNoKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGgqMS4yXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzXVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmVFbiA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUVuXG5cblx0XHRAbGluZUV4ID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRXhcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEBjdW1cblx0ZW46IC0+XG5cdFx0QGxpbmVFbiBAY3VtXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGN1bTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2FycyouOF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNTVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLm5cblx0XHRcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2FyczogMjUwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRzcGFjZTogNVxuXHRcdFx0cGFjZTogMTVcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDZcblx0XHRcdGRpc3RhbmNlOiA2MFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRydXNoX2xlbmd0aDogMjUwXG5cdFx0XHRmcmVxdWVuY3k6IDhcblx0XHRcdHJsOiAxMDAwXG5cdFx0XHRwaGFzZTogNTBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fc2lnbmFsczogMTBcblx0XHRcdGRheTogMFxuXHRcdFx0b2Zmc2V0OiAwXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBybCxAcmwvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBybF1cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
