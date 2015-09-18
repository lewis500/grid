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
  function Car(turns, destination) {
    this.turns = turns;
    this.destination = destination;
    this.id = _.uniqueId('car-');
    this.stopped = 0;
    this.color = _.sample(this.colors);
  }

  Car.prototype.subtract_stop = function() {
    return this.stopped--;
  };

  Car.prototype.at_destination = function() {
    return (this.destination.x === this._x) && (this.destination.y === this._y);
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

  Car.prototype.set_xy = function(pos, _pos) {
    var ref;
    this.x = pos.x, this.y = pos.y;
    return ref = [_pos.x, _pos.y], this._x = ref[0], this._y = ref[1], ref;
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
    var a, b, ref, ref1;
    this._scale = d3.scale.linear().domain([0, S.lane_length]);
    if ((ref = this.direction) === 'down' || ref === 'right') {
      this._scale.range([this.beg.pos, this.end.pos]);
    } else {
      this._scale.range([this.beg.pos, this.end.pos]);
    }
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
    ref1 = [a, b], this.a = ref1[0], this.b = ref1[1];
    return this.scale = d3.scale.linear().domain([0, S.lane_length]).range([a, b]);
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
      car.set_xy(this.scale(car.loc), this._scale(car.loc));
      if (car.at_destination()) {
        return _.remove(this.cars, car);
      }
    }
  };

  Lane.prototype.tick = function() {
    return _.forEach(this.cars, (function(_this) {
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
    return car.set_xy(this.scale(car.loc), this._scale(car.loc));
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
    var car, d, end, lane, start, turns;
    start = _.sample(this.outer);
    end = _.sample(this.inner);
    d = {
      x: i.pos.x + 20,
      y: i.pos.y - 35
    };
    turns = ['up', 'up', 'up', 'up', 'right', 'right', 'down'];
    lane = i.beg_lanes[turns.shift()];
    car = new Car(turns, d);
    lane.receive(car);
    return this.cars.push(car);
  };

  Traffic.prototype.setup = function() {
    var dir, i, j, k, l, len, len1, m, ref, ref1, ref2, ref3, results;
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
          if (row < S.size && col < S.size) {
            _this.inner.push(intersection);
          } else {
            _this.outer.push(intersection);
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
    return this.create_car();
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    return _.invoke(this.lanes, 'tick');
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":2,"./intersection":3,"./lane":4,"./settings":5,"./signal":6,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0VBSFY7O2lCQUtaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7V0FDVixZQUFBLEdBQWEsR0FBRyxDQUFDLENBQWpCLEdBQW1CLEdB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TjtBQUY1QixpQkFHRSxNQUhGO2lFQUc4QixDQUFBLENBQUMsQ0FBQyxHQUFGO0FBSDlCLGlCQUlFLE1BSkY7cUJBSWMsSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFDLENBQUMsR0FBRixDQUFPLENBQUEsQ0FBQyxDQUFDLEdBQUYsR0FBTSxDQUFOO0FBSjNCOztRQUtKLElBQUcsQ0FBSDtVQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFnQixJQUFBLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUCxFQUFTLEdBQVQsQ0FBaEIsRUFERDs7QUFORDtBQUREO1dBVUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQXhCSzs7b0JBMEJOLElBQUEsR0FBTSxTQUFBO0lBQ0wsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsYUFBVixFQUF3QixNQUF4QjtXQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLEtBQVYsRUFBaUIsTUFBakI7RUFGSzs7Ozs7O0FBSVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5zaWduYWxEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRkaXJlY3Rpb246Jz0nXG5cdFx0bGluazooc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2lnbmFscyA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0QWxsICdzaWduYWxzJ1xuXHRcdFx0XHQuZGF0YSBbJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0JywndXBfZG93bicsJ2xlZnRfcmlnaHQnXVxuXHRcdFx0XHQuZW50ZXIoKVxuXHRcdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdHdpZHRoOiAxLjJcblx0XHRcdFx0XHRoZWlnaHQ6IC42XG5cdFx0XHRcdFx0Y2xhc3M6ICdzaWduYWwnXG5cdFx0XHRcdFx0eTogLTEuMlxuXHRcdFx0XHRcdHg6LS42XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAoZCxpKS0+XG5cdFx0XHRcdFx0XHRcInJvdGF0ZSgjezkwKml9KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAnZGlyZWN0aW9uJywobmV3VmFsKS0+XG5cdFx0XHRcdHNpZ25hbHNcblx0XHRcdFx0XHQuY2xhc3NlZCAnb24nLCAoZCktPiBkPT1uZXdWYWxcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ3NpZ25hbERlcicsc2lnbmFsRGVyXG5cdCMgLmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdCMgLmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdCMgLmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQjIC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG4iLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAdHVybnMsQGRlc3RpbmF0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2FyLSdcblx0XHRAc3RvcHBlZCA9IDBcblx0XHRAY29sb3IgPSBfLnNhbXBsZSBAY29sb3JzXG5cblx0c3VidHJhY3Rfc3RvcDotPlxuXHRcdEBzdG9wcGVkLS1cblxuXHRhdF9kZXN0aW5hdGlvbjogLT5cblx0XHQoQGRlc3RpbmF0aW9uLnggPT0gQF94KSBhbmQgKEBkZXN0aW5hdGlvbi55ID09IEBfeSlcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRzZXRfYXRfaW50ZXJzZWN0aW9uOiAoQGF0X2ludGVyc2VjdGlvbiktPlxuXG5cdHNldF9sYW5lOiAoQGxhbmUpLT5cblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdGFkdmFuY2U6LT5cblx0XHRAbG9jKytcblxuXHRzZXRfeHk6IChwb3MsX3BvcyktPlxuXHRcdHtAeCxAeX0gPSBwb3Ncblx0XHRbQF94LEBfeV0gPSBbX3Bvcy54LF9wb3MueV1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBzZXR1cCgpXG5cblx0c2V0dXA6IC0+XG5cdFx0QF9zY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGhdXG5cblx0XHRpZiBAZGlyZWN0aW9uIGluIFsnZG93bicsJ3JpZ2h0J11cblx0XHRcdEBfc2NhbGUucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXHRcdGVsc2Vcblx0XHRcdEBfc2NhbGUucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRbQGEsQGJdID0gW2EsYl1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGhdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblxuXHRpc19mcmVlOi0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoPT0wXG5cdFx0XHR0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QGNhcnNbMF0ubG9jPjBcblxuXHRtb3ZlX2NhcjogKGNhciktPlxuXHRcdGlmIGNhci5sb2MgPT0gQGxlbmd0aFxuXHRcdFx0aWYgQGVuZC5jYW5fZ28gQGRpcmVjdGlvblxuXHRcdFx0XHR0YXJnZXQgPSBAZW5kLmJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKClcblx0XHRcdFx0XHRjYXIudHVybnMuc2hpZnQoKVxuXHRcdFx0XHRcdF8ucmVtb3ZlIEBjYXJzLCBjYXJcblx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0ZWxzZSBcblx0XHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0ZWxzZSBcblx0XHRcdGNhci5hZHZhbmNlKClcblx0XHRcdGNhci5zZXRfeHkoIEBzY2FsZShjYXIubG9jKSxAX3NjYWxlKGNhci5sb2MpKVxuXHRcdFx0aWYgY2FyLmF0X2Rlc3RpbmF0aW9uKClcblx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5mb3JFYWNoIEBjYXJzLChjYXIsaSxrKT0+XG5cdFx0XHRpZiBjYXIuc3RvcHBlZFxuXHRcdFx0XHRjYXIuc3VidHJhY3Rfc3RvcCgpXG5cdFx0XHRlbHNlIGlmIGtbaSsxXVxuXHRcdFx0XHRpZiAoa1tpKzFdLmxvYy1jYXIubG9jKT49Uy5zcGFjZVxuXHRcdFx0XHRcdEBtb3ZlX2NhciBjYXJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QG1vdmVfY2FyIGNhclxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRjYXIuc2V0X2F0X2ludGVyc2VjdGlvbiBmYWxzZVxuXHRcdGNhci5zdG9wcGVkID0gMFxuXHRcdGNhci5sb2MgPSAwXG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblx0XHRjYXIuc2V0X3h5KEBzY2FsZShjYXIubG9jKSxAX3NjYWxlKGNhci5sb2MpKVxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjYXJzLnNwbGljZSBAY2Fycy5pbmRleE9mIGNhclxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiUyA9XG5cdHNpemU6IDEwXG5cdHN0b3BwaW5nX3RpbWU6IDVcblx0cGFjZTogMTAwXG5cdHNwYWNlOiAyXG5cdHBoYXNlOiA1MFxuXHRncmVlbjogLjVcblx0bGFuZV9sZW5ndGg6IDEwXG5cbm1vZHVsZS5leHBvcnRzID0gUyIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZGlyZWN0aW9uID0gJ3VwX2Rvd24nXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID49IFMucGhhc2Vcblx0XHRcdFtAY291bnQsIEBkaXJlY3Rpb25dID0gWzAsICd1cF9kb3duJ10gI2FkZCBvZmZzZXQgbGF0ZXJcblx0XHRcdHJldHVyblxuXHRcdGlmIEBjb3VudCA+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGRpcmVjdGlvbiA9ICdsZWZ0X3JpZ2h0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkxhbmUgPSByZXF1aXJlICcuL2xhbmUnXG5JbnRlcnNlY3Rpb24gPSByZXF1aXJlICcuL2ludGVyc2VjdGlvbidcblNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0ZGlyZWN0aW9uczogWyd1cCcsJ3JpZ2h0JywnZG93bicsJ2xlZnQnXVxuXG5cdGNyZWF0ZV9jYXI6IC0+XG5cdFx0c3RhcnQgPSBfLnNhbXBsZSBAb3V0ZXJcblx0XHRlbmQgPSBfLnNhbXBsZSBAaW5uZXJcblx0XHQjIGlmIHN0YXJ0LlxuXHRcdCMgaSA9IF8ubGFzdChAZ3JpZClbM11cblx0XHRkID0ge3g6IGkucG9zLnggKyAyMCwgeTogaS5wb3MueSAtIDM1fVxuXHRcdHR1cm5zID0gWyd1cCcsJ3VwJywndXAnLCd1cCcsJ3JpZ2h0JywncmlnaHQnLCdkb3duJ11cblx0XHRsYW5lID0gaS5iZWdfbGFuZXNbdHVybnMuc2hpZnQoKV1cblx0XHRjYXIgPSBuZXcgQ2FyIHR1cm5zLGRcblx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cdFx0QGNhcnMucHVzaCBjYXJcblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXMsQGNhcnNdID0gW1tdLFtdLFtdXVxuXHRcdEBvdXRlciA9IFtdXG5cdFx0QGlubmVyID0gW11cblxuXHRcdEBncmlkID0gWzAuLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aWYgcm93PFMuc2l6ZSBhbmQgY29sPFMuc2l6ZVxuXHRcdFx0XHRcdEBpbm5lci5wdXNoIGludGVyc2VjdGlvblxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QG91dGVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCBuZXcgTGFuZSBpLGosZGlyXG5cblx0XHRAY3JlYXRlX2NhcigpXG5cblx0dGljazogLT5cblx0XHRfLmludm9rZSBAaW50ZXJzZWN0aW9ucywndGljaydcblx0XHRfLmludm9rZSBAbGFuZXMsICd0aWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiXX0=
