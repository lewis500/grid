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

  Ctrl.prototype.en_route = function(car) {
    return car.en_route;
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
    this.exited = false;
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

  Car.prototype.exit = function() {
    return this.exited = true;
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
        _.remove(this.cars, car);
        return car.exit();
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
  pace: 15,
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
    var a, b, car, l, lane, lr, lrs, m, ref, ref1, results, results1, turns, ud, uds;
    a = _.sample(this.outer);
    b = _.sample(this.inner);
    ud = b.row < a.row ? 'up' : 'down';
    lr = b.col < a.col ? 'left' : 'right';
    uds = (function() {
      results = [];
      for (var l = 0, ref = Math.abs(b.row - a.row); 0 <= ref ? l <= ref : l >= ref; 0 <= ref ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map(function(i) {
      return ud;
    });
    lrs = (function() {
      results1 = [];
      for (var m = 0, ref1 = Math.abs(b.col - a.col); 0 <= ref1 ? m <= ref1 : m >= ref1; 0 <= ref1 ? m++ : m--){ results1.push(m); }
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
    var dir, i, j, l, len, len1, m, n, o, ref, ref1, ref2, ref3, results, results1;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.cars = ref[2];
    this.outer = [];
    this.inner = [];
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
          this.lanes.push(new Lane(i, j, dir));
        }
      }
    }
    results1 = [];
    for (i = o = 0; o <= 200; i = ++o) {
      results1.push(this.create_car());
    }
    return results1;
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    _.invoke(this.lanes, 'tick');
    return this.cars.forEach(function(c, i, k) {
      if (c.exited) {
        return _.remove(k, c);
      }
    });
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":2,"./intersection":3,"./lane":4,"./settings":5,"./signal":6,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0VBSFY7O2lCQUtaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7V0FDVixZQUFBLEdBQWEsR0FBRyxDQUFDLENBQWpCLEdBQW1CLEdB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Q0FBQyxHQUFGLEdBQU0sQ0FBTjtBQUozQjs7UUFLSixJQUFHLENBQUg7VUFDQyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBZ0IsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxHQUFULENBQWhCLEVBREQ7O0FBTkQ7QUFERDtBQVVBO1NBQXVCLDRCQUF2QjtvQkFBQSxJQUFDLENBQUEsVUFBRCxDQUFBO0FBQUE7O0VBMUJLOztvQkE0Qk4sSUFBQSxHQUFNLFNBQUE7SUFDTCxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxhQUFWLEVBQXdCLE1BQXhCO0lBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsS0FBVixFQUFpQixNQUFqQjtXQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFjLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO01BQVUsSUFBRyxDQUFDLENBQUMsTUFBTDtlQUFpQixDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWpCOztJQUFWLENBQWQ7RUFISzs7Ozs7O0FBS1AsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRlbl9yb3V0ZTogKGNhciktPlxuXHRcdGNhci5lbl9yb3V0ZVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0IyAuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0IyAuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0IyAuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdCMgLmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEB0dXJucyxAZF9sb2MpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdEBzdG9wcGVkID0gMFxuXHRcdEBjb2xvciA9IF8uc2FtcGxlIEBjb2xvcnNcblx0XHRAZXhpdGVkID0gZmFsc2VcblxuXHRzdWJ0cmFjdF9zdG9wOi0+XG5cdFx0QHN0b3BwZWQtLVxuXG5cdGF0X2Rlc3RpbmF0aW9uOiAtPlxuXHRcdChAdHVybnMubGVuZ3RoID09IDApIGFuZCAoQGxvYz09QGRfbG9jKVxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdHNldF9hdF9pbnRlcnNlY3Rpb246IChAYXRfaW50ZXJzZWN0aW9uKS0+XG5cblx0c2V0X2xhbmU6IChAbGFuZSktPlxuXG5cdGV4aXQ6IC0+XG5cdFx0QGV4aXRlZCA9IHRydWVcblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdGFkdmFuY2U6LT5cblx0XHRAbG9jKytcblxuXHRzZXRfeHk6IChwb3MpLT5cblx0XHR7QHgsQHl9ID0gcG9zXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRjYW5fZ286IChkaXJlY3Rpb24pLT5cblx0XHRkaXJlY3Rpb24gaW4gQGRpcmVjdGlvbnNbQHNpZ25hbC5kaXJlY3Rpb25dXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBsZW5ndGggPSBTLmxhbmVfbGVuZ3RoLTFcblx0XHRAYmVnLnNldF9iZWdfbGFuZSB0aGlzXG5cdFx0QGVuZC5zZXRfZW5kX2xhbmUgdGhpc1xuXHRcdEBjYXJzID0gW11cblx0XHRAc2V0dXAoKVxuXG5cdHNldHVwOiAtPlxuXHRcdGEgPSBcblx0XHRcdHg6IEBiZWcucG9zLnhcblx0XHRcdHk6IEBiZWcucG9zLnlcblxuXHRcdGIgPSBcblx0XHRcdHg6IEBlbmQucG9zLnggIFxuXHRcdFx0eTogQGVuZC5wb3MueVxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aF1cblx0XHRcdC5yYW5nZSBbKEBhPWEpLChAYj1iKV1cblxuXHRpc19mcmVlOi0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoPT0wXG5cdFx0XHR0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QGNhcnNbMF0ubG9jPjBcblxuXHRtb3ZlX2NhcjogKGNhciktPlxuXHRcdGlmIGNhci5sb2MgPT0gQGxlbmd0aFxuXHRcdFx0aWYgQGVuZC5jYW5fZ28gQGRpcmVjdGlvblxuXHRcdFx0XHR0YXJnZXQgPSBAZW5kLmJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKClcblx0XHRcdFx0XHRjYXIudHVybnMuc2hpZnQoKVxuXHRcdFx0XHRcdF8ucmVtb3ZlIEBjYXJzLCBjYXJcblx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0ZWxzZSBcblx0XHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0ZWxzZSBcblx0XHRcdGNhci5hZHZhbmNlKClcblx0XHRcdGNhci5zZXRfeHkgQHNjYWxlIGNhci5sb2Ncblx0XHRcdGlmIGNhci5hdF9kZXN0aW5hdGlvbigpXG5cdFx0XHRcdF8ucmVtb3ZlIEBjYXJzLCBjYXJcblx0XHRcdFx0Y2FyLmV4aXQoKVxuXG5cdHRpY2s6IC0+XG5cdFx0QGNhcnMuZm9yRWFjaCAoY2FyLGksayk9PlxuXHRcdFx0aWYgY2FyLnN0b3BwZWRcblx0XHRcdFx0Y2FyLnN1YnRyYWN0X3N0b3AoKVxuXHRcdFx0ZWxzZSBpZiBrW2krMV1cblx0XHRcdFx0aWYgKGtbaSsxXS5sb2MtY2FyLmxvYyk+PVMuc3BhY2Vcblx0XHRcdFx0XHRAbW92ZV9jYXIgY2FyXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBtb3ZlX2NhciBjYXJcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gZmFsc2Vcblx0XHRjYXIuc3RvcHBlZCA9IDBcblx0XHRjYXIubG9jID0gMFxuXHRcdEBjYXJzLnVuc2hpZnQgY2FyXG5cdFx0Y2FyLnNldF94eSBAc2NhbGUgY2FyLmxvY1xuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjYXJzLnNwbGljZSBAY2Fycy5pbmRleE9mIGNhclxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiUyA9XG5cdHNpemU6IDEwXG5cdHN0b3BwaW5nX3RpbWU6IDVcblx0cGFjZTogMTVcblx0c3BhY2U6IDJcblx0cGhhc2U6IDUwXG5cdGdyZWVuOiAuNVxuXHRsYW5lX2xlbmd0aDogMTBcblxubW9kdWxlLmV4cG9ydHMgPSBTIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gWzAuLk1hdGguYWJzKGIucm93LWEucm93KV0ubWFwIChpKS0+IHVkXG5cdFx0bHJzID0gWzAuLk1hdGguYWJzKGIuY29sLWEuY29sKV0ubWFwIChpKS0+IGxyXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5mbGF0dGVuIFt1ZHMsbHJzXVxuXHRcdHR1cm5zLnBvcCgpXG5cdFx0bGFuZSA9IGEuYmVnX2xhbmVzW3R1cm5zLnNoaWZ0KCldXG5cdFx0Y2FyID0gbmV3IENhciB0dXJucyxfLnJhbmRvbSAyLDhcblx0XHRjYXIuYiA9IGJcblx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cdFx0QGNhcnMucHVzaCBjYXJcblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXMsQGNhcnNdID0gW1tdLFtdLFtdXVxuXHRcdEBvdXRlciA9IFtdXG5cdFx0QGlubmVyID0gW11cblxuXHRcdEBncmlkID0gWzAuLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aWYgKDA8cm93PFMuc2l6ZSkgYW5kICgwPGNvbDxTLnNpemUpXG5cdFx0XHRcdFx0QGlubmVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdFx0aW50ZXJzZWN0aW9uLmlubmVyID0gdHJ1ZVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QG91dGVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdFx0aW50ZXJzZWN0aW9uLm91dGVyID0gdHJ1ZVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggbmV3IExhbmUgaSxqLGRpclxuXG5cdFx0QGNyZWF0ZV9jYXIoKSBmb3IgaSBpbiBbMC4uMjAwXVxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5pbnZva2UgQGludGVyc2VjdGlvbnMsJ3RpY2snXG5cdFx0Xy5pbnZva2UgQGxhbmVzLCAndGljaydcblx0XHRAY2Fycy5mb3JFYWNoIChjLGksayktPlx0aWYgYy5leGl0ZWQgdGhlbiBfLnJlbW92ZSBrLCBjXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
