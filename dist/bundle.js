(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ctrl, S, Traffic, _, angular, d3, signalDer, visDer;

_ = require('lodash');

angular = require('angular');

d3 = require('d3');

S = require('./models/settings');

Traffic = require('./models/traffic');

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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer);



},{"./models/settings":5,"./models/traffic":7,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Car, S, _;

_ = require('lodash');

S = require('./settings');

Car = (function() {
  function Car(turns, d_loc) {
    this.turns = turns;
    this.d_loc = d_loc;
    this.id = _.uniqueId('car-');
    this.stopped = 0;
    this.color = _.sample(this.colors);
  }

  Car.prototype.subtract_stop = function() {
    return this.stopped--;
  };

  Car.prototype.at_destination = function() {
    return (this.turns.length === 0) && (this.loc === this.d_loc);
  };

  Car.prototype.colors = ['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5'];

  Car.prototype.set_at_intersection = function(at_intersection) {
    this.at_intersection = at_intersection;
  };

  Car.prototype.set_lane = function(lane) {
    this.lane = lane;
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

  return Car;

})();

module.exports = Car;



},{"./settings":5,"lodash":undefined}],3:[function(require,module,exports){
var Intersection, S, Signal, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

S = require('./settings');

Signal = require('./signal');

Intersection = (function() {
  function Intersection(row, col) {
    var ref;
    this.row = row;
    this.col = col;
    this.id = _.uniqueId('intersection-');
    ref = [{}, {}], this.beg_lanes = ref[0], this.end_lanes = ref[1];
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
    this.signal = new Signal;
    this.directions = {
      'up_down': ['up', 'down'],
      'left_right': ['left', 'right']
    };
  }

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.beg_lanes[lane.direction] = lane;
  };

  Intersection.prototype.set_end_lane = function(lane) {
    return this.end_lanes[lane.direction] = lane;
  };

  Intersection.prototype.can_go = function(direction) {
    return indexOf.call(this.directions[this.signal.direction], direction) >= 0;
  };

  Intersection.prototype.tick = function() {
    return this.signal.tick();
  };

  return Intersection;

})();

module.exports = Intersection;



},{"./settings":5,"./signal":6,"lodash":undefined}],4:[function(require,module,exports){
var Lane, S, _, d3;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Lane = (function() {
  function Lane(beg, end, direction) {
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.length = S.lane_length - 1;
    this.beg.set_beg_lane(this);
    this.end.set_end_lane(this);
    this.cars = [];
    this.setup();
  }

  Lane.prototype.setup = function() {
    var a, b;
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
    return this.scale = d3.scale.linear().domain([0, S.lane_length]).range([(this.a = a), (this.b = b)]);
  };

  Lane.prototype.is_free = function() {
    if (this.cars.length === 0) {
      return true;
    } else {
      return this.cars[0].loc > 0;
    }
  };

  Lane.prototype.move_car = function(car) {
    var target;
    if (car.loc === this.length) {
      if (this.end.can_go(this.direction)) {
        target = this.end.beg_lanes[car.turns[0]];
        if (target.is_free()) {
          car.turns.shift();
          _.remove(this.cars, car);
          return target.receive(car);
        } else {
          return car.stop();
        }
      } else {
        return car.stop();
      }
    } else {
      car.advance();
      car.set_xy(this.scale(car.loc));
      if (car.at_destination()) {
        return _.remove(this.cars, car);
      }
    }
  };

  Lane.prototype.tick = function() {
    return this.cars.forEach((function(_this) {
      return function(car, i, k) {
        if (car.stopped) {
          return car.subtract_stop();
        } else if (k[i + 1]) {
          if ((k[i + 1].loc - car.loc) >= S.space) {
            return _this.move_car(car);
          } else {
            return car.stop();
          }
        } else {
          return _this.move_car(car);
        }
      };
    })(this));
  };

  Lane.prototype.receive = function(car) {
    car.set_at_intersection(false);
    car.stopped = 0;
    car.loc = 0;
    this.cars.unshift(car);
    return car.set_xy(this.scale(car.loc));
  };

  Lane.prototype.remove = function(car) {
    return this.cars.splice(this.cars.indexOf(car));
  };

  return Lane;

})();

module.exports = Lane;



},{"./settings":5,"d3":undefined,"lodash":undefined}],5:[function(require,module,exports){
var S;

S = {
  size: 10,
  stopping_time: 5,
  pace: 100,
  space: 2,
  phase: 50,
  green: .5,
  lane_length: 10
};

module.exports = S;



},{}],6:[function(require,module,exports){
var S, Signal, _;

_ = require('lodash');

S = require('./settings');

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

module.exports = Signal;



},{"./settings":5,"lodash":undefined}],7:[function(require,module,exports){
var Car, Intersection, Lane, S, Signal, Traffic, _;

_ = require('lodash');

S = require('./settings');

Lane = require('./lane');

Intersection = require('./intersection');

Signal = require('./signal');

Car = require('./car');

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.directions = ['up', 'right', 'down', 'left'];

  Traffic.prototype.create_car = function() {
    var a, b, car, k, l, lane, lr, lrs, ref, ref1, results, results1, turns, ud, uds;
    a = _.sample(this.outer);
    b = _.sample(this.inner);
    ud = b.row < a.row ? 'up' : 'down';
    lr = b.col < a.col ? 'left' : 'right';
    uds = (function() {
      results = [];
      for (var k = 0, ref = Math.abs(b.row - a.row); 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map(function(i) {
      return ud;
    });
    lrs = (function() {
      results1 = [];
      for (var l = 0, ref1 = Math.abs(b.col - a.col); 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results1.push(l); }
      return results1;
    }).apply(this).map(function(i) {
      return lr;
    });
    turns = _.shuffle(_.flatten([uds, lrs]));
    turns.pop();
    lane = a.beg_lanes[turns.shift()];
    car = new Car(turns, _.random(2, 8));
    car.b = b;
    lane.receive(car);
    return this.cars.push(car);
  };

  Traffic.prototype.setup = function() {
    var dir, i, j, k, l, len, len1, m, n, ref, ref1, ref2, ref3, results, results1;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.cars = ref[2];
    this.outer = [];
    this.inner = [];
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
          if (((0 < row && row < S.size)) && ((0 < col && col < S.size))) {
            _this.inner.push(intersection);
            intersection.inner = true;
          } else {
            _this.outer.push(intersection);
            intersection.outer = true;
          }
          return intersection;
        });
      };
    })(this));
    ref2 = this.intersections;
    for (l = 0, len = ref2.length; l < len; l++) {
      i = ref2[l];
      ref3 = this.directions;
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
          this.lanes.push(new Lane(i, j, dir));
        }
      }
    }
    results1 = [];
    for (i = n = 0; n <= 200; i = ++n) {
      results1.push(this.create_car());
    }
    return results1;
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    return _.invoke(this.lanes, 'tick');
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":2,"./intersection":3,"./lane":4,"./settings":5,"./signal":6,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0VBSFY7O2lCQUtaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7V0FDVixZQUFBLEdBQWEsR0FBRyxDQUFDLENBQWpCLEdBQW1CLEdB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Qiw0QkFBdkI7b0JBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtBQUFBOztFQTFCSzs7b0JBNEJOLElBQUEsR0FBTSxTQUFBO0lBQ0wsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsYUFBVixFQUF3QixNQUF4QjtXQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLEtBQVYsRUFBaUIsTUFBakI7RUFGSzs7Ozs7O0FBSVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5zaWduYWxEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRkaXJlY3Rpb246Jz0nXG5cdFx0bGluazooc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2lnbmFscyA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0QWxsICdzaWduYWxzJ1xuXHRcdFx0XHQuZGF0YSBbJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0JywndXBfZG93bicsJ2xlZnRfcmlnaHQnXVxuXHRcdFx0XHQuZW50ZXIoKVxuXHRcdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdHdpZHRoOiAxLjJcblx0XHRcdFx0XHRoZWlnaHQ6IC42XG5cdFx0XHRcdFx0Y2xhc3M6ICdzaWduYWwnXG5cdFx0XHRcdFx0eTogLTEuMlxuXHRcdFx0XHRcdHg6LS42XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAoZCxpKS0+XG5cdFx0XHRcdFx0XHRcInJvdGF0ZSgjezkwKml9KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAnZGlyZWN0aW9uJywobmV3VmFsKS0+XG5cdFx0XHRcdHNpZ25hbHNcblx0XHRcdFx0XHQuY2xhc3NlZCAnb24nLCAoZCktPiBkPT1uZXdWYWxcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ3NpZ25hbERlcicsc2lnbmFsRGVyXG5cdCMgLmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdCMgLmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdCMgLmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQjIC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG4iLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAdHVybnMsQGRfbG9jKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2FyLSdcblx0XHRAc3RvcHBlZCA9IDBcblx0XHRAY29sb3IgPSBfLnNhbXBsZSBAY29sb3JzXG5cblx0c3VidHJhY3Rfc3RvcDotPlxuXHRcdEBzdG9wcGVkLS1cblxuXHRhdF9kZXN0aW5hdGlvbjogLT5cblx0XHQoQHR1cm5zLmxlbmd0aCA9PSAwKSBhbmQgKEBsb2M9PUBkX2xvYylcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRzZXRfYXRfaW50ZXJzZWN0aW9uOiAoQGF0X2ludGVyc2VjdGlvbiktPlxuXG5cdHNldF9sYW5lOiAoQGxhbmUpLT5cblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdGFkdmFuY2U6LT5cblx0XHRAbG9jKytcblxuXHRzZXRfeHk6IChwb3MpLT5cblx0XHR7QHgsQHl9ID0gcG9zXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRjYW5fZ286IChkaXJlY3Rpb24pLT5cblx0XHRkaXJlY3Rpb24gaW4gQGRpcmVjdGlvbnNbQHNpZ25hbC5kaXJlY3Rpb25dXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBsZW5ndGggPSBTLmxhbmVfbGVuZ3RoLTFcblx0XHRAYmVnLnNldF9iZWdfbGFuZSB0aGlzXG5cdFx0QGVuZC5zZXRfZW5kX2xhbmUgdGhpc1xuXHRcdEBjYXJzID0gW11cblx0XHRAc2V0dXAoKVxuXG5cdHNldHVwOiAtPlxuXHRcdGEgPSBcblx0XHRcdHg6IEBiZWcucG9zLnhcblx0XHRcdHk6IEBiZWcucG9zLnlcblxuXHRcdGIgPSBcblx0XHRcdHg6IEBlbmQucG9zLnggIFxuXHRcdFx0eTogQGVuZC5wb3MueVxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aF1cblx0XHRcdC5yYW5nZSBbKEBhPWEpLChAYj1iKV1cblxuXHRpc19mcmVlOi0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoPT0wXG5cdFx0XHR0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QGNhcnNbMF0ubG9jPjBcblxuXHRtb3ZlX2NhcjogKGNhciktPlxuXHRcdGlmIGNhci5sb2MgPT0gQGxlbmd0aFxuXHRcdFx0aWYgQGVuZC5jYW5fZ28gQGRpcmVjdGlvblxuXHRcdFx0XHR0YXJnZXQgPSBAZW5kLmJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKClcblx0XHRcdFx0XHRjYXIudHVybnMuc2hpZnQoKVxuXHRcdFx0XHRcdF8ucmVtb3ZlIEBjYXJzLCBjYXJcblx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0ZWxzZSBcblx0XHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0ZWxzZSBcblx0XHRcdGNhci5hZHZhbmNlKClcblx0XHRcdGNhci5zZXRfeHkgQHNjYWxlIGNhci5sb2Ncblx0XHRcdGlmIGNhci5hdF9kZXN0aW5hdGlvbigpXG5cdFx0XHRcdF8ucmVtb3ZlIEBjYXJzLCBjYXJcblxuXHR0aWNrOiAtPlxuXHRcdEBjYXJzLmZvckVhY2ggKGNhcixpLGspPT5cblx0XHRcdGlmIGNhci5zdG9wcGVkXG5cdFx0XHRcdGNhci5zdWJ0cmFjdF9zdG9wKClcblx0XHRcdGVsc2UgaWYga1tpKzFdXG5cdFx0XHRcdGlmIChrW2krMV0ubG9jLWNhci5sb2MpPj1TLnNwYWNlXG5cdFx0XHRcdFx0QG1vdmVfY2FyIGNhclxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0Y2FyLnN0b3AoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAbW92ZV9jYXIgY2FyXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0Y2FyLnN0b3BwZWQgPSAwXG5cdFx0Y2FyLmxvYyA9IDBcblx0XHRAY2Fycy51bnNoaWZ0IGNhclxuXHRcdGNhci5zZXRfeHkgQHNjYWxlIGNhci5sb2NcblxuXHRyZW1vdmU6IChjYXIpLT5cblx0XHRAY2Fycy5zcGxpY2UgQGNhcnMuaW5kZXhPZiBjYXJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIlMgPVxuXHRzaXplOiAxMFxuXHRzdG9wcGluZ190aW1lOiA1XG5cdHBhY2U6IDEwMFxuXHRzcGFjZTogMlxuXHRwaGFzZTogNTBcblx0Z3JlZW46IC41XG5cdGxhbmVfbGVuZ3RoOiAxMFxuXG5tb2R1bGUuZXhwb3J0cyA9IFMiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblxuXHRjcmVhdGVfY2FyOiAtPlxuXHRcdGEgPSBfLnNhbXBsZSBAb3V0ZXJcblx0XHRiID0gXy5zYW1wbGUgQGlubmVyXG5cdFx0dWQgPSBpZiBiLnJvdyA8IGEucm93IHRoZW4gJ3VwJyBlbHNlICdkb3duJ1xuXHRcdGxyID0gaWYgYi5jb2wgPCBhLmNvbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblx0XHR1ZHMgPSBbMC4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXS5tYXAgKGkpLT4gdWRcblx0XHRscnMgPSBbMC4uTWF0aC5hYnMoYi5jb2wtYS5jb2wpXS5tYXAgKGkpLT4gbHJcblx0XHR0dXJucyA9IF8uc2h1ZmZsZSBfLmZsYXR0ZW4gW3VkcyxscnNdXG5cdFx0dHVybnMucG9wKClcblx0XHRsYW5lID0gYS5iZWdfbGFuZXNbdHVybnMuc2hpZnQoKV1cblx0XHRjYXIgPSBuZXcgQ2FyIHR1cm5zLF8ucmFuZG9tIDIsOFxuXHRcdGNhci5iID0gYlxuXHRcdGxhbmUucmVjZWl2ZSBjYXJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHNldHVwOi0+XG5cdFx0W0BpbnRlcnNlY3Rpb25zLEBsYW5lcyxAY2Fyc10gPSBbW10sW10sW11dXG5cdFx0QG91dGVyID0gW11cblx0XHRAaW5uZXIgPSBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpZiAoMDxyb3c8Uy5zaXplKSBhbmQgKDA8Y29sPFMuc2l6ZSlcblx0XHRcdFx0XHRAaW5uZXIucHVzaCBpbnRlcnNlY3Rpb25cblx0XHRcdFx0XHRpbnRlcnNlY3Rpb24uaW5uZXIgPSB0cnVlXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpbnRlcnNlY3Rpb25cblx0XHRcdFx0XHRpbnRlcnNlY3Rpb24ub3V0ZXIgPSB0cnVlXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCBuZXcgTGFuZSBpLGosZGlyXG5cblx0XHRAY3JlYXRlX2NhcigpIGZvciBpIGluIFswLi4yMDBdXG5cblx0dGljazogLT5cblx0XHRfLmludm9rZSBAaW50ZXJzZWN0aW9ucywndGljaydcblx0XHRfLmludm9rZSBAbGFuZXMsICd0aWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiXX0=
