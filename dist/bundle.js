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
        return _this.paused;
      };
    })(this));
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
      return S.time % 10 === 0;
    }, (function(_this) {
      return function() {
        var d, i, j, k, len, len1, newD, new_map, t;
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
var Car, S, _, count;

_ = require('lodash');

S = require('./settings');

count = 0;

Car = (function() {
  function Car(orig, _uds, _rls, des) {
    this.orig = orig;
    this._uds = _uds;
    this._rls = _rls;
    this.des = des;
    _.assign(this, {
      id: count,
      cost0: Infinity,
      target: _.random(4, 400),
      color: _.sample(this.colors)
    });
    count++;
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
    var a, b, i, ref, results, scale, scale2;
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
      for (i = 0; i < 30; i++){ results.push(i); }
      return results;
    }).apply(this).map((function(_this) {
      return function(n) {
        var _pos, pos;
        pos = scale(n * 10 / 30);
        _pos = scale2(n * 10 / 30);
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
      size: 8,
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
    var dir, i, j, len, len1, m, n, o, p, ref, ref1, ref2, ref3, results;
    _.assign(this, {
      intersections: [],
      lanes: [],
      directions: ['up', 'right', 'down', 'left'],
      cars: [],
      inner: [],
      outer: []
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
          var i;
          _this.intersections.push((i = new Intersection(row, col)));
          if (((0 < row && row < (S.size - 1))) && ((0 < col && col < (S.size - 1)))) {
            _this.inner.push(i);
          } else {
            _this.outer.push(i);
          }
          return i;
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
        }
      }
    }
    for (i = p = 0, ref3 = S.num_cars; 0 <= ref3 ? p < ref3 : p > ref3; i = 0 <= ref3 ? ++p : --p) {
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
    var a, b, car, i, lr, lrs, ud, uds;
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
        return S.time % 3 === 0;
      }, function() {
        var d, enter, i, id, j, len, len1, newD, new_map, ref, t;
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
        ref = _.keys(map);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          id = ref[j];
          if (!new_map[id]) {
            map[id] = false;
            two.remove(twos[id]);
          } else {
            if (!enter[id]) {
              two.add(twos[id]);
            }
            d = map[id];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC90d29EZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLG1CQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0FBSUo7RUFDTyxjQUFDLE1BQUQsRUFBUSxHQUFSO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFBTyxJQUFDLENBQUEsS0FBRDtJQUNuQixJQUFDLENBQUEsTUFBRCxH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QTtBQUFBLGFBQUEsdUNBQUE7O1VBQ0MsSUFBRyxDQUFDLE9BQVEsQ0FBQSxFQUFBLENBQVo7WUFDQyxHQUFJLENBQUEsRUFBQSxDQUFKLEdBQVU7WUFDVixHQUFHLENBQUMsTUFBSixDQUFXLElBQUssQ0FBQSxFQUFBLENBQWhCLEVBRkQ7V0FBQSxNQUFBO1lBSUMsSUFBRyxDQUFDLEtBQU0sQ0FBQSxFQUFBLENBQVY7Y0FDQyxHQUFHLENBQUMsR0FBSixDQUFRLElBQUssQ0FBQSxFQUFBLENBQWIsRUFERDs7WUFFQSxDQUFBLEdBQUksR0FBSSxDQUFBLEVBQUE7WUFDUixJQUFLLENBQUEsRUFBQSxDQUFHLENBQUMsV0FBVyxDQUFDLEdBQXJCLENBQXlCLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBN0IsRUFBZ0MsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFwQyxFQVBEOztBQUREO2VBVUEsR0FBRyxDQUFDLE1BQUosQ0FBQTtNQXhCQyxDQUZIO0lBUkssQ0FGTjs7QUFGTzs7QUF3Q1QsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5cblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEBzY29wZS50cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdEBzY29wZS50cmFmZmljLnRpY2soKVxuXHRcdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0XHRAcGF1c2VkXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxuc2lnbmFsRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGlyZWN0aW9uOic9J1xuXHRcdGxpbms6KHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHNpZ25hbHMgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdEFsbCAnc2lnbmFscydcblx0XHRcdFx0LmRhdGEgWyd1cF9kb3duJywnbGVmdF9yaWdodCcsJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0J11cblx0XHRcdFx0LmVudGVyKClcblx0XHRcdFx0LmFwcGVuZCAncmVjdCdcblx0XHRcdFx0LmF0dHJcblx0XHRcdFx0XHR3aWR0aDogMS4yXG5cdFx0XHRcdFx0aGVpZ2h0OiAuNlxuXHRcdFx0XHRcdGNsYXNzOiAnc2lnbmFsJ1xuXHRcdFx0XHRcdHk6IC0xLjJcblx0XHRcdFx0XHR4Oi0uNlxuXHRcdFx0XHRcdHRyYW5zZm9ybTogKGQsaSktPlxuXHRcdFx0XHRcdFx0XCJyb3RhdGUoI3s5MCppfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2RpcmVjdGlvbicsKG5ld1ZhbCktPlxuXHRcdFx0XHRzaWduYWxzXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICd0d29EZXInLHJlcXVpcmUgJy4vdHdvRGVyJ1xuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5kaXJlY3RpdmUgJ2NhbkRlcicsIGNhbkRlclxuXG5cblxuXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRwYXJhbXMgPSBcblx0XHRcdHdpZHRoOiBAd2lkdGhcblx0XHRcdGhlaWdodDogQGhlaWdodFxuXHRcdFx0dHlwZTogVHdvLlR5cGVzLndlYmdsXG5cblx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdC5hcHBlbmQgXCJkaXZcIlxuXHRcdFx0LnN0eWxlXG5cdFx0XHRcdHBvc2l0aW9uOiAnYWJzb2x1dGUnXG5cdFx0XHRcdGxlZnQ6IEBtLmxcblx0XHRcdFx0dG9wOiBAbS50XG5cblx0XHR0d28gPSBuZXcgVHdvIHBhcmFtc1xuXHRcdFx0LmFwcGVuZFRvIHNlbC5ub2RlKClcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMubnVtX2NhcnNdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnMqLjJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRkYXRhID0gW11cblx0XHRtYXAgPSB7fVxuXHRcdHR3b3MgPSB7fVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRTLnRpbWUlMTA9PTBcblx0XHRcdCwgPT5cblx0XHRcdFx0bmV3RCA9IEBtZW1vcnlcblx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdGZvciBkLGkgaW4gbmV3RFxuXHRcdFx0XHRcdG5ld19tYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0aWYgIW1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGF0YS5wdXNoIGRcblx0XHRcdFx0XHRcdG1hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdID0gdHdvLm1ha2VDaXJjbGUgMCwwLDRcblx0XHRcdFx0XHRcdHQuZmlsbCA9ICcjMDNBOUY0J1xuXHRcdFx0XHRcdFx0dC5zdHJva2UgPSAnd2hpdGUnXG5cblx0XHRcdFx0Zm9yIGQsaSBpbiBkYXRhXG5cdFx0XHRcdFx0aWYgIW5ld19tYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSBtYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSAodCA9IHR3b3NbZC5pZF0pXG5cdFx0XHRcdFx0XHR0d28ucmVtb3ZlIHRcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR0ID0gdHdvc1tkLmlkXVxuXHRcdFx0XHRcdFx0dC5vcGFjaXR5ID0gKGkvbmV3RC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR0LnRyYW5zbGF0aW9uLnNldCBAaG9yKGQubiksIEB2ZXIoZC5mKVxuXG5cdFx0XHRcdHR3by51cGRhdGUoKVxuXG5cdFx0IyBAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHQjIFx0LnggKGQpPT5AaG9yIGQublxuXHRcdCMgXHQueSAoZCk9PkB2ZXIgZC5mXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgNVxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNvdW50ID0gMFxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAb3JpZyxAX3VkcyxAX3JscyxAZGVzKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBjb3VudFxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LDQwMFxuXHRcdFx0Y29sb3I6IF8uc2FtcGxlIEBjb2xvcnNcblx0XHRjb3VudCsrXG5cblx0aXNfZGVzdGluYXRpb246IChpKS0+XG5cdFx0aS5pZCA9PSBAZGVzLmlkXG5cblx0Y29sb3JzOiBbJyMwM0E5RjQnLCcjMDNBOUY0JywnIzhCQzM0QScsJyNGRjU3MjInLCcjNjA3RDhCJywnIzNGNTFCNScsJyM0Q0FGNTAnLCcjNjUxRkZGJywnIzFERTlCNiddXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRjb3N0MDogQGNvc3Rcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRleGl0ZWQ6IGZhbHNlXG5cdFx0XHRjZWxsOiB1bmRlZmluZWRcblx0XHRcdHRfZW46IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMiwyKVxuXHRcdFx0dWRzOiBfLmNsb25lIEBfdWRzXG5cdFx0XHRybHM6IF8uY2xvbmUgQF9ybHNcblxuXHRzZXRfeHk6IChAeCxAeSxAeDIsQHkyKS0+XG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSBTLnBoYXNlXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRAc2lnbmFsLmNvdW50ID0gMFxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXHRcdEBudW1fY2FycyA9IDBcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRjb3VudF9jYXJzOi0+XG5cdFx0QG51bV9jYXJzID0gZDMuc3VtIEBjZWxscywgKGQpLT4gKyhkLmNhcj8pXG5cblx0aXNfZnJlZTogLT5cblx0XHRAY2VsbHNbMF0uaXNfZnJlZSgpXG5cblx0cmVjZWl2ZTogKGNhciktPlxuXHRcdEBjZWxsc1swXS5yZWNlaXZlIGNhclxuXG5cdHNldHVwOiAtPlxuXHRcdGEgPSBcblx0XHRcdHg6IEBiZWcucG9zLnhcblx0XHRcdHk6IEBiZWcucG9zLnlcblxuXHRcdGIgPSBcblx0XHRcdHg6IEBlbmQucG9zLnggIFxuXHRcdFx0eTogQGVuZC5wb3MueVxuXG5cdFx0c3dpdGNoIEBkaXJlY3Rpb25cblx0XHRcdHdoZW4gJ3VwJ1xuXHRcdFx0XHRhLngrK1xuXHRcdFx0XHRiLngrK1xuXHRcdFx0XHRhLnktPTJcblx0XHRcdFx0Yi55Kz0yXG5cdFx0XHR3aGVuICdyaWdodCdcblx0XHRcdFx0YS54Kz0yXG5cdFx0XHRcdGIueC09MlxuXHRcdFx0XHRhLnkrK1xuXHRcdFx0XHRiLnkrK1xuXHRcdFx0d2hlbiAnZG93bidcblx0XHRcdFx0YS54LS1cblx0XHRcdFx0Yi54LS1cblx0XHRcdFx0YS55Kz0yXG5cdFx0XHRcdGIueS09MlxuXHRcdFx0d2hlbiAnbGVmdCdcblx0XHRcdFx0YS54LT0yXG5cdFx0XHRcdGIueCs9MlxuXHRcdFx0XHRhLnktLVxuXHRcdFx0XHRiLnktLVxuXG5cdFx0c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblx0XHRcdFxuXHRcdHNjYWxlMiA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbQGJlZy5wb3MsQGVuZC5wb3NdXG5cblx0XHRbQGEsQGJdPVthLGJdXG5cblx0XHRAY2VsbHMgPSBbMC4uLjMwXS5tYXAgKG4pPT4gXG5cdFx0XHRwb3MgPSBzY2FsZSBuKjEwLzMwXG5cdFx0XHRfcG9zID0gc2NhbGUyIG4qMTAvMzBcblx0XHRcdG5ldyBDZWxsIHBvcyxfcG9zXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHNpemU6IDhcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDVcblx0XHRcdHBhY2U6IDFcblx0XHRcdHNwYWNlOiA0XG5cdFx0XHRwaGFzZTogODBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0bGFuZV9sZW5ndGg6IDEwXG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9jYXJzOiAzMDAwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdGZyZXF1ZW5jeTogMjVcblx0XHRcdGRheTogMFxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIiwiIV8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkxhbmUgPSByZXF1aXJlICcuL2xhbmUnXG5JbnRlcnNlY3Rpb24gPSByZXF1aXJlICcuL2ludGVyc2VjdGlvbidcbiMgU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpbnRlcnNlY3Rpb25zOiBbXVxuXHRcdFx0bGFuZXM6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRvdXRlcjogW11cblxuXHRcdEBncmlkID0gWzAuLi5TLnNpemVdLm1hcCAocm93KT0+XG5cdFx0XHRbMC4uLlMuc2l6ZV0ubWFwIChjb2wpPT5cblxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpZiAoMDxyb3c8KFMuc2l6ZS0xKSkgYW5kICgwPGNvbDwoUy5zaXplLTEpKVxuXHRcdFx0XHRcdEBpbm5lci5wdXNoIGlcblx0XHRcdFx0ZWxzZSBcblx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpXG5cdFx0XHRcdGlcblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggbmV3IExhbmUgaSxqLGRpclxuXG5cblx0XHRAY3JlYXRlX2NhcigpIGZvciBpIGluIFswLi4uUy5udW1fY2Fyc11cblxuXHRjaG9vc2VfaW50ZXJzZWN0aW9uOiAtPlxuXHRcdGEgPSBfLnNhbXBsZSBAaW50ZXJzZWN0aW9uc1xuXHRcdGIgPSBfLnNhbXBsZSBAaW50ZXJzZWN0aW9uc1xuXHRcdGlmIGEuaWQ9PWIuaWQgdGhlbiBAY2hvb3NlX2ludGVyc2VjdGlvbigpIGVsc2Uge2E6IGEsIGI6IGJ9XG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHQjIHthLGJ9ID0gQGNob29zZV9pbnRlcnNlY3Rpb24oKVxuXHRcdGEgPSBfLnNhbXBsZSBAb3V0ZXJcblx0XHRiID0gXy5zYW1wbGUgQGlubmVyXG5cdFx0dWQgPSBpZiBiLnJvdyA8IGEucm93IHRoZW4gJ3VwJyBlbHNlICdkb3duJ1xuXHRcdGxyID0gaWYgYi5jb2wgPCBhLmNvbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblx0XHR1ZHMgPSAodWQgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLnJvdy1hLnJvdyldKVxuXHRcdGxycyA9IChsciBmb3IgaSBpbiBbMC4uLk1hdGguYWJzKGIuY29sLWEuY29sKV0pXG5cdFx0Y2FyID0gbmV3IENhciBhLHVkcyxscnMsYlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0dGlja19sYW5lOiAobGFuZSktPlxuXHRcdGxhbmUuY291bnRfY2FycygpXG5cdFx0bnVtX21vdmluZyA9IDBcblx0XHRrID0gbGFuZS5jZWxsc1xuXHRcdGlmIChjYXI9a1trLmxlbmd0aC0xXS5jYXIpXG5cdFx0XHRpZiBsYW5lLmVuZC5jYW5fZ28gbGFuZS5kaXJlY3Rpb25cblx0XHRcdFx0aWYgQHR1cm5fY2FyIGNhciwgbGFuZS5lbmRcblx0XHRcdFx0XHRrW2subGVuZ3RoLTFdLnJlbW92ZSgpXG5cdFx0XHRcdFx0bnVtX21vdmluZysrXG5cblx0XHRmb3IgY2VsbCxpIGluIGtbMC4uLmsubGVuZ3RoLTFdXG5cdFx0XHRcdHRhcmdldCA9IGtbaSsxXVxuXHRcdFx0XHRpZiB0YXJnZXQuaXNfZnJlZSgpIGFuZCAoY2FyPWNlbGwuY2FyKVxuXHRcdFx0XHRcdG51bV9tb3ZpbmcrK1xuXHRcdFx0XHRcdHRhcmdldC5yZWNlaXZlIGNhclxuXHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblx0XHRudW1fbW92aW5nXG5cblx0dHVybl9jYXI6IChjLGkpLT5cblx0XHRpZiBjLmRlcy5pZCA9PSBpLmlkXG5cdFx0XHRjLmV4aXRlZCA9IHRydWVcblx0XHRcdGMudF9leCA9IFMudGltZVxuXHRcdFx0dHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdHt1ZHMscmxzfSA9IGNcblx0XHRcdGwxID0gaS5iZWdfbGFuZXNbdWRzWzBdXVxuXHRcdFx0bDIgPSBpLmJlZ19sYW5lc1tybHNbMF1dXG5cdFx0XHRpZiBsMT8uaXNfZnJlZSgpIGFuZCBsMj8uaXNfZnJlZSgpXG5cdFx0XHRcdGlmIGwxLm51bV9jYXJzIDwgbDIubnVtX2NhcnNcblx0XHRcdFx0XHRsYW5lX2Nob3NlbiA9IGwxXG5cdFx0XHRcdFx0YXJyX2Nob3NlbiA9IHVkc1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bGFuZV9jaG9zZW4gPSBsMlxuXHRcdFx0XHRcdGFycl9jaG9zZW4gPSBybHNcblx0XHRcdGVsc2UgaWYgbDE/LmlzX2ZyZWUoKVxuXHRcdFx0XHRsYW5lX2Nob3NlbiA9IGwxXG5cdFx0XHRcdGFycl9jaG9zZW4gPSB1ZHNcblx0XHRcdGVsc2UgaWYgbDI/LmlzX2ZyZWUoKVxuXHRcdFx0XHRsYW5lX2Nob3NlbiA9IGwyXG5cdFx0XHRcdGFycl9jaG9zZW4gPSBybHNcblx0XHRcdGlmIGxhbmVfY2hvc2VuXG5cdFx0XHRcdGxhbmVfY2hvc2VuLnJlY2VpdmUgY1xuXHRcdFx0XHRjLmVudGVyZWQgPSB0cnVlXG5cdFx0XHRcdGFycl9jaG9zZW4uc2hpZnQoKVxuXHRcdFx0XHR0cnVlXG5cblx0dGljazogLT5cblx0XHRpLnRpY2soKSBmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdG51bV9tb3ZpbmcgPSBfLnN1bSAoQHRpY2tfbGFuZSBsYW5lIGZvciBsYW5lIGluIEBsYW5lcylcblxuXHRcdGZvciBjYXIgaW4gQHdhaXRpbmdcblx0XHRcdGlmIGNhci50X2VuPFMudGltZSB0aGVuIEB0dXJuX2NhciBjYXIsY2FyLm9yaWdcblxuXHRcdGZvciBsIGluIEBsYW5lc1xuXHRcdFx0Zm9yIGMgaW4gbC5jZWxsc1xuXHRcdFx0XHRjLmZpbmFsaXplKClcblxuXHRcdEB3YWl0aW5nID0gXy5maWx0ZXIgQGNhcnMsKGMpLT4gIWMuZW50ZXJlZFxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAY2FycywgKGMpLT4gYy5lbnRlcmVkIGFuZCAhYy5leGl0ZWRcblxuXHRcdGlmIFMudGltZSAlUy5mcmVxdWVuY3kgPT0wXG5cdFx0XHRAbWVtb3J5LnB1c2ggXG5cdFx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHRcdHY6IG51bV9tb3ZpbmcvQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdFx0ZjogbnVtX21vdmluZ1xuXHRcdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cblx0bG9nOiAtPlxuXHRcdEBjdW0ucHVzaFxuXHRcdFx0dGltZTogUy50aW1lXG5cdFx0XHRjdW1FbjogUy5udW1fY2FycyAtIEB3YWl0aW5nLmxlbmd0aCBcblx0XHRcdGN1bUV4OiBTLm51bV9jYXJzIC0gQHRyYXZlbGluZy5sZW5ndGgtQHdhaXRpbmcubGVuZ3RoXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdGRheV9lbmQ6LT5cblx0XHRjLmV2YWxfY29zdCgpIGZvciBjIGluIEBjYXJzXG5cdFx0Yy5jaG9vc2UoKSBmb3IgYyBpbiBfLnNhbXBsZSBAY2FycywgMjVcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0dHJhdmVsaW5nOiBbXVxuXHRcdFx0Y3VtOiBbXVxuXHRcdFx0bWVtb3J5OiBbXVxuXHRcdFx0Y3VtRW46IDBcblx0XHRcdGN1bUV4OiAwXG5cdFx0XHR3YWl0aW5nOiBfLmNsb25lIEBjYXJzXG5cdFx0Zm9yIGludGVyc2VjdGlvbiBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0aW50ZXJzZWN0aW9uLmRheV9zdGFydCgpIFxuXHRcdGZvciBsYW5lIGluIEBsYW5lc1xuXHRcdFx0bGFuZS5kYXlfc3RhcnQoKVxuXHRcdGZvciBjYXIgaW4gQGNhcnNcblx0XHRcdGNhci5kYXlfc3RhcnQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWMiLCJTID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG50d29EZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRjYXJzOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0cGFyYW1zID0geyB3aWR0aDogNzAwLCBoZWlnaHQ6IDcwMCwgdHlwZTogVHdvLlR5cGVzLndlYmdsIH1cblx0XHRcdHR3byA9IG5ldyBUd28ocGFyYW1zKS5hcHBlbmRUbyBlbFswXVxuXG5cdFx0XHRkYXRhID0gW11cblx0XHRcdG1hcCA9IHt9XG5cdFx0XHR0d29zID0ge31cblxuXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFx0Uy50aW1lJTM9PTBcblx0XHRcdFx0LCAtPlxuXHRcdFx0XHRcdG5ld0QgPSBzY29wZS5jYXJzXG5cdFx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdFx0ZW50ZXIgPSB7fVxuXHRcdFx0XHRcdGZvciBkIGluIG5ld0Rcblx0XHRcdFx0XHRcdG5ld19tYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRpZiAhbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdG1hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdFx0ZW50ZXJbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRcdGlmICEodD0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdFx0XHR0PXR3b3NbZC5pZF0gPSB0d28ubWFrZVJlY3RhbmdsZSAtMS41LC0xLjUsMywzXG5cdFx0XHRcdFx0XHRcdFx0dC5maWxsID0gZC5jb2xvclxuXHRcdFx0XHRcdFx0XHRcdHQuc3Ryb2tlID0gJ3doaXRlJ1xuXHRcdFx0XHRcdFx0XHRcdHQubGluZXdpZHRoPS43XG5cdFx0XHRcdFx0Zm9yIGlkIGluIF8ua2V5cyBtYXBcblx0XHRcdFx0XHRcdGlmICFuZXdfbWFwW2lkXVxuXHRcdFx0XHRcdFx0XHRtYXBbaWRdID0gZmFsc2Vcblx0XHRcdFx0XHRcdFx0dHdvLnJlbW92ZSB0d29zW2lkXVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRpZiAhZW50ZXJbaWRdXG5cdFx0XHRcdFx0XHRcdFx0dHdvLmFkZCB0d29zW2lkXVxuXHRcdFx0XHRcdFx0XHRkID0gbWFwW2lkXVxuXHRcdFx0XHRcdFx0XHR0d29zW2lkXS50cmFuc2xhdGlvbi5zZXQgZC54KjcsIGQueSo3XG5cblx0XHRcdFx0XHR0d28udXBkYXRlKClcblxubW9kdWxlLmV4cG9ydHMgPSB0d29EZXIiXX0=
