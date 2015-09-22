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
    return d3.timer((function(_this) {
      return function() {
        if (_this.scope.traffic.done()) {
          _this.day_end();
          return true;
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
  };

  Ctrl.prototype.play = function() {
    this.pause();
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer).directive('twoDer', require('./twoDer')).directive('mfdDer', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis'));



},{"./directives/xAxis":2,"./directives/yAxis":3,"./mfd":4,"./models/settings":8,"./models/traffic":9,"./twoDer":10,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
  function Car(orig, _uds, _rls, des) {
    this.orig = orig;
    this._uds = _uds;
    this._rls = _rls;
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
      uds: _.clone(this._uds),
      rls: _.clone(this._rls)
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
    this.num_cars = 0;
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

  Lane.prototype.count_cars = function() {
    return this.num_cars = d3.sum(this.cells, function(d) {
      return +(d.car != null);
    });
  };

  Lane.prototype.is_free = function() {
    return this.cells[0].is_free();
  };

  Lane.prototype.receive = function(car) {
    return this.cells[0].receive(car);
  };

  Lane.prototype.setup = function() {
    var a, b, ref, scale, scale2;
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
    return this.cells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((function(_this) {
      return function(n) {
        var _pos, pos;
        pos = scale(n * 10 / 20);
        _pos = scale2(n * 10 / 20);
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
      size: 9,
      stopping_time: 5,
      pace: 1,
      space: 4,
      phase: 80,
      green: .5,
      lane_length: 10,
      wish: 150,
      num_cars: 3000,
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
    var dir, i, j, len, len1, m, n, o, p, ref, ref1, ref2, ref3, ref4, ref5, results;
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
          this.lanes.push(new Lane(i, j, dir));
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

  Traffic.prototype.choose_intersection = function() {
    var a, b;
    a = _.sample(this.intersections);
    b = _.sample(this.intersections);
    if (a.id === b.id) {
      return this.choose_intersection();
    } else {
      return {
        a: a,
        b: b
      };
    }
  };

  Traffic.prototype.create_car = function() {
    var a, b, car, i, lr, lrs, ref, ud, uds;
    ref = this.choose_intersection(), a = ref.a, b = ref.b;
    ud = b.row < a.row ? 'up' : 'down';
    lr = b.col < a.col ? 'left' : 'right';
    uds = (function() {
      var m, ref1, results;
      results = [];
      for (i = m = 0, ref1 = Math.abs(b.row - a.row); 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        results.push(ud);
      }
      return results;
    })();
    lrs = (function() {
      var m, ref1, results;
      results = [];
      for (i = m = 0, ref1 = Math.abs(b.col - a.col); 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        results.push(lr);
      }
      return results;
    })();
    car = new Car(a, uds, lrs, b);
    return this.cars.push(car);
  };

  Traffic.prototype.tick_lane = function(lane) {
    var car, cell, i, k, len, m, num_moving, ref, target;
    lane.count_cars();
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

  Traffic.prototype.turn_car = function(c, i) {
    var arr_chosen, l1, l2, lane_chosen, rls, uds;
    if (c.des.id === i.id) {
      c.exited = true;
      c.t_ex = S.time;
      return true;
    } else {
      uds = c.uds, rls = c.rls;
      l1 = i.beg_lanes[uds[0]];
      l2 = i.beg_lanes[rls[0]];
      if ((l1 != null ? l1.is_free() : void 0) && (l2 != null ? l2.is_free() : void 0)) {
        if (l1.num_cars < l2.num_cars) {
          lane_chosen = l1;
          arr_chosen = uds;
        } else {
          lane_chosen = l2;
          arr_chosen = rls;
        }
      } else if (l1 != null ? l1.is_free() : void 0) {
        lane_chosen = l1;
        arr_chosen = uds;
      } else if (l2 != null ? l2.is_free() : void 0) {
        lane_chosen = l2;
        arr_chosen = rls;
      }
      if (lane_chosen) {
        lane_chosen.receive(c);
        c.entered = true;
        arr_chosen.shift();
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
    this.traveling = _.filter(this.cars, function(c) {
      return c.entered && !c.exited;
    });
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
    var c, len, len1, m, n, ref, ref1, results;
    ref = this.cars;
    for (m = 0, len = ref.length; m < len; m++) {
      c = ref[m];
      c.eval_cost();
    }
    ref1 = _.sample(this.cars, 25);
    results = [];
    for (n = 0, len1 = ref1.length; n < len1; n++) {
      c = ref1[n];
      results.push(c.choose());
    }
    return results;
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



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"lodash":undefined}],10:[function(require,module,exports){
var S, twoDer;

S = require('./models/settings');

twoDer = function() {
  var directive;
  return directive = {
    scope: {
      cars: '='
    },
    link: function(scope, el, attr) {
      var data, map, params, two, twos;
      params = {
        width: 700,
        height: 700,
        type: Two.Types.webgl
      };
      two = new Two(params).appendTo(el[0]);
      data = [];
      map = {};
      twos = {};
      return scope.$watch(function() {
        return S.time;
      }, function() {
        var d, enter, i, id, len, newD, new_map, t;
        newD = scope.cars;
        new_map = {};
        enter = {};
        for (i = 0, len = newD.length; i < len; i++) {
          d = newD[i];
          new_map[d.id] = d;
          if (!map[d.id]) {
            map[d.id] = d;
            enter[d.id] = d;
            if (!(t = twos[d.id])) {
              t = twos[d.id] = two.makeRectangle(-1.5, -1.5, 3, 3);
              t.fill = d.color;
              t.stroke = 'white';
              t.linewidth = .7;
            }
          }
        }
        for (id in map) {
          d = map[id];
          if (!new_map[d.id]) {
            map[id] = false;
            two.remove(twos[id]);
          } else {
            if (!enter[id]) {
              two.add(twos[id]);
            }
            twos[id].translation.set(d.x * 7, d.y * 7);
          }
        }
        return two.update();
      });
    }
  };
};

module.exports = twoDer;



},{"./models/settings":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC90d29EZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLG1CQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0FBRUo7RUFDTyxjQUFDLE1BQUQsRUFBUSxHQUFSO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFBTyxJQUFDLENBQUEsS0FBRDtJQUNuQixJQUFDLENBQUEsTUFBRCxH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LEdBQUcsQ0FBQyxhQUFKLENBQWtCLENBQUMsR0FBbkIsRUFBdUIsQ0FBQyxHQUF4QixFQUE0QixDQUE1QixFQUE4QixDQUE5QjtjQUNmLENBQUMsQ0FBQyxJQUFGLEdBQVMsQ0FBQyxDQUFDO2NBQ1gsQ0FBQyxDQUFDLE1BQUYsR0FBVztjQUNYLENBQUMsQ0FBQyxTQUFGLEdBQVksR0FKYjthQUhEOztBQUZEO0FBV0EsYUFBQSxTQUFBOztVQUNDLElBQUcsQ0FBQyxPQUFRLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBWjtZQUNDLEdBQUksQ0FBQSxFQUFBLENBQUosR0FBVTtZQUNWLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBSyxDQUFBLEVBQUEsQ0FBaEIsRUFGRDtXQUFBLE1BQUE7WUFJQyxJQUFHLENBQUMsS0FBTSxDQUFBLEVBQUEsQ0FBVjtjQUNDLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBSyxDQUFBLEVBQUEsQ0FBYixFQUREOztZQUVBLElBQUssQ0FBQSxFQUFBLENBQUcsQ0FBQyxXQUFXLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUE3QixFQUFnQyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQXBDLEVBTkQ7O0FBREQ7ZUFTQSxHQUFHLENBQUMsTUFBSixDQUFBO01BeEJDLENBRkg7SUFSSyxDQUZOOztBQUZPOztBQXdDVCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblx0XHRAZGF5X3N0YXJ0KClcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAc2NvcGUudHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0QHBoeXNpY3MgPSB0cnVlICNwaHlzaWNzIHN0YWdlIGhhcHBlbmluZ1xuXHRcdEBzY29wZS50cmFmZmljLmRheV9zdGFydCgpXG5cdFx0QHRpY2soKVxuXG5cdGRheV9lbmQ6IC0+XG5cdFx0QHBoeXNpY3MgPSBmYWxzZSAjcGh5c2ljcyBzdGFnZSBub3QgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X2VuZCgpXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0KClcblxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0LmRpcmVjdGl2ZSAndHdvRGVyJyxyZXF1aXJlICcuL3R3b0Rlcidcblx0LmRpcmVjdGl2ZSAnbWZkRGVyJyxyZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuXG5cblxuIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0cGFyYW1zID0gXG5cdFx0XHR3aWR0aDogQHdpZHRoXG5cdFx0XHRoZWlnaHQ6IEBoZWlnaHRcblx0XHRcdHR5cGU6IFR3by5UeXBlcy53ZWJnbFxuXG5cdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHQuYXBwZW5kIFwiZGl2XCJcblx0XHRcdC5zdHlsZVxuXHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJ1xuXHRcdFx0XHRsZWZ0OiBAbS5sXG5cdFx0XHRcdHRvcDogQG0udFxuXG5cdFx0dHdvID0gbmV3IFR3byBwYXJhbXNcblx0XHRcdC5hcHBlbmRUbyBzZWwubm9kZSgpXG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi4yXVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0ZGF0YSA9IFtdXG5cdFx0bWFwID0ge31cblx0XHR0d29zID0ge31cblxuXHRcdEBzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFx0Uy50aW1lXG5cdFx0XHQsIChuZXdEKT0+XG5cdFx0XHRcdG5ld0QgPSBAbWVtb3J5XG5cdFx0XHRcdG5ld19tYXAgPSB7fVxuXHRcdFx0XHRmb3IgZCxpIGluIG5ld0Rcblx0XHRcdFx0XHRuZXdfbWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdGlmICFtYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRhdGEucHVzaCBkXG5cdFx0XHRcdFx0XHRtYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHR0ID0gdHdvc1tkLmlkXSA9IHR3by5tYWtlQ2lyY2xlIDAsMCw0XG5cdFx0XHRcdFx0XHR0LmZpbGwgPSAnIzAzQTlGNCdcblx0XHRcdFx0XHRcdHQuc3Ryb2tlID0gJ3doaXRlJ1xuXG5cdFx0XHRcdGZvciBkLGkgaW4gZGF0YVxuXHRcdFx0XHRcdGlmICFuZXdfbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRkZWxldGUgbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRkZWxldGUgKHQgPSB0d29zW2QuaWRdKVxuXHRcdFx0XHRcdFx0dHdvLnJlbW92ZSB0XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0dCA9IHR3b3NbZC5pZF1cblx0XHRcdFx0XHRcdHQub3BhY2l0eSA9IChpL25ld0QubGVuZ3RoKVxuXHRcdFx0XHRcdFx0dC50cmFuc2xhdGlvbi5zZXQgQGhvcihkLm4pLCBAdmVyKGQuZilcblxuXHRcdFx0XHR0d28udXBkYXRlKClcblxuXHRcdCMgQGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0IyBcdC54IChkKT0+QGhvciBkLm5cblx0XHQjIFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDVcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEBvcmlnLEBfdWRzLEBfcmxzLEBkZXMpLT5cblx0XHQjZGVzIGlzIGFuIGludGVyc2VjdGlvblxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDQsNjAwXG5cdFx0XHRjb2xvcjogXy5zYW1wbGUgQGNvbG9yc1xuXG5cdGlzX2Rlc3RpbmF0aW9uOiAoaSktPlxuXHRcdGkuaWQgPT0gQGRlcy5pZFxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzAzQTlGNCcsJyM4QkMzNEEnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnLCcjNENBRjUwJywnIzY1MUZGRicsJyMxREU5QjYnXVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0Y29zdDA6IEBjb3N0XG5cdFx0XHRlbnRlcmVkOiBmYWxzZVxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXHRcdFx0Y2VsbDogdW5kZWZpbmVkXG5cdFx0XHR0X2VuOiBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblx0XHRcdHVkczogXy5jbG9uZSBAX3Vkc1xuXHRcdFx0cmxzOiBfLmNsb25lIEBfcmxzXG5cblx0c2V0X3h5OiAoQHgsQHksQHgyLEB5MiktPlxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBAY29zdCA8IEBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gKFMucGhhc2UgKyBfLnJhbmRvbSAtNSw1KVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0QHNpZ25hbC5jb3VudCA9IDBcblxuXHRjYW5fZ286IChkaXJlY3Rpb24pLT5cblx0XHRkaXJlY3Rpb24gaW4gQGRpcmVjdGlvbnNbQHNpZ25hbC5kaXJlY3Rpb25dXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAcG9zLEBfcG9zKS0+XG5cdFx0XHRAeCA9IEBwb3MueFxuXHRcdFx0QHkgPSBAcG9zLnlcblx0XHRcdEB4MiA9IE1hdGguZmxvb3IgQF9wb3MueFxuXHRcdFx0QHkyID0gTWF0aC5mbG9vciBAX3Bvcy55XG5cdFx0XHRAbGFzdCA9IC1JbmZpbml0eVxuXHRcdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRzcGFjZTogUy5zcGFjZVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfeHkgQHgsQHksQHgyLEB5MlxuXHRcdEBsYXN0PVMudGltZVxuXHRcdEB0ZW1wX2NhciA9IGNhclxuXG5cdHJlbW92ZTogLT5cblx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBjYXIgPSBAdGVtcF9jYXJcblx0XHRpZiBAY2FyXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QHNldHVwKClcblx0XHRAcm93ID0gTWF0aC5taW4gQGJlZy5yb3csQGVuZC5yb3dcblx0XHRAY29sID0gTWF0aC5taW4gQGJlZy5jb2wsQGVuZC5jb2xcblx0XHRAbnVtX2NhcnMgPSAwXG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Zm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0XHRjZWxsLmNhciA9IGNlbGwudGVtcF9jYXIgPSBmYWxzZVxuXHRcdFx0Y2VsbC5sYXN0ID0gLUluZmluaXR5XG5cblx0Y291bnRfY2FyczotPlxuXHRcdEBudW1fY2FycyA9IGQzLnN1bSBAY2VsbHMsIChkKS0+ICsoZC5jYXI/KVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0QGNlbGxzWzBdLmlzX2ZyZWUoKVxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY2VsbHNbMF0ucmVjZWl2ZSBjYXJcblxuXHRzZXR1cDogLT5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnlcblxuXHRcdHN3aXRjaCBAZGlyZWN0aW9uXG5cdFx0XHR3aGVuICd1cCdcblx0XHRcdFx0YS54Kytcblx0XHRcdFx0Yi54Kytcblx0XHRcdFx0YS55LT0yXG5cdFx0XHRcdGIueSs9MlxuXHRcdFx0d2hlbiAncmlnaHQnXG5cdFx0XHRcdGEueCs9MlxuXHRcdFx0XHRiLngtPTJcblx0XHRcdFx0YS55Kytcblx0XHRcdFx0Yi55Kytcblx0XHRcdHdoZW4gJ2Rvd24nXG5cdFx0XHRcdGEueC0tXG5cdFx0XHRcdGIueC0tXG5cdFx0XHRcdGEueSs9MlxuXHRcdFx0XHRiLnktPTJcblx0XHRcdHdoZW4gJ2xlZnQnXG5cdFx0XHRcdGEueC09MlxuXHRcdFx0XHRiLngrPTJcblx0XHRcdFx0YS55LS1cblx0XHRcdFx0Yi55LS1cblxuXHRcdHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cdFx0XHRcblx0XHRzY2FsZTIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0W0BhLEBiXT1bYSxiXVxuXG5cdFx0QGNlbGxzID0gWzAuLi4yMF0ubWFwIChuKT0+IFxuXHRcdFx0cG9zID0gc2NhbGUgbioxMC8yMFxuXHRcdFx0X3BvcyA9IHNjYWxlMiBuKjEwLzIwXG5cdFx0XHRuZXcgQ2VsbCBwb3MsX3Bvc1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRzaXplOiA5XG5cdFx0XHRzdG9wcGluZ190aW1lOiA1XG5cdFx0XHRwYWNlOiAxXG5cdFx0XHRzcGFjZTogNFxuXHRcdFx0cGhhc2U6IDgwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdGxhbmVfbGVuZ3RoOiAxMFxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fY2FyczogMzAwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRmcmVxdWVuY3k6IDI1XG5cdFx0XHRkYXk6IDBcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSIsIiFfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG4jIFNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aW50ZXJzZWN0aW9uczogW11cblx0XHRcdGxhbmVzOiBbXVxuXHRcdFx0b3V0ZXI6IFtdXG5cdFx0XHRpbm5lcjogW11cblx0XHRcdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblx0XHRcdGNhcnM6IFtdXG5cblx0XHRAZ3JpZCA9IFswLi4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aW50ZXJzZWN0aW9uXG5cblx0XHRmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0Zm9yIGRpciBpbiBAZGlyZWN0aW9uc1xuXHRcdFx0XHRqID0gc3dpdGNoIGRpclxuXHRcdFx0XHRcdHdoZW4gJ3VwJyB0aGVuIEBncmlkW2kucm93LTFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wrMV1cblx0XHRcdFx0XHR3aGVuICdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbC0xXVxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIG5ldyBMYW5lIGksaixkaXJcblx0XHRcdFx0XHRpZiAoMDxpLnJvdzwoUy5zaXplLTEpKSBhbmQgKDA8aS5jb2w8KFMuc2l6ZS0xKSlcblx0XHRcdFx0XHRcdEBpbm5lci5wdXNoIGlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiAoaS5yb3c+MCkgb3IgKGkuY29sPjApXG5cdFx0XHRcdFx0XHRcdEBvdXRlci5wdXNoIGlcblx0XHRcdFx0XHRcdFx0aS5vdXRlciA9IHRydWVcblxuXHRcdEBjcmVhdGVfY2FyKCkgZm9yIGkgaW4gWzAuLi5TLm51bV9jYXJzXVxuXG5cdGNob29zZV9pbnRlcnNlY3Rpb246IC0+XG5cdFx0YSA9IF8uc2FtcGxlIEBpbnRlcnNlY3Rpb25zXG5cdFx0YiA9IF8uc2FtcGxlIEBpbnRlcnNlY3Rpb25zXG5cdFx0aWYgYS5pZD09Yi5pZCB0aGVuIEBjaG9vc2VfaW50ZXJzZWN0aW9uKCkgZWxzZSB7YTogYSwgYjogYn1cblxuXHRjcmVhdGVfY2FyOiAtPlxuXHRcdHthLGJ9ID0gQGNob29zZV9pbnRlcnNlY3Rpb24oKVxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gKHVkIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSlcblx0XHRscnMgPSAobHIgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldKVxuXHRcdGNhciA9IG5ldyBDYXIgYSx1ZHMsbHJzLGJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2tfbGFuZTogKGxhbmUpLT5cblx0XHRsYW5lLmNvdW50X2NhcnMoKVxuXHRcdG51bV9tb3ZpbmcgPSAwXG5cdFx0ayA9IGxhbmUuY2VsbHNcblx0XHRpZiAoY2FyPWtbay5sZW5ndGgtMV0uY2FyKVxuXHRcdFx0aWYgbGFuZS5lbmQuY2FuX2dvIGxhbmUuZGlyZWN0aW9uXG5cdFx0XHRcdGlmIEB0dXJuX2NhciBjYXIsIGxhbmUuZW5kXG5cdFx0XHRcdFx0a1trLmxlbmd0aC0xXS5yZW1vdmUoKVxuXHRcdFx0XHRcdG51bV9tb3ZpbmcrK1xuXG5cdFx0Zm9yIGNlbGwsaSBpbiBrWzAuLi5rLmxlbmd0aC0xXVxuXHRcdFx0XHR0YXJnZXQgPSBrW2krMV1cblx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKSBhbmQgKGNhcj1jZWxsLmNhcilcblx0XHRcdFx0XHRudW1fbW92aW5nKytcblx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0bnVtX21vdmluZ1xuXG5cdHR1cm5fY2FyOiAoYyxpKS0+XG5cdFx0aWYgYy5kZXMuaWQgPT0gaS5pZFxuXHRcdFx0Yy5leGl0ZWQgPSB0cnVlXG5cdFx0XHRjLnRfZXggPSBTLnRpbWVcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHR7dWRzLHJsc30gPSBjXG5cdFx0XHRsMSA9IGkuYmVnX2xhbmVzW3Vkc1swXV1cblx0XHRcdGwyID0gaS5iZWdfbGFuZXNbcmxzWzBdXVxuXHRcdFx0aWYgbDE/LmlzX2ZyZWUoKSBhbmQgbDI/LmlzX2ZyZWUoKVxuXHRcdFx0XHRpZiBsMS5udW1fY2FycyA8IGwyLm51bV9jYXJzXG5cdFx0XHRcdFx0bGFuZV9jaG9zZW4gPSBsMVxuXHRcdFx0XHRcdGFycl9jaG9zZW4gPSB1ZHNcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGxhbmVfY2hvc2VuID0gbDJcblx0XHRcdFx0XHRhcnJfY2hvc2VuID0gcmxzXG5cdFx0XHRlbHNlIGlmIGwxPy5pc19mcmVlKClcblx0XHRcdFx0bGFuZV9jaG9zZW4gPSBsMVxuXHRcdFx0XHRhcnJfY2hvc2VuID0gdWRzXG5cdFx0XHRlbHNlIGlmIGwyPy5pc19mcmVlKClcblx0XHRcdFx0bGFuZV9jaG9zZW4gPSBsMlxuXHRcdFx0XHRhcnJfY2hvc2VuID0gcmxzXG5cdFx0XHRpZiBsYW5lX2Nob3NlblxuXHRcdFx0XHRsYW5lX2Nob3Nlbi5yZWNlaXZlIGNcblx0XHRcdFx0Yy5lbnRlcmVkID0gdHJ1ZVxuXHRcdFx0XHRhcnJfY2hvc2VuLnNoaWZ0KClcblx0XHRcdFx0dHJ1ZVxuXG5cdHRpY2s6IC0+XG5cdFx0aS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRudW1fbW92aW5nID0gXy5zdW0gKEB0aWNrX2xhbmUgbGFuZSBmb3IgbGFuZSBpbiBAbGFuZXMpXG5cblx0XHRmb3IgY2FyIGluIEB3YWl0aW5nXG5cdFx0XHRpZiBjYXIudF9lbjxTLnRpbWUgdGhlbiBAdHVybl9jYXIgY2FyLGNhci5vcmlnXG5cblx0XHRmb3IgbCBpbiBAbGFuZXNcblx0XHRcdGZvciBjIGluIGwuY2VsbHNcblx0XHRcdFx0Yy5maW5hbGl6ZSgpXG5cblx0XHRAd2FpdGluZyA9IF8uZmlsdGVyIEBjYXJzLChjKS0+ICFjLmVudGVyZWRcblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQGNhcnMsIChjKS0+IGMuZW50ZXJlZCBhbmQgIWMuZXhpdGVkXG5cblx0XHRpZiBTLnRpbWUgJVMuZnJlcXVlbmN5ID09MFxuXHRcdFx0QG1lbW9yeS5wdXNoIFxuXHRcdFx0XHRuOiBAdHJhdmVsaW5nLmxlbmd0aFxuXHRcdFx0XHR2OiBudW1fbW92aW5nL0B0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHRcdGY6IG51bV9tb3Zpbmdcblx0XHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXG5cdGxvZzogLT5cblx0XHRAY3VtLnB1c2hcblx0XHRcdHRpbWU6IFMudGltZVxuXHRcdFx0Y3VtRW46IFMubnVtX2NhcnMgLSBAd2FpdGluZy5sZW5ndGggXG5cdFx0XHRjdW1FeDogUy5udW1fY2FycyAtIEB0cmF2ZWxpbmcubGVuZ3RoLUB3YWl0aW5nLmxlbmd0aFxuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHRkYXlfZW5kOi0+XG5cdFx0Yy5ldmFsX2Nvc3QoKSBmb3IgYyBpbiBAY2Fyc1xuXHRcdGMuY2hvb3NlKCkgZm9yIGMgaW4gXy5zYW1wbGUgQGNhcnMsIDI1XG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSBAY2Fyc1xuXHRcdGZvciBpbnRlcnNlY3Rpb24gaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGludGVyc2VjdGlvbi5kYXlfc3RhcnQoKSBcblx0XHRmb3IgbGFuZSBpbiBAbGFuZXNcblx0XHRcdGxhbmUuZGF5X3N0YXJ0KClcblx0XHRmb3IgY2FyIGluIEBjYXJzXG5cdFx0XHRjYXIuZGF5X3N0YXJ0KClcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljIiwiUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xudHdvRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y2FyczogJz0nXG5cdFx0bGluazogKHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHBhcmFtcyA9IHsgd2lkdGg6IDcwMCwgaGVpZ2h0OiA3MDAsIHR5cGU6IFR3by5UeXBlcy53ZWJnbCB9XG5cdFx0XHR0d28gPSBuZXcgVHdvKHBhcmFtcykuYXBwZW5kVG8gZWxbMF1cblxuXHRcdFx0ZGF0YSA9IFtdXG5cdFx0XHRtYXAgPSB7fVxuXHRcdFx0dHdvcyA9IHt9XG5cblx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRcdFMudGltZVxuXHRcdFx0XHQsIC0+XG5cdFx0XHRcdFx0bmV3RCA9IHNjb3BlLmNhcnNcblx0XHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0XHRlbnRlciA9IHt9XG5cdFx0XHRcdFx0Zm9yIGQgaW4gbmV3RFxuXHRcdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdGlmICFtYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0XHRlbnRlcltkLmlkXSA9IGRcblx0XHRcdFx0XHRcdFx0aWYgISh0PSB0d29zW2QuaWRdKVxuXHRcdFx0XHRcdFx0XHRcdHQ9dHdvc1tkLmlkXSA9IHR3by5tYWtlUmVjdGFuZ2xlIC0xLjUsLTEuNSwzLDNcblx0XHRcdFx0XHRcdFx0XHR0LmZpbGwgPSBkLmNvbG9yXG5cdFx0XHRcdFx0XHRcdFx0dC5zdHJva2UgPSAnd2hpdGUnXG5cdFx0XHRcdFx0XHRcdFx0dC5saW5ld2lkdGg9LjdcblxuXHRcdFx0XHRcdGZvciBpZCxkIG9mIG1hcFxuXHRcdFx0XHRcdFx0aWYgIW5ld19tYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0bWFwW2lkXSA9IGZhbHNlXG5cdFx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdHdvc1tpZF1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0aWYgIWVudGVyW2lkXVxuXHRcdFx0XHRcdFx0XHRcdHR3by5hZGQgdHdvc1tpZF1cblx0XHRcdFx0XHRcdFx0dHdvc1tpZF0udHJhbnNsYXRpb24uc2V0IGQueCo3LCBkLnkqN1xuXG5cdFx0XHRcdFx0dHdvLnVwZGF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gdHdvRGVyIl19
