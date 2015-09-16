(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, S, Traffic, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  size: 10,
  stopping_time: 5,
  pace: 100,
  space: 2
};

S.lane_length = 10;

Lane = (function() {
  function Lane(beg, end, direction) {
    var a, b, ref;
    this.beg = beg;
    this.end = end;
    this.direction = direction;
    this.id = _.uniqueId('lane-');
    this.length = S.lane_length - 1;
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
    ref = [a, b], this.a = ref[0], this.b = ref[1];
    this.scale = d3.scale.linear().domain([0, S.lane_length]).range([a, b]);
    this.cars = [];
  }

  Lane.prototype.is_free = function() {
    if (this.cars.length === 0) {
      return true;
    }
    return !(this.cars[0].loc === 0);
  };

  Lane.prototype.move_car = function(car, i, k) {
    var next_car;
    if (car.at_intersection) {
      return;
    }
    if (car.stopped) {
      return car.subtract_stop();
    }
    if (car.loc === this.length) {
      return this.end.receive(car);
    }
    if ((next_car = k[i + 1])) {
      if ((next_car.loc - car.loc) >= S.space) {
        car.advance();
        return car.set_xy(this.get_coords(car.loc));
      } else {
        return car.stop();
      }
    } else {
      car.advance();
      return car.set_xy(this.get_coords(car.loc));
    }
  };

  Lane.prototype.tick = function() {
    return _.forEach(this.cars, this.move_car, this);
  };

  Lane.prototype.receive = function(car) {
    return this.cars.unshift(car);
  };

  Lane.prototype.remove = function(car) {
    return this.cars.splice(this.cars.indexOf(car));
  };

  Lane.prototype.get_coords = function(loc) {
    return this.scale(loc);
  };

  return Lane;

})();

Car = (function() {
  function Car(lane1) {
    var ref;
    this.lane = lane1;
    this.id = _.uniqueId('car-');
    this.loc = _.random(2, 5);
    this.stopped = 0;
    this.lane.receive(this);
    this.set_at_intersection(false);
    this.color = _.sample(['#03A9F4', '#8BC34A', '#E91E63', '#FF5722', '#607D8B', '#3F51B5']);
    ref = this.lane.get_coords(this.loc), this.x = ref.x, this.y = ref.y;
  }

  Car.prototype.subtract_stop = function() {
    return this.stopped--;
  };

  Car.prototype.set_at_intersection = function(at_intersection) {
    this.at_intersection = at_intersection;
  };

  Car.prototype.set_lane = function(lane1) {
    this.lane = lane1;
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

  Car.prototype.reset_loc = function() {
    return this.loc = 0;
  };

  return Car;

})();

Intersection = (function() {
  function Intersection(row1, col1) {
    this.row = row1;
    this.col = col1;
    this.id = _.uniqueId('intersection-');
    this.lanes = {};
    this.cars = [];
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
  }

  Intersection.prototype.receive = function(car) {
    car.set_at_intersection(true);
    return this.cars.push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane.direction] = lane;
  };

  Intersection.prototype.turn_car = function(car, lane) {
    car.lane.remove(car);
    car.set_at_intersection(false);
    lane.receive(car);
    car.set_lane(lane);
    return car.reset_loc();
  };

  Intersection.prototype.tick = function() {
    var lane;
    if (this.cars.length > 0) {
      lane = _.sample(_.values(this.lanes));
      if (lane.is_free()) {
        return this.turn_car(this.cars.shift(), lane);
      }
    }
  };

  return Intersection;

})();

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.directions = ['up', 'right', 'down', 'left'];

  Traffic.prototype.setup = function() {
    var dir, i, j, l, lane, len, len1, m, n, ref, ref1, ref2, ref3, results;
    ref = [[], []], this.intersections = ref[0], this.lanes = ref[1];
    this.grid = (function() {
      results = [];
      for (var l = 0, ref1 = S.size; 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map((function(_this) {
      return function(row) {
        var l, ref1, results;
        return (function() {
          results = [];
          for (var l = 0, ref1 = S.size; 0 <= ref1 ? l <= ref1 : l >= ref1; 0 <= ref1 ? l++ : l--){ results.push(l); }
          return results;
        }).apply(this).map(function(col) {
          var intersection;
          _this.intersections.push((intersection = new Intersection(row, col)));
          return intersection;
        });
      };
    })(this));
    ref2 = this.intersections;
    for (m = 0, len = ref2.length; m < len; m++) {
      i = ref2[m];
      ref3 = this.directions;
      for (n = 0, len1 = ref3.length; n < len1; n++) {
        dir = ref3[n];
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
          this.lanes.push((lane = new Lane(i, j, dir)));
          i.set_beg_lane(lane);
        }
      }
    }
    return this.cars = _.map(this.lanes, function(lane) {
      return new Car(lane);
    });
  };

  Traffic.prototype.tick = function() {
    _.invoke(this.lanes, 'tick');
    return _.invoke(this.intersections, 'tick');
  };

  return Traffic;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    this.el = el;
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./mfd":6,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 250,
      height: 250,
      m: {
        t: 10,
        l: 40,
        r: 15,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, S.rush_length * 1.2]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars]).range([this.height, 0]);
    this.lineEn = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEn);
      };
    })(this));
    this.lineEx = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEx);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.ex = function() {
    return this.lineEx(this.cum);
  };

  Ctrl.prototype.en = function() {
    return this.lineEn(this.cum);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      cum: '='
    },
    templateUrl: './dist/chart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":7,"d3":undefined,"lodash":undefined}],3:[function(require,module,exports){
