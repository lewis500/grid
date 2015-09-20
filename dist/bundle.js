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

canDer = function() {
  var directive;
  return directive = {
    scope: {
      cars: '='
    },
    link: function(scope, el, attr) {
      var ctx, height, ref, width;
      ref = [+attr.width, +attr.height], width = ref[0], height = ref[1];
      ctx = d3.select(el[0]).append('canvas').attr({
        width: 700,
        height: 700
      }).node().getContext('2d');
      ctx.fRect = function(x, y, w, h) {
        x = parseInt(x);
        y = parseInt(y);
        return ctx.fillRect(x, y, w, h);
      };
      ctx.sRect = function(x, y, w, h) {
        x = parseInt(x) + 0.50;
        y = parseInt(y) + 0.50;
        return ctx.strokeRect(x, y, w, h);
      };
      ctx.strokeStyle = '#ccc';
      return scope.$watch(function() {
        return S.time;
      }, function() {
        ctx.clearRect(0, 0, 700, 700);
        return _.forEach(scope.cars, function(c) {
          var x, y;
          ctx.fillStyle = c.color;
          x = c.x, y = c.y;
          ctx.fRect((x - .4) * 7, (y - .4) * 7, .8 * 7, .8 * 7);
          return ctx.sRect((x - .4) * 7, (y - .4) * 7, .8 * 7, .8 * 7);
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



},{"./directives/xAxis":2,"./directives/yAxis":3,"./mfd":4,"./models/settings":8,"./models/traffic":9,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
  function Car(orig, perm_turns, des) {
    this.orig = orig;
    this.perm_turns = perm_turns;
    this.des = des;
    _.assign(this, {
      id: _.uniqueId(),
      cost0: Infinity,
      target: _.random(4, 600),
      color: _.sample(this.colors)
    });
  }

  Car.prototype.is_destination = function(i) {
    return i.id === this.des.id;
  };

  Car.prototype.colors = ['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5'];

  Car.prototype.day_start = function() {
    return _.assign(this, {
      cost0: this.cost,
      entered: false,
      exited: false,
      cell: void 0,
      t_en: Math.max(0, this.target + _.random(-2, 2)),
      turns: _.shuffle(_.clone(this.perm_turns))
    });
  };

  Car.prototype.set_xy = function(x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
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

  Intersection.prototype.day_start = function() {
    return this.signal.count = 0;
  };

  Intersection.prototype.turn_car = function(car, cell) {
    var lane;
    if (car.des.id === this.id) {
      cell.remove();
      car.exited = true;
      return car.t_ex = S.time;
    } else {
      lane = this.beg_lanes[car.turns[0]];
      if (lane.is_free()) {
        lane.receive(car);
        car.entered = true;
        if (cell != null) {
          cell.remove();
        }
        return car.turns.shift();
      }
    }
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



},{"./settings":8,"lodash":undefined}],7:[function(require,module,exports){
var Cell, Lane, S, _, d3;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Cell = (function() {
  function Cell(pos1, _pos1) {
    this.pos = pos1;
    this._pos = _pos1;
    this.x = this.pos.x;
    this.y = this.pos.y;
    this.x2 = Math.floor(this._pos.x);
    this.y2 = Math.floor(this._pos.y);
    this.last = -Infinity;
    this.temp_car = false;
  }

  Cell.prototype.space = S.space;

  Cell.prototype.receive = function(car) {
    car.set_xy(this.x, this.y, this.x2, this.y2);
    this.last = S.time;
    return this.temp_car = car;
  };

  Cell.prototype.remove = function() {
    return this.temp_car = false;
  };

  Cell.prototype.finalize = function() {
    this.car = this.temp_car;
    if (this.car) {
      return this.last = S.time;
    }
  };

  Cell.prototype.is_free = function() {
    return (S.time - this.last) > this.space;
  };

  return Cell;

})();

Lane = (function() {
  function Lane(beg, end, direction) {
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.beg.set_beg_lane(this);
    this.end.set_end_lane(this);
    this.setup();
    this.row = Math.min(this.beg.row, this.end.row);
    this.col = Math.min(this.beg.col, this.end.col);
  }

  Lane.prototype.tick = function() {
    var car, cell, i, j, k, len, results, target;
    k = this.cells;
    results = [];
    for (i = j = 0, len = k.length; j < len; i = ++j) {
      cell = k[i];
      if (car = cell.car) {
        if (i === (k.length - 1)) {
          if (this.end.can_go(this.direction)) {
            results.push(this.end.turn_car(car, cell));
          } else {
            results.push(void 0);
          }
        } else {
          target = k[i + 1];
          if (target.is_free()) {
            target.receive(car);
            results.push(cell.remove());
          } else {
            results.push(void 0);
          }
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Lane.prototype.day_start = function() {
    var cell, j, len, ref, results;
    ref = this.cells;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.car = cell.temp_car = false;
      results.push(cell.last = -Infinity);
    }
    return results;
  };

  Lane.prototype.is_free = function() {
    return this.cells[0].is_free();
  };

  Lane.prototype.receive = function(car) {
    return this.cells[0].receive(car);
  };

  Lane.prototype.setup = function() {
    var a, b, j, ref, ref1, results, scale, scale2;
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
    scale = d3.scale.linear().domain([0, S.lane_length - 1]).range([a, b]);
    scale2 = d3.scale.linear().domain([0, S.lane_length - 1]).range([this.beg.pos, this.end.pos]);
    ref = [a, b], this.a = ref[0], this.b = ref[1];
    return this.cells = (function() {
      results = [];
      for (var j = 0, ref1 = S.lane_length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this).map((function(_this) {
      return function(n) {
        var _pos, pos;
        pos = scale(n);
        _pos = scale2(n);
        return new Cell(pos, _pos);
      };
    })(this));
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
      pace: 25,
      space: 3,
      phase: 80,
      green: .5,
      lane_length: 10,
      wish: 150,
      num_cars: 2000,
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
var Car, Intersection, Lane, S, Traffic, _;

!(_ = require('lodash'));

S = require('./settings');

Lane = require('./lane');

Intersection = require('./intersection');

Car = require('./car');

Traffic = (function() {
  function Traffic() {
    var dir, i, j, k, lane, len, len1, m, n, o, ref, ref1, ref2, ref3, ref4, ref5, results;
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
      for (var k = 0, ref = S.size; 0 <= ref ? k < ref : k > ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var k, ref, results;
        return (function() {
          results = [];
          for (var k = 0, ref = S.size; 0 <= ref ? k < ref : k > ref; 0 <= ref ? k++ : k--){ results.push(k); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
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
          this.lanes.push((lane = new Lane(i, j, dir)));
          if (((0 < (ref3 = i.row) && ref3 < (S.size - 1))) && ((0 < (ref4 = i.col) && ref4 < (S.size - 1)))) {
            this.inner.push(i);
          } else {
            if ((i.row > 0) || (i.col > 0)) {
              this.outer.push(i);
              i.outer = true;
            }
          }
        }
      }
    }
    for (i = o = 0, ref5 = S.num_cars; 0 <= ref5 ? o < ref5 : o > ref5; i = 0 <= ref5 ? ++o : --o) {
      this.create_car();
    }
  }

  Traffic.prototype.create_car = function() {
    var a, b, car, i, lr, lrs, turns, ud, uds;
    a = _.sample(this.outer);
    b = _.sample(this.inner);
    ud = b.row < a.row ? 'up' : 'down';
    lr = b.col < a.col ? 'left' : 'right';
    uds = (function() {
      var k, ref, results;
      results = [];
      for (i = k = 0, ref = Math.abs(b.row - a.row); 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        results.push(ud);
      }
      return results;
    })();
    lrs = (function() {
      var k, ref, results;
      results = [];
      for (i = k = 0, ref = Math.abs(b.col - a.col); 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        results.push(lr);
      }
      return results;
    })();
    turns = _.shuffle(_.flatten([uds, lrs]));
    car = new Car(a, turns, b);
    return this.cars.push(car);
  };

  Traffic.prototype.tick = function() {
    var c, i, k, l, len, len1, len2, len3, m, n, o, ref, ref1, ref2, ref3;
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
    this.waiting.forEach((function(_this) {
      return function(car) {
        if (car.t_en < S.time) {
          if (car.orig.can_go(car.turns[0])) {
            return car.orig.turn_car(car);
          }
        }
      };
    })(this));
    this.waiting = _.filter(this.cars, function(c) {
      return !c.entered;
    });
    this.traveling = _.filter(this.cars, function(c) {
      return c.entered && !c.exited;
    });
    ref2 = this.lanes;
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      l = ref2[n];
      ref3 = l.cells;
      for (o = 0, len3 = ref3.length; o < len3; o++) {
        c = ref3[o];
        c.finalize();
      }
    }
    if (S.time % S.frequency === 0) {
      this.log();
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
      cumEn: S.num_cars - this.waiting.length,
      cumEx: S.num_cars - this.traveling.length - this.waiting.length
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
    var c, k, len, len1, m, ref, ref1;
    ref = this.cars;
    for (k = 0, len = ref.length; k < len; k++) {
      c = ref[k];
      c.eval_cost();
    }
    ref1 = _.sample(this.cars, 25);
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      c = ref1[m];
      c.choose();
    }
    return setTimeout((function(_this) {
      return function() {
        return _this.day_start();
      };
    })(this));
  };

  Traffic.prototype.day_start = function() {
    var car, intersection, k, lane, len, len1, len2, m, n, ref, ref1, ref2, results;
    _.assign(this, {
      traveling: [],
      cum: [],
      memory: [],
      cumEn: 0,
      cumEx: 0,
      waiting: _.clone(this.cars)
    });
    S.reset_time();
    ref = this.intersections;
    for (k = 0, len = ref.length; k < len; k++) {
      intersection = ref[k];
      intersection.day_start();
    }
    ref1 = this.lanes;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      lane = ref1[m];
      lane.day_start();
    }
    ref2 = this.cars;
    results = [];
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      car = ref2[n];
      results.push(car.day_start());
    }
    return results;
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBQ1gsSUFB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QUFTLENBQUMsTUFBNUIsQ0FBQSxLQUFxQztFQURoQzs7b0JBR04sTUFBQSxHQUFRLFNBQUMsR0FBRDtJQUNQLElBQUMsQ0FBQSxLQUFEO1dBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixHQUFyQjtFQUZPOztvQkFJUixPQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQUEsQ0FBQyxDQUFDLFNBQUYsQ0FBQTtBQUFBO0FBQ0E7QUFBQSxTQUFBLHdDQUFBOztNQUFBLENBQUMsQ0FBQyxNQUFGLENBQUE7QUFBQTtXQUNBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO01BQUg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7RUFITzs7b0JBS1IsU0FBQSxHQUFVLFNBQUE7QUFDVCxRQUFBO0lBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxTQUFBLEVBQVcsRUFBWDtNQUNBLEdBQUEsRUFBSyxFQURMO01BRUEsTUFBQSxFQUFRLEVBRlI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtNQUlBLEtBQUEsRUFBTyxDQUpQO01BS0EsT0FBQSxFQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLElBQVQsQ0FMVDtLQUREO0lBT0EsQ0FBQyxDQUFDLFVBQUYsQ0FBQTtBQUNBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDQyxZQUFZLENBQUMsU0FBYixDQUFBO0FBREQ7QUFFQTtBQUFBLFNBQUEsd0NBQUE7O01BQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBQTtBQUREO0FBRUE7QUFBQTtTQUFBLHdDQUFBOzttQkFDQyxHQUFHLENBQUMsU0FBSixDQUFBO0FBREQ7O0VBYlM7Ozs7OztBQWdCWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblx0XHQjIEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblxuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0aWYgQHBoeXNpY3Ncblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfc3RhcnQoKVxuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdEBzY29wZS50cmFmZmljLmRheV9lbmQoKVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cbmNhbkRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGNhcnM6ICc9J1xuXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRbd2lkdGgsaGVpZ2h0XSA9IFsrYXR0ci53aWR0aCwrYXR0ci5oZWlnaHRdXG5cblx0XHRcdGN0eCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHRcdC5hcHBlbmQgJ2NhbnZhcydcblx0XHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdFx0d2lkdGg6IDcwMFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiA3MDBcblx0XHRcdFx0XHQubm9kZSgpXG5cdFx0XHRcdFx0LmdldENvbnRleHQgJzJkJ1xuXG5cdFx0XHRjdHguZlJlY3Q9ICh4LHksdyxoKS0+XG5cdFx0XHRcdHggPSBwYXJzZUludCB4XG5cdFx0XHRcdHkgPSBwYXJzZUludCB5XG5cdFx0XHRcdGN0eC5maWxsUmVjdCB4LHksdyxoXG5cblx0XHRcdGN0eC5zUmVjdCA9ICh4LHksdyxoKS0+XG5cdFx0XHRcdHggPSBwYXJzZUludCh4KSswLjUwXG5cdFx0XHRcdHkgPSBwYXJzZUludCh5KSswLjUwXG5cdFx0XHRcdGN0eC5zdHJva2VSZWN0IHgseSx3LGhcblxuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG5cdFx0XHRzY29wZS4kd2F0Y2ggKCktPlxuXHRcdFx0XHRcdFMudGltZVxuXHRcdFx0XHQsIC0+XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCAwLCAwLCA3MDAsNzAwXG5cdFx0XHRcdFx0Xy5mb3JFYWNoIHNjb3BlLmNhcnMsIChjKS0+XG5cdFx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYy5jb2xvclxuXHRcdFx0XHRcdFx0e3gseX0gPSBjXG5cdFx0XHRcdFx0XHRjdHguZlJlY3QoICh4LS40KSo3LCh5LS40KSo3LC44KjcsLjgqNylcblx0XHRcdFx0XHRcdGN0eC5zUmVjdCggKHgtLjQpKjcsKHktLjQpKjcsLjgqNywuOCo3KVxuXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBvcmlnLEBwZXJtX3R1cm5zLEBkZXMpLT5cblx0XHQjZGVzIGlzIGFuIGludGVyc2VjdGlvblxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDQsNjAwXG5cdFx0XHRjb2xvcjogXy5zYW1wbGUgQGNvbG9yc1xuXG5cdGlzX2Rlc3RpbmF0aW9uOiAoaSktPlxuXHRcdGkuaWQgPT0gQGRlcy5pZFxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0Y29zdDA6IEBjb3N0XG5cdFx0XHRlbnRlcmVkOiBmYWxzZVxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0Y2VsbDogdW5kZWZpbmVkXG5cdFx0XHR0X2VuOiBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblx0XHRcdHR1cm5zOiBfLnNodWZmbGUgXy5jbG9uZSBAcGVybV90dXJuc1xuXG5cdHNldF94eTogKEB4LEB5LEB4MixAeTIpLT5cblxuXHRldmFsX2Nvc3Q6IC0+XG5cdFx0QHNkID0gQHRfZXggLSBTLndpc2hcblx0XHRAc3AgPSBNYXRoLm1heCggLVMuYmV0YSAqIEBzZCwgUy5nYW1tYSAqIEBzZClcblx0XHRAdHQgPSBAdF9leCAtIEB0X2VuXG5cdFx0QGNvc3QgPSAgQHR0K0BzcCBcblxuXHRjaG9vc2U6IC0+XG5cdFx0aWYgQGNvc3QgPCBAY29zdDBcblx0XHRcdFtAY29zdDAsQHRhcmdldF0gPSBbQGNvc3QsIEB0X2VuXVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZGlyZWN0aW9uID0gJ3VwX2Rvd24nXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID49IFMucGhhc2Vcblx0XHRcdFtAY291bnQsIEBkaXJlY3Rpb25dID0gWzAsICd1cF9kb3duJ10gI2FkZCBvZmZzZXQgbGF0ZXJcblx0XHRcdHJldHVyblxuXHRcdGlmIEBjb3VudCA+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGRpcmVjdGlvbiA9ICdsZWZ0X3JpZ2h0J1xuXG5jbGFzcyBJbnRlcnNlY3Rpb25cblx0Y29uc3RydWN0b3I6KEByb3csQGNvbCktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2ludGVyc2VjdGlvbi0nXG5cdFx0W0BiZWdfbGFuZXMsQGVuZF9sYW5lc10gPSBbe30se31dXG5cblx0XHRAcG9zID0gXG5cdFx0XHR4OiBAY29sKjEwMC9TLnNpemVcblx0XHRcdHk6IEByb3cqMTAwL1Muc2l6ZVxuXG5cdFx0QHNpZ25hbCA9IG5ldyBTaWduYWxcblxuXHRcdEBkaXJlY3Rpb25zID0gXG5cdFx0XHQndXBfZG93bic6IFsndXAnLCdkb3duJ11cblx0XHRcdCdsZWZ0X3JpZ2h0JzogWydsZWZ0JywncmlnaHQnXVxuXG5cdHNldF9iZWdfbGFuZTogKGxhbmUpLT5cblx0XHRAYmVnX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRzZXRfZW5kX2xhbmU6IChsYW5lKS0+XG5cdFx0QGVuZF9sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdEBzaWduYWwuY291bnQgPSAwXG5cblx0dHVybl9jYXI6KGNhcixjZWxsKS0+XG5cdFx0aWYgY2FyLmRlcy5pZCA9PSBAaWRcblx0XHRcdGNlbGwucmVtb3ZlKClcblx0XHRcdGNhci5leGl0ZWQgPSB0cnVlXG5cdFx0XHRjYXIudF9leCA9IFMudGltZVxuXHRcdGVsc2Vcblx0XHRcdGxhbmUgPSBAYmVnX2xhbmVzW2Nhci50dXJuc1swXV1cblx0XHRcdGlmIGxhbmUuaXNfZnJlZSgpXG5cdFx0XHRcdGxhbmUucmVjZWl2ZSBjYXJcblx0XHRcdFx0Y2FyLmVudGVyZWQ9dHJ1ZVxuXHRcdFx0XHRjZWxsPy5yZW1vdmUoKVxuXHRcdFx0XHRjYXIudHVybnMuc2hpZnQoKVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXG5cdHRpY2s6IC0+XG5cdFx0ayA9IEBjZWxsc1xuXHRcdGZvciBjZWxsLGkgaW4ga1xuXHRcdFx0aWYgY2FyPWNlbGwuY2FyXG5cdFx0XHRcdGlmIGk9PShrLmxlbmd0aC0xKSAjaWYgdGhlIGxhc3QgY2VsbFxuXHRcdFx0XHRcdGlmIEBlbmQuY2FuX2dvIEBkaXJlY3Rpb25cblx0XHRcdFx0XHRcdEBlbmQudHVybl9jYXIgY2FyLGNlbGxcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHRhcmdldCA9IGtbaSsxXVxuXHRcdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKClcblx0XHRcdFx0XHRcdHRhcmdldC5yZWNlaXZlIGNhclxuXHRcdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXG5cdGRheV9zdGFydDotPlxuXHRcdGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5jYXIgPSBjZWxsLnRlbXBfY2FyID0gZmFsc2Vcblx0XHRcdGNlbGwubGFzdCA9IC1JbmZpbml0eVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0QGNlbGxzWzBdLmlzX2ZyZWUoKVxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY2VsbHNbMF0ucmVjZWl2ZSBjYXJcblxuXHRzZXR1cDogLT5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnlcblxuXHRcdHN3aXRjaCBAZGlyZWN0aW9uXG5cdFx0XHR3aGVuICd1cCdcblx0XHRcdFx0YS54Kytcblx0XHRcdFx0Yi54Kytcblx0XHRcdFx0YS55LT0yXG5cdFx0XHRcdGIueSs9MlxuXHRcdFx0d2hlbiAncmlnaHQnXG5cdFx0XHRcdGEueCs9MlxuXHRcdFx0XHRiLngtPTJcblx0XHRcdFx0YS55Kytcblx0XHRcdFx0Yi55Kytcblx0XHRcdHdoZW4gJ2Rvd24nXG5cdFx0XHRcdGEueC0tXG5cdFx0XHRcdGIueC0tXG5cdFx0XHRcdGEueSs9MlxuXHRcdFx0XHRiLnktPTJcblx0XHRcdHdoZW4gJ2xlZnQnXG5cdFx0XHRcdGEueC09MlxuXHRcdFx0XHRiLngrPTJcblx0XHRcdFx0YS55LS1cblx0XHRcdFx0Yi55LS1cblxuXHRcdHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cdFx0XHRcblx0XHRzY2FsZTIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0W0BhLEBiXT1bYSxiXVxuXG5cdFx0QGNlbGxzID0gWzAuLihTLmxhbmVfbGVuZ3RoLTEpXS5tYXAgKG4pPT4gXG5cdFx0XHRwb3MgPSBzY2FsZSBuXG5cdFx0XHRfcG9zID0gc2NhbGUyIG5cblx0XHRcdG5ldyBDZWxsIHBvcyxfcG9zXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHNpemU6IDEwXG5cdFx0XHRzdG9wcGluZ190aW1lOiA1XG5cdFx0XHRwYWNlOiAyNVxuXHRcdFx0c3BhY2U6IDNcblx0XHRcdHBoYXNlOiA4MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHRsYW5lX2xlbmd0aDogMTBcblx0XHRcdHdpc2g6IDE1MFxuXHRcdFx0bnVtX2NhcnM6IDIwMDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0ZnJlcXVlbmN5OiAyNVxuXHRcdFx0ZGF5OiAwXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiLCIhXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuIyBTaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGludGVyc2VjdGlvbnM6IFtdXG5cdFx0XHRsYW5lczogW11cblx0XHRcdG91dGVyOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZT1uZXcgTGFuZSBpLGosZGlyKVxuXHRcdFx0XHRcdGlmICgwPGkucm93PChTLnNpemUtMSkpIGFuZCAoMDxpLmNvbDwoUy5zaXplLTEpKVxuXHRcdFx0XHRcdFx0QGlubmVyLnB1c2ggaVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGlmIChpLnJvdz4wKSBvciAoaS5jb2w+MClcblx0XHRcdFx0XHRcdFx0QG91dGVyLnB1c2ggaVxuXHRcdFx0XHRcdFx0XHRpLm91dGVyID0gdHJ1ZVxuXG5cdFx0QGNyZWF0ZV9jYXIoKSBmb3IgaSBpbiBbMC4uLlMubnVtX2NhcnNdXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gKHVkIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSlcblx0XHRscnMgPSAobHIgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldKVxuXHRcdHR1cm5zID0gXy5zaHVmZmxlIF8uZmxhdHRlbihbdWRzLGxyc10pXG5cdFx0Y2FyID0gbmV3IENhciBhLHR1cm5zLGJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2s6IC0+XG5cdFx0KGkudGljaygpIGZvciBpIGluIEBpbnRlcnNlY3Rpb25zKVxuXHRcdChsLnRpY2soKSBmb3IgbCBpbiBAbGFuZXMpXG5cdFx0QHdhaXRpbmcuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRpZiBjYXIudF9lbiA8IFMudGltZVxuXHRcdFx0XHRpZiBjYXIub3JpZy5jYW5fZ28gY2FyLnR1cm5zWzBdXG5cdFx0XHRcdFx0Y2FyLm9yaWcudHVybl9jYXIgY2FyXG5cblx0XHRAd2FpdGluZyA9IF8uZmlsdGVyIEBjYXJzLChjKS0+ICFjLmVudGVyZWRcblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQGNhcnMsIChjKS0+IGMuZW50ZXJlZCBhbmQgIWMuZXhpdGVkXG5cblx0XHRmb3IgbCBpbiBAbGFuZXNcblx0XHRcdGZvciBjIGluIGwuY2VsbHNcblx0XHRcdFx0Yy5maW5hbGl6ZSgpXG5cblx0XHRpZiBTLnRpbWUgJVMuZnJlcXVlbmN5ID09MFxuXHRcdFx0QGxvZygpXG5cdFx0XHRAcmVtZW1iZXIoKVxuXG5cdHJlbWVtYmVyOiAtPlxuXHRcdG1lbSA9IFxuXHRcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdHY6IDBcblx0XHRcdGY6IDBcblxuXHRcdGZvciBjIGluIEB0cmF2ZWxpbmdcblx0XHRcdGlmIGMuc3RvcHBlZCA9PSAwXG5cdFx0XHRcdG1lbS5mKytcblx0XHRcdFx0bWVtLnYrPSgxL21lbS5uKVxuXHRcdFx0XHRcblx0XHRAbWVtb3J5LnB1c2ggbWVtXG5cblx0bG9nOiAtPlxuXHRcdEBjdW0ucHVzaFxuXHRcdFx0dGltZTogUy50aW1lXG5cdFx0XHRjdW1FbjogUy5udW1fY2FycyAtIEB3YWl0aW5nLmxlbmd0aCBcblx0XHRcdGN1bUV4OiBTLm51bV9jYXJzIC0gQHRyYXZlbGluZy5sZW5ndGgtQHdhaXRpbmcubGVuZ3RoXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjdW1FeCsrXG5cdFx0Xy5yZW1vdmUgQHRyYXZlbGluZywgY2FyXG5cblx0ZGF5X2VuZDotPlxuXHRcdGMuZXZhbF9jb3N0KCkgZm9yIGMgaW4gQGNhcnNcblx0XHRjLmNob29zZSgpIGZvciBjIGluIF8uc2FtcGxlIEBjYXJzLCAyNVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSBAY2Fyc1xuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0Zm9yIGludGVyc2VjdGlvbiBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0aW50ZXJzZWN0aW9uLmRheV9zdGFydCgpIFxuXHRcdGZvciBsYW5lIGluIEBsYW5lc1xuXHRcdFx0bGFuZS5kYXlfc3RhcnQoKVxuXHRcdGZvciBjYXIgaW4gQGNhcnNcblx0XHRcdGNhci5kYXlfc3RhcnQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiXX0=
