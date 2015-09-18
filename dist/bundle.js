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
var Car, _;

_ = require('lodash');

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



},{"lodash":undefined}],3:[function(require,module,exports){
var Intersection, S, Signal, _;

_ = require('lodash');

S = require('./settings');

Signal = require('./signal');

Intersection = (function() {
  function Intersection(row, col) {
    var left_right, up_down;
    this.row = row;
    this.col = col;
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

  Intersection.prototype.receive = function(car, direction) {
    car.set_at_intersection(true);
    return this.cars_waiting[direction].push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane.direction] = lane;
  };

  Intersection.prototype.turn_car = function(c, i, k) {
    var new_lane, ref;
    new_lane = this.lanes[c.turns[0]];
    if (new_lane.is_free()) {
      _.remove(k, c);
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
    return _.forEach(cars, this.turn_car, this);
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
    var a, b, ref, ref1;
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.length = S.lane_length - 1;
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
    car.set_xy(this.scale(car.loc), this._scale(car.loc));
    if (car.at_destination()) {
      return _.remove(this.cars, car);
    }
    if (car.loc === this.length) {
      return this.end.receive(car, this.direction);
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
    var car, d, i, turns;
    i = _.last(this.grid)[3];
    d = {
      x: i.pos.x + 20,
      y: i.pos.y - 35
    };
    turns = ['up', 'up', 'up', 'up', 'right', 'right', 'down'];
    car = new Car(turns, d);
    this.cars.push(car);
    return i.receive(car, 'down');
  };

  Traffic.prototype.setup = function() {
    var dir, i, j, k, l, lane, len, len1, m, ref, ref1, ref2, ref3, results;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.cars = ref[2];
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
          this.lanes.push((lane = new Lane(i, j, dir)));
          i.set_beg_lane(lane);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0VBSFY7O2lCQUtaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7V0FDVixZQUFBLEdBQWEsR0FBRyxDQUFDLENBQWpCLEdBQW1CLEdB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QU0sU0FBQTtJQUNMLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLGFBQVYsRUFBd0IsTUFBeEI7V0FDQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxLQUFWLEVBQWlCLE1BQWpCO0VBRks7Ozs7OztBQUlQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdHRydWVcblx0XHRcdCwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdGQzLnRpbWVyLmZsdXNoKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQjIC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQjIC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQjIC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0IyAuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOiAoQHR1cm5zLEBkZXN0aW5hdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2Nhci0nXG5cdFx0QHN0b3BwZWQgPSAwXG5cdFx0IyBAbGFuZS5yZWNlaXZlIHRoaXNcblx0XHQjIEBhdF9pbnRlcnNlY3Rpb24gPSB0cnVlXG5cdFx0IyBAc2V0X2F0X2ludGVyc2VjdGlvbiB0cnVlXG5cdFx0IyB7QHgsQHl9ID0gQGxhbmUuc2NhbGUgKEBsb2MgPSBfLnJhbmRvbSAyLDUpXG5cdFx0QGNvbG9yID0gXy5zYW1wbGUgQGNvbG9yc1xuXG5cdHN1YnRyYWN0X3N0b3A6LT5cblx0XHRAc3RvcHBlZC0tXG5cblx0YXRfZGVzdGluYXRpb246IC0+XG5cdFx0KEBkZXN0aW5hdGlvbi54ID09IEBfeCkgYW5kIChAZGVzdGluYXRpb24ueSA9PSBAX3kpXG5cblx0Y29sb3JzOiBbJyMwM0E5RjQnLCcjOEJDMzRBJywnI0U5MUU2MycsJyNGRjU3MjInLCcjNjA3RDhCJywnIzNGNTFCNSddXG5cblx0c2V0X2F0X2ludGVyc2VjdGlvbjogKEBhdF9pbnRlcnNlY3Rpb24pLT5cblxuXHRzZXRfbGFuZTogKEBsYW5lKS0+XG5cblx0c3RvcDogLT5cblx0XHRAc3RvcHBlZCA9IFMuc3RvcHBpbmdfdGltZSBcblxuXHRhZHZhbmNlOi0+XG5cdFx0QGxvYysrXG5cblx0c2V0X3h5OiAocG9zLF9wb3MpLT5cblx0XHR7QHgsQHl9ID0gcG9zXG5cdFx0W0BfeCxAX3ldID0gW19wb3MueCxfcG9zLnldXG5cblx0IyByZXNldF9sb2M6IC0+XG5cdCMgXHRAbG9jPTBcblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdEBsYW5lcyA9IHt9XG5cdFx0dXBfZG93biA9IFtdXG5cdFx0bGVmdF9yaWdodCA9IFtdXG5cdFx0QGNhcnNfd2FpdGluZyA9IFxuXHRcdFx0dXA6IHVwX2Rvd25cblx0XHRcdGRvd246IHVwX2Rvd25cblx0XHRcdGxlZnQ6IGxlZnRfcmlnaHRcblx0XHRcdHJpZ2h0OiBsZWZ0X3JpZ2h0XG5cdFx0XHR1cF9kb3duOiB1cF9kb3duXG5cdFx0XHRsZWZ0X3JpZ2h0OiBsZWZ0X3JpZ2h0XG5cblx0XHRAcG9zID0gXG5cdFx0XHR4OiBAY29sKjEwMC9TLnNpemVcblx0XHRcdHk6IEByb3cqMTAwL1Muc2l6ZVxuXG5cdFx0QHNpZ25hbCA9IG5ldyBTaWduYWxcblxuXHRyZWNlaXZlOihjYXIsIGRpcmVjdGlvbiktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIHRydWVcblx0XHRAY2Fyc193YWl0aW5nW2RpcmVjdGlvbl0ucHVzaCBjYXJcblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGxhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHR0dXJuX2NhcjogKGMsaSxrKSAtPlxuXHRcdFx0bmV3X2xhbmUgPSBAbGFuZXNbYy50dXJuc1swXV1cblx0XHRcdGlmIG5ld19sYW5lLmlzX2ZyZWUoKVxuXHRcdFx0XHRfLnJlbW92ZSBrLCBjXG5cdFx0XHRcdGMudHVybnMuc2hpZnQoKVxuXHRcdFx0XHRjLmxhbmU/LnJlbW92ZSBjXG5cdFx0XHRcdGMuc2V0X2xhbmUgbmV3X2xhbmVcblx0XHRcdFx0bmV3X2xhbmUucmVjZWl2ZSBjXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXHRcdGNhcnMgPSBAY2Fyc193YWl0aW5nW0BzaWduYWwuZGlyZWN0aW9uXVxuXHRcdF8uZm9yRWFjaCBjYXJzLCBAdHVybl9jYXIsdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBsZW5ndGggPSBTLmxhbmVfbGVuZ3RoLTFcblx0XHRAX3NjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aF1cblx0XHRpZiBAZGlyZWN0aW9uIGluIFsnZG93bicsJ3JpZ2h0J11cblx0XHRcdEBfc2NhbGUucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXHRcdGVsc2Vcblx0XHRcdEBfc2NhbGUucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRbQGEsQGJdID0gW2EsYl1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGhdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblxuXHRcdEBjYXJzID0gW11cblxuXHRpc19mcmVlOi0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoPT0wXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdCEoQGNhcnNbMF0ubG9jPT0wKVxuXG5cdG1vdmVfY2FyOiAoY2FyKS0+XG5cdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdGNhci5zZXRfeHkoIEBzY2FsZShjYXIubG9jKSxAX3NjYWxlKGNhci5sb2MpKVxuXHRcdGlmIGNhci5hdF9kZXN0aW5hdGlvbigpXG5cdFx0XHRyZXR1cm4gXy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdGlmIGNhci5sb2MgPT0gQGxlbmd0aFxuXHRcdFx0QGVuZC5yZWNlaXZlIGNhcixAZGlyZWN0aW9uXG5cblx0dGljazogLT5cblx0XHRfLmZvckVhY2ggQGNhcnMsKGNhcixpLGspPT5cblx0XHRcdGlmIGNhci5hdF9pbnRlcnNlY3Rpb25cblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRpZiBjYXIuc3RvcHBlZFxuXHRcdFx0XHRyZXR1cm4gY2FyLnN1YnRyYWN0X3N0b3AoKVxuXHRcdFx0aWYgKG5leHRfY2FyPWtbaSsxXSlcblx0XHRcdFx0aWYgKG5leHRfY2FyLmxvYy1jYXIubG9jKT49Uy5zcGFjZVxuXHRcdFx0XHRcdHJldHVybiBAbW92ZV9jYXIgY2FyXG5cdFx0XHRcdHJldHVybiBjYXIuc3RvcCgpXG5cdFx0XHRAbW92ZV9jYXIgY2FyXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0Y2FyLnN0b3BwZWQgPSAwXG5cdFx0Y2FyLmxvYyA9IDBcblx0XHRAY2Fycy51bnNoaWZ0IGNhclxuXHRcdGNhci5zZXRfeHkoQHNjYWxlKGNhci5sb2MpLEBfc2NhbGUoY2FyLmxvYykpXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGNhcnMuc3BsaWNlIEBjYXJzLmluZGV4T2YgY2FyXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5lXG4iLCJTID1cblx0c2l6ZTogMTBcblx0c3RvcHBpbmdfdGltZTogNVxuXHRwYWNlOiAxMDBcblx0c3BhY2U6IDJcblx0cGhhc2U6IDUwXG5cdGdyZWVuOiAuNVxuXHRsYW5lX2xlbmd0aDogMTBcblxubW9kdWxlLmV4cG9ydHMgPSBTIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRpID0gXy5sYXN0KEBncmlkKVszXVxuXHRcdGQgPSB7eDogaS5wb3MueCArIDIwLCB5OiBpLnBvcy55IC0gMzV9XG5cdFx0dHVybnMgPSBbJ3VwJywndXAnLCd1cCcsJ3VwJywncmlnaHQnLCdyaWdodCcsJ2Rvd24nXVxuXHRcdGNhciA9IG5ldyBDYXIgdHVybnMsZFxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cdFx0aS5yZWNlaXZlIGNhciwnZG93bidcblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXMsQGNhcnNdID0gW1tdLFtdLFtdXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZSA9IG5ldyBMYW5lIGksaixkaXIpICNpIGlzIHRoZSBlbmRcblx0XHRcdFx0XHRpLnNldF9iZWdfbGFuZSBsYW5lXG5cblx0XHRAY3JlYXRlX2NhcigpXG5cblx0XHQjIEBjYXJzID0gW0BjcmVhdGVfY2FyKCldXG5cblx0XHQjIGNhciA9IFxuXHRcdCMgQGNhcnMgPSBfLm1hcCBAbGFuZXNbODUuLjg3XSwgKGxhbmUpLT5cblx0XHQjIFx0dHVybnMgPSBfLnNhbXBsZSBbJ3VwJywncmlnaHQnLCdsZWZ0JywnZG93biddLDEwXG5cdFx0IyBcdG5ldyBDYXIgbGFuZSwgdHVybnNcblxuXHR0aWNrOiAtPlxuXHRcdF8uaW52b2tlIEBpbnRlcnNlY3Rpb25zLCd0aWNrJ1xuXHRcdF8uaW52b2tlIEBsYW5lcywgJ3RpY2snXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
