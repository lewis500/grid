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
    var a, b, car, i, lr, lrs, ref, turns, ud, uds;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC90d29EZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLG1CQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0FBRUo7RUFDTyxjQUFDLE1BQUQsRUFBUSxHQUFSO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFBTyxJQUFDLENBQUEsS0FBRDtJQUNuQixJQUFDLENBQUEsTUFBRCxH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QUZIO0lBUkssQ0FGTjs7QUFGTzs7QUF3Q1QsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cdFx0QGRheV9zdGFydCgpXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfc3RhcnQoKVxuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdEBzY29wZS50cmFmZmljLmRheV9lbmQoKVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5zaWduYWxEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRkaXJlY3Rpb246Jz0nXG5cdFx0bGluazooc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2lnbmFscyA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0QWxsICdzaWduYWxzJ1xuXHRcdFx0XHQuZGF0YSBbJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0JywndXBfZG93bicsJ2xlZnRfcmlnaHQnXVxuXHRcdFx0XHQuZW50ZXIoKVxuXHRcdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdHdpZHRoOiAxLjJcblx0XHRcdFx0XHRoZWlnaHQ6IC42XG5cdFx0XHRcdFx0Y2xhc3M6ICdzaWduYWwnXG5cdFx0XHRcdFx0eTogLTEuMlxuXHRcdFx0XHRcdHg6LS42XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAoZCxpKS0+XG5cdFx0XHRcdFx0XHRcInJvdGF0ZSgjezkwKml9KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAnZGlyZWN0aW9uJywobmV3VmFsKS0+XG5cdFx0XHRcdHNpZ25hbHNcblx0XHRcdFx0XHQuY2xhc3NlZCAnb24nLCAoZCktPiBkPT1uZXdWYWxcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ3NpZ25hbERlcicsc2lnbmFsRGVyXG5cdC5kaXJlY3RpdmUgJ3R3b0RlcicscmVxdWlyZSAnLi90d29EZXInXG5cdC5kaXJlY3RpdmUgJ21mZERlcicscmVxdWlyZSAnLi9tZmQnXG5cdC5kaXJlY3RpdmUgJ2hvckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveEF4aXMnXG5cdC5kaXJlY3RpdmUgJ3ZlckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveUF4aXMnXG5cdCMgLmRpcmVjdGl2ZSAnY2FuRGVyJywgY2FuRGVyXG5cblxuXG5cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdHBhcmFtcyA9IFxuXHRcdFx0d2lkdGg6IEB3aWR0aFxuXHRcdFx0aGVpZ2h0OiBAaGVpZ2h0XG5cdFx0XHR0eXBlOiBUd28uVHlwZXMud2ViZ2xcblxuXHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0LmFwcGVuZCBcImRpdlwiXG5cdFx0XHQuc3R5bGVcblx0XHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZSdcblx0XHRcdFx0bGVmdDogQG0ubFxuXHRcdFx0XHR0b3A6IEBtLnRcblxuXHRcdHR3byA9IG5ldyBUd28gcGFyYW1zXG5cdFx0XHQuYXBwZW5kVG8gc2VsLm5vZGUoKVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouMl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdGRhdGEgPSBbXVxuXHRcdG1hcCA9IHt9XG5cdFx0dHdvcyA9IHt9XG5cblx0XHRAc2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFMudGltZVxuXHRcdFx0LCAobmV3RCk9PlxuXHRcdFx0XHRuZXdEID0gQG1lbW9yeVxuXHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0Zm9yIGQsaSBpbiBuZXdEXG5cdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRpZiAhbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRkYXRhLnB1c2ggZFxuXHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0dCA9IHR3b3NbZC5pZF0gPSB0d28ubWFrZUNpcmNsZSAwLDAsNFxuXHRcdFx0XHRcdFx0dC5maWxsID0gJyMwM0E5RjQnXG5cdFx0XHRcdFx0XHR0LnN0cm9rZSA9ICd3aGl0ZSdcblxuXHRcdFx0XHRmb3IgZCxpIGluIGRhdGFcblx0XHRcdFx0XHRpZiAhbmV3X21hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlIG1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlICh0ID0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdXG5cdFx0XHRcdFx0XHR0Lm9wYWNpdHkgPSAoaS9uZXdELmxlbmd0aClcblx0XHRcdFx0XHRcdHQudHJhbnNsYXRpb24uc2V0IEBob3IoZC5uKSwgQHZlcihkLmYpXG5cblx0XHRcdFx0dHdvLnVwZGF0ZSgpXG5cblx0XHQjIEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdCMgXHQueCAoZCk9PkBob3IgZC5uXG5cdFx0IyBcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA1XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAb3JpZyxAcGVybV90dXJucyxAZGVzKS0+XG5cdFx0I2RlcyBpcyBhbiBpbnRlcnNlY3Rpb25cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LDYwMFxuXHRcdFx0Y29sb3I6IF8uc2FtcGxlIEBjb2xvcnNcblxuXHRpc19kZXN0aW5hdGlvbjogKGkpLT5cblx0XHRpLmlkID09IEBkZXMuaWRcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyMwM0E5RjQnLCcjOEJDMzRBJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1JywnIzRDQUY1MCcsJyM2NTFGRkYnLCcjMURFOUI2J11cblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZW50ZXJlZDogZmFsc2Vcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGNlbGw6IHVuZGVmaW5lZFxuXHRcdFx0dF9lbjogTWF0aC5tYXggMCwoQHRhcmdldCArIF8ucmFuZG9tIC0yLDIpXG5cdFx0XHR0dXJuczogXy5zaHVmZmxlIF8uY2xvbmUgQHBlcm1fdHVybnNcblxuXHRzZXRfeHk6IChAeCxAeSxAeDIsQHkyKS0+XG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSAoUy5waGFzZSArIF8ucmFuZG9tIC01LDUpXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRAc2lnbmFsLmNvdW50ID0gMFxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXG5cdGRheV9zdGFydDotPlxuXHRcdGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5jYXIgPSBjZWxsLnRlbXBfY2FyID0gZmFsc2Vcblx0XHRcdGNlbGwubGFzdCA9IC1JbmZpbml0eVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0QGNlbGxzWzBdLmlzX2ZyZWUoKVxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY2VsbHNbMF0ucmVjZWl2ZSBjYXJcblxuXHRzZXR1cDogLT5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnlcblxuXHRcdHN3aXRjaCBAZGlyZWN0aW9uXG5cdFx0XHR3aGVuICd1cCdcblx0XHRcdFx0YS54Kytcblx0XHRcdFx0Yi54Kytcblx0XHRcdFx0YS55LT0yXG5cdFx0XHRcdGIueSs9MlxuXHRcdFx0d2hlbiAncmlnaHQnXG5cdFx0XHRcdGEueCs9MlxuXHRcdFx0XHRiLngtPTJcblx0XHRcdFx0YS55Kytcblx0XHRcdFx0Yi55Kytcblx0XHRcdHdoZW4gJ2Rvd24nXG5cdFx0XHRcdGEueC0tXG5cdFx0XHRcdGIueC0tXG5cdFx0XHRcdGEueSs9MlxuXHRcdFx0XHRiLnktPTJcblx0XHRcdHdoZW4gJ2xlZnQnXG5cdFx0XHRcdGEueC09MlxuXHRcdFx0XHRiLngrPTJcblx0XHRcdFx0YS55LS1cblx0XHRcdFx0Yi55LS1cblxuXHRcdHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cdFx0XHRcblx0XHRzY2FsZTIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0W0BhLEBiXT1bYSxiXVxuXG5cdFx0QGNlbGxzID0gWzAuLi4yMF0ubWFwIChuKT0+IFxuXHRcdFx0cG9zID0gc2NhbGUgbioxMC8yMFxuXHRcdFx0X3BvcyA9IHNjYWxlMiBuKjEwLzIwXG5cdFx0XHRuZXcgQ2VsbCBwb3MsX3Bvc1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRzaXplOiA5XG5cdFx0XHRzdG9wcGluZ190aW1lOiA1XG5cdFx0XHRwYWNlOiAxXG5cdFx0XHRzcGFjZTogNFxuXHRcdFx0cGhhc2U6IDgwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdGxhbmVfbGVuZ3RoOiAxMFxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fY2FyczogMjAwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRmcmVxdWVuY3k6IDI1XG5cdFx0XHRkYXk6IDBcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSIsIiFfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG4jIFNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aW50ZXJzZWN0aW9uczogW11cblx0XHRcdGxhbmVzOiBbXVxuXHRcdFx0b3V0ZXI6IFtdXG5cdFx0XHRpbm5lcjogW11cblx0XHRcdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblx0XHRcdGNhcnM6IFtdXG5cblx0XHRAZ3JpZCA9IFswLi4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aW50ZXJzZWN0aW9uXG5cblx0XHRmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0Zm9yIGRpciBpbiBAZGlyZWN0aW9uc1xuXHRcdFx0XHRqID0gc3dpdGNoIGRpclxuXHRcdFx0XHRcdHdoZW4gJ3VwJyB0aGVuIEBncmlkW2kucm93LTFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wrMV1cblx0XHRcdFx0XHR3aGVuICdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbC0xXVxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIG5ldyBMYW5lIGksaixkaXJcblx0XHRcdFx0XHRpZiAoMDxpLnJvdzwoUy5zaXplLTEpKSBhbmQgKDA8aS5jb2w8KFMuc2l6ZS0xKSlcblx0XHRcdFx0XHRcdEBpbm5lci5wdXNoIGlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiAoaS5yb3c+MCkgb3IgKGkuY29sPjApXG5cdFx0XHRcdFx0XHRcdEBvdXRlci5wdXNoIGlcblx0XHRcdFx0XHRcdFx0aS5vdXRlciA9IHRydWVcblxuXHRcdEBjcmVhdGVfY2FyKCkgZm9yIGkgaW4gWzAuLi5TLm51bV9jYXJzXVxuXG5cdGNob29zZV9pbnRlcnNlY3Rpb246IC0+XG5cdFx0YSA9IF8uc2FtcGxlIEBpbnRlcnNlY3Rpb25zXG5cdFx0YiA9IF8uc2FtcGxlIEBpbnRlcnNlY3Rpb25zXG5cdFx0aWYgYS5pZD09Yi5pZCB0aGVuIEBjaG9vc2VfaW50ZXJzZWN0aW9uKCkgZWxzZSB7YTogYSwgYjogYn1cblxuXG5cdGNyZWF0ZV9jYXI6IC0+XG5cdFx0IyBhID0gXy5zYW1wbGUgQGludGVyc2VjdGlvbnNcblx0XHQjIGIgPSBfLnNhbXBsZSBAaW50ZXJzZWN0aW9uc1xuXHRcdHthLGJ9ID0gQGNob29zZV9pbnRlcnNlY3Rpb24oKVxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gKHVkIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSlcblx0XHRscnMgPSAobHIgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldKVxuXHRcdHR1cm5zID0gXy5zaHVmZmxlIF8uZmxhdHRlbihbdWRzLGxyc10pXG5cdFx0Y2FyID0gbmV3IENhciBhLHR1cm5zLGJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2tfbGFuZTogKGxhbmUpLT5cblx0XHRudW1fbW92aW5nID0gMFxuXHRcdGsgPSBsYW5lLmNlbGxzXG5cdFx0aWYgKGNhcj1rW2subGVuZ3RoLTFdLmNhcilcblx0XHRcdGlmIGxhbmUuZW5kLmNhbl9nbyBsYW5lLmRpcmVjdGlvblxuXHRcdFx0XHRpZiBAdHVybl9jYXIgY2FyLCBsYW5lLmVuZFxuXHRcdFx0XHRcdGtbay5sZW5ndGgtMV0ucmVtb3ZlKClcblx0XHRcdFx0XHRudW1fbW92aW5nKytcblxuXHRcdGZvciBjZWxsLGkgaW4ga1swLi4uay5sZW5ndGgtMV1cblx0XHRcdFx0dGFyZ2V0ID0ga1tpKzFdXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKCkgYW5kIChjYXI9Y2VsbC5jYXIpXG5cdFx0XHRcdFx0bnVtX21vdmluZysrXG5cdFx0XHRcdFx0dGFyZ2V0LnJlY2VpdmUgY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdG51bV9tb3ZpbmdcblxuXHR0dXJuX2NhcjogKGNhcixpKS0+XG5cdFx0aWYgY2FyLmRlcy5pZCA9PSBpLmlkXG5cdFx0XHRjYXIuZXhpdGVkID0gdHJ1ZVxuXHRcdFx0Y2FyLnRfZXggPSBTLnRpbWVcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRsYW5lID0gaS5iZWdfbGFuZXNbY2FyLnR1cm5zWzBdXVxuXHRcdFx0aWYgbGFuZS5pc19mcmVlKClcblx0XHRcdFx0bGFuZS5yZWNlaXZlIGNhclxuXHRcdFx0XHRjYXIuZW50ZXJlZD10cnVlXG5cdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdHRydWVcblxuXHR0aWNrOiAtPlxuXHRcdGkudGljaygpIGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0bnVtX21vdmluZyA9IF8uc3VtIChAdGlja19sYW5lIGxhbmUgZm9yIGxhbmUgaW4gQGxhbmVzKVxuXG5cdFx0Zm9yIGNhciBpbiBAd2FpdGluZ1xuXHRcdFx0aWYgY2FyLnRfZW48Uy50aW1lIHRoZW4gQHR1cm5fY2FyIGNhcixjYXIub3JpZ1xuXG5cdFx0Zm9yIGwgaW4gQGxhbmVzXG5cdFx0XHRmb3IgYyBpbiBsLmNlbGxzXG5cdFx0XHRcdGMuZmluYWxpemUoKVxuXG5cdFx0QHdhaXRpbmcgPSBfLmZpbHRlciBAY2FycywoYyktPiAhYy5lbnRlcmVkXG5cdFx0QHRyYXZlbGluZyA9IF8uZmlsdGVyIEBjYXJzLCAoYyktPiBjLmVudGVyZWQgYW5kICFjLmV4aXRlZFxuXG5cdFx0aWYgUy50aW1lICVTLmZyZXF1ZW5jeSA9PTBcblx0XHRcdEBtZW1vcnkucHVzaCBcblx0XHRcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdFx0djogbnVtX21vdmluZy9AdHJhdmVsaW5nLmxlbmd0aFxuXHRcdFx0XHRmOiBudW1fbW92aW5nXG5cdFx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBTLm51bV9jYXJzIC0gQHdhaXRpbmcubGVuZ3RoIFxuXHRcdFx0Y3VtRXg6IFMubnVtX2NhcnMgLSBAdHJhdmVsaW5nLmxlbmd0aC1Ad2FpdGluZy5sZW5ndGhcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0ZGF5X2VuZDotPlxuXHRcdGMuZXZhbF9jb3N0KCkgZm9yIGMgaW4gQGNhcnNcblx0XHRjLmNob29zZSgpIGZvciBjIGluIF8uc2FtcGxlIEBjYXJzLCAyNVxuXG5cdGRheV9zdGFydDotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRtZW1vcnk6IFtdXG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgQGNhcnNcblx0XHRmb3IgaW50ZXJzZWN0aW9uIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRpbnRlcnNlY3Rpb24uZGF5X3N0YXJ0KCkgXG5cdFx0Zm9yIGxhbmUgaW4gQGxhbmVzXG5cdFx0XHRsYW5lLmRheV9zdGFydCgpXG5cdFx0Zm9yIGNhciBpbiBAY2Fyc1xuXHRcdFx0Y2FyLmRheV9zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyIsIlMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcbnR3b0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGNhcnM6ICc9J1xuXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRwYXJhbXMgPSB7IHdpZHRoOiA3MDAsIGhlaWdodDogNzAwLCB0eXBlOiBUd28uVHlwZXMud2ViZ2wgfVxuXHRcdFx0dHdvID0gbmV3IFR3byhwYXJhbXMpLmFwcGVuZFRvIGVsWzBdXG5cblx0XHRcdGRhdGEgPSBbXVxuXHRcdFx0bWFwID0ge31cblx0XHRcdHR3b3MgPSB7fVxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFx0XHRTLnRpbWVcblx0XHRcdFx0LCAtPlxuXHRcdFx0XHRcdG5ld0QgPSBzY29wZS5jYXJzXG5cdFx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdFx0ZW50ZXIgPSB7fVxuXHRcdFx0XHRcdGZvciBkIGluIG5ld0Rcblx0XHRcdFx0XHRcdG5ld19tYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRpZiAhbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdG1hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdFx0ZW50ZXJbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRcdGlmICEodD0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdFx0XHR0PXR3b3NbZC5pZF0gPSB0d28ubWFrZVJlY3RhbmdsZSAtMS41LC0xLjUsMywzXG5cdFx0XHRcdFx0XHRcdFx0dC5maWxsID0gZC5jb2xvclxuXHRcdFx0XHRcdFx0XHRcdHQuc3Ryb2tlID0gJ3doaXRlJ1xuXHRcdFx0XHRcdFx0XHRcdHQubGluZXdpZHRoPS43XG5cblx0XHRcdFx0XHRmb3IgaWQsZCBvZiBtYXBcblx0XHRcdFx0XHRcdGlmICFuZXdfbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdG1hcFtpZF0gPSBmYWxzZVxuXHRcdFx0XHRcdFx0XHR0d28ucmVtb3ZlIHR3b3NbaWRdXG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGlmICFlbnRlcltpZF1cblx0XHRcdFx0XHRcdFx0XHR0d28uYWRkIHR3b3NbaWRdXG5cdFx0XHRcdFx0XHRcdHR3b3NbaWRdLnRyYW5zbGF0aW9uLnNldCBkLngqNywgZC55KjdcblxuXHRcdFx0XHRcdHR3by51cGRhdGUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHR3b0RlciJdfQ==
