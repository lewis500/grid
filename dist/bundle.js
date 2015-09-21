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
      num_cars: 4000,
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



},{"./car":5,"./intersection":6,"./lane":7,"./settings":8,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9pbnRlcnNlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy9sYW5lLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL2dyaWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxtQkFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVKO0VBQ08sY0FBQyxNQUFELEVBQVEsR0FBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBQ1gsSUFB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Z0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUE1QixDQUFBLEtBQXFDO0VBRGhDOztvQkFHTixPQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQUEsQ0FBQyxDQUFDLFNBQUYsQ0FBQTtBQUFBO0FBQ0E7QUFBQTtTQUFBLHdDQUFBOzttQkFBQSxDQUFDLENBQUMsTUFBRixDQUFBO0FBQUE7O0VBRk87O29CQUlSLFNBQUEsR0FBVSxTQUFBO0FBQ1QsUUFBQTtJQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsU0FBQSxFQUFXLEVBQVg7TUFDQSxHQUFBLEVBQUssRUFETDtNQUVBLE1BQUEsRUFBUSxFQUZSO01BR0EsS0FBQSxFQUFPLENBSFA7TUFJQSxLQUFBLEVBQU8sQ0FKUDtNQUtBLE9BQUEsRUFBUyxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxJQUFULENBTFQ7S0FERDtBQU9BO0FBQUEsU0FBQSxxQ0FBQTs7TUFDQyxZQUFZLENBQUMsU0FBYixDQUFBO0FBREQ7QUFFQTtBQUFBLFNBQUEsd0NBQUE7O01BQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBQTtBQUREO0FBRUE7QUFBQTtTQUFBLHdDQUFBOzttQkFDQyxHQUFHLENBQUMsU0FBSixDQUFBO0FBREQ7O0VBWlM7Ozs7OztBQWVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5TID0gcmVxdWlyZSAnLi9tb2RlbHMvc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBuZXcgVHJhZmZpY1xuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHBsYWNlX2NhcjogKGNhciktPlxuXHRcdFwidHJhbnNsYXRlKCN7Y2FyLnh9LCN7Y2FyLnl9KVwiXG5cblx0cGxhY2VfaW50ZXJzZWN0aW9uOiAoZCktPlxuXHRcdFwidHJhbnNsYXRlKCN7ZC5wb3MueH0sI3tkLnBvcy55fSlcIlxuXG5cdHBsYWNlX2xhbmU6IChkKS0+XG5cdFx0XCJNICN7ZC5hLnh9LCN7ZC5hLnl9IEwgI3tkLmIueH0sI3tkLmIueX1cIlx0XHRcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0IyBpZiBAcGh5c2ljc1xuXHRcdCMgXHRzZXRUaW1lb3V0ID0+XG5cdFx0IyBcdFx0XHRpZiBAc2NvcGUudHJhZmZpYy5kb25lKClcblx0XHQjIFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdCMgXHRcdFx0XHRyZXR1cm5cblx0XHQjIFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0IyBcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHQjIFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHQjIFx0XHRcdCMgQHBhdXNlZFxuXHRcdCMgXHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0IyBcdFx0XHQjIHRydWVcblx0XHQjIFx0XHQsIFMucGFjZVxuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAc2NvcGUudHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0QHBhdXNlZFxuXHRcdFx0XHRcdCMgaWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0IyB0cnVlXG5cdFx0XHRcdCMgLCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0IyBkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAc2NvcGUudHJhZmZpYy5kYXlfc3RhcnQoKVxuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdCMgZDMudGltZXIuZmx1c2goKVxuXHRcdEBzY29wZS50cmFmZmljLmRheV9lbmQoKVxuXHRcdCMgQGRheV9zdGFydCgpXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0KClcblxudHdvRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y2FyczogJz0nXG5cdFx0bGluazogKHNjb3BlLGVsLGF0dHIpLT5cblx0XHRcdHBhcmFtcyA9IHsgd2lkdGg6IDcwMCwgaGVpZ2h0OiA3MDAsIHR5cGU6IFR3by5UeXBlcy53ZWJnbCB9XG5cdFx0XHR0d28gPSBuZXcgVHdvKHBhcmFtcykuYXBwZW5kVG8gZWxbMF1cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXG5cdFx0XHRkYXRhID0gW11cblx0XHRcdG1hcCA9IHt9XG5cdFx0XHR0d29zID0ge31cblxuXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFx0Uy50aW1lXG5cdFx0XHRcdCwgLT5cblx0XHRcdFx0XHRuZXdEID0gc2NvcGUuY2Fyc1xuXHRcdFx0XHRcdG5ld19tYXAgPSB7fVxuXHRcdFx0XHRcdGVudGVyID0ge31cblx0XHRcdFx0XHRmb3IgZCBpbiBuZXdEXG5cdFx0XHRcdFx0XHRuZXdfbWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0aWYgIW1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2ggZFxuXHRcdFx0XHRcdFx0XHRtYXBbZC5pZF0gPSBkXG5cdFx0XHRcdFx0XHRcdGVudGVyW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0XHRpZiAhKHR3b3NbZC5pZF0pXG5cdFx0XHRcdFx0XHRcdFx0dHdvc1tkLmlkXSA9IHR3by5tYWtlUmVjdGFuZ2xlIC0yLC0yLDQsNFxuXHRcdFx0XHRcdFx0XHRcdHR3b3NbZC5pZF0uZmlsbCA9IGQuY29sb3Jcblx0XHRcdFx0XHRcdFx0XHR0d29zW2QuaWRdLnN0cm9rZSA9ICd3aGl0ZSdcblxuXHRcdFx0XHRcdGZvciBkIGluIGRhdGFcblx0XHRcdFx0XHRcdGlmICFuZXdfbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBtYXBbZC5pZF1cblx0XHRcdFx0XHRcdFx0dHdvLnJlbW92ZSB0d29zW2QuaWRdXG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGlmICFlbnRlcltkLmlkXVxuXHRcdFx0XHRcdFx0XHRcdHR3by5hZGQgdHdvc1tkLmlkXVxuXHRcdFx0XHRcdFx0XHR0d29zW2QuaWRdLnRyYW5zbGF0aW9uLnNldCBkLngqNywgZC55KjdcblxuXHRcdFx0XHRcdHR3by51cGRhdGUoKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdCMgLmF0dHIgXG5cdFx0XHRcdFx0LmNsYXNzZWQgJ29uJywgKGQpLT4gZD09bmV3VmFsXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdzaWduYWxEZXInLHNpZ25hbERlclxuXHQuZGlyZWN0aXZlICd0d29EZXInLHR3b0RlclxuXHQuZGlyZWN0aXZlICdtZmREZXInLHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5kaXJlY3RpdmUgJ2NhbkRlcicsIGNhbkRlclxuXG5cblxuIyBjYW5EZXIgPSAtPlxuIyBcdGRpcmVjdGl2ZSA9IFxuIyBcdFx0c2NvcGU6IFxuIyBcdFx0XHRjYXJzOiAnPSdcbiMgXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG5cbiMgXHRcdFx0Y3R4ID0gZDMuc2VsZWN0IGVsWzBdXG4jIFx0XHRcdFx0XHQuYXBwZW5kICdjYW52YXMnXG4jIFx0XHRcdFx0XHQuYXR0clxuIyBcdFx0XHRcdFx0XHR3aWR0aDogNzAwXG4jIFx0XHRcdFx0XHRcdGhlaWdodDogNzAwXG4jIFx0XHRcdFx0XHQubm9kZSgpXG4jIFx0XHRcdFx0XHQuZ2V0Q29udGV4dCAnMmQnXG5cbiMgXHRcdFx0Y3R4LmZSZWN0PSAoeCx5LHcsaCktPlxuIyBcdFx0XHRcdHggPSBwYXJzZUludCB4XG4jIFx0XHRcdFx0eSA9IHBhcnNlSW50IHlcbiMgXHRcdFx0XHRjdHguZmlsbFJlY3QgeCx5LHcsaFxuXG4jIFx0XHRcdGN0eC5zUmVjdCA9ICh4LHksdyxoKS0+XG4jIFx0XHRcdFx0eCA9IC41K3BhcnNlSW50IHhcbiMgXHRcdFx0XHR5ID0gLjUrcGFyc2VJbnQgeVxuIyBcdFx0XHRcdGN0eC5zdHJva2VSZWN0IHgseSx3LGhcblxuIyBcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiMgXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG4jIFx0XHRcdFx0XHRTLnRpbWVcbiMgXHRcdFx0XHQsIC0+XG4jIFx0XHRcdFx0XHRjdHguY2xlYXJSZWN0IDAsIDAsIDcwMCw3MDBcbiMgXHRcdFx0XHRcdF8uZm9yRWFjaCBzY29wZS5jYXJzLCAoYyktPlxuIyBcdFx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYy5jb2xvclxuIyBcdFx0XHRcdFx0XHR7eCx5fSA9IGNcbiMgXHRcdFx0XHRcdFx0Y3R4LmZSZWN0IHgqNyx5KjcsNCw0XG4jIFx0XHRcdFx0XHRcdGN0eC5zUmVjdCB4KjcseSo3LDQsNFxuXG5cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL21vZGVscy9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdHBhcmFtcyA9IFxuXHRcdFx0d2lkdGg6IEB3aWR0aFxuXHRcdFx0aGVpZ2h0OiBAaGVpZ2h0XG5cdFx0XHR0eXBlOiBUd28uVHlwZXMud2ViZ2xcblxuXHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0IyAuYXBwZW5kICdkaXYnXG5cdFx0XHQjIC5zZWxlY3QgJy5nLW1haW4nXG5cdFx0XHQjIC5hcHBlbmQgJ2ZvcmVpZ25PYmplY3QnXG5cdFx0XHQjIC5hcHBlbmQgJ2Rpdidcblx0XHRcdCMgLnN0eWxlICdwb3NpdGlvbicsJ2Fic29sdXRlJ1xuXHRcdFx0IyAuYXR0ciAnd2lkdGgnLEB3aWR0aFxuXHRcdFx0IyAuYXR0ciAnaGVpZ2h0JyxAaGVpZ2h0XG5cdFx0XHQuYXBwZW5kIFwiZGl2XCJcblx0XHRcdC5zdHlsZVxuXHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJ1xuXHRcdFx0XHRsZWZ0OiBAbS5sXG5cdFx0XHRcdHRvcDogQG0udFxuXHRcdFx0IyAuc3R5bGUgJ3Bvc2l0aW9uJywnYWJzb2x1dGUnXG5cblx0XHR0d28gPSBuZXcgVHdvIHBhcmFtc1xuXHRcdFx0LmFwcGVuZFRvIHNlbC5ub2RlKClcblx0XHRcdCMgLlxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2Fyc11cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouMl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdGRhdGEgPSBbXVxuXHRcdG1hcCA9IHt9XG5cdFx0dHdvcyA9IHt9XG5cblx0XHRAc2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFMudGltZVxuXHRcdFx0LCAobmV3RCk9PlxuXHRcdFx0XHRuZXdEID0gQG1lbW9yeVxuXHRcdFx0XHRuZXdfbWFwID0ge31cblx0XHRcdFx0Zm9yIGQsaSBpbiBuZXdEXG5cdFx0XHRcdFx0bmV3X21hcFtkLmlkXSA9IGRcblx0XHRcdFx0XHRpZiAhbWFwW2QuaWRdXG5cdFx0XHRcdFx0XHRkYXRhLnB1c2ggZFxuXHRcdFx0XHRcdFx0bWFwW2QuaWRdID0gZFxuXHRcdFx0XHRcdFx0dCA9IHR3b3NbZC5pZF0gPSB0d28ubWFrZUNpcmNsZSAwLDAsNFxuXHRcdFx0XHRcdFx0dC5maWxsID0gJyMwM0E5RjQnXG5cdFx0XHRcdFx0XHR0LnN0cm9rZSA9ICd3aGl0ZSdcblxuXHRcdFx0XHRmb3IgZCxpIGluIGRhdGFcblx0XHRcdFx0XHRpZiAhbmV3X21hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlIG1hcFtkLmlkXVxuXHRcdFx0XHRcdFx0ZGVsZXRlICh0ID0gdHdvc1tkLmlkXSlcblx0XHRcdFx0XHRcdHR3by5yZW1vdmUgdFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHQgPSB0d29zW2QuaWRdXG5cdFx0XHRcdFx0XHR0Lm9wYWNpdHkgPSAoaS9uZXdELmxlbmd0aClcblx0XHRcdFx0XHRcdHQudHJhbnNsYXRpb24uc2V0IEBob3IoZC5uKSwgQHZlcihkLmYpXG5cblx0XHRcdFx0dHdvLnVwZGF0ZSgpXG5cblx0XHQjIEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdCMgXHQueCAoZCk9PkBob3IgZC5uXG5cdFx0IyBcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA1XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAb3JpZyxAcGVybV90dXJucyxAZGVzKS0+XG5cdFx0I2RlcyBpcyBhbiBpbnRlcnNlY3Rpb25cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LDMwMFxuXHRcdFx0Y29sb3I6IF8uc2FtcGxlIEBjb2xvcnNcblxuXHRpc19kZXN0aW5hdGlvbjogKGkpLT5cblx0XHRpLmlkID09IEBkZXMuaWRcblxuXHRjb2xvcnM6IFsnIzAzQTlGNCcsJyMwM0E5RjQnLCcjOEJDMzRBJywnI0ZGNTcyMicsJyM2MDdEOEInLCcjM0Y1MUI1JywnIzRDQUY1MCcsJyM2NTFGRkYnLCcjMURFOUI2J11cblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGNvc3QwOiBAY29zdFxuXHRcdFx0ZW50ZXJlZDogZmFsc2Vcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGNlbGw6IHVuZGVmaW5lZFxuXHRcdFx0dF9lbjogTWF0aC5tYXggMCwoQHRhcmdldCArIF8ucmFuZG9tIC0yLDIpXG5cdFx0XHR0dXJuczogXy5zaHVmZmxlIF8uY2xvbmUgQHBlcm1fdHVybnNcblxuXHRzZXRfeHk6IChAeCxAeSxAeDIsQHkyKS0+XG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0IDwgQGNvc3QwXG5cdFx0XHRbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGRpcmVjdGlvbiA9ICd1cF9kb3duJ1xuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+PSAoUy5waGFzZSArIF8ucmFuZG9tIC01LDUpXG5cdFx0XHRbQGNvdW50LCBAZGlyZWN0aW9uXSA9IFswLCAndXBfZG93biddICNhZGQgb2Zmc2V0IGxhdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAY291bnQgPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBkaXJlY3Rpb24gPSAnbGVmdF9yaWdodCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGRheV9zdGFydDogLT5cblx0XHRAc2lnbmFsLmNvdW50ID0gMFxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBwb3MsQF9wb3MpLT5cblx0XHRcdEB4ID0gQHBvcy54XG5cdFx0XHRAeSA9IEBwb3MueVxuXHRcdFx0QHgyID0gTWF0aC5mbG9vciBAX3Bvcy54XG5cdFx0XHRAeTIgPSBNYXRoLmZsb29yIEBfcG9zLnlcblx0XHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdHNwYWNlOiBTLnNwYWNlXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF94eSBAeCxAeSxAeDIsQHkyXG5cdFx0QGxhc3Q9Uy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmIEBjYXJcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGJlZy5zZXRfYmVnX2xhbmUgdGhpc1xuXHRcdEBlbmQuc2V0X2VuZF9sYW5lIHRoaXNcblx0XHRAc2V0dXAoKVxuXHRcdEByb3cgPSBNYXRoLm1pbiBAYmVnLnJvdyxAZW5kLnJvd1xuXHRcdEBjb2wgPSBNYXRoLm1pbiBAYmVnLmNvbCxAZW5kLmNvbFxuXG5cdGRheV9zdGFydDotPlxuXHRcdGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5jYXIgPSBjZWxsLnRlbXBfY2FyID0gZmFsc2Vcblx0XHRcdGNlbGwubGFzdCA9IC1JbmZpbml0eVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0QGNlbGxzWzBdLmlzX2ZyZWUoKVxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY2VsbHNbMF0ucmVjZWl2ZSBjYXJcblxuXHRzZXR1cDogLT5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnlcblxuXHRcdHN3aXRjaCBAZGlyZWN0aW9uXG5cdFx0XHR3aGVuICd1cCdcblx0XHRcdFx0YS54Kytcblx0XHRcdFx0Yi54Kytcblx0XHRcdFx0YS55LT0yXG5cdFx0XHRcdGIueSs9MlxuXHRcdFx0d2hlbiAncmlnaHQnXG5cdFx0XHRcdGEueCs9MlxuXHRcdFx0XHRiLngtPTJcblx0XHRcdFx0YS55Kytcblx0XHRcdFx0Yi55Kytcblx0XHRcdHdoZW4gJ2Rvd24nXG5cdFx0XHRcdGEueC0tXG5cdFx0XHRcdGIueC0tXG5cdFx0XHRcdGEueSs9MlxuXHRcdFx0XHRiLnktPTJcblx0XHRcdHdoZW4gJ2xlZnQnXG5cdFx0XHRcdGEueC09MlxuXHRcdFx0XHRiLngrPTJcblx0XHRcdFx0YS55LS1cblx0XHRcdFx0Yi55LS1cblxuXHRcdHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsUy5sYW5lX2xlbmd0aC0xXVxuXHRcdFx0LnJhbmdlIFthLGJdXG5cdFx0XHRcblx0XHRzY2FsZTIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoLTFdXG5cdFx0XHQucmFuZ2UgW0BiZWcucG9zLEBlbmQucG9zXVxuXG5cdFx0W0BhLEBiXT1bYSxiXVxuXG5cdFx0QGNlbGxzID0gWzAuLihTLmxhbmVfbGVuZ3RoLTEpXS5tYXAgKG4pPT4gXG5cdFx0XHRwb3MgPSBzY2FsZSBuXG5cdFx0XHRfcG9zID0gc2NhbGUyIG5cblx0XHRcdG5ldyBDZWxsIHBvcyxfcG9zXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZVxuIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHNpemU6IDEwXG5cdFx0XHRzdG9wcGluZ190aW1lOiA1XG5cdFx0XHRwYWNlOiAxXG5cdFx0XHRzcGFjZTogNFxuXHRcdFx0cGhhc2U6IDgwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdGxhbmVfbGVuZ3RoOiAxMFxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fY2FyczogNDAwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRmcmVxdWVuY3k6IDI1XG5cdFx0XHRkYXk6IDBcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSIsIiFfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5MYW5lID0gcmVxdWlyZSAnLi9sYW5lJ1xuSW50ZXJzZWN0aW9uID0gcmVxdWlyZSAnLi9pbnRlcnNlY3Rpb24nXG4jIFNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aW50ZXJzZWN0aW9uczogW11cblx0XHRcdGxhbmVzOiBbXVxuXHRcdFx0b3V0ZXI6IFtdXG5cdFx0XHRpbm5lcjogW11cblx0XHRcdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblx0XHRcdGNhcnM6IFtdXG5cblx0XHRAZ3JpZCA9IFswLi4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLi5TLnNpemVdLm1hcCAoY29sKT0+XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggKGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24gcm93LGNvbClcblx0XHRcdFx0aW50ZXJzZWN0aW9uXG5cblx0XHRmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0Zm9yIGRpciBpbiBAZGlyZWN0aW9uc1xuXHRcdFx0XHRqID0gc3dpdGNoIGRpclxuXHRcdFx0XHRcdHdoZW4gJ3VwJyB0aGVuIEBncmlkW2kucm93LTFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wrMV1cblx0XHRcdFx0XHR3aGVuICdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbC0xXVxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIChsYW5lPW5ldyBMYW5lIGksaixkaXIpXG5cdFx0XHRcdFx0aWYgKDA8aS5yb3c8KFMuc2l6ZS0xKSkgYW5kICgwPGkuY29sPChTLnNpemUtMSkpXG5cdFx0XHRcdFx0XHRAaW5uZXIucHVzaCBpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aWYgKGkucm93PjApIG9yIChpLmNvbD4wKVxuXHRcdFx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpXG5cdFx0XHRcdFx0XHRcdGkub3V0ZXIgPSB0cnVlXG5cblx0XHRAY3JlYXRlX2NhcigpIGZvciBpIGluIFswLi4uUy5udW1fY2Fyc11cblxuXHRjcmVhdGVfY2FyOiAtPlxuXHRcdGEgPSBfLnNhbXBsZSBAb3V0ZXJcblx0XHRiID0gXy5zYW1wbGUgQGlubmVyXG5cdFx0dWQgPSBpZiBiLnJvdyA8IGEucm93IHRoZW4gJ3VwJyBlbHNlICdkb3duJ1xuXHRcdGxyID0gaWYgYi5jb2wgPCBhLmNvbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblx0XHR1ZHMgPSAodWQgZm9yIGkgaW4gWzAuLi5NYXRoLmFicyhiLnJvdy1hLnJvdyldKVxuXHRcdGxycyA9IChsciBmb3IgaSBpbiBbMC4uLk1hdGguYWJzKGIuY29sLWEuY29sKV0pXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5mbGF0dGVuKFt1ZHMsbHJzXSlcblx0XHRjYXIgPSBuZXcgQ2FyIGEsdHVybnMsYlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0dGlja19sYW5lOiAobGFuZSktPlxuXHRcdG51bV9tb3ZpbmcgPSAwXG5cdFx0ayA9IGxhbmUuY2VsbHNcblx0XHRpZiAoY2FyPWtbay5sZW5ndGgtMV0uY2FyKVxuXHRcdFx0aWYgbGFuZS5lbmQuY2FuX2dvIGxhbmUuZGlyZWN0aW9uXG5cdFx0XHRcdGlmIEB0dXJuX2NhciBjYXIsIGxhbmUuZW5kXG5cdFx0XHRcdFx0a1trLmxlbmd0aC0xXS5yZW1vdmUoKVxuXHRcdFx0XHRcdG51bV9tb3ZpbmcrK1xuXG5cdFx0Zm9yIGNlbGwsaSBpbiBrWzAuLi5rLmxlbmd0aC0xXVxuXHRcdFx0XHR0YXJnZXQgPSBrW2krMV1cblx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKSBhbmQgKGNhcj1jZWxsLmNhcilcblx0XHRcdFx0XHRudW1fbW92aW5nKytcblx0XHRcdFx0XHR0YXJnZXQucmVjZWl2ZSBjYXJcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0bnVtX21vdmluZ1xuXG5cdHR1cm5fY2FyOiAoY2FyLGkpLT5cblx0XHRpZiBjYXIuZGVzLmlkID09IGkuaWRcblx0XHRcdGNhci5leGl0ZWQgPSB0cnVlXG5cdFx0XHRjYXIudF9leCA9IFMudGltZVxuXHRcdFx0dHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdGxhbmUgPSBpLmJlZ19sYW5lc1tjYXIudHVybnNbMF1dXG5cdFx0XHRpZiBsYW5lLmlzX2ZyZWUoKVxuXHRcdFx0XHRsYW5lLnJlY2VpdmUgY2FyXG5cdFx0XHRcdGNhci5lbnRlcmVkPXRydWVcblx0XHRcdFx0Y2FyLnR1cm5zLnNoaWZ0KClcblx0XHRcdFx0dHJ1ZVxuXG5cdHRpY2s6IC0+XG5cdFx0aS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRudW1fbW92aW5nID0gXy5zdW0gKEB0aWNrX2xhbmUgbGFuZSBmb3IgbGFuZSBpbiBAbGFuZXMpXG5cblx0XHRmb3IgY2FyIGluIEB3YWl0aW5nXG5cdFx0XHRpZiBjYXIudF9lbjxTLnRpbWUgdGhlbiBAdHVybl9jYXIgY2FyLGNhci5vcmlnXG5cblx0XHRmb3IgbCBpbiBAbGFuZXNcblx0XHRcdGZvciBjIGluIGwuY2VsbHNcblx0XHRcdFx0Yy5maW5hbGl6ZSgpXG5cblx0XHRAd2FpdGluZyA9IF8uZmlsdGVyIEBjYXJzLChjKS0+ICFjLmVudGVyZWRcblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQGNhcnMsIChjKS0+IGMuZW50ZXJlZCBhbmQgIWMuZXhpdGVkXG5cblx0XHRpZiBTLnRpbWUgJVMuZnJlcXVlbmN5ID09MFxuXHRcdFx0QG1lbW9yeS5wdXNoIFxuXHRcdFx0XHRuOiBAdHJhdmVsaW5nLmxlbmd0aFxuXHRcdFx0XHR2OiBudW1fbW92aW5nL0B0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHRcdGY6IG51bV9tb3Zpbmdcblx0XHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXG5cdGxvZzogLT5cblx0XHRAY3VtLnB1c2hcblx0XHRcdHRpbWU6IFMudGltZVxuXHRcdFx0Y3VtRW46IFMubnVtX2NhcnMgLSBAd2FpdGluZy5sZW5ndGggXG5cdFx0XHRjdW1FeDogUy5udW1fY2FycyAtIEB0cmF2ZWxpbmcubGVuZ3RoLUB3YWl0aW5nLmxlbmd0aFxuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHRkYXlfZW5kOi0+XG5cdFx0Yy5ldmFsX2Nvc3QoKSBmb3IgYyBpbiBAY2Fyc1xuXHRcdGMuY2hvb3NlKCkgZm9yIGMgaW4gXy5zYW1wbGUgQGNhcnMsIDI1XG5cblx0ZGF5X3N0YXJ0Oi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSBAY2Fyc1xuXHRcdGZvciBpbnRlcnNlY3Rpb24gaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdGludGVyc2VjdGlvbi5kYXlfc3RhcnQoKSBcblx0XHRmb3IgbGFuZSBpbiBAbGFuZXNcblx0XHRcdGxhbmUuZGF5X3N0YXJ0KClcblx0XHRmb3IgY2FyIGluIEBjYXJzXG5cdFx0XHRjYXIuZGF5X3N0YXJ0KClcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljIl19
