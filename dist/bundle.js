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
    d3.timer.flush();
    this.paused = false;
    return this.tick();
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('signalDer', signalDer);



},{"./models/settings":5,"./models/traffic":7,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Car, S, _;

_ = require('lodash');

S = require('./settings');

Car = (function() {
  function Car(turns, d_loc) {
    this.turns = turns;
    this.d_loc = d_loc;
    this.id = _.uniqueId('car-');
    this.stopped = 0;
    this.color = _.sample(this.colors);
  }

  Car.prototype.subtract_stop = function() {
    return this.stopped--;
  };

  Car.prototype.at_destination = function() {
    return (this.turns.length === 0) && (this.loc === this.d_loc);
  };

  Car.prototype.colors = ['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5'];

  Car.prototype.set_at_intersection = function(at_intersection) {
    this.at_intersection = at_intersection;
  };

  Car.prototype.set_lane = function(lane) {
    this.lane = lane;
  };

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.advance = function() {
    return this.loc++;
  };

  Car.prototype.set_xy = function(pos) {
    return this.x = pos.x, this.y = pos.y, pos;
  };

  return Car;

})();

module.exports = Car;



},{"./settings":5,"lodash":undefined}],3:[function(require,module,exports){
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



},{"./settings":5,"./signal":6,"lodash":undefined}],4:[function(require,module,exports){
var Lane, S, _, d3;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Lane = (function() {
  function Lane(beg, end, direction) {
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.length = S.lane_length - 1;
    this.beg.set_beg_lane(this);
    this.end.set_end_lane(this);
    this.cars = [];
    this.setup();
  }

  Lane.prototype.setup = function() {
    var a, b;
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
    return this.scale = d3.scale.linear().domain([0, S.lane_length]).range([(this.a = a), (this.b = b)]);
  };

  Lane.prototype.is_free = function() {
    if (this.cars.length === 0) {
      return true;
    } else {
      return this.cars[0].loc > 0;
    }
  };

  Lane.prototype.move_car = function(car) {
    var target;
    if (car.loc === this.length) {
      if (this.end.can_go(this.direction)) {
        target = this.end.beg_lanes[car.turns[0]];
        if (target.is_free()) {
          car.turns.shift();
          _.remove(this.cars, car);
          return target.receive(car);
        } else {
          return car.stop();
        }
      } else {
        return car.stop();
      }
    } else {
      car.advance();
      car.set_xy(this.scale(car.loc));
      if (car.at_destination()) {
        return _.remove(this.cars, car);
      }
    }
  };

  Lane.prototype.tick = function() {
    return _.forEach(this.cars, (function(_this) {
      return function(car, i, k) {
        if (car.stopped) {
          return car.subtract_stop();
        } else if (k[i + 1]) {
          if ((k[i + 1].loc - car.loc) >= S.space) {
            return _this.move_car(car);
          } else {
            return car.stop();
          }
        } else {
          return _this.move_car(car);
        }
      };
    })(this));
  };

  Lane.prototype.receive = function(car) {
    car.set_at_intersection(false);
    car.stopped = 0;
    car.loc = 0;
    this.cars.unshift(car);
    return car.set_xy(this.scale(car.loc));
  };

  Lane.prototype.remove = function(car) {
    return this.cars.splice(this.cars.indexOf(car));
  };

  return Lane;

})();

module.exports = Lane;



},{"./settings":5,"d3":undefined,"lodash":undefined}],5:[function(require,module,exports){
var S;

S = {
  size: 10,
  stopping_time: 5,
  pace: 100,
  space: 2,
  phase: 50,
  green: .5,
  lane_length: 10
};

module.exports = S;



},{}],6:[function(require,module,exports){
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



},{"./settings":5,"lodash":undefined}],7:[function(require,module,exports){
var Car, Intersection, Lane, S, Signal, Traffic, _;

_ = require('lodash');

S = require('./settings');

Lane = require('./lane');

Intersection = require('./intersection');

Signal = require('./signal');

Car = require('./car');

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.directions = ['up', 'right', 'down', 'left'];

  Traffic.prototype.create_car = function() {
    var a, b, car, k, l, lane, lr, lrs, ref, ref1, results, results1, turns, ud, uds;
    a = _.sample(this.outer);
    b = _.sample(this.inner);
    ud = b.row <= a.row ? 'up' : 'down';
    lr = b.col <= a.col ? 'left' : 'right';
    uds = _.map((function() {
      results = [];
      for (var k = 0, ref = Math.abs(b.row - a.row); 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this), function(i) {
      return ud;
    });
    lrs = _.map((function() {
      results1 = [];
      for (var l = 0, ref1 = Math.abs(b.col - a.col); 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results1.push(l); }
      return results1;
    }).apply(this), function(i) {
      return lr;
    });
    turns = _.shuffle(_.merge(uds, lrs));
    lane = a.beg_lanes[turns.shift()];
    car = new Car(turns, 0);
    lane.receive(car);
    return this.cars.push(car);
  };

  Traffic.prototype.setup = function() {
    var dir, i, j, k, l, len, len1, m, ref, ref1, ref2, ref3, results;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.cars = ref[2];
    this.outer = [];
    this.inner = [];
    this.grid = (function() {
      results = [];
      for (var k = 0, ref1 = S.size; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var k, ref1, results;
        return (function() {
          results = [];
          for (var k = 0, ref1 = S.size; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--){ results.push(k); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
          if ((0 < row && row < S.size) && (0 < col && col < S.size)) {
            _this.inner.push(intersection);
          } else {
            _this.outer.push(intersection);
          }
          return intersection;
        });
      };
    })(this));
    ref2 = this.intersections;
    for (l = 0, len = ref2.length; l < len; l++) {
      i = ref2[l];
      ref3 = this.directions;
      for (m = 0, len1 = ref3.length; m < len1; m++) {
        dir = ref3[m];
        j = (function() {
          var ref4, ref5;
          switch (dir) {
            case 'up':
              return (ref4 = this.grid[i.row - 1]) != null ? ref4[i.col] : void 0;
            case 'right':
              return this.grid[i.row][i.col + 1];
            case 'down':
              return (ref5 = this.grid[i.row + 1]) != null ? ref5[i.col] : void 0;
            case 'left':
              return this.grid[i.row][i.col - 1];
          }
        }).call(this);
        if (j) {
          this.lanes.push(new Lane(i, j, dir));
        }
      }
    }
    return this.create_car();
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.intersections, 'tick');
    return _.invoke(this.lanes, 'tick');
  };

  return Traffic;

})();

module.exports = Traffic;



},{"./car":2,"./intersection":3,"./lane":4,"./settings":5,"./signal":6,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvaW50ZXJzZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvbGFuZS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbW9kZWxzL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsbUJBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFSjtFQUNPLGNBQUMsTUFBRCxFQUFRLEdBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFPLElBQUMsQ0FBQSxLQUFEO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVztJQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixJQUFJO0VBSFY7O2lCQUtaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7V0FDVixZQUFBLEdBQWEsR0FBRyxDQUFDLENBQWpCLEdBQW1CLEdB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QixNQUFqQjtFQUZLOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuUyA9IHJlcXVpcmUgJy4vbW9kZWxzL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxAZWwpLT5cblx0XHRAcGF1c2VkID0gdHJ1ZVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBzY29wZS50cmFmZmljID0gbmV3IFRyYWZmaWNcblxuXHRwbGFjZV9jYXI6IChjYXIpLT5cblx0XHRcInRyYW5zbGF0ZSgje2Nhci54fSwje2Nhci55fSlcIlxuXG5cdHBsYWNlX2ludGVyc2VjdGlvbjogKGQpLT5cblx0XHRcInRyYW5zbGF0ZSgje2QucG9zLnh9LCN7ZC5wb3MueX0pXCJcblxuXHRwbGFjZV9sYW5lOiAoZCktPlxuXHRcdFwiTSAje2QuYS54fSwje2QuYS55fSBMICN7ZC5iLnh9LCN7ZC5iLnl9XCJcdFx0XG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdEBzY29wZS50cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHR0cnVlXG5cdFx0XHQsIFMucGFjZVxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbnNpZ25hbERlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGRpcmVjdGlvbjonPSdcblx0XHRsaW5rOihzY29wZSxlbCxhdHRyKS0+XG5cdFx0XHRzaWduYWxzID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3RBbGwgJ3NpZ25hbHMnXG5cdFx0XHRcdC5kYXRhIFsndXBfZG93bicsJ2xlZnRfcmlnaHQnLCd1cF9kb3duJywnbGVmdF9yaWdodCddXG5cdFx0XHRcdC5lbnRlcigpXG5cdFx0XHRcdC5hcHBlbmQgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyXG5cdFx0XHRcdFx0d2lkdGg6IDEuMlxuXHRcdFx0XHRcdGhlaWdodDogLjZcblx0XHRcdFx0XHRjbGFzczogJ3NpZ25hbCdcblx0XHRcdFx0XHR5OiAtMS4yXG5cdFx0XHRcdFx0eDotLjZcblx0XHRcdFx0XHR0cmFuc2Zvcm06IChkLGkpLT5cblx0XHRcdFx0XHRcdFwicm90YXRlKCN7OTAqaX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdkaXJlY3Rpb24nLChuZXdWYWwpLT5cblx0XHRcdFx0c2lnbmFsc1xuXHRcdFx0XHRcdC5jbGFzc2VkICdvbicsIChkKS0+IGQ9PW5ld1ZhbFxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnc2lnbmFsRGVyJyxzaWduYWxEZXJcblx0IyAuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0IyAuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0IyAuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdCMgLmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcbiIsIl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjogKEB0dXJucyxAZF9sb2MpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdEBzdG9wcGVkID0gMFxuXHRcdEBjb2xvciA9IF8uc2FtcGxlIEBjb2xvcnNcblxuXHRzdWJ0cmFjdF9zdG9wOi0+XG5cdFx0QHN0b3BwZWQtLVxuXG5cdGF0X2Rlc3RpbmF0aW9uOiAtPlxuXHRcdChAdHVybnMubGVuZ3RoID09IDApIGFuZCAoQGxvYz09QGRfbG9jKVxuXG5cdGNvbG9yczogWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXG5cdHNldF9hdF9pbnRlcnNlY3Rpb246IChAYXRfaW50ZXJzZWN0aW9uKS0+XG5cblx0c2V0X2xhbmU6IChAbGFuZSktPlxuXG5cdHN0b3A6IC0+XG5cdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWUgXG5cblx0YWR2YW5jZTotPlxuXHRcdEBsb2MrK1xuXG5cdHNldF94eTogKHBvcyktPlxuXHRcdHtAeCxAeX0gPSBwb3NcblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJfID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcblxuY2xhc3MgSW50ZXJzZWN0aW9uXG5cdGNvbnN0cnVjdG9yOihAcm93LEBjb2wpLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdpbnRlcnNlY3Rpb24tJ1xuXHRcdFtAYmVnX2xhbmVzLEBlbmRfbGFuZXNdID0gW3t9LHt9XVxuXG5cdFx0QHBvcyA9IFxuXHRcdFx0eDogQGNvbCoxMDAvUy5zaXplXG5cdFx0XHR5OiBAcm93KjEwMC9TLnNpemVcblxuXHRcdEBzaWduYWwgPSBuZXcgU2lnbmFsXG5cblx0XHRAZGlyZWN0aW9ucyA9IFxuXHRcdFx0J3VwX2Rvd24nOiBbJ3VwJywnZG93biddXG5cdFx0XHQnbGVmdF9yaWdodCc6IFsnbGVmdCcsJ3JpZ2h0J11cblxuXHRzZXRfYmVnX2xhbmU6IChsYW5lKS0+XG5cdFx0QGJlZ19sYW5lc1tsYW5lLmRpcmVjdGlvbl0gPSBsYW5lXG5cblx0c2V0X2VuZF9sYW5lOiAobGFuZSktPlxuXHRcdEBlbmRfbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdGNhbl9nbzogKGRpcmVjdGlvbiktPlxuXHRcdGRpcmVjdGlvbiBpbiBAZGlyZWN0aW9uc1tAc2lnbmFsLmRpcmVjdGlvbl1cblxuXHR0aWNrOiAtPlxuXHRcdEBzaWduYWwudGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJzZWN0aW9uIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXHRcdEBiZWcuc2V0X2JlZ19sYW5lIHRoaXNcblx0XHRAZW5kLnNldF9lbmRfbGFuZSB0aGlzXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBzZXR1cCgpXG5cblx0c2V0dXA6IC0+XG5cdFx0YSA9IFxuXHRcdFx0eDogQGJlZy5wb3MueFxuXHRcdFx0eTogQGJlZy5wb3MueVxuXG5cdFx0YiA9IFxuXHRcdFx0eDogQGVuZC5wb3MueCAgXG5cdFx0XHR5OiBAZW5kLnBvcy55XG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxTLmxhbmVfbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFsoQGE9YSksKEBiPWIpXVxuXG5cdGlzX2ZyZWU6LT5cblx0XHRpZiBAY2Fycy5sZW5ndGg9PTBcblx0XHRcdHRydWVcblx0XHRlbHNlXG5cdFx0XHRAY2Fyc1swXS5sb2M+MFxuXG5cdG1vdmVfY2FyOiAoY2FyKS0+XG5cdFx0aWYgY2FyLmxvYyA9PSBAbGVuZ3RoXG5cdFx0XHRpZiBAZW5kLmNhbl9nbyBAZGlyZWN0aW9uXG5cdFx0XHRcdHRhcmdldCA9IEBlbmQuYmVnX2xhbmVzW2Nhci50dXJuc1swXV1cblx0XHRcdFx0aWYgdGFyZ2V0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNhci50dXJucy5zaGlmdCgpXG5cdFx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXHRcdFx0XHRcdHRhcmdldC5yZWNlaXZlIGNhclxuXHRcdFx0XHRlbHNlIFxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2UgXG5cdFx0XHRcdGNhci5zdG9wKClcblx0XHRlbHNlIFxuXHRcdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdFx0Y2FyLnNldF94eSBAc2NhbGUgY2FyLmxvY1xuXHRcdFx0aWYgY2FyLmF0X2Rlc3RpbmF0aW9uKClcblx0XHRcdFx0Xy5yZW1vdmUgQGNhcnMsIGNhclxuXG5cdHRpY2s6IC0+XG5cdFx0Xy5mb3JFYWNoIEBjYXJzLChjYXIsaSxrKT0+XG5cdFx0XHRpZiBjYXIuc3RvcHBlZFxuXHRcdFx0XHRjYXIuc3VidHJhY3Rfc3RvcCgpXG5cdFx0XHRlbHNlIGlmIGtbaSsxXVxuXHRcdFx0XHRpZiAoa1tpKzFdLmxvYy1jYXIubG9jKT49Uy5zcGFjZVxuXHRcdFx0XHRcdEBtb3ZlX2NhciBjYXJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNhci5zdG9wKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QG1vdmVfY2FyIGNhclxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRjYXIuc2V0X2F0X2ludGVyc2VjdGlvbiBmYWxzZVxuXHRcdGNhci5zdG9wcGVkID0gMFxuXHRcdGNhci5sb2MgPSAwXG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblx0XHRjYXIuc2V0X3h5IEBzY2FsZSBjYXIubG9jXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGNhcnMuc3BsaWNlIEBjYXJzLmluZGV4T2YgY2FyXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5lXG4iLCJTID1cblx0c2l6ZTogMTBcblx0c3RvcHBpbmdfdGltZTogNVxuXHRwYWNlOiAxMDBcblx0c3BhY2U6IDJcblx0cGhhc2U6IDUwXG5cdGdyZWVuOiAuNVxuXHRsYW5lX2xlbmd0aDogMTBcblxubW9kdWxlLmV4cG9ydHMgPSBTIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBkaXJlY3Rpb24gPSAndXBfZG93bidcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0W0Bjb3VudCwgQGRpcmVjdGlvbl0gPSBbMCwgJ3VwX2Rvd24nXSAjYWRkIG9mZnNldCBsYXRlclxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZGlyZWN0aW9uID0gJ2xlZnRfcmlnaHQnXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTGFuZSA9IHJlcXVpcmUgJy4vbGFuZSdcbkludGVyc2VjdGlvbiA9IHJlcXVpcmUgJy4vaW50ZXJzZWN0aW9uJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRkaXJlY3Rpb25zOiBbJ3VwJywncmlnaHQnLCdkb3duJywnbGVmdCddXG5cblx0Y3JlYXRlX2NhcjogLT5cblx0XHRhID0gXy5zYW1wbGUgQG91dGVyXG5cdFx0YiA9IF8uc2FtcGxlIEBpbm5lclxuXHRcdHVkID0gaWYgYi5yb3cgPD0gYS5yb3cgdGhlbiAndXAnIGVsc2UgJ2Rvd24nXG5cdFx0bHIgPSBpZiBiLmNvbCA8PSBhLmNvbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblx0XHR1ZHMgPSBfLm1hcCBbMC4uTWF0aC5hYnMoYi5yb3ctYS5yb3cpXSwoaSktPiB1ZFxuXHRcdGxycyA9IF8ubWFwIFswLi5NYXRoLmFicyhiLmNvbC1hLmNvbCldLChpKS0+IGxyXG5cdFx0dHVybnMgPSBfLnNodWZmbGUgXy5tZXJnZSB1ZHMsbHJzXG5cdFx0bGFuZSA9IGEuYmVnX2xhbmVzW3R1cm5zLnNoaWZ0KCldXG5cdFx0Y2FyID0gbmV3IENhciB0dXJucywwXG5cdFx0bGFuZS5yZWNlaXZlIGNhclxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cblx0c2V0dXA6LT5cblx0XHRbQGludGVyc2VjdGlvbnMsQGxhbmVzLEBjYXJzXSA9IFtbXSxbXSxbXV1cblx0XHRAb3V0ZXIgPSBbXVxuXHRcdEBpbm5lciA9IFtdXG5cblx0XHRAZ3JpZCA9IFswLi5TLnNpemVdLm1hcCAocm93KT0+XG5cdFx0XHRbMC4uUy5zaXplXS5tYXAgKGNvbCk9PlxuXHRcdFx0XHRAaW50ZXJzZWN0aW9ucy5wdXNoIChpbnRlcnNlY3Rpb24gPSBuZXcgSW50ZXJzZWN0aW9uIHJvdyxjb2wpXG5cdFx0XHRcdGlmIDA8cm93PFMuc2l6ZSBhbmQgMDxjb2w8Uy5zaXplXG5cdFx0XHRcdFx0QGlubmVyLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAb3V0ZXIucHVzaCBpbnRlcnNlY3Rpb25cblx0XHRcdFx0aW50ZXJzZWN0aW9uXG5cblx0XHRmb3IgaSBpbiBAaW50ZXJzZWN0aW9uc1xuXHRcdFx0Zm9yIGRpciBpbiBAZGlyZWN0aW9uc1xuXHRcdFx0XHRqID0gc3dpdGNoIGRpclxuXHRcdFx0XHRcdHdoZW4gJ3VwJyB0aGVuIEBncmlkW2kucm93LTFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiBAZ3JpZFtpLnJvd11baS5jb2wrMV1cblx0XHRcdFx0XHR3aGVuICdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbC0xXVxuXHRcdFx0XHRpZiBqIFxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIG5ldyBMYW5lIGksaixkaXJcblxuXHRcdEBjcmVhdGVfY2FyKClcblxuXHR0aWNrOiAtPlxuXHRcdF8uaW52b2tlIEBpbnRlcnNlY3Rpb25zLCd0aWNrJ1xuXHRcdF8uaW52b2tlIEBsYW5lcywgJ3RpY2snXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpYyJdfQ==
