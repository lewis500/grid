(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ctrl, S, Traffic, _, angular, canDer, d3, signalDer, visDer;

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
          return _this.paused;
        };
      })(this));
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

canDer = function() {
  var directive;
  return directive = {
    scope: {
      cars: '='
    },
    link: function(scope, el, attr) {
      var ctx, fo, height, ref, width;
      ref = [+attr.width, +attr.height], width = ref[0], height = ref[1];
      fo = d3.select(el[0]).append('foreignObject');
      ctx = fo.append('xhtml:canvas').attr('width', "700px").attr('height', "700px").node().getContext('2d');
      ctx.fRect = function(x, y, w, h) {
        x = parseInt(x);
        y = parseInt(y);
        return ctx.fillRect(x, y, w, h);
      };
      return scope.$watch(function() {
        return S.time;
      }, function() {
        ctx.clearRect(0, 0, 700, 700);
        return _.forEach(scope.cars, function(c) {
          var x, y;
          ctx.fillStyle = c.color;
          x = c.x, y = c.y;
          return ctx.fRect((x - .4) * 7, (y - .4) * 7, .8 * 7, .8 * 7);
        });
      });
    }
  };
};

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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer).directive('mfdDer', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('canDer', canDer);



},{"./directives/xAxis":2,"./directives/yAxis":3,"./mfd":4,"./models/settings":8,"./models/traffic":10,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('hor axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],3:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('ver axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],4:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./models/settings');

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
    this.hor = d3.scale.linear().domain([0, S.num_cars]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars * .6]).range([this.height, 0]);
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



},{"./models/settings":8,"d3":undefined,"lodash":undefined}],5:[function(require,module,exports){
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



},{"./settings":8,"lodash":undefined}],6:[function(require,module,exports){
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



},{"./settings":8,"./signal":9,"lodash":undefined}],7:[function(require,module,exports){
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
    var car, i, j, len, ref;
    ref = this.cars;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      car = ref[i];
      if (!car) {
        return;
      }
      if (car.stopped) {
        car.stopped--;
      } else if (this.cars[i + 1]) {
        if ((this.cars[i + 1].loc - car.loc) >= S.space) {
          this.move_car(car);
        } else {
          car.stop();
        }
      } else {
        this.move_car(car);
      }
    }
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



},{"./settings":8,"d3":undefined,"lodash":undefined}],8:[function(require,module,exports){
var Settings, _;

_ = require('lodash');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      size: 10,
      stopping_time: 5,
      pace: 5,
      space: 2,
      phase: 50,
      green: .5,
      lane_length: 10,
      wish: 150,
      num_cars: 1000,
      time: 0,
      beta: .5,
      gamma: 2,
      frequency: 25,
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



},{"lodash":undefined}],9:[function(require,module,exports){
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



},{"./settings":8,"lodash":undefined}],10:[function(require,module,exports){
var Car, Intersection, Lane, S, Signal, Traffic, _;

_ = require('lodash');

S = require('./settings');

Lane = require('./lane');

Intersection = require('./intersection');

Signal = require('./signal');

Car = require('./car');

Traffic = (function() {
  function Traffic() {
    var dir, i, j, k, len, len1, m, n, o, ref, ref1, ref2, ref3, results, results1;
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
      for (var k = 0, ref = S.size; 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var k, ref, results;
        return (function() {
          results = [];
          for (var k = 0, ref = S.size; 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
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
      for (var o = 0, ref3 = S.num_cars; 0 <= ref3 ? o <= ref3 : o >= ref3; 0 <= ref3 ? o++ : o--){ results1.push(o); }
      return results1;
    }).apply(this), (function(_this) {
      return function() {
        return _this.create_car();
      };
    })(this));
  }

  Traffic.prototype.create_car = function() {
    var a, b, car, d_loc, k, lr, lrs, m, ref, ref1, results, results1, start_lane, turns, ud, uds;
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
    var car, i, k, l, len, len1, len2, m, n, ref, ref1, ref2;
    ref = this.intersections;
    for (k = 0, len = ref.length; k < len; k++) {
      i = ref[k];
      i.tick();
    }
    ref1 = this.lanes;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      l = ref1[m];
      l.tick();
    }
    ref2 = this.waiting;
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      car = ref2[n];
      if (car) {
        if (car.t_en < S.time) {
          car.enter();
          car.start_lane.receive(car);
          car.turns.pop();
          _.remove(this.waiting, car);
          this.traveling.push(car);
        }
      }
    }
    this.traveling = _.filter(this.traveling, function(c) {
      return !c.exited;
    });
    this.log();
    if (S.time % S.frequency === 0) {
      return this.remember();
    }
  };

  Traffic.prototype.remember = function() {
    var c, k, len, mem, ref;
    mem = {
      n: this.traveling.length,
      v: 0,
      f: 0
    };
    ref = this.traveling;
    for (k = 0, len = ref.length; k < len; k++) {
      c = ref[k];
      if (c.stopped === 0) {
        mem.f++;
        mem.v += 1 / mem.n;
      }
    }
    return this.memory.push(mem);
  };

  Traffic.prototype.log = function() {
    return this.cum.push({
      time: S.time,
      cumEn: this.cumEn,
      cumEx: this.cumEx
    });
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
  };

  Traffic.prototype.remove = function(car) {
    this.cumEx++;
    return _.remove(this.traveling, car);
  };

  Traffic.prototype.day_end = function() {
    var c, k, len, len1, m, ref, ref1, results;
    ref = this.cars;
    for (k = 0, len = ref.length; k < len; k++) {
      c = ref[k];
      c.eval_cost();
    }
    ref1 = _.sample(this.cars, 25);
    results = [];
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      c = ref1[m];
      results.push(c.choose());
    }
    return results;
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



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"./signal":9,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9zaWduYWwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFB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QUFGLENBQUE7QUFBQTs7RUFGTzs7b0JBSVIsU0FBQSxHQUFVLFNBQUE7SUFDVCxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFDQztNQUFBLFNBQUEsRUFBVyxFQUFYO01BQ0EsR0FBQSxFQUFLLEVBREw7TUFFQSxNQUFBLEVBQVEsRUFGUjtNQUdBLEtBQUEsRUFBTyxDQUhQO01BSUEsS0FBQSxFQUFPLENBSlA7TUFLQSxPQUFBLEVBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsSUFBVCxDQUxUO0tBREQ7V0FRQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxJQUFWLEVBQWdCLGNBQWhCO0VBVFM7Ozs7OztBQVdYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0aWYgQHBoeXNpY3Ncblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0QHBhdXNlZFxuXHRcdFx0XHRcdCMgaWYgIUBwYXVzZWRcblx0XHRcdFx0XHQjIFx0QHRpY2soKVxuXHRcdFx0XHRcdCMgdHJ1ZVxuXHRcdFx0XHRcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5jYW5EZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRjYXJzOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0W3dpZHRoLGhlaWdodF0gPSBbK2F0dHIud2lkdGgsK2F0dHIuaGVpZ2h0XVxuXHRcdFx0Zm8gPWQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHRcdC5hcHBlbmQgJ2ZvcmVpZ25PYmplY3QnXHRcblx0XHRcdFx0XHQjIC5hdHRyICd3aWR0aCcsMTAwK1xuXHRcdFx0XHRcdCMgLmF0dHIgJ2hlaWdodCcsMTAwXG5cblx0XHRcdCMgZGl2ID0gZm8uYXBwZW5kICd4aHRtbDpkaXYnXG5cdFx0XHQjIFx0XHQuYXR0ciAnY2xhc3MnLCdtaW5lJ1xuXG5cdFx0XHRjdHggPSBmb1xuXHRcdFx0XHRcdC5hcHBlbmQgJ3hodG1sOmNhbnZhcydcblx0XHRcdFx0XHQuYXR0ciAnd2lkdGgnLFwiNzAwcHhcIlxuXHRcdFx0XHRcdC5hdHRyICdoZWlnaHQnLFwiNzAwcHhcIlxuXHRcdFx0XHRcdC5ub2RlKClcblx0XHRcdFx0XHQuZ2V0Q29udGV4dCAnMmQnXG5cblx0XHRcdGN0eC5mUmVjdD0gKHgseSx3LGgpLT5cblx0XHRcdFx0eCA9IHBhcnNlSW50IHhcblx0XHRcdFx0eSA9IHBhcnNlSW50IHlcblx0XHRcdFx0Y3R4LmZpbGxSZWN0IHgseSx3LGhcblxuXHRcdFx0c2NvcGUuJHdhdGNoICgpLT5cblx0XHRcdFx0XHRTLnRpbWVcblx0XHRcdFx0LCAtPlxuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QgMCwgMCwgNzAwLDcwMFxuXHRcdFx0XHRcdF8uZm9yRWFjaCBzY29wZS5jYXJzLCAoYyktPlxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGMuY29sb3Jcblx0XHRcdFx0XHRcdHt4LHl9ID0gY1xuXHRcdFx0XHRcdFx0Y3R4LmZSZWN0KCAoeC0uNCkqNywoeS0uNCkqNywuOCo3LC44KjcpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBfdHVybnMsQGRfbG9jLEBzdGFydF9sYW5lKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCwzMDBcblx0XHRcdGNvbG9yOiBfLnNhbXBsZSBAY29sb3JzXG5cblx0c3VidHJhY3Rfc3RvcDotPlxuXHRcdEBzdG9wcGVkLS1cblxuXHRhdF9kZXN0aW5hdGlvbjogLT5cblx0XHQoQHR1cm5zLmxlbmd0aCA9PSAwKSBhbmQgKEBsb2M9PUBkX2xvYylcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRzZXRfYXRfaW50ZXJzZWN0aW9uOiAoQGF0X2ludGVyc2VjdGlvbiktPlxuXG5cdGVudGVyOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0c3RvcHBlZDogMFxuXHRcdFx0dHVybnM6IF8uY2xvbmUgQF90dXJuc1xuXHRcdEB0dXJucy5zaGlmdCgpXG5cblx0YXNzaWduX2Vycm9yOi0+IFxuXHRcdEB0X2VuID0gTWF0aC5tYXggMCwoQHRhcmdldCArIF8ucmFuZG9tIC0yLDIpXG5cblx0c3RvcDogLT5cblx0XHRAc3RvcHBlZCA9IFMuc3RvcHBpbmdfdGltZSBcblxuXHRhZHZhbmNlOi0+XG5cdFx0QGxvYysrXG5cblx0c2V0X3h5OiAocG9zKS0+XG5cdFx0e0B4LEB5fSA9IHBvc1xuXG5cdGV4aXQ6IC0+XG5cdFx0W0B0X2V4LCBAZXhpdGVkXSA9IFtTLnRpbWUsIHRydWVdXG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBzZXR1cCgpXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFsoQGE9YSksKEBiPWIpXVxuXG5cdGlzX2ZyZWU6LT5cblx0XHRpZiBAY2Fycy5sZW5ndGg9PTBcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRAY2Fyc1swXS5sb2M+MFxuXG5cdG1vdmVfY2FyOiAoY2FyKS0+XG5cdFx0aWYgY2FyLmxvYyA9PSBAbGVuZ3RoXG5cdFx0XHRpZiBAZW5kLmNhbl9nbyBAZGlyZWN0aW9uXG5cdFx0XHRcdHRhcmdldCA9IEBlbmQuYmVnX2xhbmVzW2Nhci50dXJuc1swXV1cblx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdFx0XHRcdHRhcmdldC5yZWNlaXZlIGNhclxuXHRcdFx0XHRlbHNlIFxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2UgXG5cdFx0XHRcdGNhci5zdG9wKClcblx0XHRlbHNlIFxuXHRcdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdFx0Y2FyLnNldF94eSBAc2NhbGUgY2FyLmxvY1xuXHRcdFx0aWYgY2FyLmF0X2Rlc3RpbmF0aW9uKClcblx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdFx0XHRjYXIuZXhpdCgpXG5cblx0dGljazogLT5cblx0XHRmb3IgY2FyLGkgaW4gQGNhcnNcblx0XHRcdGlmICFjYXIgdGhlbiByZXR1cm5cblx0XHRcdGlmIGNhci5zdG9wcGVkXG5cdFx0XHRcdGNhci5zdG9wcGVkLS1cblx0XHRcdGVsc2UgaWYgQGNhcnNbaSsxXVxuXHRcdFx0XHRpZiAoQGNhcnNbaSsxXS5sb2MtY2FyLmxvYyk+PVMuc3BhY2Vcblx0XHRcdFx0XHRAbW92ZV9jYXIgY2FyXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBtb3ZlX2NhciBjYXJcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0Y2FyLnNldF9hdF9pbnRlcnNlY3Rpb24gZmFsc2Vcblx0XHRjYXIuc3RvcHBlZCA9IDBcblx0XHRjYXIubG9jID0gMFxuXHRcdEBjYXJzLnVuc2hpZnQgY2FyXG5cdFx0Y2FyLnNldF94eSBAc2NhbGUgY2FyLmxvY1xuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjYXJzLnNwbGljZSBAY2Fycy5pbmRleE9mIGNhclxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHNpemU6IDEwXG5cdFx0XHRzdG9wcGluZ190aW1lOiA1XG5cdFx0XHRwYWNlOiA1XG5cdFx0XHRzcGFjZTogMlxuXHRcdFx0cGhhc2U6IDUwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdGxhbmVfbGVuZ3RoOiAxMFxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fY2FyczogMTAwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRmcmVxdWVuY3k6IDI1XG5cdFx0XHRkYXk6IDBcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZGlyZWN0aW9uID0gJ3VwX2Rvd24nXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID49IFMucGhhc2Vcblx0XHRcdFtAY291bnQsIEBkaXJlY3Rpb25dID0gWzAsICd1cF9kb3duJ10gI2FkZCBvZmZzZXQgbGF0ZXJcblx0XHRcdHJldHVyblxuXHRcdGlmIEBjb3VudCA+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGRpcmVjdGlvbiA9ICdsZWZ0X3JpZ2h0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkxhbmUgPSByZXF1aXJlICcuL2xhbmUnXG5JbnRlcnNlY3Rpb24gPSByZXF1aXJlICcuL2ludGVyc2VjdGlvbidcblNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGludGVyc2VjdGlvbnM6IFtdXG5cdFx0XHRsYW5lczogW11cblx0XHRcdG91dGVyOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpZiAoMDxyb3c8Uy5zaXplKSBhbmQgKDA8Y29sPFMuc2l6ZSlcblx0XHRcdFx0XHRAaW5uZXIucHVzaCBpbnRlcnNlY3Rpb25cblx0XHRcdFx0XHRpbnRlcnNlY3Rpb24uaW5uZXIgPSB0cnVlXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpbnRlcnNlY3Rpb25cblx0XHRcdFx0XHRpbnRlcnNlY3Rpb24ub3V0ZXIgPSB0cnVlXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCBuZXcgTGFuZSBpLGosZGlyXG5cblx0XHRfLmZvckVhY2ggWzAuLlMubnVtX2NhcnNdLCA9PiBAY3JlYXRlX2NhcigpXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gWzAuLk1hdGguYWJzKGIucm93LWEucm93KV0ubWFwIChpKS0+IHVkXG5cdFx0bHJzID0gWzAuLk1hdGguYWJzKGIuY29sLWEuY29sKV0ubWFwIChpKS0+IGxyXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5mbGF0dGVuIFt1ZHMsbHJzXVxuXHRcdHN0YXJ0X2xhbmUgPSBhLmJlZ19sYW5lc1t0dXJuc1swXV1cblx0XHRkX2xvYyA9IF8ucmFuZG9tIDIsOFxuXHRcdGNhciA9IG5ldyBDYXIgdHVybnMsZF9sb2Msc3RhcnRfbGFuZVxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0dGljazogLT5cblx0XHQoaS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnMpXG5cdFx0KGwudGljaygpIGZvciBsIGluIEBsYW5lcylcblx0XHRmb3IgY2FyIGluIEB3YWl0aW5nXG5cdFx0XHRpZiBjYXJcblx0XHRcdFx0aWYgY2FyLnRfZW4gPCBTLnRpbWVcblx0XHRcdFx0XHRjYXIuZW50ZXIoKVxuXHRcdFx0XHRcdGNhci5zdGFydF9sYW5lLnJlY2VpdmUgY2FyXG5cdFx0XHRcdFx0Y2FyLnR1cm5zLnBvcCgpXG5cdFx0XHRcdFx0Xy5yZW1vdmUgQHdhaXRpbmcsIGNhclxuXHRcdFx0XHRcdEB0cmF2ZWxpbmcucHVzaCBjYXJcblxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAdHJhdmVsaW5nLCAoYyktPiAhYy5leGl0ZWRcblxuXHRcdEBsb2coKVxuXG5cdFx0aWYgKFMudGltZSVTLmZyZXF1ZW5jeT09MCkgdGhlbiBAcmVtZW1iZXIoKVxuXG5cdHJlbWVtYmVyOiAtPlxuXHRcdG1lbSA9IFxuXHRcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdHY6IDBcblx0XHRcdGY6IDBcblxuXHRcdGZvciBjIGluIEB0cmF2ZWxpbmdcblx0XHRcdGlmIGMuc3RvcHBlZCA9PSAwXG5cdFx0XHRcdG1lbS5mKytcblx0XHRcdFx0bWVtLnYrPSgxL21lbS5uKVxuXHRcdEBtZW1vcnkucHVzaCBtZW1cblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBAY3VtRW5cblx0XHRcdGN1bUV4OiBAY3VtRXhcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHRkYXlfZW5kOi0+XG5cdFx0Yy5ldmFsX2Nvc3QoKSBmb3IgYyBpbiBAY2Fyc1xuXHRcdGMuY2hvb3NlKCkgZm9yIGMgaW4gXy5zYW1wbGUgQGNhcnMsIDI1XG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZShAY2FycylcblxuXHRcdF8uaW52b2tlIEBjYXJzLCAnYXNzaWduX2Vycm9yJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiXX0=
