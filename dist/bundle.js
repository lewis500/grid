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
        var d, enter, j, k, len, len1, newD, new_map;
        newD = scope.cars;
        new_map = {};
        enter = {};
        for (j = 0, len = newD.length; j < len; j++) {
          d = newD[j];
          new_map[d.id] = d;
          if (!map[d.id]) {
            data.push(d);
            map[d.id] = d;
            enter[d.id] = d;
            if (!twos[d.id]) {
              twos[d.id] = two.makeRectangle(-2, -2, 4, 4);
              twos[d.id].fill = d.color;
              twos[d.id].stroke = 'white';
            }
          }
        }
        for (k = 0, len1 = data.length; k < len1; k++) {
          d = data[k];
          if (!new_map[d.id]) {
            delete map[d.id];
            two.remove(twos[d.id]);
          } else {
            if (!enter[d.id]) {
              two.add(twos[d.id]);
            }
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
      target: _.random(4, 300),
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



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBQ1gsSUFB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QztNQUFBLFNBQUEsRUFBVyxFQUFYO01BQ0EsR0FBQSxFQUFLLEVBREw7TUFFQSxNQUFBLEVBQVEsRUFGUjtNQUdBLEtBQUEsRUFBTyxDQUhQO01BSUEsS0FBQSxFQUFPLENBSlA7TUFLQSxPQUFBLEVBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsSUFBVCxDQUxUO0tBREQ7QUFPQTtBQUFBLFNBQUEscUNBQUE7O01BQ0MsWUFBWSxDQUFDLFNBQWIsQ0FBQTtBQUREO0FBRUE7QUFBQSxTQUFBLHdDQUFBOztNQUNDLElBQUksQ0FBQyxTQUFMLENBQUE7QUFERDtBQUVBO0FBQUE7U0FBQSx3Q0FBQTs7bUJBQ0MsR0FBRyxDQUFDLFNBQUosQ0FBQTtBQUREOztFQVpTOzs7Ozs7QUFlWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblx0XHRAZGF5X3N0YXJ0KClcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdCMgaWYgQHBoeXNpY3Ncblx0XHQjIFx0c2V0VGltZW91dCA9PlxuXHRcdCMgXHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0IyBcdFx0XHRcdEBkYXlfZW5kKClcblx0XHQjIFx0XHRcdFx0cmV0dXJuXG5cdFx0IyBcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdCMgXHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0IyBcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0IyBcdFx0XHQjIEBwYXVzZWRcblx0XHQjIFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdCMgXHRcdFx0IyB0cnVlXG5cdFx0IyBcdFx0LCBTLnBhY2Vcblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHNjb3BlLnRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHNjb3BlLnRyYWZmaWMudGljaygpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdEBwYXVzZWRcblx0XHRcdFx0XHQjIGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdCMgdHJ1ZVxuXHRcdFx0XHQjICwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdCMgZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHNjb3BlLnRyYWZmaWMuZGF5X3N0YXJ0KClcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHQjIGQzLnRpbWVyLmZsdXNoKClcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfZW5kKClcblx0XHQjIEBkYXlfc3RhcnQoKVxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cbnR3b0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGNhcnM6ICc9J1xuXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRwYXJhbXMgPSB7IHdpZHRoOiA3MDAsIGhlaWdodDogNzAwLCB0eXBlOiBUd28uVHlwZXMud2ViZ2wgfVxuXHRcdFx0dHdvID0gbmV3IFR3byhwYXJhbXMpLmFwcGVuZFRvIGVsWzBdXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblxuXHRcdFx0ZGF0YSA9IFtdXG5cdFx0XHRtYXAgPSB7fVxuXHRcdFx0dHdvcyA9IHt9XG5cblx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRcdFMudGltZVxuXHRcdFx0XHQsIC0+XG5cdFx0XHRcdFx0bmV3RCA9IHNjb3BlLmNhcnNcblx0XHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0XHRlbnRlciA9IHt9XG5cdFx0XHRcdFx0Zm9yIGQgaW4gbmV3RFxuXHRcdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdGlmICFtYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoIGRcblx0XHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0XHRlbnRlcltkLmlkXSA9IGRcblx0XHRcdFx0XHRcdFx0aWYgISh0d29zW2QuaWRdKVxuXHRcdFx0XHRcdFx0XHRcdHR3b3NbZC5pZF0gPSB0d28ubWFrZVJlY3RhbmdsZSAtMiwtMiw0LDRcblx0XHRcdFx0XHRcdFx0XHR0d29zW2QuaWRdLmZpbGwgPSBkLmNvbG9yXG5cdFx0XHRcdFx0XHRcdFx0dHdvc1tkLmlkXS5zdHJva2UgPSAnd2hpdGUnXG5cblx0XHRcdFx0XHRmb3IgZCBpbiBkYXRhXG5cdFx0XHRcdFx0XHRpZiAhbmV3X21hcFtkLmlkXVxuXHRcdFx0XHRcdFx0XHRkZWxldGUgbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdHdvc1tkLmlkXVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRpZiAhZW50ZXJbZC5pZF1cblx0XHRcdFx0XHRcdFx0XHR0d28uYWRkIHR3b3NbZC5pZF1cblx0XHRcdFx0XHRcdFx0dHdvc1tkLmlkXS50cmFuc2xhdGlvbi5zZXQgZC54KjcsIGQueSo3XG5cblx0XHRcdFx0XHR0d28udXBkYXRlKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5zaWduYWxEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZTogXG5cdFx0XHRkaXJlY3Rpb246Jz0nXG5cdFx0bGluazooc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2lnbmFscyA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0QWxsICdzaWduYWxzJ1xuXHRcdFx0XHQuZGF0YSBbJ3VwX2Rvd24nLCdsZWZ0X3JpZ2h0JywndXBfZG93bicsJ2xlZnRfcmlnaHQnXVxuXHRcdFx0XHQuZW50ZXIoKVxuXHRcdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdHdpZHRoOiAxLjJcblx0XHRcdFx0XHRoZWlnaHQ6IC42XG5cdFx0XHRcdFx0Y2xhc3M6ICdzaWduYWwnXG5cdFx0XHRcdFx0eTogLTEuMlxuXHRcdFx0XHRcdHg6LS42XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAoZCxpKS0+XG5cdFx0XHRcdFx0XHRcInJvdGF0ZSgjezkwKml9KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAnZGlyZWN0aW9uJywobmV3VmFsKS0+XG5cdFx0XHRcdHNpZ25hbHNcblx0XHRcdFx0XHQjIC5hdHRyIFxuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0LmRpcmVjdGl2ZSAndHdvRGVyJyx0d29EZXJcblx0LmRpcmVjdGl2ZSAnbWZkRGVyJyxyZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuZGlyZWN0aXZlICdjYW5EZXInLCBjYW5EZXJcblxuXG5cbiMgY2FuRGVyID0gLT5cbiMgXHRkaXJlY3RpdmUgPSBcbiMgXHRcdHNjb3BlOiBcbiMgXHRcdFx0Y2FyczogJz0nXG4jIFx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXG4jIFx0XHRcdGN0eCA9IGQzLnNlbGVjdCBlbFswXVxuIyBcdFx0XHRcdFx0LmFwcGVuZCAnY2FudmFzJ1xuIyBcdFx0XHRcdFx0LmF0dHJcbiMgXHRcdFx0XHRcdFx0d2lkdGg6IDcwMFxuIyBcdFx0XHRcdFx0XHRoZWlnaHQ6IDcwMFxuIyBcdFx0XHRcdFx0Lm5vZGUoKVxuIyBcdFx0XHRcdFx0LmdldENvbnRleHQgJzJkJ1xuXG4jIFx0XHRcdGN0eC5mUmVjdD0gKHgseSx3LGgpLT5cbiMgXHRcdFx0XHR4ID0gcGFyc2VJbnQgeFxuIyBcdFx0XHRcdHkgPSBwYXJzZUludCB5XG4jIFx0XHRcdFx0Y3R4LmZpbGxSZWN0IHgseSx3LGhcblxuIyBcdFx0XHRjdHguc1JlY3QgPSAoeCx5LHcsaCktPlxuIyBcdFx0XHRcdHggPSAuNStwYXJzZUludCB4XG4jIFx0XHRcdFx0eSA9IC41K3BhcnNlSW50IHlcbiMgXHRcdFx0XHRjdHguc3Ryb2tlUmVjdCB4LHksdyxoXG5cbiMgXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4jIFx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuIyBcdFx0XHRcdFx0Uy50aW1lXG4jIFx0XHRcdFx0LCAtPlxuIyBcdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCAwLCAwLCA3MDAsNzAwXG4jIFx0XHRcdFx0XHRfLmZvckVhY2ggc2NvcGUuY2FycywgKGMpLT5cbiMgXHRcdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGMuY29sb3JcbiMgXHRcdFx0XHRcdFx0e3gseX0gPSBjXG4jIFx0XHRcdFx0XHRcdGN0eC5mUmVjdCB4KjcseSo3LDQsNFxuIyBcdFx0XHRcdFx0XHRjdHguc1JlY3QgeCo3LHkqNyw0LDRcblxuXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRwYXJhbXMgPSBcblx0XHRcdHdpZHRoOiBAd2lkdGhcblx0XHRcdGhlaWdodDogQGhlaWdodFxuXHRcdFx0dHlwZTogVHdvLlR5cGVzLndlYmdsXG5cblx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdCMgLmFwcGVuZCAnZGl2J1xuXHRcdFx0IyAuc2VsZWN0ICcuZy1tYWluJ1xuXHRcdFx0IyAuYXBwZW5kICdmb3JlaWduT2JqZWN0J1xuXHRcdFx0IyAuYXBwZW5kICdkaXYnXG5cdFx0XHQjIC5zdHlsZSAncG9zaXRpb24nLCdhYnNvbHV0ZSdcblx0XHRcdCMgLmF0dHIgJ3dpZHRoJyxAd2lkdGhcblx0XHRcdCMgLmF0dHIgJ2hlaWdodCcsQGhlaWdodFxuXHRcdFx0LmFwcGVuZCBcImRpdlwiXG5cdFx0XHQuc3R5bGVcblx0XHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZSdcblx0XHRcdFx0bGVmdDogQG0ubFxuXHRcdFx0XHR0b3A6IEBtLnRcblx0XHRcdCMgLnN0eWxlICdwb3NpdGlvbicsJ2Fic29sdXRlJ1xuXG5cdFx0dHdvID0gbmV3IFR3byBwYXJhbXNcblx0XHRcdC5hcHBlbmRUbyBzZWwubm9kZSgpXG5cdFx0XHQjIC5cblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMubnVtX2NhcnNdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnMqLjJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRkYXRhID0gW11cblx0XHRtYXAgPSB7fVxuXHRcdHR3b3MgPSB7fVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRTLnRpbWVcblx0XHRcdCwgKG5ld0QpPT5cblx0XHRcdFx0bmV3RCA9IEBtZW1vcnlcblx0XHRcdFx0bmV3X21hcCA9IHt9XG5cdFx0XHRcdGZvciBkLGkgaW4gbmV3RFxuXHRcdFx0XHRcdG5ld19tYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0aWYgIW1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGF0YS5wdXNoIGRcblx0XHRcdFx0XHRcdG1hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdID0gdHdvLm1ha2VDaXJjbGUgMCwwLDRcblx0XHRcdFx0XHRcdHQuZmlsbCA9ICcjMDNBOUY0J1xuXHRcdFx0XHRcdFx0dC5zdHJva2UgPSAnd2hpdGUnXG5cblx0XHRcdFx0Zm9yIGQsaSBpbiBkYXRhXG5cdFx0XHRcdFx0aWYgIW5ld19tYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSBtYXBbZC5pZF1cblx0XHRcdFx0XHRcdGRlbGV0ZSAodCA9IHR3b3NbZC5pZF0pXG5cdFx0XHRcdFx0XHR0d28ucmVtb3ZlIHRcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR0ID0gdHdvc1tkLmlkXVxuXHRcdFx0XHRcdFx0dC5vcGFjaXR5ID0gKGkvbmV3RC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR0LnRyYW5zbGF0aW9uLnNldCBAaG9yKGQubiksIEB2ZXIoZC5mKVxuXG5cdFx0XHRcdHR3by51cGRhdGUoKVxuXG5cdFx0IyBAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHQjIFx0LnggKGQpPT5AaG9yIGQublxuXHRcdCMgXHQueSAoZCk9PkB2ZXIgZC5mXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgNVxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOiAoQG9yaWcsQHBlcm1fdHVybnMsQGRlcyktPlxuXHRcdCNkZXMgaXMgYW4gaW50ZXJzZWN0aW9uXG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCwzMDBcblx0XHRcdGNvbG9yOiBfLnNhbXBsZSBAY29sb3JzXG5cblx0aXNfZGVzdGluYXRpb246IChpKS0+XG5cdFx0aS5pZCA9PSBAZGVzLmlkXG5cblx0Y29sb3JzOiBbJyMwM0E5RjQnLCcjMDNBOUY0JywnIzhCQzM0QScsJyNGRjU3MjInLCcjNjA3RDhCJywnIzNGNTFCNScsJyM0Q0FGNTAnLCcjNjUxRkZGJywnIzFERTlCNiddXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRjb3N0MDogQGNvc3Rcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRleGl0ZWQ6IGZhbHNlXG5cdFx0XHRjZWxsOiB1bmRlZmluZWRcblx0XHRcdHRfZW46IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMiwyKVxuXHRcdFx0dHVybnM6IF8uc2h1ZmZsZSBfLmNsb25lIEBwZXJtX3R1cm5zXG5cblx0c2V0X3h5OiAoQHgsQHksQHgyLEB5MiktPlxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBAY29zdCA8IEBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gKFMucGhhc2UgKyBfLnJhbmRvbSAtNSw1KVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRbQGJlZ19sYW5lcyxAZW5kX2xhbmVzXSA9IFt7fSx7fV1cblxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IEBjb2wqMTAwL1Muc2l6ZVxuXHRcdFx0eTogQHJvdyoxMDAvUy5zaXplXG5cblx0XHRAc2lnbmFsID0gbmV3IFNpZ25hbFxuXG5cdFx0QGRpcmVjdGlvbnMgPSBcblx0XHRcdCd1cF9kb3duJzogWyd1cCcsJ2Rvd24nXVxuXHRcdFx0J2xlZnRfcmlnaHQnOiBbJ2xlZnQnLCdyaWdodCddXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBiZWdfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHNldF9lbmRfbGFuZTogKGxhbmUpLT5cblx0XHRAZW5kX2xhbmVzW2xhbmUuZGlyZWN0aW9uXSA9IGxhbmVcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0QHNpZ25hbC5jb3VudCA9IDBcblxuXHRjYW5fZ286IChkaXJlY3Rpb24pLT5cblx0XHRkaXJlY3Rpb24gaW4gQGRpcmVjdGlvbnNbQHNpZ25hbC5kaXJlY3Rpb25dXG5cblx0dGljazogLT5cblx0XHRAc2lnbmFsLnRpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyc2VjdGlvbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAcG9zLEBfcG9zKS0+XG5cdFx0XHRAeCA9IEBwb3MueFxuXHRcdFx0QHkgPSBAcG9zLnlcblx0XHRcdEB4MiA9IE1hdGguZmxvb3IgQF9wb3MueFxuXHRcdFx0QHkyID0gTWF0aC5mbG9vciBAX3Bvcy55XG5cdFx0XHRAbGFzdCA9IC1JbmZpbml0eVxuXHRcdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRzcGFjZTogUy5zcGFjZVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfeHkgQHgsQHksQHgyLEB5MlxuXHRcdEBsYXN0PVMudGltZVxuXHRcdEB0ZW1wX2NhciA9IGNhclxuXG5cdHJlbW92ZTogLT5cblx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBjYXIgPSBAdGVtcF9jYXJcblx0XHRpZiBAY2FyXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6IChAYmVnLEBlbmQsQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2xhbmUtJ1xuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QHNldHVwKClcblx0XHRAcm93ID0gTWF0aC5taW4gQGJlZy5yb3csQGVuZC5yb3dcblx0XHRAY29sID0gTWF0aC5taW4gQGJlZy5jb2wsQGVuZC5jb2xcblxuXHRkYXlfc3RhcnQ6LT5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRpc19mcmVlOiAtPlxuXHRcdEBjZWxsc1swXS5pc19mcmVlKClcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGNlbGxzWzBdLnJlY2VpdmUgY2FyXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGgtMV1cblx0XHRcdC5yYW5nZSBbYSxiXVxuXHRcdFx0XG5cdFx0c2NhbGUyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFtAYmVnLnBvcyxAZW5kLnBvc11cblxuXHRcdFtAYSxAYl09W2EsYl1cblxuXHRcdEBjZWxscyA9IFswLi4oUy5sYW5lX2xlbmd0aC0xKV0ubWFwIChuKT0+IFxuXHRcdFx0cG9zID0gc2NhbGUgblxuXHRcdFx0X3BvcyA9IHNjYWxlMiBuXG5cdFx0XHRuZXcgQ2VsbCBwb3MsX3Bvc1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmVcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRzaXplOiAxMFxuXHRcdFx0c3RvcHBpbmdfdGltZTogNVxuXHRcdFx0cGFjZTogMVxuXHRcdFx0c3BhY2U6IDRcblx0XHRcdHBoYXNlOiA4MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHRsYW5lX2xlbmd0aDogMTBcblx0XHRcdHdpc2g6IDE1MFxuXHRcdFx0bnVtX2NhcnM6IDIwMDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0ZnJlcXVlbmN5OiAyNVxuXHRcdFx0ZGF5OiAwXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiLCIhXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuIyBTaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGludGVyc2VjdGlvbnM6IFtdXG5cdFx0XHRsYW5lczogW11cblx0XHRcdG91dGVyOiBbXVxuXHRcdFx0aW5uZXI6IFtdXG5cdFx0XHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cdFx0XHRjYXJzOiBbXVxuXG5cdFx0QGdyaWQgPSBbMC4uLlMuc2l6ZV0ubWFwIChyb3cpPT5cblx0XHRcdFswLi4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0Zm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGZvciBkaXIgaW4gQGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaCBkaXJcblx0XHRcdFx0XHR3aGVuICd1cCcgdGhlbiBAZ3JpZFtpLnJvdy0xXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiAnZG93bicgdGhlbiBAZ3JpZFtpLnJvdysxXT9baS5jb2xdXG5cdFx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wtMV1cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZT1uZXcgTGFuZSBpLGosZGlyKVxuXHRcdFx0XHRcdGlmICgwPGkucm93PChTLnNpemUtMSkpIGFuZCAoMDxpLmNvbDwoUy5zaXplLTEpKVxuXHRcdFx0XHRcdFx0QGlubmVyLnB1c2ggaVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGlmIChpLnJvdz4wKSBvciAoaS5jb2w+MClcblx0XHRcdFx0XHRcdFx0QG91dGVyLnB1c2ggaVxuXHRcdFx0XHRcdFx0XHRpLm91dGVyID0gdHJ1ZVxuXG5cdFx0QGNyZWF0ZV9jYXIoKSBmb3IgaSBpbiBbMC4uLlMubnVtX2NhcnNdXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPCBhLnJvdyB0aGVuICd1cCcgZWxzZSAnZG93bidcblx0XHRsciA9IGlmIGIuY29sIDwgYS5jb2wgdGhlbiAnbGVmdCcgZWxzZSAncmlnaHQnXG5cdFx0dWRzID0gKHVkIGZvciBpIGluIFswLi4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSlcblx0XHRscnMgPSAobHIgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldKVxuXHRcdHR1cm5zID0gXy5zaHVmZmxlIF8uZmxhdHRlbihbdWRzLGxyc10pXG5cdFx0Y2FyID0gbmV3IENhciBhLHR1cm5zLGJcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHRpY2tfbGFuZTogKGxhbmUpLT5cblx0XHRudW1fbW92aW5nID0gMFxuXHRcdGsgPSBsYW5lLmNlbGxzXG5cdFx0aWYgKGNhcj1rW2subGVuZ3RoLTFdLmNhcilcblx0XHRcdGlmIGxhbmUuZW5kLmNhbl9nbyBsYW5lLmRpcmVjdGlvblxuXHRcdFx0XHRpZiBAdHVybl9jYXIgY2FyLCBsYW5lLmVuZFxuXHRcdFx0XHRcdGtbay5sZW5ndGgtMV0ucmVtb3ZlKClcblx0XHRcdFx0XHRudW1fbW92aW5nKytcblxuXHRcdGZvciBjZWxsLGkgaW4ga1swLi4uay5sZW5ndGgtMV1cblx0XHRcdFx0dGFyZ2V0ID0ga1tpKzFdXG5cdFx0XHRcdGlmIHRhcmdldC5pc19mcmVlKCkgYW5kIChjYXI9Y2VsbC5jYXIpXG5cdFx0XHRcdFx0bnVtX21vdmluZysrXG5cdFx0XHRcdFx0dGFyZ2V0LnJlY2VpdmUgY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdG51bV9tb3ZpbmdcblxuXHR0dXJuX2NhcjogKGNhcixpKS0+XG5cdFx0aWYgY2FyLmRlcy5pZCA9PSBpLmlkXG5cdFx0XHRjYXIuZXhpdGVkID0gdHJ1ZVxuXHRcdFx0Y2FyLnRfZXggPSBTLnRpbWVcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRsYW5lID0gaS5iZWdfbGFuZXNbY2FyLnR1cm5zWzBdXVxuXHRcdFx0aWYgbGFuZS5pc19mcmVlKClcblx0XHRcdFx0bGFuZS5yZWNlaXZlIGNhclxuXHRcdFx0XHRjYXIuZW50ZXJlZD10cnVlXG5cdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdHRydWVcblxuXHR0aWNrOiAtPlxuXHRcdGkudGljaygpIGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0bnVtX21vdmluZyA9IF8uc3VtIChAdGlja19sYW5lIGxhbmUgZm9yIGxhbmUgaW4gQGxhbmVzKVxuXG5cdFx0Zm9yIGNhciBpbiBAd2FpdGluZ1xuXHRcdFx0aWYgY2FyLnRfZW48Uy50aW1lIHRoZW4gQHR1cm5fY2FyIGNhcixjYXIub3JpZ1xuXG5cdFx0Zm9yIGwgaW4gQGxhbmVzXG5cdFx0XHRmb3IgYyBpbiBsLmNlbGxzXG5cdFx0XHRcdGMuZmluYWxpemUoKVxuXG5cdFx0QHdhaXRpbmcgPSBfLmZpbHRlciBAY2FycywoYyktPiAhYy5lbnRlcmVkXG5cdFx0QHRyYXZlbGluZyA9IF8uZmlsdGVyIEBjYXJzLCAoYyktPiBjLmVudGVyZWQgYW5kICFjLmV4aXRlZFxuXG5cdFx0IyBpZiBTLnRpbWUgJVMuZnJlcXVlbmN5ID09MFxuXHRcdCMgXHRAbWVtb3J5LnB1c2ggXG5cdFx0IyBcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHQjIFx0XHR2OiBudW1fbW92aW5nL0B0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0IyBcdFx0ZjogbnVtX21vdmluZ1xuXHRcdCMgXHRcdGlkOiBfLnVuaXF1ZUlkKClcblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBTLm51bV9jYXJzIC0gQHdhaXRpbmcubGVuZ3RoIFxuXHRcdFx0Y3VtRXg6IFMubnVtX2NhcnMgLSBAdHJhdmVsaW5nLmxlbmd0aC1Ad2FpdGluZy5sZW5ndGhcblxuXHRkb25lOiAtPlxuXHRcdChAd2FpdGluZy5sZW5ndGgrQHRyYXZlbGluZy5sZW5ndGgpPT0wXG5cblx0ZGF5X2VuZDotPlxuXHRcdGMuZXZhbF9jb3N0KCkgZm9yIGMgaW4gQGNhcnNcblx0XHRjLmNob29zZSgpIGZvciBjIGluIF8uc2FtcGxlIEBjYXJzLCAyNVxuXG5cdGRheV9zdGFydDotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRtZW1vcnk6IFtdXG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgQGNhcnNcblx0XHRmb3IgaW50ZXJzZWN0aW9uIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRpbnRlcnNlY3Rpb24uZGF5X3N0YXJ0KCkgXG5cdFx0Zm9yIGxhbmUgaW4gQGxhbmVzXG5cdFx0XHRsYW5lLmRheV9zdGFydCgpXG5cdFx0Zm9yIGNhciBpbiBAY2Fyc1xuXHRcdFx0Y2FyLmRheV9zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