var angular, d3, der;

d3 = require('d3');

angular = require('angular');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      d3Der: '=',
      tran: '='
    },
    link: function(scope, el, attr) {
      var hasTransitioned, sel, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      hasTransitioned = false;
      return scope.$watch('d3Der', function(v) {
        if (scope.tran && hasTransitioned) {
          hasTransitioned = true;
          return sel.transition(u).attr(v).call(scope.tran);
        } else {
          hasTransitioned = true;
          return sel.attr(v);
        }
      }, true);
    }
  };
};

module.exports = der;



},{"angular":undefined,"d3":undefined}],4:[function(require,module,exports){
module.exports = function($parse) {
  return function(scope, el, attr) {
    return d3.select(el[0]).datum($parse(attr.datum)(scope));
  };
};



},{}],5:[function(require,module,exports){
'use strict';
Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};



},{}],6:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

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
    this.hor = d3.scale.linear().domain([0, S.num_cars * .8]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars * .55]).range([this.height, 0]);
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



},{"./settings":7,"d3":undefined,"lodash":undefined}],7:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

require('./helpers');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cars: 250,
      time: 0,
      space: 5,
      pace: 15,
      stopping_time: 6,
      distance: 60,
      beta: .5,
      gamma: 2,
      rush_length: 250,
      frequency: 8,
      rl: 1000,
      phase: 50,
      green: .5,
      wish: 150,
      num_signals: 10,
      day: 0,
      offset: 0
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.rl, this.rl / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.rl]).range([0, 360]);
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



},{"./helpers":5,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLElBQUEsRUFBTSxFQUFOO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxJQUFBLEVBQU0sR0FGTjtFQUdBLEtBQUEsRUFBTyxDQUhQOzs7QUFLRCxDQUFDLENBQUMsV0FBRixHQUFnQjs7QUFFVjtFQUNRLGNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxTQUFYO0FBQ1osUUFBQTtJQURhLElBQUMsQ0FBQSxNQUFEO0lBQUssSUFBQyxDQUFBLE1BQUQ7SUFBSyxJQUFDLENBQUEsWUFBRDtJQUN2QixJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWDtJQUNOLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLFdBQUYsR0FBYztJ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QUFVLEVBTFY7TUFNQSxJQUFBLEVBQU0sRUFOTjtNQU9BLEtBQUEsRUFBTyxDQVBQO01BUUEsV0FBQSxFQUFhLEdBUmI7TUFTQSxTQUFBLEVBQVcsQ0FUWDtNQVVBLEVBQUEsRUFBSSxJQVZKO01BV0EsS0FBQSxFQUFPLEVBWFA7TUFZQSxLQUFBLEVBQU8sRUFaUDtNQWFBLElBQUEsRUFBTSxHQWJOO01BY0EsV0FBQSxFQUFhLEVBZGI7TUFlQSxHQUFBLEVBQUssQ0FmTDtNQWdCQSxNQUFBLEVBQVEsQ0FoQlI7S0FERDtJQW1CQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1QsQ0FBQyxNQURRLENBQ0QsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVUsSUFBQyxDQUFBLEVBQVgsRUFBYyxJQUFDLENBQUEsRUFBRCxHQUFJLENBQWxCLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBV1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxFQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUEvQkU7O3FCQW1DWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUQ7V0FDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cblMgPVxuXHRzaXplOiAxMFxuXHRzdG9wcGluZ190aW1lOiA1XG5cdHBhY2U6IDEwMFxuXHRzcGFjZTogMlxuXG5TLmxhbmVfbGVuZ3RoID0gMTBcblxuY2xhc3MgTGFuZVxuXHRjb25zdHJ1Y3RvcjogKEBiZWcsQGVuZCxAZGlyZWN0aW9uKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnbGFuZS0nXG5cdFx0QGxlbmd0aCA9IFMubGFuZV9sZW5ndGgtMVxuXHRcdCMge0Byb3csQGNvbH0gPSBAZW5kXG5cblx0XHRhID0gXG5cdFx0XHR4OiBAYmVnLnBvcy54XG5cdFx0XHR5OiBAYmVnLnBvcy55XG5cblx0XHRiID0gXG5cdFx0XHR4OiBAZW5kLnBvcy54ICBcblx0XHRcdHk6IEBlbmQucG9zLnkgXG5cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnXG5cdFx0XHRcdGEueCsrXG5cdFx0XHRcdGIueCsrXG5cdFx0XHRcdGEueS09MlxuXHRcdFx0XHRiLnkrPTJcblx0XHRcdHdoZW4gJ3JpZ2h0J1xuXHRcdFx0XHRhLngrPTJcblx0XHRcdFx0Yi54LT0yXG5cdFx0XHRcdGEueSsrXG5cdFx0XHRcdGIueSsrXG5cdFx0XHR3aGVuICdkb3duJ1xuXHRcdFx0XHRhLngtLVxuXHRcdFx0XHRiLngtLVxuXHRcdFx0XHRhLnkrPTJcblx0XHRcdFx0Yi55LT0yXG5cdFx0XHR3aGVuICdsZWZ0J1xuXHRcdFx0XHRhLngtPTJcblx0XHRcdFx0Yi54Kz0yXG5cdFx0XHRcdGEueS0tXG5cdFx0XHRcdGIueS0tXG5cblx0XHRbQGEsQGJdID0gW2EsYl1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLFMubGFuZV9sZW5ndGhdXG5cdFx0XHQucmFuZ2UgW2EsYl1cblxuXG5cdFx0QGNhcnMgPSBbXVxuXG5cdGlzX2ZyZWU6LT5cblx0XHRpZiBAY2Fycy5sZW5ndGg9PTBcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0IShAY2Fyc1swXS5sb2M9PTApXG5cblx0bW92ZV9jYXI6IChjYXIsaSxrKS0+XG5cdFx0aWYgY2FyLmF0X2ludGVyc2VjdGlvblxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgY2FyLnN0b3BwZWRcblx0XHRcdHJldHVybiBjYXIuc3VidHJhY3Rfc3RvcCgpXG5cdFx0aWYgY2FyLmxvYyA9PSBAbGVuZ3RoXG5cdFx0XHRyZXR1cm4gQGVuZC5yZWNlaXZlIGNhclxuXHRcdGlmIChuZXh0X2Nhcj1rW2krMV0pXG5cdFx0XHRpZiAobmV4dF9jYXIubG9jLWNhci5sb2MpPj1TLnNwYWNlXG5cdFx0XHRcdGNhci5hZHZhbmNlKClcblx0XHRcdFx0Y2FyLnNldF94eSBAZ2V0X2Nvb3JkcyBjYXIubG9jXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRjYXIuc3RvcCgpXG5cdFx0ZWxzZVxuXHRcdFx0Y2FyLmFkdmFuY2UoKVxuXHRcdFx0Y2FyLnNldF94eSBAZ2V0X2Nvb3JkcyBjYXIubG9jXG5cblx0dGljazogLT5cblx0XHRfLmZvckVhY2ggQGNhcnMsQG1vdmVfY2FyLHRoaXNcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGNhcnMudW5zaGlmdCBjYXJcblxuXHRyZW1vdmU6IChjYXIpLT5cblx0XHRAY2Fycy5zcGxpY2UgQGNhcnMuaW5kZXhPZiBjYXJcblxuXHRnZXRfY29vcmRzOiAobG9jKS0+XG5cdFx0QHNjYWxlIGxvY1xuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAbGFuZSktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2Nhci0nXG5cdFx0QGxvYyA9IF8ucmFuZG9tIDIsNVxuXHRcdEBzdG9wcGVkID0gMFxuXHRcdCMgQG1vdmVfZmluYWwoKVxuXHRcdEBsYW5lLnJlY2VpdmUgdGhpc1xuXHRcdEBzZXRfYXRfaW50ZXJzZWN0aW9uIGZhbHNlXG5cdFx0QGNvbG9yID0gXy5zYW1wbGUgWycjMDNBOUY0JywnIzhCQzM0QScsJyNFOTFFNjMnLCcjRkY1NzIyJywnIzYwN0Q4QicsJyMzRjUxQjUnXVxuXHRcdHtAeCxAeX0gPSBAbGFuZS5nZXRfY29vcmRzIEBsb2NcblxuXHRzdWJ0cmFjdF9zdG9wOi0+XG5cdFx0QHN0b3BwZWQtLVxuXG5cdHNldF9hdF9pbnRlcnNlY3Rpb246IChAYXRfaW50ZXJzZWN0aW9uKS0+XG5cblx0c2V0X2xhbmU6IChAbGFuZSktPlxuXG5cdHN0b3A6IC0+XG5cdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWUgXG5cblx0YWR2YW5jZTotPlxuXHRcdEBsb2MrK1xuXG5cdHNldF94eTogKHBvcyktPlxuXHRcdHtAeCxAeX0gPSBwb3NcblxuXHRyZXNldF9sb2M6IC0+XG5cdFx0QGxvYz0wXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRAbGFuZXMgPSB7fVxuXHRcdEBjYXJzID0gW11cblx0XHRAcG9zID0gXG5cdFx0XHR4OiBAY29sKjEwMC9TLnNpemVcblx0XHRcdHk6IEByb3cqMTAwL1Muc2l6ZVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfYXRfaW50ZXJzZWN0aW9uIHRydWVcblx0XHRAY2Fycy5wdXNoIGNhclxuXG5cdHNldF9iZWdfbGFuZTogKGxhbmUpLT5cblx0XHRAbGFuZXNbbGFuZS5kaXJlY3Rpb25dID0gbGFuZVxuXG5cdHR1cm5fY2FyOihjYXIsbGFuZSktPlxuXHRcdGNhci5sYW5lLnJlbW92ZSBjYXJcblx0XHRjYXIuc2V0X2F0X2ludGVyc2VjdGlvbiBmYWxzZVxuXHRcdGxhbmUucmVjZWl2ZSBjYXJcblx0XHRjYXIuc2V0X2xhbmUgbGFuZVxuXHRcdGNhci5yZXNldF9sb2MoKVxuXG5cdHRpY2s6IC0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoID4gMFxuXHRcdFx0bGFuZSA9IF8uc2FtcGxlIF8udmFsdWVzIEBsYW5lc1xuXHRcdFx0aWYgbGFuZS5pc19mcmVlKClcblx0XHRcdFx0QHR1cm5fY2FyIEBjYXJzLnNoaWZ0KCksbGFuZVxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdGRpcmVjdGlvbnM6IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXNdID0gW1tdLFtdXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0QGludGVyc2VjdGlvbnMucHVzaCAoaW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sKVxuXHRcdFx0XHRpbnRlcnNlY3Rpb25cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIEBkaXJlY3Rpb25zXG5cdFx0XHRcdGogPSBzd2l0Y2ggZGlyXG5cdFx0XHRcdFx0d2hlbiAndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIEBncmlkW2kucm93XVtpLmNvbCsxXVxuXHRcdFx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQGdyaWRbaS5yb3crMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cblx0XHRcdFx0aWYgaiBcblx0XHRcdFx0XHRAbGFuZXMucHVzaCAobGFuZSA9IG5ldyBMYW5lIGksaixkaXIpICNpIGlzIHRoZSBlbmRcblx0XHRcdFx0XHRpLnNldF9iZWdfbGFuZSBsYW5lXG5cdFx0QGNhcnMgPSBfLm1hcCBAbGFuZXMsIChsYW5lKS0+bmV3IENhciBsYW5lXG5cblx0dGljazogLT5cblx0XHRfLmludm9rZSBAbGFuZXMsICd0aWNrJ1xuXHRcdF8uaW52b2tlIEBpbnRlcnNlY3Rpb25zLCd0aWNrJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAc2NvcGUudHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0cGxhY2VfY2FyOiAoY2FyKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tjYXIueH0sI3tjYXIueX0pXCJcblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRcIk0gI3tkLmEueH0sI3tkLmEueX0gTCAje2QuYi54fSwje2QuYi55fVwiXHRcdFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRAc2NvcGUudHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aCoxLjJdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAxNVxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
