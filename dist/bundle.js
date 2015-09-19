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
      return scope.$watch(function() {
        return S.time;
      }, function() {
        ctx.clearRect(0, 0, 700, 700);
        return _.forEach(scope.cars, function(c) {
          var x, y;
          ctx.fillStyle = c.color;
          x = c.x, y = c.y;
          return ctx.fillRect((x - .4) * 7, (y - .4) * 7, .8 * 7, .8 * 7);
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
  function Car(start_cell, perm_turns, des) {
    this.start_cell = start_cell;
    this.perm_turns = perm_turns;
    this.des = des;
    _.assign(this, {
      id: _.uniqueId(),
      cost0: Infinity,
      target: _.random(4, 300),
      color: _.sample(this.colors)
    });
  }

  Car.prototype.colors = ['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5'];

  Car.prototype.enter = function() {
    _.assign(this, {
      cost0: this.cost,
      exited: false,
      stopped: 0,
      turns: _.clone(this.perm_turns)
    });
    return this.start_cell.receive(this, S.time);
  };

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-2, 2));
  };

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.set_xy = function(x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
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

  Cell.prototype.is_free = function(time) {
    return (time - this.last) > this.space;
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
        var car, target, target_lane;
        if (!(car = cell.car)) {
          return;
        }
        if (i === (k.length - 1)) {
          if (_this.end.can_go(_this.direction)) {
            target_lane = _this.end.beg_lanes[car.turns[0]];
            target = target_lane != null ? target_lane.cells[0] : void 0;
            car.turns.shift();
            if (car.turns.length === 0) {
              return car.exit();
            }
          }
        } else {
          target = k[i + 1];
        }
        if (target != null ? target.is_free(S.time) : void 0) {
          cell.remove();
          return target.receive(car, S.time);
        }
      };
    })(this));
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
    var dir, i, j, k, lane, len, len1, m, n, o, ref, ref1, ref2, ref3, ref4, ref5, results, results1;
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
            this.inner.push(lane);
          } else {
            this.outer.push(lane);
          }
        }
      }
    }
    _.forEach((function() {
      results1 = [];
      for (var o = 0, ref5 = S.num_cars; 0 <= ref5 ? o <= ref5 : o >= ref5; 0 <= ref5 ? o++ : o--){ results1.push(o); }
      return results1;
    }).apply(this), (function(_this) {
      return function() {
        return _this.create_car();
      };
    })(this));
  }

  Traffic.prototype.create_car = function() {
    var a, b, car, cells, des, k, lr, lrs, m, ref, ref1, results, results1, start_cell, turns, ud, uds;
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
    cells = _.filter(a.cells, function(d) {
      return d.is_free(S.time);
    });
    if (cells.length === 0) {
      return;
    }
    start_cell = _.sample(cells);
    des = _.sample(b.cells)._pos;
    car = new Car(start_cell, turns, des);
    return this.cars.push(car);
  };

  Traffic.prototype.tick = function() {
    var c, car, i, k, l, len, len1, len2, len3, len4, m, n, o, p, ref, ref1, ref2, ref3, ref4;
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
          car.turns.pop();
          _.remove(this.waiting, car);
          this.traveling.push(car);
        }
      }
    }
    this.traveling = _.filter(this.traveling, function(c) {
      return !c.exited;
    });
    ref3 = this.lanes;
    for (o = 0, len3 = ref3.length; o < len3; o++) {
      l = ref3[o];
      ref4 = l.cells;
      for (p = 0, len4 = ref4.length; p < len4; p++) {
        c = ref4[p];
        c.finalize();
      }
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9zaWduYWwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFB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LEVBQU8sSUFBQyxDQUFBLEtBRFI7TUFFQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBRlI7S0FERDtFQURJOztvQkFNTCxJQUFBLEdBQU0sU0FBQTtXQUNMLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBNUIsQ0FBQSxLQUFxQztFQURoQzs7b0JBR04sTUFBQSxHQUFRLFNBQUMsR0FBRDtJQUNQLElBQUMsQ0FBQSxLQUFEO1dBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixHQUFyQjtFQUZPOztvQkFJUixPQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQUEsQ0FBQyxDQUFDLFNBQUYsQ0FBQTtBQUFBO0FBQ0E7QUFBQTtTQUFBLHdDQUFBOzttQkFBQSxDQUFDLENBQUMsTUFBRixDQUFBO0FBQUE7O0VBRk87O29CQUlSLFNBQUEsR0FBVSxTQUFBO0lBQ1QsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxTQUFBLEVBQVcsRUFBWDtNQUNBLEdBQUEsRUFBSyxFQURMO01BRUEsTUFBQSxFQUFRLEVBRlI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtNQUlBLEtBQUEsRUFBTyxDQUpQO01BS0EsT0FBQSxFQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLElBQVQsQ0FMVDtLQUREO1dBUUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsSUFBVixFQUFnQixjQUFoQjtFQVRTOzs7Ozs7QUFXWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblx0XHRAZGF5X3N0YXJ0KClcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGlmIEBwaHlzaWNzXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEBzY29wZS50cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdEBwYXVzZWRcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5jYW5EZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRjYXJzOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0W3dpZHRoLGhlaWdodF0gPSBbK2F0dHIud2lkdGgsK2F0dHIuaGVpZ2h0XVxuXHRcdFx0Zm8gPWQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHRcdC5hcHBlbmQgJ2ZvcmVpZ25PYmplY3QnXHRcblxuXHRcdFx0Y3R4ID0gZm9cblx0XHRcdFx0XHQuYXBwZW5kICd4aHRtbDpjYW52YXMnXG5cdFx0XHRcdFx0LmF0dHIgJ3dpZHRoJyxcIjcwMHB4XCJcblx0XHRcdFx0XHQuYXR0ciAnaGVpZ2h0JyxcIjcwMHB4XCJcblx0XHRcdFx0XHQubm9kZSgpXG5cdFx0XHRcdFx0LmdldENvbnRleHQgJzJkJ1xuXG5cdFx0XHQjIGN0eC5mUmVjdD0gKHgseSx3LGgpLT5cblx0XHRcdCMgXHR4ID0gcGFyc2VJbnQgeFxuXHRcdFx0IyBcdHkgPSBwYXJzZUludCB5XG5cdFx0XHQjIFx0Y3R4LmZpbGxSZWN0IHgseSx3LGhcblxuXHRcdFx0c2NvcGUuJHdhdGNoICgpLT5cblx0XHRcdFx0XHRTLnRpbWVcblx0XHRcdFx0LCAtPlxuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QgMCwgMCwgNzAwLDcwMFxuXHRcdFx0XHRcdF8uZm9yRWFjaCBzY29wZS5jYXJzLCAoYyktPlxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGMuY29sb3Jcblx0XHRcdFx0XHRcdHt4LHl9ID0gY1xuXHRcdFx0XHRcdFx0Y3R4LmZpbGxSZWN0KCAoeC0uNCkqNywoeS0uNCkqNywuOCo3LC44KjcpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBzdGFydF9jZWxsLEBwZXJtX3R1cm5zLCBAZGVzKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCwzMDBcblx0XHRcdGNvbG9yOiBfLnNhbXBsZSBAY29sb3JzXG5cblx0IyBhdF9kZXN0aW5hdGlvbjogKHgseSktPlxuXHQjIFx0KEBkZXMueCA9PSB4KSBhbmQgKEBkZXMueSA9PSB5KVxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdGVudGVyOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0c3RvcHBlZDogMFxuXHRcdFx0dHVybnM6IF8uY2xvbmUgQHBlcm1fdHVybnNcblx0XHRcdFxuXHRcdEBzdGFydF9jZWxsLnJlY2VpdmUgdGhpcyxTLnRpbWVcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lIFxuXG5cdHNldF94eTogKEB4LEB5LEB4MixAeTIpLT5cblx0XHQjIGlmIEB4MiA9PSBAZGVzLnggYW5kIEB5MiA9IEBkZXMueVxuXHRcdCMgXHRAZXhpdCgpXG5cblx0ZXhpdDogLT5cblx0XHRbQHRfZXgsIEBleGl0ZWRdID0gW1MudGltZSwgdHJ1ZV1cblxuXHRldmFsX2Nvc3Q6IC0+XG5cdFx0QHNkID0gQHRfZXggLSBTLndpc2hcblx0XHRAc3AgPSBNYXRoLm1heCggLVMuYmV0YSAqIEBzZCwgUy5nYW1tYSAqIEBzZClcblx0XHRAdHQgPSBAdF9leCAtIEB0X2VuXG5cdFx0QGNvc3QgPSAgQHR0K0BzcCBcblxuXHRjaG9vc2U6IC0+XG5cdFx0aWYgQGNvc3QgPCBAY29zdDBcblx0XHRcdFtAY29zdDAsQHRhcmdldF0gPSBbQGNvc3QsIEB0X2VuXVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuXG5jbGFzcyBJbnRlcnNlY3Rpb25cblx0Y29uc3RydWN0b3I6KEByb3csQGNvbCktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2ludGVyc2VjdGlvbi0nXG5cdFx0W0BiZWdfbGFuZXMsQGVuZF9sYW5lc10gPSBbe30se31dXG5cblx0XHRAcG9zID0gXG5cdFx0XHR4OiBAY29sKjEwMC9TLnNpemVcblx0XHRcdHk6IEByb3cqMTAwL1Muc2l6ZVxuXG5cdFx0QHNpZ25hbCA9IG5ldyBTaWduYWxcblxuXHRcdEBkaXJlY3Rpb25zID0gXG5cdFx0XHQndXBfZG93bic6IFsndXAnLCdkb3duJ11cblx0XHRcdCdsZWZ0X3JpZ2h0JzogWydsZWZ0JywncmlnaHQnXVxuXG5cdHNldF9iZWdfbGFuZTogKGxhbmUpLT5cblx0XHRAYmVnX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRzZXRfZW5kX2xhbmU6IChsYW5lKS0+XG5cdFx0QGVuZF9sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0Y2FuX2dvOiAoZGlyZWN0aW9uKS0+XG5cdFx0ZGlyZWN0aW9uIGluIEBkaXJlY3Rpb25zW0BzaWduYWwuZGlyZWN0aW9uXVxuXG5cdHRpY2s6IC0+XG5cdFx0QHNpZ25hbC50aWNrKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcnNlY3Rpb24iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQHBvcyxAX3BvcyktPlxuXHRcdFx0QHggPSBAcG9zLnhcblx0XHRcdEB5ID0gQHBvcy55XG5cdFx0XHRAeDIgPSBNYXRoLmZsb29yIEBfcG9zLnhcblx0XHRcdEB5MiA9IE1hdGguZmxvb3IgQF9wb3MueVxuXHRcdFx0QGxhc3QgPSAtSW5maW5pdHlcblx0XHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0c3BhY2U6IFMuc3BhY2VcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X3h5IEB4LEB5LEB4MixAeTJcblx0XHQjIGlmICFjYXIuZXhpdGVkXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogKHRpbWUpLT5cblx0XHQodGltZS1AbGFzdCk+QHNwYWNlXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QHNldHVwKClcblx0XHRAcm93ID0gTWF0aC5taW4gQGJlZy5yb3csQGVuZC5yb3dcblx0XHRAY29sID0gTWF0aC5taW4gQGJlZy5jb2wsQGVuZC5jb2xcblxuXHR0aWNrOiAtPlxuXHRcdF8uZm9yRWFjaFJpZ2h0IEBjZWxscywgKGNlbGwsaSxrKT0+XG5cdFx0XHRpZiAhKGNhcj1jZWxsLmNhcikgdGhlbiByZXR1cm5cblx0XHRcdGlmIGk9PShrLmxlbmd0aC0xKSAjaWYgdGhlIGxhc3QgY2VsbFxuXHRcdFx0XHRpZiBAZW5kLmNhbl9nbyBAZGlyZWN0aW9uXG5cdFx0XHRcdFx0dGFyZ2V0X2xhbmUgPSBAZW5kLmJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0X2xhbmU/LmNlbGxzWzBdXG5cdFx0XHRcdFx0Y2FyLnR1cm5zLnNoaWZ0KClcblx0XHRcdFx0XHRpZiBjYXIudHVybnMubGVuZ3RoID09MFxuXHRcdFx0XHRcdFx0cmV0dXJuIGNhci5leGl0KClcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGFyZ2V0ID0ga1tpKzFdXG5cblx0XHRcdGlmIHRhcmdldD8uaXNfZnJlZSBTLnRpbWVcblx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXIsUy50aW1lXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbYSxiXVxuXHRcdFx0XG5cdFx0c2NhbGUyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFtAYmVnLnBvcyxAZW5kLnBvc11cblxuXHRcdFtAYSxAYl09W2EsYl1cblxuXHRcdEBjZWxscyA9IFswLi4oUy5sYW5lX2xlbmd0aC0xKV0ubWFwIChuKT0+IFxuXHRcdFx0cG9zID0gc2NhbGUgblxuXHRcdFx0X3BvcyA9IHNjYWxlMiBuXG5cdFx0XHRuZXcgQ2VsbCBwb3MsX3Bvc1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRzaXplOiAxMFxuXHRcdFx0c3RvcHBpbmdfdGltZTogNVxuXHRcdFx0cGFjZTogNVxuXHRcdFx0c3BhY2U6IDJcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHRsYW5lX2xlbmd0aDogMTBcblx0XHRcdHdpc2g6IDE1MFxuXHRcdFx0bnVtX2NhcnM6IDEwMDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0ZnJlcXVlbmN5OiAyNVxuXHRcdFx0ZGF5OiAwXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGludGVyc2VjdGlvbnM6IFtdXG5cdFx0XHRsYW5lczogW11cblx0XHRcdG91dGVyOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggKGxhbmU9bmV3IExhbmUgaSxqLGRpcilcblx0XHRcdFx0XHRpZiAoMDxpLnJvdzwoUy5zaXplLTEpKSBhbmQgKDA8aS5jb2w8KFMuc2l6ZS0xKSlcblx0XHRcdFx0XHRcdEBpbm5lci5wdXNoIGxhbmVcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRAb3V0ZXIucHVzaCBsYW5lXG5cblx0XHRfLmZvckVhY2ggWzAuLlMubnVtX2NhcnNdLCA9PiBAY3JlYXRlX2NhcigpXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gWzAuLk1hdGguYWJzKGIucm93LWEucm93KV0ubWFwIChpKS0+IHVkXG5cdFx0bHJzID0gWzAuLk1hdGguYWJzKGIuY29sLWEuY29sKV0ubWFwIChpKS0+IGxyXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5mbGF0dGVuIFt1ZHMsbHJzXVxuXHRcdCMgdHVybnMuc2hpZnRcblx0XHRjZWxscyA9IF8uZmlsdGVyIGEuY2VsbHMsIChkKS0+IGQuaXNfZnJlZSBTLnRpbWVcblx0XHRpZiBjZWxscy5sZW5ndGg9PTAgdGhlbiByZXR1cm5cblx0XHRzdGFydF9jZWxsID0gXy5zYW1wbGUgY2VsbHNcblx0XHRkZXMgPSBfLnNhbXBsZShiLmNlbGxzKS5fcG9zXG5cdFx0Y2FyID0gbmV3IENhciBzdGFydF9jZWxsLHR1cm5zLGRlc1xuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0dGljazogLT5cblx0XHQoaS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnMpXG5cdFx0KGwudGljaygpIGZvciBsIGluIEBsYW5lcylcblx0XHRmb3IgY2FyIGluIEB3YWl0aW5nXG5cdFx0XHRpZiBjYXJcblx0XHRcdFx0aWYgY2FyLnRfZW4gPCBTLnRpbWVcblx0XHRcdFx0XHRjYXIuZW50ZXIoKVxuXHRcdFx0XHRcdGNhci50dXJucy5wb3AoKVxuXHRcdFx0XHRcdF8ucmVtb3ZlIEB3YWl0aW5nLCBjYXJcblx0XHRcdFx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQHRyYXZlbGluZywgKGMpLT4gIWMuZXhpdGVkXG5cblx0XHRmb3IgbCBpbiBAbGFuZXNcblx0XHRcdGZvciBjIGluIGwuY2VsbHNcblx0XHRcdFx0Yy5maW5hbGl6ZSgpXG5cblx0XHRAbG9nKClcblxuXHRcdGlmIChTLnRpbWUlUy5mcmVxdWVuY3k9PTApIHRoZW4gQHJlbWVtYmVyKClcblxuXHRyZW1lbWJlcjogLT5cblx0XHRtZW0gPSBcblx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHR2OiAwXG5cdFx0XHRmOiAwXG5cblx0XHRmb3IgYyBpbiBAdHJhdmVsaW5nXG5cdFx0XHRpZiBjLnN0b3BwZWQgPT0gMFxuXHRcdFx0XHRtZW0uZisrXG5cdFx0XHRcdG1lbS52Kz0oMS9tZW0ubilcblx0XHRAbWVtb3J5LnB1c2ggbWVtXG5cblx0bG9nOiAtPlxuXHRcdEBjdW0ucHVzaFxuXHRcdFx0dGltZTogUy50aW1lXG5cdFx0XHRjdW1FbjogQGN1bUVuXG5cdFx0XHRjdW1FeDogQGN1bUV4XG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjdW1FeCsrXG5cdFx0Xy5yZW1vdmUgQHRyYXZlbGluZywgY2FyXG5cblx0ZGF5X2VuZDotPlxuXHRcdGMuZXZhbF9jb3N0KCkgZm9yIGMgaW4gQGNhcnNcblx0XHRjLmNob29zZSgpIGZvciBjIGluIF8uc2FtcGxlIEBjYXJzLCAyNVxuXG5cdGRheV9zdGFydDotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRtZW1vcnk6IFtdXG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUoQGNhcnMpXG5cblx0XHRfLmludm9rZSBAY2FycywgJ2Fzc2lnbl9lcnJvcidcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljIl19
