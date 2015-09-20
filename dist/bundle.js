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
      var ctx, fo, height, ref, width;
      ref = [+attr.width, +attr.height], width = ref[0], height = ref[1];
      fo = d3.select(el[0]);
      ctx = fo.append('canvas').attr({
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
      turns: _.clone(this.perm_turns)
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

  Intersection.prototype.day_start = function() {
    return this.signal.count = 0;
  };

  Intersection.prototype.turn_car = function(car, cell) {
    var lane;
    if (car.des.id === this.id) {
      car.cell.remove();
      car.exited = true;
      return car.t_ex = S.time;
    } else {
      lane = this.beg_lanes[car.turns[0]];
      if (lane.is_free()) {
        lane.receive(car);
        car.entered = true;
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



},{"./settings":8,"./signal":9,"lodash":undefined}],7:[function(require,module,exports){
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
    var ref;
    if ((ref = car.cell) != null) {
      ref.remove();
    }
    car.cell = this;
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
    return _.forEachRight(this.cells, (function(_this) {
      return function(cell, i, k) {
        var car, target;
        if (!(car = cell.car)) {
          return;
        }
        if (i === (k.length - 1)) {
          if (_this.end.can_go(_this.direction)) {
            return _this.end.turn_car(car, cell);
          }
        } else {
          target = k[i + 1];
          if (target.is_free()) {
            return target.receive(car);
          }
        }
      };
    })(this));
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
      pace: 5,
      space: 2,
      phase: 50,
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

!(_ = require('lodash'));

S = require('./settings');

Lane = require('./lane');

Intersection = require('./intersection');

Signal = require('./signal');

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



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"./signal":9,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9zaWduYWwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFB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QUMsQ0FBQyxVQUFGLENBQUE7QUFDQTtBQUFBLFNBQUEscUNBQUE7O01BQ0MsWUFBWSxDQUFDLFNBQWIsQ0FBQTtBQUREO0FBRUE7QUFBQSxTQUFBLHdDQUFBOztNQUNDLElBQUksQ0FBQyxTQUFMLENBQUE7QUFERDtBQUVBO0FBQUE7U0FBQSx3Q0FBQTs7bUJBQ0MsR0FBRyxDQUFDLFNBQUosQ0FBQTtBQUREOztFQWJTOzs7Ozs7QUFnQlgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cdFx0IyBAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cblx0XHRAZGF5X3N0YXJ0KClcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGlmIEBwaHlzaWNzXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEBzY29wZS50cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5jYW5EZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRjYXJzOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0W3dpZHRoLGhlaWdodF0gPSBbK2F0dHIud2lkdGgsK2F0dHIuaGVpZ2h0XVxuXHRcdFx0Zm8gPWQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHRcdCMgLmFwcGVuZCAnZm9yZWlnbk9iamVjdCdcdFxuXG5cdFx0XHRjdHggPSBmb1xuXHRcdFx0XHRcdC5hcHBlbmQgJ2NhbnZhcydcblx0XHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdFx0d2lkdGg6IDcwMFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiA3MDBcblx0XHRcdFx0XHQjIC5hdHRyICd3aWR0aCcsXCI3MDBweFwiXG5cdFx0XHRcdFx0IyAuYXR0ciAnaGVpZ2h0JyxcIjcwMHB4XCJcblx0XHRcdFx0XHQubm9kZSgpXG5cdFx0XHRcdFx0LmdldENvbnRleHQgJzJkJ1xuXG5cdFx0XHRjdHguZlJlY3Q9ICh4LHksdyxoKS0+XG5cdFx0XHRcdHggPSBwYXJzZUludCB4XG5cdFx0XHRcdHkgPSBwYXJzZUludCB5XG5cdFx0XHRcdGN0eC5maWxsUmVjdCB4LHksdyxoXG5cblx0XHRcdGN0eC5zUmVjdCA9ICh4LHksdyxoKS0+XG5cdFx0XHRcdHggPSBwYXJzZUludCh4KSswLjUwXG5cdFx0XHRcdHkgPSBwYXJzZUludCh5KSswLjUwXG5cdFx0XHRcdGN0eC5zdHJva2VSZWN0IHgseSx3LGhcblxuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG5cdFx0XHRzY29wZS4kd2F0Y2ggKCktPlxuXHRcdFx0XHRcdFMudGltZVxuXHRcdFx0XHQsIC0+XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCAwLCAwLCA3MDAsNzAwXG5cdFx0XHRcdFx0Xy5mb3JFYWNoIHNjb3BlLmNhcnMsIChjKS0+XG5cdFx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYy5jb2xvclxuXHRcdFx0XHRcdFx0e3gseX0gPSBjXG5cdFx0XHRcdFx0XHRjdHguZlJlY3QoICh4LS40KSo3LCh5LS40KSo3LC44KjcsLjgqNylcblx0XHRcdFx0XHRcdGN0eC5zUmVjdCggKHgtLjQpKjcsKHktLjQpKjcsLjgqNywuOCo3KVxuXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBvcmlnLEBwZXJtX3R1cm5zLEBkZXMpLT5cblx0XHQjZGVzIGlzIGFuIGludGVyc2VjdGlvblxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDQsNjAwXG5cdFx0XHRjb2xvcjogXy5zYW1wbGUgQGNvbG9yc1xuXG5cdGlzX2Rlc3RpbmF0aW9uOiAoaSktPlxuXHRcdGkuaWQgPT0gQGRlcy5pZFxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0Y29zdDA6IEBjb3N0XG5cdFx0XHRlbnRlcmVkOiBmYWxzZVxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0Y2VsbDogdW5kZWZpbmVkXG5cdFx0XHR0X2VuOiBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblx0XHRcdCMgdF9lbjogMTBcblx0XHRcdHR1cm5zOiBfLmNsb25lIEBwZXJtX3R1cm5zXG5cblx0c2V0X3h5OiAoQHgsQHksQHgyLEB5MiktPlxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBAY29zdCA8IEBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0QHNpZ25hbC5jb3VudCA9IDBcblxuXHR0dXJuX2NhcjooY2FyLGNlbGwpLT5cblx0XHRpZiBjYXIuZGVzLmlkID09IEBpZFxuXHRcdFx0Y2FyLmNlbGwucmVtb3ZlKClcblx0XHRcdGNhci5leGl0ZWQgPSB0cnVlXG5cdFx0XHRjYXIudF9leCA9IFMudGltZVxuXHRcdGVsc2Vcblx0XHRcdGxhbmUgPSBAYmVnX2xhbmVzW2Nhci50dXJuc1swXV1cblx0XHRcdGlmIGxhbmUuaXNfZnJlZSgpXG5cdFx0XHRcdGxhbmUucmVjZWl2ZSBjYXJcblx0XHRcdFx0Y2FyLmVudGVyZWQ9dHJ1ZVxuXHRcdFx0XHRjYXIudHVybnMuc2hpZnQoKVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLmNlbGw/LnJlbW92ZSgpXG5cdFx0Y2FyLmNlbGwgPSB0aGlzXG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5mb3JFYWNoUmlnaHQgQGNlbGxzLCAoY2VsbCxpLGspPT5cblx0XHRcdGlmICEoY2FyPWNlbGwuY2FyKSB0aGVuIHJldHVyblxuXHRcdFx0aWYgaT09KGsubGVuZ3RoLTEpICNpZiB0aGUgbGFzdCBjZWxsXG5cdFx0XHRcdGlmIEBlbmQuY2FuX2dvIEBkaXJlY3Rpb25cblx0XHRcdFx0XHRAZW5kLnR1cm5fY2FyIGNhcixjZWxsXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRhcmdldCA9IGtbaSsxXVxuXHRcdFx0XHRpZiB0YXJnZXQuaXNfZnJlZSgpXG5cdFx0XHRcdFx0dGFyZ2V0LnJlY2VpdmUgY2FyXG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Zm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0XHRjZWxsLmNhciA9IGNlbGwudGVtcF9jYXIgPSBmYWxzZVxuXHRcdFx0Y2VsbC5sYXN0ID0gLUluZmluaXR5XG5cblx0aXNfZnJlZTogLT5cblx0XHRAY2VsbHNbMF0uaXNfZnJlZSgpXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdEBjZWxsc1swXS5yZWNlaXZlIGNhclxuXG5cdHNldHVwOiAtPlxuXHRcdGEgPSBcblx0XHRcdHg6IEBiZWcucG9zLnhcblx0XHRcdHk6IEBiZWcucG9zLnlcblxuXHRcdGIgPSBcblx0XHRcdHg6IEBlbmQucG9zLnggIFxuXHRcdFx0eTogQGVuZC5wb3MueVxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblx0XHRcdFxuXHRcdHNjYWxlMiA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbQGJlZy5wb3MsQGVuZC5wb3NdXG5cblx0XHRbQGEsQGJdPVthLGJdXG5cblx0XHRAY2VsbHMgPSBbMC4uKFMubGFuZV9sZW5ndGgtMSldLm1hcCAobik9PiBcblx0XHRcdHBvcyA9IHNjYWxlIG5cblx0XHRcdF9wb3MgPSBzY2FsZTIgblxuXHRcdFx0bmV3IENlbGwgcG9zLF9wb3NcblxubW9kdWxlLmV4cG9ydHMgPSBMYW5lXG4iLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0c2l6ZTogMTBcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDVcblx0XHRcdHBhY2U6IDVcblx0XHRcdHNwYWNlOiAyXG5cdFx0XHRwaGFzZTogNTBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0bGFuZV9sZW5ndGg6IDEwXG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9jYXJzOiAyMDAwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdGZyZXF1ZW5jeTogMjVcblx0XHRcdGRheTogMFxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiIV8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkxhbmUgPSByZXF1aXJlICcuL2xhbmUnXG5JbnRlcnNlY3Rpb24gPSByZXF1aXJlICcuL2ludGVyc2VjdGlvbidcblNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aW50ZXJzZWN0aW9uczogW11cblx0XHRcdGxhbmVzOiBbXVxuXHRcdFx0b3V0ZXI6IFtdXG5cdFx0XHRpbm5lcjogW11cblx0XHRcdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblx0XHRcdGNhcnM6IFtdXG5cblx0XHRAZ3JpZCA9IFswLi4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aW50ZXJzZWN0aW9uXG5cblx0XHRmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0Zm9yIGRpciBpbiBAZGlyZWN0aW9uc1xuXHRcdFx0XHRqID0gc3dpdGNoIGRpclxuXHRcdFx0XHRcdHdoZW4gJ3VwJyB0aGVuIEBncmlkW2kucm93LTFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wrMV1cblx0XHRcdFx0XHR3aGVuICdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbC0xXVxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIChsYW5lPW5ldyBMYW5lIGksaixkaXIpXG5cdFx0XHRcdFx0aWYgKDA8aS5yb3c8KFMuc2l6ZS0xKSkgYW5kICgwPGkuY29sPChTLnNpemUtMSkpXG5cdFx0XHRcdFx0XHRAaW5uZXIucHVzaCBpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aWYgKGkucm93PjApIG9yIChpLmNvbD4wKVxuXHRcdFx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpXG5cdFx0XHRcdFx0XHRcdGkub3V0ZXIgPSB0cnVlXG5cblx0XHRAY3JlYXRlX2NhcigpIGZvciBpIGluIFswLi4uUy5udW1fY2Fyc11cblxuXHRjcmVhdGVfY2FyOiAtPlxuXHRcdGEgPSBfLnNhbXBsZSBAb3V0ZXJcblx0XHRiID0gXy5zYW1wbGUgQGlubmVyXG5cdFx0dWQgPSBpZiBiLnJvdyA8IGEucm93IHRoZW4gJ3VwJyBlbHNlICdkb3duJ1xuXHRcdGxyID0gaWYgYi5jb2wgPCBhLmNvbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblx0XHR1ZHMgPSAodWQgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLnJvdy1hLnJvdyldKVxuXHRcdGxycyA9IChsciBmb3IgaSBpbiBbMC4uLk1hdGguYWJzKGIuY29sLWEuY29sKV0pXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5mbGF0dGVuKFt1ZHMsbHJzXSlcblx0XHRjYXIgPSBuZXcgQ2FyIGEsdHVybnMsYlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0dGljazogLT5cblx0XHQoaS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnMpXG5cdFx0KGwudGljaygpIGZvciBsIGluIEBsYW5lcylcblx0XHRAd2FpdGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGlmIGNhci50X2VuIDwgUy50aW1lXG5cdFx0XHRcdGlmIGNhci5vcmlnLmNhbl9nbyBjYXIudHVybnNbMF1cblx0XHRcdFx0XHRjYXIub3JpZy50dXJuX2NhciBjYXJcblxuXHRcdEB3YWl0aW5nID0gXy5maWx0ZXIgQGNhcnMsKGMpLT4gIWMuZW50ZXJlZFxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAY2FycywgKGMpLT4gYy5lbnRlcmVkIGFuZCAhYy5leGl0ZWRcblxuXHRcdGZvciBsIGluIEBsYW5lc1xuXHRcdFx0Zm9yIGMgaW4gbC5jZWxsc1xuXHRcdFx0XHRjLmZpbmFsaXplKClcblxuXHRcdGlmIFMudGltZSAlUy5mcmVxdWVuY3kgPT0wXG5cdFx0XHRAbG9nKClcblx0XHRcdEByZW1lbWJlcigpXG5cblx0cmVtZW1iZXI6IC0+XG5cdFx0bWVtID0gXG5cdFx0XHRuOiBAdHJhdmVsaW5nLmxlbmd0aFxuXHRcdFx0djogMFxuXHRcdFx0ZjogMFxuXG5cdFx0Zm9yIGMgaW4gQHRyYXZlbGluZ1xuXHRcdFx0aWYgYy5zdG9wcGVkID09IDBcblx0XHRcdFx0bWVtLmYrK1xuXHRcdFx0XHRtZW0udis9KDEvbWVtLm4pXG5cdFx0XHRcdFxuXHRcdEBtZW1vcnkucHVzaCBtZW1cblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBTLm51bV9jYXJzIC0gQHdhaXRpbmcubGVuZ3RoIFxuXHRcdFx0Y3VtRXg6IFMubnVtX2NhcnMgLSBAdHJhdmVsaW5nLmxlbmd0aC1Ad2FpdGluZy5sZW5ndGhcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHRkYXlfZW5kOi0+XG5cdFx0Yy5ldmFsX2Nvc3QoKSBmb3IgYyBpbiBAY2Fyc1xuXHRcdGMuY2hvb3NlKCkgZm9yIGMgaW4gXy5zYW1wbGUgQGNhcnMsIDI1XG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0KClcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0dHJhdmVsaW5nOiBbXVxuXHRcdFx0Y3VtOiBbXVxuXHRcdFx0bWVtb3J5OiBbXVxuXHRcdFx0Y3VtRW46IDBcblx0XHRcdGN1bUV4OiAwXG5cdFx0XHR3YWl0aW5nOiBfLmNsb25lIEBjYXJzXG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRmb3IgaW50ZXJzZWN0aW9uIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRpbnRlcnNlY3Rpb24uZGF5X3N0YXJ0KCkgXG5cdFx0Zm9yIGxhbmUgaW4gQGxhbmVzXG5cdFx0XHRsYW5lLmRheV9zdGFydCgpXG5cdFx0Zm9yIGNhciBpbiBAY2Fyc1xuXHRcdFx0Y2FyLmRheV9zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
