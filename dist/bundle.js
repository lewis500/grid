(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ctrl, S, Traffic, _, angular, d3, signalDer, twoDer, visDer;

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

twoDer = function() {
  var directive;
  return directive = {
    scope: {
      cars: '='
    },
    link: function(scope, el, attr) {
      var data, map, params, sel, two, twos;
      params = {
        width: 700,
        height: 700,
        type: Two.Types.webgl
      };
      two = new Two(params).appendTo(el[0]);
      sel = d3.select(el[0]);
      data = [];
      map = {};
      twos = {};
      return scope.$watch(function() {
        return S.time;
      }, function() {
        var d, j, k, len, len1, newD, new_map, t;
        newD = scope.cars;
        new_map = {};
        for (j = 0, len = newD.length; j < len; j++) {
          d = newD[j];
          new_map[d.id] = d;
          if (!map[d.id]) {
            data.push(d);
            map[d.id] = d;
            t = twos[d.id] = two.makeRectangle(-2, -2, 4, 4);
            t.fill = d.color;
            t.stroke = 'white';
          }
        }
        for (k = 0, len1 = data.length; k < len1; k++) {
          d = data[k];
          if (!new_map[d.id]) {
            delete map[d.id];
            delete (t = twos[d.id]);
            two.remove(t);
          } else {
            twos[d.id].translation.set(d.x * 7, d.y * 7);
          }
        }
        return two.update();
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer).directive('twoDer', twoDer).directive('mfdDer', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis'));



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
    var data, map, params, sel, two, twos;
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
    params = {
      width: this.width,
      height: this.height,
      type: Two.Types.webgl
    };
    sel = d3.select(el[0]).append("div").style({
      position: 'absolute',
      left: this.m.l,
      top: this.m.t
    });
    two = new Two(params).appendTo(sel.node());
    this.hor = d3.scale.linear().domain([0, S.num_cars]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars * .2]).range([this.height, 0]);
    data = [];
    map = {};
    twos = {};
    this.scope.$watch(function() {
      return S.time;
    }, (function(_this) {
      return function(newD) {
        var d, i, j, k, len, len1, new_map, t;
        newD = _this.memory;
        new_map = {};
        for (i = j = 0, len = newD.length; j < len; i = ++j) {
          d = newD[i];
          new_map[d.id] = d;
          if (!map[d.id]) {
            data.push(d);
            map[d.id] = d;
            t = twos[d.id] = two.makeCircle(0, 0, 4);
            t.fill = '#03A9F4';
            t.stroke = 'white';
          }
        }
        for (i = k = 0, len1 = data.length; k < len1; i = ++k) {
          d = data[i];
          if (!new_map[d.id]) {
            delete map[d.id];
            delete (t = twos[d.id]);
            two.remove(t);
          } else {
            t = twos[d.id];
            t.opacity = i / newD.length;
            t.translation.set(_this.hor(d.n), _this.ver(d.f));
          }
        }
        return two.update();
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
      car.t_ex = S.time;
      return true;
    } else {
      lane = this.beg_lanes[car.turns[0]];
      if (lane.is_free()) {
        lane.receive(car);
        car.entered = true;
        if (cell != null) {
          cell.remove();
        }
        car.turns.shift();
        return true;
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
    var car, cell, i, j, k, len, num_moving, target;
    num_moving = 0;
    k = this.cells;
    for (i = j = 0, len = k.length; j < len; i = ++j) {
      cell = k[i];
      if (car = cell.car) {
        if (i === (k.length - 1)) {
          if (this.end.can_go(this.direction)) {
            if (this.end.turn_car(car, cell)) {
              num_moving++;
            }
          }
        } else {
          target = k[i + 1];
          if (target.is_free()) {
            num_moving++;
            target.receive(car);
            cell.remove();
          }
        }
      }
    }
    return num_moving;
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
      pace: 2,
      space: 4,
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
    var c, i, k, l, len, len1, len2, m, n, num_moving, ref, ref1, ref2;
    ref = this.intersections;
    for (k = 0, len = ref.length; k < len; k++) {
      i = ref[k];
      i.tick();
    }
    num_moving = _.sum((function() {
      var len1, m, ref1, results;
      ref1 = this.lanes;
      results = [];
      for (m = 0, len1 = ref1.length; m < len1; m++) {
        l = ref1[m];
        results.push(l.tick());
      }
      return results;
    }).call(this));
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
    ref1 = this.lanes;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      l = ref1[m];
      ref2 = l.cells;
      for (n = 0, len2 = ref2.length; n < len2; n++) {
        c = ref2[n];
        c.finalize();
      }
    }
    if (S.time % S.frequency === 0) {
      return this.memory.push({
        n: this.traveling.length,
        v: num_moving / this.traveling.length,
        f: num_moving,
        id: _.uniqueId()
      });
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBQ1gsSUFB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QUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUFBLENBQUMsQ0FBQyxTQUFGLENBQUE7QUFBQTtBQUNBO0FBQUEsU0FBQSx3Q0FBQTs7TUFBQSxDQUFDLENBQUMsTUFBRixDQUFBO0FBQUE7V0FDQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0VBSE87O29CQUtSLFNBQUEsR0FBVSxTQUFBO0FBQ1QsUUFBQTtJQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsU0FBQSxFQUFXLEVBQVg7TUFDQSxHQUFBLEVBQUssRUFETDtNQUVBLE1BQUEsRUFBUSxFQUZSO01BR0EsS0FBQSxFQUFPLENBSFA7TUFJQSxLQUFBLEVBQU8sQ0FKUDtNQUtBLE9BQUEsRUFBUyxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxJQUFULENBTFQ7S0FERDtJQU9BLENBQUMsQ0FBQyxVQUFGLENBQUE7QUFDQTtBQUFBLFNBQUEscUNBQUE7O01BQ0MsWUFBWSxDQUFDLFNBQWIsQ0FBQTtBQUREO0FBRUE7QUFBQSxTQUFBLHdDQUFBOztNQUNDLElBQUksQ0FBQyxTQUFMLENBQUE7QUFERDtBQUVBO0FBQUE7U0FBQSx3Q0FBQTs7bUJBQ0MsR0FBRyxDQUFDLFNBQUosQ0FBQTtBQUREOztFQWJTOzs7Ozs7QUFnQlgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cdFx0QGRheV9zdGFydCgpXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRpZiBAcGh5c2ljc1xuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAc2NvcGUudHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdEBzY29wZS50cmFmZmljLnRpY2soKVxuXHRcdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdGQzLnRpbWVyLmZsdXNoKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0QHBoeXNpY3MgPSB0cnVlICNwaHlzaWNzIHN0YWdlIGhhcHBlbmluZ1xuXHRcdEBzY29wZS50cmFmZmljLmRheV9zdGFydCgpXG5cdFx0QHRpY2soKVxuXG5cdGRheV9lbmQ6IC0+XG5cdFx0QHBoeXNpY3MgPSBmYWxzZSAjcGh5c2ljcyBzdGFnZSBub3QgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X2VuZCgpXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0KClcblxudHdvRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y2FyczogJz0nXG5cdFx0bGluazogKHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHBhcmFtcyA9IHsgd2lkdGg6IDcwMCwgaGVpZ2h0OiA3MDAsIHR5cGU6IFR3by5UeXBlcy53ZWJnbCB9XG5cdFx0XHR0d28gPSBuZXcgVHdvKHBhcmFtcykuYXBwZW5kVG8oZWxbMF0pXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblxuXHRcdFx0ZGF0YSA9IFtdXG5cdFx0XHRtYXAgPSB7fVxuXHRcdFx0dHdvcyA9IHt9XG5cblx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRcdFMudGltZVxuXHRcdFx0XHQsIC0+XG5cdFx0XHRcdFx0bmV3RCA9IHNjb3BlLmNhcnNcblx0XHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0XHRmb3IgZCBpbiBuZXdEXG5cdFx0XHRcdFx0XHRuZXdfbWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0aWYgIW1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2ggZFxuXHRcdFx0XHRcdFx0XHRtYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdID0gdHdvLm1ha2VSZWN0YW5nbGUgLTIsLTIsNCw0XG5cdFx0XHRcdFx0XHRcdHQuZmlsbCA9IGQuY29sb3Jcblx0XHRcdFx0XHRcdFx0dC5zdHJva2UgPSAnd2hpdGUnXG5cblxuXHRcdFx0XHRcdGZvciBkIGluIGRhdGFcblx0XHRcdFx0XHRcdGlmICFuZXdfbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBtYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0ZGVsZXRlICh0ID0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdFx0dHdvLnJlbW92ZSB0XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHR3b3NbZC5pZF0udHJhbnNsYXRpb24uc2V0IGQueCo3LCBkLnkqN1xuXG5cdFx0XHRcdFx0dHdvLnVwZGF0ZSgpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICd0d29EZXInLHR3b0RlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5kaXJlY3RpdmUgJ2NhbkRlcicsIGNhbkRlclxuXG5cblxuIyBjYW5EZXIgPSAtPlxuIyBcdGRpcmVjdGl2ZSA9IFxuIyBcdFx0c2NvcGU6IFxuIyBcdFx0XHRjYXJzOiAnPSdcbiMgXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cbiMgXHRcdFx0Y3R4ID0gZDMuc2VsZWN0IGVsWzBdXG4jIFx0XHRcdFx0XHQuYXBwZW5kICdjYW52YXMnXG4jIFx0XHRcdFx0XHQuYXR0clxuIyBcdFx0XHRcdFx0XHR3aWR0aDogNzAwXG4jIFx0XHRcdFx0XHRcdGhlaWdodDogNzAwXG4jIFx0XHRcdFx0XHQubm9kZSgpXG4jIFx0XHRcdFx0XHQuZ2V0Q29udGV4dCAnMmQnXG5cbiMgXHRcdFx0Y3R4LmZSZWN0PSAoeCx5LHcsaCktPlxuIyBcdFx0XHRcdHggPSBwYXJzZUludCB4XG4jIFx0XHRcdFx0eSA9IHBhcnNlSW50IHlcbiMgXHRcdFx0XHRjdHguZmlsbFJlY3QgeCx5LHcsaFxuXG4jIFx0XHRcdGN0eC5zUmVjdCA9ICh4LHksdyxoKS0+XG4jIFx0XHRcdFx0eCA9IC41K3BhcnNlSW50IHhcbiMgXHRcdFx0XHR5ID0gLjUrcGFyc2VJbnQgeVxuIyBcdFx0XHRcdGN0eC5zdHJva2VSZWN0IHgseSx3LGhcblxuIyBcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiMgXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG4jIFx0XHRcdFx0XHRTLnRpbWVcbiMgXHRcdFx0XHQsIC0+XG4jIFx0XHRcdFx0XHRjdHguY2xlYXJSZWN0IDAsIDAsIDcwMCw3MDBcbiMgXHRcdFx0XHRcdF8uZm9yRWFjaCBzY29wZS5jYXJzLCAoYyktPlxuIyBcdFx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYy5jb2xvclxuIyBcdFx0XHRcdFx0XHR7eCx5fSA9IGNcbiMgXHRcdFx0XHRcdFx0Y3R4LmZSZWN0IHgqNyx5KjcsNCw0XG4jIFx0XHRcdFx0XHRcdGN0eC5zUmVjdCB4KjcseSo3LDQsNFxuXG5cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdHBhcmFtcyA9IFxuXHRcdFx0d2lkdGg6IEB3aWR0aFxuXHRcdFx0aGVpZ2h0OiBAaGVpZ2h0XG5cdFx0XHR0eXBlOiBUd28uVHlwZXMud2ViZ2xcblxuXHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0IyAuYXBwZW5kICdkaXYnXG5cdFx0XHQjIC5zZWxlY3QgJy5nLW1haW4nXG5cdFx0XHQjIC5hcHBlbmQgJ2ZvcmVpZ25PYmplY3QnXG5cdFx0XHQjIC5hcHBlbmQgJ2Rpdidcblx0XHRcdCMgLnN0eWxlICdwb3NpdGlvbicsJ2Fic29sdXRlJ1xuXHRcdFx0IyAuYXR0ciAnd2lkdGgnLEB3aWR0aFxuXHRcdFx0IyAuYXR0ciAnaGVpZ2h0JyxAaGVpZ2h0XG5cdFx0XHQuYXBwZW5kIFwiZGl2XCJcblx0XHRcdC5zdHlsZVxuXHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJ1xuXHRcdFx0XHRsZWZ0OiBAbS5sXG5cdFx0XHRcdHRvcDogQG0udFxuXHRcdFx0IyAuc3R5bGUgJ3Bvc2l0aW9uJywnYWJzb2x1dGUnXG5cblx0XHR0d28gPSBuZXcgVHdvIHBhcmFtc1xuXHRcdFx0LmFwcGVuZFRvIHNlbC5ub2RlKClcblx0XHRcdCMgLlxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouMl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdGRhdGEgPSBbXVxuXHRcdG1hcCA9IHt9XG5cdFx0dHdvcyA9IHt9XG5cblx0XHRAc2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFMudGltZVxuXHRcdFx0LCAobmV3RCk9PlxuXHRcdFx0XHRuZXdEID0gQG1lbW9yeVxuXHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0Zm9yIGQsaSBpbiBuZXdEXG5cdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRpZiAhbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRkYXRhLnB1c2ggZFxuXHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0dCA9IHR3b3NbZC5pZF0gPSB0d28ubWFrZUNpcmNsZSAwLDAsNFxuXHRcdFx0XHRcdFx0dC5maWxsID0gJyMwM0E5RjQnXG5cdFx0XHRcdFx0XHR0LnN0cm9rZSA9ICd3aGl0ZSdcblxuXHRcdFx0XHRmb3IgZCxpIGluIGRhdGFcblx0XHRcdFx0XHRpZiAhbmV3X21hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlIG1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlICh0ID0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdXG5cdFx0XHRcdFx0XHR0Lm9wYWNpdHkgPSAoaS9uZXdELmxlbmd0aClcblx0XHRcdFx0XHRcdHQudHJhbnNsYXRpb24uc2V0IEBob3IoZC5uKSwgQHZlcihkLmYpXG5cblx0XHRcdFx0dHdvLnVwZGF0ZSgpXG5cblx0XHQjIEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdCMgXHQueCAoZCk9PkBob3IgZC5uXG5cdFx0IyBcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAb3JpZyxAcGVybV90dXJucyxAZGVzKS0+XG5cdFx0I2RlcyBpcyBhbiBpbnRlcnNlY3Rpb25cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LDYwMFxuXHRcdFx0Y29sb3I6IF8uc2FtcGxlIEBjb2xvcnNcblxuXHRpc19kZXN0aW5hdGlvbjogKGkpLT5cblx0XHRpLmlkID09IEBkZXMuaWRcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRTkxRTYzJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1J11cblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZW50ZXJlZDogZmFsc2Vcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGNlbGw6IHVuZGVmaW5lZFxuXHRcdFx0dF9lbjogTWF0aC5tYXggMCwoQHRhcmdldCArIF8ucmFuZG9tIC0yLDIpXG5cdFx0XHR0dXJuczogXy5zaHVmZmxlIF8uY2xvbmUgQHBlcm1fdHVybnNcblxuXHRzZXRfeHk6IChAeCxAeSxAeDIsQHkyKS0+XG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRAc2lnbmFsLmNvdW50ID0gMFxuXG5cdHR1cm5fY2FyOihjYXIsY2VsbCktPlxuXHRcdGlmIGNhci5kZXMuaWQgPT0gQGlkXG5cdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0XHRjYXIuZXhpdGVkID0gdHJ1ZVxuXHRcdFx0Y2FyLnRfZXggPSBTLnRpbWVcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRsYW5lID0gQGJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRpZiBsYW5lLmlzX2ZyZWUoKVxuXHRcdFx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cdFx0XHRcdGNhci5lbnRlcmVkPXRydWVcblx0XHRcdFx0Y2VsbD8ucmVtb3ZlKClcblx0XHRcdFx0Y2FyLnR1cm5zLnNoaWZ0KClcblx0XHRcdFx0dHJ1ZVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXG5cdHRpY2s6IC0+XG5cdFx0bnVtX21vdmluZyA9IDBcblx0XHRrID0gQGNlbGxzXG5cdFx0Zm9yIGNlbGwsaSBpbiBrXG5cdFx0XHRpZiBjYXI9Y2VsbC5jYXJcblx0XHRcdFx0aWYgaT09KGsubGVuZ3RoLTEpICNpZiB0aGUgbGFzdCBjZWxsXG5cdFx0XHRcdFx0aWYgQGVuZC5jYW5fZ28gQGRpcmVjdGlvblxuXHRcdFx0XHRcdFx0aWYgQGVuZC50dXJuX2NhciBjYXIsY2VsbCB0aGVuIG51bV9tb3ZpbmcrK1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGFyZ2V0ID0ga1tpKzFdXG5cdFx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdFx0bnVtX21vdmluZysrXG5cdFx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblx0XHRudW1fbW92aW5nXG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Zm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0XHRjZWxsLmNhciA9IGNlbGwudGVtcF9jYXIgPSBmYWxzZVxuXHRcdFx0Y2VsbC5sYXN0ID0gLUluZmluaXR5XG5cblx0aXNfZnJlZTogLT5cblx0XHRAY2VsbHNbMF0uaXNfZnJlZSgpXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdEBjZWxsc1swXS5yZWNlaXZlIGNhclxuXG5cdHNldHVwOiAtPlxuXHRcdGEgPSBcblx0XHRcdHg6IEBiZWcucG9zLnhcblx0XHRcdHk6IEBiZWcucG9zLnlcblxuXHRcdGIgPSBcblx0XHRcdHg6IEBlbmQucG9zLnggIFxuXHRcdFx0eTogQGVuZC5wb3MueVxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblx0XHRcdFxuXHRcdHNjYWxlMiA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbQGJlZy5wb3MsQGVuZC5wb3NdXG5cblx0XHRbQGEsQGJdPVthLGJdXG5cblx0XHRAY2VsbHMgPSBbMC4uKFMubGFuZV9sZW5ndGgtMSldLm1hcCAobik9PiBcblx0XHRcdHBvcyA9IHNjYWxlIG5cblx0XHRcdF9wb3MgPSBzY2FsZTIgblxuXHRcdFx0bmV3IENlbGwgcG9zLF9wb3NcblxubW9kdWxlLmV4cG9ydHMgPSBMYW5lXG4iLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0c2l6ZTogMTBcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDVcblx0XHRcdHBhY2U6IDJcblx0XHRcdHNwYWNlOiA0XG5cdFx0XHRwaGFzZTogODBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0bGFuZV9sZW5ndGg6IDEwXG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9jYXJzOiAyMDAwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdGZyZXF1ZW5jeTogMjVcblx0XHRcdGRheTogMFxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIiwiIV8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkxhbmUgPSByZXF1aXJlICcuL2xhbmUnXG5JbnRlcnNlY3Rpb24gPSByZXF1aXJlICcuL2ludGVyc2VjdGlvbidcbiMgU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpbnRlcnNlY3Rpb25zOiBbXVxuXHRcdFx0bGFuZXM6IFtdXG5cdFx0XHRvdXRlcjogW11cblx0XHRcdGlubmVyOiBbXVxuXHRcdFx0ZGlyZWN0aW9uczogWyd1cCcsJ3JpZ2h0JywnZG93bicsJ2xlZnQnXVxuXHRcdFx0Y2FyczogW11cblxuXHRcdEBncmlkID0gWzAuLi5TLnNpemVdLm1hcCAocm93KT0+XG5cdFx0XHRbMC4uLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggKGxhbmU9bmV3IExhbmUgaSxqLGRpcilcblx0XHRcdFx0XHRpZiAoMDxpLnJvdzwoUy5zaXplLTEpKSBhbmQgKDA8aS5jb2w8KFMuc2l6ZS0xKSlcblx0XHRcdFx0XHRcdEBpbm5lci5wdXNoIGlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiAoaS5yb3c+MCkgb3IgKGkuY29sPjApXG5cdFx0XHRcdFx0XHRcdEBvdXRlci5wdXNoIGlcblx0XHRcdFx0XHRcdFx0aS5vdXRlciA9IHRydWVcblxuXHRcdEBjcmVhdGVfY2FyKCkgZm9yIGkgaW4gWzAuLi5TLm51bV9jYXJzXVxuXG5cdGNyZWF0ZV9jYXI6IC0+XG5cdFx0YSA9IF8uc2FtcGxlIEBvdXRlclxuXHRcdGIgPSBfLnNhbXBsZSBAaW5uZXJcblx0XHR1ZCA9IGlmIGIucm93IDwgYS5yb3cgdGhlbiAndXAnIGVsc2UgJ2Rvd24nXG5cdFx0bHIgPSBpZiBiLmNvbCA8IGEuY29sIHRoZW4gJ2xlZnQnIGVsc2UgJ3JpZ2h0J1xuXHRcdHVkcyA9ICh1ZCBmb3IgaSBpbiBbMC4uLk1hdGguYWJzKGIucm93LWEucm93KV0pXG5cdFx0bHJzID0gKGxyIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5jb2wtYS5jb2wpXSlcblx0XHR0dXJucyA9IF8uc2h1ZmZsZSBfLmZsYXR0ZW4oW3VkcyxscnNdKVxuXHRcdGNhciA9IG5ldyBDYXIgYSx0dXJucyxiXG5cdFx0QGNhcnMucHVzaCBjYXJcblxuXHR0aWNrOiAtPlxuXHRcdChpLnRpY2soKSBmb3IgaSBpbiBAaW50ZXJzZWN0aW9ucylcblx0XHRudW1fbW92aW5nID0gXy5zdW0gKGwudGljaygpIGZvciBsIGluIEBsYW5lcylcblx0XHRAd2FpdGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGlmIGNhci50X2VuIDwgUy50aW1lXG5cdFx0XHRcdGlmIGNhci5vcmlnLmNhbl9nbyBjYXIudHVybnNbMF1cblx0XHRcdFx0XHRjYXIub3JpZy50dXJuX2NhciBjYXJcblxuXHRcdEB3YWl0aW5nID0gXy5maWx0ZXIgQGNhcnMsKGMpLT4gIWMuZW50ZXJlZFxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAY2FycywgKGMpLT4gYy5lbnRlcmVkIGFuZCAhYy5leGl0ZWRcblxuXHRcdGZvciBsIGluIEBsYW5lc1xuXHRcdFx0Zm9yIGMgaW4gbC5jZWxsc1xuXHRcdFx0XHRjLmZpbmFsaXplKClcblxuXHRcdGlmIFMudGltZSAlUy5mcmVxdWVuY3kgPT0wXG5cdFx0XHRAbWVtb3J5LnB1c2ggXG5cdFx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHRcdHY6IG51bV9tb3ZpbmcvQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdFx0ZjogbnVtX21vdmluZ1xuXHRcdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cblx0bG9nOiAtPlxuXHRcdEBjdW0ucHVzaFxuXHRcdFx0dGltZTogUy50aW1lXG5cdFx0XHRjdW1FbjogUy5udW1fY2FycyAtIEB3YWl0aW5nLmxlbmd0aCBcblx0XHRcdGN1bUV4OiBTLm51bV9jYXJzIC0gQHRyYXZlbGluZy5sZW5ndGgtQHdhaXRpbmcubGVuZ3RoXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdGRheV9lbmQ6LT5cblx0XHRjLmV2YWxfY29zdCgpIGZvciBjIGluIEBjYXJzXG5cdFx0Yy5jaG9vc2UoKSBmb3IgYyBpbiBfLnNhbXBsZSBAY2FycywgMjVcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5cdGRheV9zdGFydDotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRtZW1vcnk6IFtdXG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgQGNhcnNcblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdGZvciBpbnRlcnNlY3Rpb24gaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGludGVyc2VjdGlvbi5kYXlfc3RhcnQoKSBcblx0XHRmb3IgbGFuZSBpbiBAbGFuZXNcblx0XHRcdGxhbmUuZGF5X3N0YXJ0KClcblx0XHRmb3IgY2FyIGluIEBjYXJzXG5cdFx0XHRjYXIuZGF5X3N0YXJ0KClcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljIl19
