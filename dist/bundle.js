(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, S, Signal, Traffic, _, angular, d3, signalDer, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  size: 10,
  stopping_time: 5,
  pace: 100,
  space: 2,
  phase: 50,
  green: .5,
  lane_length: 10
};

Signal = (function() {
  function Signal() {
    this.count = 0;
    this.direction = 'up_down';
    this.id = _.uniqueId('signal-');
  }

  Signal.prototype.tick = function() {
    var ref;
    this.count++;
    if (this.count >= S.phase) {
      ref = [0, 'up_down'], this.count = ref[0], this.direction = ref[1];
      return;
    }
    if (this.count >= (S.green * S.phase)) {
      return this.direction = 'left_right';
    }
  };

  return Signal;

})();

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

  Intersection.prototype.turn_car = function(car, lane) {
    car.lane.remove(car);
    car.set_lane(lane);
    return lane.receive(car);
  };

  Intersection.prototype.tick = function() {
    var cars, lane;
    this.signal.tick();
    cars = this.cars_waiting[this.signal.direction];
    if (cars.length > 0) {
      lane = _.sample(_.values(this.lanes));
      if (lane.is_free()) {
        return this.turn_car(cars.shift(), lane);
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
    return this.cars = _.map(this.lanes, function(lane) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLElBQUEsRUFBTSxFQUFOO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxJQUFBLEVBQU0sR0FGTjtFQUdBLEtBQUEsRUFBTyxDQUhQO0VBSUEsS0FBQSxFQUFPLEVBSlA7RUFLQSxLQUFBLEVBQU8sRUFMUDtFQU1BLFdBQUEsRUFBYSxFQU5iOzs7QUFRSztFQUNRLGdCQUFBO0lBQ1osSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsQ0FBQyxRQUFGLENBQVcsU0FBWDtFQUhNOzttQkFLYixJQUFBLEdBQU0sU0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRDtJ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RUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDVCxDQUFDLE1BRFEsQ0FDRCxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsRUFBVSxJQUFDLENBQUEsRUFBWCxFQUFjLElBQUMsQ0FBQSxFQUFELEdBQUksQ0FBbEIsQ0FEQyxDQUVULENBQUMsS0FGUSxDQUVGLENBQ04sU0FETSxFQUVOLFNBRk0sRUFHTixTQUhNLEVBSU4sU0FKTSxFQUtOLFNBTE0sRUFNTixTQU5NLENBRkU7SUFXVixJQUFDLENBQUEsS0FBRCxHQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1IsQ0FBQyxNQURPLENBQ0EsQ0FBQyxDQUFELEVBQUcsSUFBQyxDQUFBLEVBQUosQ0FEQSxDQUVSLENBQUMsS0FGTyxDQUVELENBQUMsQ0FBRCxFQUFHLEdBQUgsQ0FGQztFQS9CRTs7cUJBbUNaLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLElBQUQ7RUFEUTs7cUJBRVQsVUFBQSxHQUFZLFNBQUE7SUFDWCxJQUFDLENBQUEsR0FBRDtXQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7RUFGRzs7Ozs7O0FBSWIsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuUyA9XG5cdHNpemU6IDEwXG5cdHN0b3BwaW5nX3RpbWU6IDVcblx0cGFjZTogMTAwXG5cdHNwYWNlOiAyXG5cdHBoYXNlOiA1MFxuXHRncmVlbjogLjVcblx0bGFuZV9sZW5ndGg6IDEwXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55IFxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0W0BhLEBiXSA9IFthLGJdXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cblx0XHRAY2FycyA9IFtdXG5cblx0aXNfZnJlZTotPlxuXHRcdGlmIEBjYXJzLmxlbmd0aD09MFxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHQhKEBjYXJzWzBdLmxvYz09MClcblxuXHRtb3ZlX2NhcjogKGNhciktPlxuXHRcdGNhci5hZHZhbmNlKClcblx0XHRjYXIuc2V0X3h5IEBzY2FsZSBjYXIubG9jXG5cdFx0aWYgY2FyLmxvYyA9PSBAbGVuZ3RoXG5cdFx0XHRAZW5kLnJlY2VpdmUgY2FyXG5cblx0dGljazogLT5cblx0XHRfLmZvckVhY2ggQGNhcnMsKGNhcixpLGspPT5cblx0XHRcdGlmIGNhci5hdF9pbnRlcnNlY3Rpb25cblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRpZiBjYXIuc3RvcHBlZFxuXHRcdFx0XHRyZXR1cm4gY2FyLnN1YnRyYWN0X3N0b3AoKVxuXHRcdFx0aWYgKG5leHRfY2FyPWtbaSsxXSlcblx0XHRcdFx0aWYgKG5leHRfY2FyLmxvYy1jYXIubG9jKT49Uy5zcGFjZVxuXHRcdFx0XHRcdHJldHVybiBAbW92ZV9jYXIgY2FyXG5cdFx0XHRcdHJldHVybiBjYXIuc3RvcCgpXG5cdFx0XHRAbW92ZV9jYXIgY2FyXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0Y2FyLnN0b3BwZWQgPSAwXG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblx0XHRjYXIucmVzZXRfbG9jKClcblx0XHRjYXIuc2V0X3h5IEBzY2FsZSBjYXIubG9jXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGNhcnMuc3BsaWNlIEBjYXJzLmluZGV4T2YgY2FyXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBsYW5lKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2FyLSdcblx0XHRAc3RvcHBlZCA9IDBcblx0XHRAbGFuZS5yZWNlaXZlIHRoaXNcblx0XHRAc2V0X2F0X2ludGVyc2VjdGlvbiBmYWxzZVxuXHRcdHtAeCxAeX0gPSBAbGFuZS5zY2FsZSAoQGxvYyA9IF8ucmFuZG9tIDIsNSlcblx0XHRAY29sb3IgPSBfLnNhbXBsZSBAY29sb3JzXG5cblx0c3VidHJhY3Rfc3RvcDotPlxuXHRcdEBzdG9wcGVkLS1cblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRzZXRfYXRfaW50ZXJzZWN0aW9uOiAoQGF0X2ludGVyc2VjdGlvbiktPlxuXG5cdHNldF9sYW5lOiAoQGxhbmUpLT5cblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdGFkdmFuY2U6LT5cblx0XHRAbG9jKytcblxuXHRzZXRfeHk6IChwb3MpLT5cblx0XHR7QHgsQHl9ID0gcG9zXG5cblx0cmVzZXRfbG9jOiAtPlxuXHRcdEBsb2M9MFxuXG5jbGFzcyBJbnRlcnNlY3Rpb25cblx0Y29uc3RydWN0b3I6KEByb3csQGNvbCktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2ludGVyc2VjdGlvbi0nXG5cdFx0QGxhbmVzID0ge31cblx0XHR1cF9kb3duID0gW11cblx0XHRsZWZ0X3JpZ2h0ID0gW11cblx0XHRAY2Fyc193YWl0aW5nID0gXG5cdFx0XHR1cDogdXBfZG93blxuXHRcdFx0ZG93bjogdXBfZG93blxuXHRcdFx0bGVmdDogbGVmdF9yaWdodFxuXHRcdFx0cmlnaHQ6IGxlZnRfcmlnaHRcblx0XHRcdHVwX2Rvd246IHVwX2Rvd25cblx0XHRcdGxlZnRfcmlnaHQ6IGxlZnRfcmlnaHRcblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIHRydWVcblx0XHRAY2Fyc193YWl0aW5nW2Nhci5sYW5lLmRpcmVjdGlvbl0ucHVzaCBjYXJcblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGxhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHR0dXJuX2NhcjooY2FyLGxhbmUpLT5cblx0XHRjYXIubGFuZS5yZW1vdmUgY2FyXG5cdFx0Y2FyLnNldF9sYW5lIGxhbmVcblx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXHRcdGNhcnMgPSBAY2Fyc193YWl0aW5nW0BzaWduYWwuZGlyZWN0aW9uXVxuXHRcdGlmIGNhcnMubGVuZ3RoID4gMFxuXHRcdFx0bGFuZSA9IF8uc2FtcGxlIF8udmFsdWVzIEBsYW5lc1xuXHRcdFx0aWYgbGFuZS5pc19mcmVlKClcblx0XHRcdFx0QHR1cm5fY2FyIGNhcnMuc2hpZnQoKSxsYW5lXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0ZGlyZWN0aW9uczogWyd1cCcsJ3JpZ2h0JywnZG93bicsJ2xlZnQnXVxuXG5cdHNldHVwOi0+XG5cdFx0W0BpbnRlcnNlY3Rpb25zLEBsYW5lc10gPSBbW10sW11dXG5cblx0XHRAZ3JpZCA9IFswLi5TLnNpemVdLm1hcCAocm93KT0+XG5cdFx0XHRbMC4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIChsYW5lID0gbmV3IExhbmUgaSxqLGRpcikgI2kgaXMgdGhlIGVuZFxuXHRcdFx0XHRcdGkuc2V0X2JlZ19sYW5lIGxhbmVcblx0XHRAY2FycyA9IF8ubWFwIEBsYW5lcywgKGxhbmUpLT5uZXcgQ2FyIGxhbmVcblxuXHR0aWNrOiAtPlxuXHRcdF8uaW52b2tlIEBpbnRlcnNlY3Rpb25zLCd0aWNrJ1xuXHRcdF8uaW52b2tlIEBsYW5lcywgJ3RpY2snXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdEBzY29wZS50cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHR0cnVlXG5cdFx0XHQsIFMucGFjZVxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdCMgLnRyYW5zaXRpb24oKVxuXHRcdFx0XHRcdCMgLmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdCMgLmRlbGF5IChkLGkpLT4gaSo1MFxuXHRcdFx0XHRcdCMgLmR1cmF0aW9uIDIwMFxuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aCoxLjJdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAxNVxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
