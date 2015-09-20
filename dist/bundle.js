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
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(5);
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

  Car.prototype.colors = ['#03A9F4', '#03A9F4', '#8BC34A', '#FF5722', '#607D8B', '#3F51B5', '#4CAF50', '#651FFF', '#1DE9B6'];

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
    if (this.count >= (S.phase + _.random(-5, 5))) {
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

  Lane.prototype.day_start = function() {
    var cell, i, len, ref, results;
    ref = this.cells;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      cell = ref[i];
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
    var a, b, i, ref, ref1, results, scale, scale2;
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
      for (var i = 0, ref1 = S.lane_length - 1; 0 <= ref1 ? i <= ref1 : i >= ref1; 0 <= ref1 ? i++ : i--){ results.push(i); }
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
    var dir, i, j, lane, len, len1, m, n, o, p, ref, ref1, ref2, ref3, ref4, ref5, results;
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
      for (var m = 0, ref = S.size; 0 <= ref ? m < ref : m > ref; 0 <= ref ? m++ : m--){ results.push(m); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var m, ref, results;
        return (function() {
          results = [];
          for (var m = 0, ref = S.size; 0 <= ref ? m < ref : m > ref; 0 <= ref ? m++ : m--){ results.push(m); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
          return intersection;
        });
      };
    })(this));
    ref1 = this.intersections;
    for (n = 0, len = ref1.length; n < len; n++) {
      i = ref1[n];
      ref2 = this.directions;
      for (o = 0, len1 = ref2.length; o < len1; o++) {
        dir = ref2[o];
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
    for (i = p = 0, ref5 = S.num_cars; 0 <= ref5 ? p < ref5 : p > ref5; i = 0 <= ref5 ? ++p : --p) {
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
      var m, ref, results;
      results = [];
      for (i = m = 0, ref = Math.abs(b.row - a.row); 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        results.push(ud);
      }
      return results;
    })();
    lrs = (function() {
      var m, ref, results;
      results = [];
      for (i = m = 0, ref = Math.abs(b.col - a.col); 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        results.push(lr);
      }
      return results;
    })();
    turns = _.shuffle(_.flatten([uds, lrs]));
    car = new Car(a, turns, b);
    return this.cars.push(car);
  };

  Traffic.prototype.tick_lane = function(lane) {
    var car, cell, i, k, len, m, num_moving, ref, target;
    num_moving = 0;
    k = lane.cells;
    if ((car = k[k.length - 1].car)) {
      if (lane.end.can_go(lane.direction)) {
        if (this.turn_car(car, lane.end)) {
          k[k.length - 1].remove();
          num_moving++;
        }
      }
    }
    ref = k.slice(0, k.length - 1);
    for (i = m = 0, len = ref.length; m < len; i = ++m) {
      cell = ref[i];
      target = k[i + 1];
      if (target.is_free() && (car = cell.car)) {
        num_moving++;
        target.receive(car);
        cell.remove();
      }
    }
    return num_moving;
  };

  Traffic.prototype.turn_car = function(car, i) {
    var lane;
    if (car.des.id === i.id) {
      car.exited = true;
      car.t_ex = S.time;
      return true;
    } else {
      lane = i.beg_lanes[car.turns[0]];
      if (lane.is_free()) {
        lane.receive(car);
        car.entered = true;
        car.turns.shift();
        return true;
      }
    }
  };

  Traffic.prototype.tick = function() {
    var c, car, i, l, lane, len, len1, len2, len3, m, n, num_moving, o, p, ref, ref1, ref2, ref3;
    ref = this.intersections;
    for (m = 0, len = ref.length; m < len; m++) {
      i = ref[m];
      i.tick();
    }
    num_moving = _.sum((function() {
      var len1, n, ref1, results;
      ref1 = this.lanes;
      results = [];
      for (n = 0, len1 = ref1.length; n < len1; n++) {
        lane = ref1[n];
        results.push(this.tick_lane(lane));
      }
      return results;
    }).call(this));
    ref1 = this.waiting;
    for (n = 0, len1 = ref1.length; n < len1; n++) {
      car = ref1[n];
      if (car.t_en < S.time) {
        this.turn_car(car, car.orig);
      }
    }
    ref2 = this.lanes;
    for (o = 0, len2 = ref2.length; o < len2; o++) {
      l = ref2[o];
      ref3 = l.cells;
      for (p = 0, len3 = ref3.length; p < len3; p++) {
        c = ref3[p];
        c.finalize();
      }
    }
    this.waiting = _.filter(this.cars, function(c) {
      return !c.entered;
    });
    return this.traveling = _.filter(this.cars, function(c) {
      return c.entered && !c.exited;
    });
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
    var c, len, len1, m, n, ref, ref1;
    ref = this.cars;
    for (m = 0, len = ref.length; m < len; m++) {
      c = ref[m];
      c.eval_cost();
    }
    ref1 = _.sample(this.cars, 25);
    for (n = 0, len1 = ref1.length; n < len1; n++) {
      c = ref1[n];
      c.choose();
    }
    return setTimeout((function(_this) {
      return function() {
        return _this.day_start();
      };
    })(this));
  };

  Traffic.prototype.day_start = function() {
    var car, intersection, lane, len, len1, len2, m, n, o, ref, ref1, ref2, results;
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
    for (m = 0, len = ref.length; m < len; m++) {
      intersection = ref[m];
      intersection.day_start();
    }
    ref1 = this.lanes;
    for (n = 0, len1 = ref1.length; n < len1; n++) {
      lane = ref1[n];
      lane.day_start();
    }
    ref2 = this.cars;
    results = [];
    for (o = 0, len2 = ref2.length; o < len2; o++) {
      car = ref2[o];
      results.push(car.day_start());
    }
    return results;
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBQ1gsSUFB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QVQsRUFDQztNQUFBLFNBQUEsRUFBVyxFQUFYO01BQ0EsR0FBQSxFQUFLLEVBREw7TUFFQSxNQUFBLEVBQVEsRUFGUjtNQUdBLEtBQUEsRUFBTyxDQUhQO01BSUEsS0FBQSxFQUFPLENBSlA7TUFLQSxPQUFBLEVBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsSUFBVCxDQUxUO0tBREQ7SUFPQSxDQUFDLENBQUMsVUFBRixDQUFBO0FBQ0E7QUFBQSxTQUFBLHFDQUFBOztNQUNDLFlBQVksQ0FBQyxTQUFiLENBQUE7QUFERDtBQUVBO0FBQUEsU0FBQSx3Q0FBQTs7TUFDQyxJQUFJLENBQUMsU0FBTCxDQUFBO0FBREQ7QUFFQTtBQUFBO1NBQUEsd0NBQUE7O21CQUNDLEdBQUcsQ0FBQyxTQUFKLENBQUE7QUFERDs7RUFiUzs7Ozs7O0FBZ0JYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0aWYgQHBoeXNpY3Ncblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfc3RhcnQoKVxuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdEBzY29wZS50cmFmZmljLmRheV9lbmQoKVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cbnR3b0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGNhcnM6ICc9J1xuXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRwYXJhbXMgPSB7IHdpZHRoOiA3MDAsIGhlaWdodDogNzAwLCB0eXBlOiBUd28uVHlwZXMud2ViZ2wgfVxuXHRcdFx0dHdvID0gbmV3IFR3byhwYXJhbXMpLmFwcGVuZFRvKGVsWzBdKVxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cblx0XHRcdGRhdGEgPSBbXVxuXHRcdFx0bWFwID0ge31cblx0XHRcdHR3b3MgPSB7fVxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFx0XHRTLnRpbWVcblx0XHRcdFx0LCAtPlxuXHRcdFx0XHRcdG5ld0QgPSBzY29wZS5jYXJzXG5cdFx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdFx0Zm9yIGQgaW4gbmV3RFxuXHRcdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdGlmICFtYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoIGRcblx0XHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0XHR0ID0gdHdvc1tkLmlkXSA9IHR3by5tYWtlUmVjdGFuZ2xlIC0yLC0yLDQsNFxuXHRcdFx0XHRcdFx0XHR0LmZpbGwgPSBkLmNvbG9yXG5cdFx0XHRcdFx0XHRcdHQuc3Ryb2tlID0gJ3doaXRlJ1xuXHRcdFx0XHRcdFx0XHQjIHQubGluZXdpZHRoID0uNVxuXG5cblx0XHRcdFx0XHRmb3IgZCBpbiBkYXRhXG5cdFx0XHRcdFx0XHRpZiAhbmV3X21hcFtkLmlkXVxuXHRcdFx0XHRcdFx0XHRkZWxldGUgbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSAodCA9IHR3b3NbZC5pZF0pXG5cdFx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdFxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR0d29zW2QuaWRdLnRyYW5zbGF0aW9uLnNldCBkLngqNywgZC55KjdcblxuXHRcdFx0XHRcdHR3by51cGRhdGUoKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0LmRpcmVjdGl2ZSAndHdvRGVyJyx0d29EZXJcblx0LmRpcmVjdGl2ZSAnbWZkRGVyJyxyZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuXG5cbiMgY2FuRGVyID0gLT5cbiMgXHRkaXJlY3RpdmUgPSBcbiMgXHRcdHNjb3BlOiBcbiMgXHRcdFx0Y2FyczogJz0nXG4jIFx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXG4jIFx0XHRcdGN0eCA9IGQzLnNlbGVjdCBlbFswXVxuIyBcdFx0XHRcdFx0LmFwcGVuZCAnY2FudmFzJ1xuIyBcdFx0XHRcdFx0LmF0dHJcbiMgXHRcdFx0XHRcdFx0d2lkdGg6IDcwMFxuIyBcdFx0XHRcdFx0XHRoZWlnaHQ6IDcwMFxuIyBcdFx0XHRcdFx0Lm5vZGUoKVxuIyBcdFx0XHRcdFx0LmdldENvbnRleHQgJzJkJ1xuXG4jIFx0XHRcdGN0eC5mUmVjdD0gKHgseSx3LGgpLT5cbiMgXHRcdFx0XHR4ID0gcGFyc2VJbnQgeFxuIyBcdFx0XHRcdHkgPSBwYXJzZUludCB5XG4jIFx0XHRcdFx0Y3R4LmZpbGxSZWN0IHgseSx3LGhcblxuIyBcdFx0XHRjdHguc1JlY3QgPSAoeCx5LHcsaCktPlxuIyBcdFx0XHRcdHggPSAuNStwYXJzZUludCB4XG4jIFx0XHRcdFx0eSA9IC41K3BhcnNlSW50IHlcbiMgXHRcdFx0XHRjdHguc3Ryb2tlUmVjdCB4LHksdyxoXG5cbiMgXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4jIFx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuIyBcdFx0XHRcdFx0Uy50aW1lXG4jIFx0XHRcdFx0LCAtPlxuIyBcdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCAwLCAwLCA3MDAsNzAwXG4jIFx0XHRcdFx0XHRfLmZvckVhY2ggc2NvcGUuY2FycywgKGMpLT5cbiMgXHRcdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGMuY29sb3JcbiMgXHRcdFx0XHRcdFx0e3gseX0gPSBjXG4jIFx0XHRcdFx0XHRcdGN0eC5mUmVjdCB4KjcseSo3LDQsNFxuIyBcdFx0XHRcdFx0XHRjdHguc1JlY3QgeCo3LHkqNyw0LDRcblxuXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRwYXJhbXMgPSBcblx0XHRcdHdpZHRoOiBAd2lkdGhcblx0XHRcdGhlaWdodDogQGhlaWdodFxuXHRcdFx0dHlwZTogVHdvLlR5cGVzLndlYmdsXG5cblx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdCMgLmFwcGVuZCAnZGl2J1xuXHRcdFx0IyAuc2VsZWN0ICcuZy1tYWluJ1xuXHRcdFx0IyAuYXBwZW5kICdmb3JlaWduT2JqZWN0J1xuXHRcdFx0IyAuYXBwZW5kICdkaXYnXG5cdFx0XHQjIC5zdHlsZSAncG9zaXRpb24nLCdhYnNvbHV0ZSdcblx0XHRcdCMgLmF0dHIgJ3dpZHRoJyxAd2lkdGhcblx0XHRcdCMgLmF0dHIgJ2hlaWdodCcsQGhlaWdodFxuXHRcdFx0LmFwcGVuZCBcImRpdlwiXG5cdFx0XHQuc3R5bGVcblx0XHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZSdcblx0XHRcdFx0bGVmdDogQG0ubFxuXHRcdFx0XHR0b3A6IEBtLnRcblx0XHRcdCMgLnN0eWxlICdwb3NpdGlvbicsJ2Fic29sdXRlJ1xuXG5cdFx0dHdvID0gbmV3IFR3byBwYXJhbXNcblx0XHRcdC5hcHBlbmRUbyBzZWwubm9kZSgpXG5cdFx0XHQjIC5cblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMubnVtX2NhcnNdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnMqLjJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRkYXRhID0gW11cblx0XHRtYXAgPSB7fVxuXHRcdHR3b3MgPSB7fVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRTLnRpbWVcblx0XHRcdCwgKG5ld0QpPT5cblx0XHRcdFx0bmV3RCA9IEBtZW1vcnlcblx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdGZvciBkLGkgaW4gbmV3RFxuXHRcdFx0XHRcdG5ld19tYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0aWYgIW1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGF0YS5wdXNoIGRcblx0XHRcdFx0XHRcdG1hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdID0gdHdvLm1ha2VDaXJjbGUgMCwwLDRcblx0XHRcdFx0XHRcdHQuZmlsbCA9ICcjMDNBOUY0J1xuXHRcdFx0XHRcdFx0dC5zdHJva2UgPSAnd2hpdGUnXG5cblx0XHRcdFx0Zm9yIGQsaSBpbiBkYXRhXG5cdFx0XHRcdFx0aWYgIW5ld19tYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSBtYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSAodCA9IHR3b3NbZC5pZF0pXG5cdFx0XHRcdFx0XHR0d28ucmVtb3ZlIHRcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR0ID0gdHdvc1tkLmlkXVxuXHRcdFx0XHRcdFx0dC5vcGFjaXR5ID0gKGkvbmV3RC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR0LnRyYW5zbGF0aW9uLnNldCBAaG9yKGQubiksIEB2ZXIoZC5mKVxuXG5cdFx0XHRcdHR3by51cGRhdGUoKVxuXG5cdFx0IyBAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHQjIFx0LnggKGQpPT5AaG9yIGQublxuXHRcdCMgXHQueSAoZCk9PkB2ZXIgZC5mXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgNVxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOiAoQG9yaWcsQHBlcm1fdHVybnMsQGRlcyktPlxuXHRcdCNkZXMgaXMgYW4gaW50ZXJzZWN0aW9uXG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCw2MDBcblx0XHRcdGNvbG9yOiBfLnNhbXBsZSBAY29sb3JzXG5cblx0aXNfZGVzdGluYXRpb246IChpKS0+XG5cdFx0aS5pZCA9PSBAZGVzLmlkXG5cblx0Y29sb3JzOiBbJyMwM0E5RjQnLCcjMDNBOUY0JywnIzhCQzM0QScsJyNGRjU3MjInLCcjNjA3RDhCJywnIzNGNTFCNScsJyM0Q0FGNTAnLCcjNjUxRkZGJywnIzFERTlCNiddXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRjb3N0MDogQGNvc3Rcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRleGl0ZWQ6IGZhbHNlXG5cdFx0XHRjZWxsOiB1bmRlZmluZWRcblx0XHRcdHRfZW46IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMiwyKVxuXHRcdFx0dHVybnM6IF8uc2h1ZmZsZSBfLmNsb25lIEBwZXJtX3R1cm5zXG5cblx0c2V0X3h5OiAoQHgsQHksQHgyLEB5MiktPlxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBAY29zdCA8IEBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gKFMucGhhc2UgKyBfLnJhbmRvbSAtNSw1KVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0QHNpZ25hbC5jb3VudCA9IDBcblxuXHRjYW5fZ286IChkaXJlY3Rpb24pLT5cblx0XHRkaXJlY3Rpb24gaW4gQGRpcmVjdGlvbnNbQHNpZ25hbC5kaXJlY3Rpb25dXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAcG9zLEBfcG9zKS0+XG5cdFx0XHRAeCA9IEBwb3MueFxuXHRcdFx0QHkgPSBAcG9zLnlcblx0XHRcdEB4MiA9IE1hdGguZmxvb3IgQF9wb3MueFxuXHRcdFx0QHkyID0gTWF0aC5mbG9vciBAX3Bvcy55XG5cdFx0XHRAbGFzdCA9IC1JbmZpbml0eVxuXHRcdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRzcGFjZTogUy5zcGFjZVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfeHkgQHgsQHksQHgyLEB5MlxuXHRcdEBsYXN0PVMudGltZVxuXHRcdEB0ZW1wX2NhciA9IGNhclxuXG5cdHJlbW92ZTogLT5cblx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBjYXIgPSBAdGVtcF9jYXJcblx0XHRpZiBAY2FyXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QHNldHVwKClcblx0XHRAcm93ID0gTWF0aC5taW4gQGJlZy5yb3csQGVuZC5yb3dcblx0XHRAY29sID0gTWF0aC5taW4gQGJlZy5jb2wsQGVuZC5jb2xcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRpc19mcmVlOiAtPlxuXHRcdEBjZWxsc1swXS5pc19mcmVlKClcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGNlbGxzWzBdLnJlY2VpdmUgY2FyXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbYSxiXVxuXHRcdFx0XG5cdFx0c2NhbGUyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFtAYmVnLnBvcyxAZW5kLnBvc11cblxuXHRcdFtAYSxAYl09W2EsYl1cblxuXHRcdEBjZWxscyA9IFswLi4oUy5sYW5lX2xlbmd0aC0xKV0ubWFwIChuKT0+IFxuXHRcdFx0cG9zID0gc2NhbGUgblxuXHRcdFx0X3BvcyA9IHNjYWxlMiBuXG5cdFx0XHRuZXcgQ2VsbCBwb3MsX3Bvc1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRzaXplOiAxMFxuXHRcdFx0c3RvcHBpbmdfdGltZTogNVxuXHRcdFx0cGFjZTogMlxuXHRcdFx0c3BhY2U6IDRcblx0XHRcdHBoYXNlOiA4MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHRsYW5lX2xlbmd0aDogMTBcblx0XHRcdHdpc2g6IDE1MFxuXHRcdFx0bnVtX2NhcnM6IDIwMDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0ZnJlcXVlbmN5OiAyNVxuXHRcdFx0ZGF5OiAwXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiLCIhXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuIyBTaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGludGVyc2VjdGlvbnM6IFtdXG5cdFx0XHRsYW5lczogW11cblx0XHRcdG91dGVyOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZT1uZXcgTGFuZSBpLGosZGlyKVxuXHRcdFx0XHRcdGlmICgwPGkucm93PChTLnNpemUtMSkpIGFuZCAoMDxpLmNvbDwoUy5zaXplLTEpKVxuXHRcdFx0XHRcdFx0QGlubmVyLnB1c2ggaVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGlmIChpLnJvdz4wKSBvciAoaS5jb2w+MClcblx0XHRcdFx0XHRcdFx0QG91dGVyLnB1c2ggaVxuXHRcdFx0XHRcdFx0XHRpLm91dGVyID0gdHJ1ZVxuXG5cdFx0QGNyZWF0ZV9jYXIoKSBmb3IgaSBpbiBbMC4uLlMubnVtX2NhcnNdXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gKHVkIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSlcblx0XHRscnMgPSAobHIgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldKVxuXHRcdHR1cm5zID0gXy5zaHVmZmxlIF8uZmxhdHRlbihbdWRzLGxyc10pXG5cdFx0Y2FyID0gbmV3IENhciBhLHR1cm5zLGJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2tfbGFuZTogKGxhbmUpLT5cblx0XHRudW1fbW92aW5nID0gMFxuXHRcdGsgPSBsYW5lLmNlbGxzXG5cdFx0aWYgKGNhcj1rW2subGVuZ3RoLTFdLmNhcilcblx0XHRcdGlmIGxhbmUuZW5kLmNhbl9nbyBsYW5lLmRpcmVjdGlvblxuXHRcdFx0XHRpZiBAdHVybl9jYXIgY2FyLCBsYW5lLmVuZFxuXHRcdFx0XHRcdGtbay5sZW5ndGgtMV0ucmVtb3ZlKClcblx0XHRcdFx0XHRudW1fbW92aW5nKytcblxuXHRcdGZvciBjZWxsLGkgaW4ga1swLi4uay5sZW5ndGgtMV1cblx0XHRcdFx0dGFyZ2V0ID0ga1tpKzFdXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKCkgYW5kIChjYXI9Y2VsbC5jYXIpXG5cdFx0XHRcdFx0bnVtX21vdmluZysrXG5cdFx0XHRcdFx0dGFyZ2V0LnJlY2VpdmUgY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdG51bV9tb3ZpbmdcblxuXHR0dXJuX2NhcjogKGNhcixpKS0+XG5cdFx0aWYgY2FyLmRlcy5pZCA9PSBpLmlkXG5cdFx0XHRjYXIuZXhpdGVkID0gdHJ1ZVxuXHRcdFx0Y2FyLnRfZXggPSBTLnRpbWVcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRsYW5lID0gaS5iZWdfbGFuZXNbY2FyLnR1cm5zWzBdXVxuXHRcdFx0aWYgbGFuZS5pc19mcmVlKClcblx0XHRcdFx0bGFuZS5yZWNlaXZlIGNhclxuXHRcdFx0XHRjYXIuZW50ZXJlZD10cnVlXG5cdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdHRydWVcblxuXHR0aWNrOiAtPlxuXHRcdGkudGljaygpIGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0bnVtX21vdmluZyA9IF8uc3VtIChAdGlja19sYW5lIGxhbmUgZm9yIGxhbmUgaW4gQGxhbmVzKVxuXG5cdFx0Zm9yIGNhciBpbiBAd2FpdGluZ1xuXHRcdFx0aWYgY2FyLnRfZW48Uy50aW1lIHRoZW4gQHR1cm5fY2FyIGNhcixjYXIub3JpZ1xuXG5cdFx0Zm9yIGwgaW4gQGxhbmVzXG5cdFx0XHRmb3IgYyBpbiBsLmNlbGxzXG5cdFx0XHRcdGMuZmluYWxpemUoKVxuXG5cdFx0QHdhaXRpbmcgPSBfLmZpbHRlciBAY2FycywoYyktPiAhYy5lbnRlcmVkXG5cdFx0QHRyYXZlbGluZyA9IF8uZmlsdGVyIEBjYXJzLCAoYyktPiBjLmVudGVyZWQgYW5kICFjLmV4aXRlZFxuXG5cdFx0IyBpZiBTLnRpbWUgJVMuZnJlcXVlbmN5ID09MFxuXHRcdCMgXHRAbWVtb3J5LnB1c2ggXG5cdFx0IyBcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHQjIFx0XHR2OiBudW1fbW92aW5nL0B0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0IyBcdFx0ZjogbnVtX21vdmluZ1xuXHRcdCMgXHRcdGlkOiBfLnVuaXF1ZUlkKClcblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBTLm51bV9jYXJzIC0gQHdhaXRpbmcubGVuZ3RoIFxuXHRcdFx0Y3VtRXg6IFMubnVtX2NhcnMgLSBAdHJhdmVsaW5nLmxlbmd0aC1Ad2FpdGluZy5sZW5ndGhcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0ZGF5X2VuZDotPlxuXHRcdGMuZXZhbF9jb3N0KCkgZm9yIGMgaW4gQGNhcnNcblx0XHRjLmNob29zZSgpIGZvciBjIGluIF8uc2FtcGxlIEBjYXJzLCAyNVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSBAY2Fyc1xuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0Zm9yIGludGVyc2VjdGlvbiBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0aW50ZXJzZWN0aW9uLmRheV9zdGFydCgpIFxuXHRcdGZvciBsYW5lIGluIEBsYW5lc1xuXHRcdFx0bGFuZS5kYXlfc3RhcnQoKVxuXHRcdGZvciBjYXIgaW4gQGNhcnNcblx0XHRcdGNhci5kYXlfc3RhcnQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiXX0=
