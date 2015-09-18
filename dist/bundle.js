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
    this.day_start();
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
    if (this.physics) {
      return d3.timer((function(_this) {
        return function() {
          if (_this.scope.traffic.done()) {
            _this.day_end();
            true;
          }
          S.advance();
          _this.scope.traffic.tick();
          _this.scope.$evalAsync();
          if (!_this.paused) {
            _this.tick();
          }
          return true;
        };
      })(this), S.pace);
    }
  };

  Ctrl.prototype.play = function() {
    this.pause();
    d3.timer.flush();
    this.paused = false;
    return this.tick();
  };

  Ctrl.prototype.day_start = function() {
    S.reset_time();
    this.physics = true;
    this.scope.traffic.day_start();
    return this.tick();
  };

  Ctrl.prototype.day_end = function() {
    this.physics = false;
    this.scope.traffic.day_end();
    return setTimeout((function(_this) {
      return function() {
        return _this.day_start();
      };
    })(this));
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
  function Car(_turns, d_loc, start_lane) {
    this._turns = _turns;
    this.d_loc = d_loc;
    this.start_lane = start_lane;
    _.assign(this, {
      id: _.uniqueId(),
      cost0: Infinity,
      target: _.random(4, 300),
      color: _.sample(this.colors)
    });
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

  Car.prototype.enter = function() {
    _.assign(this, {
      cost0: this.cost,
      exited: false,
      stopped: 0,
      turns: _.clone(this._turns)
    });
    return this.turns.shift();
  };

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-2, 2));
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

  Car.prototype.exit = function() {
    var ref;
    return ref = [S.time, true], this.t_ex = ref[0], this.exited = ref[1], ref;
  };

  Car.prototype.eval_cost = function() {
    this.sd = this.t_ex - S.wish;
    this.sp = Math.max(-S.beta * this.sd, S.gamma * this.sd);
    this.tt = this.t_ex - this.t_en;
    return this.cost = this.tt + this.sp;
  };

  Car.prototype.choose = function() {
    var ref;
    if (this.cost < this.cost0) {
      return ref = [this.cost, this.t_en], this.cost0 = ref[0], this.target = ref[1], ref;
    }
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
var Settings, _;

_ = require('lodash');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      size: 10,
      stopping_time: 5,
      pace: 15,
      space: 2,
      phase: 50,
      green: .5,
      lane_length: 10,
      wish: 150,
      num_cars: 250,
      time: 0,
      beta: .5,
      gamma: 2,
      frequency: 8,
      day: 0
    });
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



},{"lodash":undefined}],6:[function(require,module,exports){
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
  function Traffic() {
    var dir, i, j, l, len, len1, m, n, o, ref, ref1, ref2, results, results1;
    _.assign(this, {
      intersections: [],
      lanes: [],
      outer: [],
      inner: [],
      directions: ['up', 'right', 'down', 'left'],
      cars: []
    });
    this.grid = (function() {
      results = [];
      for (var l = 0, ref = S.size; 0 <= ref ? l <= ref : l >= ref; 0 <= ref ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var l, ref, results;
        return (function() {
          results = [];
          for (var l = 0, ref = S.size; 0 <= ref ? l <= ref : l >= ref; 0 <= ref ? l++ : l--){ results.push(l); }
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
    ref1 = this.intersections;
    for (m = 0, len = ref1.length; m < len; m++) {
      i = ref1[m];
      ref2 = this.directions;
      for (n = 0, len1 = ref2.length; n < len1; n++) {
        dir = ref2[n];
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
          this.lanes.push(new Lane(i, j, dir));
        }
      }
    }
    _.forEach((function() {
      results1 = [];
      for (o = 0; o <= 1000; o++){ results1.push(o); }
      return results1;
    }).apply(this), (function(_this) {
      return function() {
        return _this.create_car();
      };
    })(this));
  }

  Traffic.prototype.create_car = function() {
    var a, b, car, d_loc, l, lr, lrs, m, ref, ref1, results, results1, start_lane, turns, ud, uds;
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
    start_lane = a.beg_lanes[turns[0]];
    d_loc = _.random(2, 8);
    car = new Car(turns, d_loc, start_lane);
    return this.cars.push(car);
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    _.invoke(this.lanes, 'tick');
    this.waiting.forEach((function(_this) {
      return function(car) {
        if (car.t_en < S.time) {
          car.enter();
          car.start_lane.receive(car);
          car.turns.pop();
          _.remove(_this.waiting, car);
          return _this.traveling.push(car);
        }
      };
    })(this));
    return this.traveling.forEach((function(_this) {
      return function(c, i, k) {
        if (c.exited) {
          return _.remove(k, c);
        }
      };
    })(this));
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
  };

  Traffic.prototype.remove = function(car) {
    this.cumEx++;
    return _.remove(this.traveling, car);
  };

  Traffic.prototype.day_end = function() {
    _.invoke(this.cars, 'eval_cost');
    return _.sample(this.cars, 25).forEach(function(d) {
      return d.choose();
    });
  };

  Traffic.prototype.day_start = function() {
    _.assign(this, {
      traveling: [],
      cum: [],
      memory: [],
      cumEn: 0,
      cumEx: 0,
      waiting: _.clone(this.cars)
    });
    return _.invoke(this.cars, 'assign_error');
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":2,"./intersection":3,"./lane":4,"./settings":5,"./signal":6,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0lBQ3JCLElBQUMsQ0FBQSxTQUFELENBQUE7RUFKVzs7aUJBTVosU0FBQSxHQUFXLFNBQUMsR0FBRDtXQUNWLFlBQUEsR0FB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Q0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUE1QixDQUFBLEtBQXFDO0VBRGhDOztvQkFHTixNQUFBLEdBQVEsU0FBQyxHQUFEO0lBQ1AsSUFBQyxDQUFBLEtBQUQ7V0FDQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLEdBQXJCO0VBRk87O29CQUlSLE9BQUEsR0FBUSxTQUFBO0lBQ1AsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsSUFBVixFQUFnQixXQUFoQjtXQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLElBQVYsRUFBZ0IsRUFBaEIsQ0FDQyxDQUFDLE9BREYsQ0FDVSxTQUFDLENBQUQ7YUFBSyxDQUFDLENBQUMsTUFBRixDQUFBO0lBQUwsQ0FEVjtFQUZPOztvQkFLUixTQUFBLEdBQVUsU0FBQTtJQUNULENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsU0FBQSxFQUFXLEVBQVg7TUFDQSxHQUFBLEVBQUssRUFETDtNQUVBLE1BQUEsRUFBUSxFQUZSO01BR0EsS0FBQSxFQUFPLENBSFA7TUFJQSxLQUFBLEVBQU8sQ0FKUDtNQUtBLE9BQUEsRUFBUyxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxJQUFULENBTFQ7S0FERDtXQVFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLElBQVYsRUFBZ0IsY0FBaEI7RUFUUzs7Ozs7O0FBV1gsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cdFx0QGRheV9zdGFydCgpXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRpZiBAcGh5c2ljc1xuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAc2NvcGUudHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdEBzY29wZS50cmFmZmljLnRpY2soKVxuXHRcdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0XHRpZiAhQHBhdXNlZFxuXHRcdFx0XHRcdFx0QHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblxuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBfdHVybnMsQGRfbG9jLEBzdGFydF9sYW5lKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCwzMDBcblx0XHRcdGNvbG9yOiBfLnNhbXBsZSBAY29sb3JzXG5cblx0c3VidHJhY3Rfc3RvcDotPlxuXHRcdEBzdG9wcGVkLS1cblxuXHRhdF9kZXN0aW5hdGlvbjogLT5cblx0XHQoQHR1cm5zLmxlbmd0aCA9PSAwKSBhbmQgKEBsb2M9PUBkX2xvYylcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRzZXRfYXRfaW50ZXJzZWN0aW9uOiAoQGF0X2ludGVyc2VjdGlvbiktPlxuXG5cdGVudGVyOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0c3RvcHBlZDogMFxuXHRcdFx0dHVybnM6IF8uY2xvbmUgQF90dXJuc1xuXHRcdEB0dXJucy5zaGlmdCgpXG5cblx0YXNzaWduX2Vycm9yOi0+IFxuXHRcdEB0X2VuID0gTWF0aC5tYXggMCwoQHRhcmdldCArIF8ucmFuZG9tIC0yLDIpXG5cblx0c3RvcDogLT5cblx0XHRAc3RvcHBlZCA9IFMuc3RvcHBpbmdfdGltZSBcblxuXHRhZHZhbmNlOi0+XG5cdFx0QGxvYysrXG5cblx0c2V0X3h5OiAocG9zKS0+XG5cdFx0e0B4LEB5fSA9IHBvc1xuXG5cdGV4aXQ6IC0+XG5cdFx0W0B0X2V4LCBAZXhpdGVkXSA9IFtTLnRpbWUsIHRydWVdXG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBzZXR1cCgpXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFsoQGE9YSksKEBiPWIpXVxuXG5cdGlzX2ZyZWU6LT5cblx0XHRpZiBAY2Fycy5sZW5ndGg9PTBcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRAY2Fyc1swXS5sb2M+MFxuXG5cdG1vdmVfY2FyOiAoY2FyKS0+XG5cdFx0aWYgY2FyLmxvYyA9PSBAbGVuZ3RoXG5cdFx0XHRpZiBAZW5kLmNhbl9nbyBAZGlyZWN0aW9uXG5cdFx0XHRcdHRhcmdldCA9IEBlbmQuYmVnX2xhbmVzW2Nhci50dXJuc1swXV1cblx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdFx0XHRcdHRhcmdldC5yZWNlaXZlIGNhclxuXHRcdFx0XHRlbHNlIFxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2UgXG5cdFx0XHRcdGNhci5zdG9wKClcblx0XHRlbHNlIFxuXHRcdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdFx0Y2FyLnNldF94eSBAc2NhbGUgY2FyLmxvY1xuXHRcdFx0aWYgY2FyLmF0X2Rlc3RpbmF0aW9uKClcblx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdFx0XHRjYXIuZXhpdCgpXG5cblx0dGljazogLT5cblx0XHRAY2Fycy5mb3JFYWNoIChjYXIsaSxrKT0+XG5cdFx0XHRpZiBjYXIuc3RvcHBlZFxuXHRcdFx0XHRjYXIuc3VidHJhY3Rfc3RvcCgpXG5cdFx0XHRlbHNlIGlmIGtbaSsxXVxuXHRcdFx0XHRpZiAoa1tpKzFdLmxvYy1jYXIubG9jKT49Uy5zcGFjZVxuXHRcdFx0XHRcdEBtb3ZlX2NhciBjYXJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QG1vdmVfY2FyIGNhclxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRjYXIuc2V0X2F0X2ludGVyc2VjdGlvbiBmYWxzZVxuXHRcdGNhci5zdG9wcGVkID0gMFxuXHRcdGNhci5sb2MgPSAwXG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblx0XHRjYXIuc2V0X3h5IEBzY2FsZSBjYXIubG9jXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGNhcnMuc3BsaWNlIEBjYXJzLmluZGV4T2YgY2FyXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5lXG4iLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0c2l6ZTogMTBcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDVcblx0XHRcdHBhY2U6IDE1XG5cdFx0XHRzcGFjZTogMlxuXHRcdFx0cGhhc2U6IDUwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdGxhbmVfbGVuZ3RoOiAxMFxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fY2FyczogMjUwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0ZGF5OiAwXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpbnRlcnNlY3Rpb25zOiBbXVxuXHRcdFx0bGFuZXM6IFtdXG5cdFx0XHRvdXRlcjogW11cblx0XHRcdGlubmVyOiBbXVxuXHRcdFx0ZGlyZWN0aW9uczogWyd1cCcsJ3JpZ2h0JywnZG93bicsJ2xlZnQnXVxuXHRcdFx0Y2FyczogW11cblxuXHRcdEBncmlkID0gWzAuLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aWYgKDA8cm93PFMuc2l6ZSkgYW5kICgwPGNvbDxTLnNpemUpXG5cdFx0XHRcdFx0QGlubmVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdFx0aW50ZXJzZWN0aW9uLmlubmVyID0gdHJ1ZVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QG91dGVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdFx0aW50ZXJzZWN0aW9uLm91dGVyID0gdHJ1ZVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggbmV3IExhbmUgaSxqLGRpclxuXG5cdFx0Xy5mb3JFYWNoIFswLi4xMDAwXSwgPT4gQGNyZWF0ZV9jYXIoKVxuXG5cdGNyZWF0ZV9jYXI6IC0+XG5cdFx0YSA9IF8uc2FtcGxlIEBvdXRlclxuXHRcdGIgPSBfLnNhbXBsZSBAaW5uZXJcblx0XHR1ZCA9IGlmIGIucm93IDwgYS5yb3cgdGhlbiAndXAnIGVsc2UgJ2Rvd24nXG5cdFx0bHIgPSBpZiBiLmNvbCA8IGEuY29sIHRoZW4gJ2xlZnQnIGVsc2UgJ3JpZ2h0J1xuXHRcdHVkcyA9IFswLi5NYXRoLmFicyhiLnJvdy1hLnJvdyldLm1hcCAoaSktPiB1ZFxuXHRcdGxycyA9IFswLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldLm1hcCAoaSktPiBsclxuXHRcdHR1cm5zID0gXy5zaHVmZmxlIF8uZmxhdHRlbiBbdWRzLGxyc11cblx0XHRzdGFydF9sYW5lID0gYS5iZWdfbGFuZXNbdHVybnNbMF1dXG5cdFx0ZF9sb2MgPSBfLnJhbmRvbSAyLDhcblx0XHRjYXIgPSBuZXcgQ2FyIHR1cm5zLGRfbG9jLHN0YXJ0X2xhbmVcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5pbnZva2UgQGludGVyc2VjdGlvbnMsJ3RpY2snXG5cdFx0Xy5pbnZva2UgQGxhbmVzLCAndGljaydcblxuXHRcdEB3YWl0aW5nLmZvckVhY2ggKGNhcik9PlxuXHRcdFx0aWYgY2FyLnRfZW4gPCBTLnRpbWVcblx0XHRcdFx0Y2FyLmVudGVyKClcblx0XHRcdFx0Y2FyLnN0YXJ0X2xhbmUucmVjZWl2ZSBjYXJcblx0XHRcdFx0Y2FyLnR1cm5zLnBvcCgpXG5cdFx0XHRcdF8ucmVtb3ZlIEB3YWl0aW5nLCBjYXJcblx0XHRcdFx0QHRyYXZlbGluZy5wdXNoIGNhclxuXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjLGksayk9PiBcblx0XHRcdGlmIGMuZXhpdGVkXG5cdFx0XHRcdF8ucmVtb3ZlIGssIGNcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHRkYXlfZW5kOi0+XG5cdFx0Xy5pbnZva2UgQGNhcnMsICdldmFsX2Nvc3QnXG5cdFx0Xy5zYW1wbGUgQGNhcnMsIDI1XG5cdFx0XHQuZm9yRWFjaCAoZCktPmQuY2hvb3NlKClcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0dHJhdmVsaW5nOiBbXVxuXHRcdFx0Y3VtOiBbXVxuXHRcdFx0bWVtb3J5OiBbXVxuXHRcdFx0Y3VtRW46IDBcblx0XHRcdGN1bUV4OiAwXG5cdFx0XHR3YWl0aW5nOiBfLmNsb25lKEBjYXJzKVxuXG5cdFx0Xy5pbnZva2UgQGNhcnMsICdhc3NpZ25fZXJyb3InXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
