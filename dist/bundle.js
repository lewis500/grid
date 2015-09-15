(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, Position, S, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  grid_size: 8,
  stopping_time: 6,
  height: 100,
  width: 100
};

Lane = (function() {
  function Lane(x2, y2, intersection1, direction1) {
    this.x = x2;
    this.y = y2;
    this.intersection = intersection1;
    this.direction = direction1;
    this.id = _.uniqueId('road-');
    this.cars = [];
  }

  Lane.prototype.tick = function() {
    var car, i, j, k, len, len1, next_car, ref, results;
    ref = this.cars;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      car = ref[i];
      next_car = this.cars[i + 1];
      car.move(next_car);
    }
    results = [];
    for (k = 0, len1 = cars.length; k < len1; k++) {
      car = cars[k];
      car.move_final();
      if (car.isAt(this.intersection)) {
        results.push(this.intersection.enter(car));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Lane.prototype.receive = function(car) {
    return this.cars.push(car);
  };

  return Lane;

})();

Position = (function() {
  function Position(x2, y2) {
    var ref;
    this.x = x2;
    this.y = y2;
    ref = [this.x, this.y], this._x = ref[0], this._y = ref[1];
  }

  Position.prototype.advance = function(direction) {
    switch (direction) {
      case 'up':
        return this._y--;
      case 'right':
        return this._x++;
      case 'down':
        return this._y++;
      case 'left':
        return this._x--;
    }
  };

  Position.prototype.advance_final = function() {
    var ref;
    return ref = [this._x, this._y], this.x = ref[0], this.y = ref[1], ref;
  };

  return Position;

})();

Car = (function() {
  function Car(x, y, direction1, turns) {
    this.direction = direction1;
    this.turns = turns;
    this.id = _.uniqueId('car-');
    this.position = new Position(x, y);
  }

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.isAt = function(pos) {
    var ref, x, x1, y, y1;
    ref = this.position, x = ref.x, y = ref.y;
    x1 = pos.x1, y1 = pos.y1;
    return x1 === x && y1 === y;
  };

  Car.prototype.trajectory = function() {
    var ref, x, y;
    ref = this.position, x = ref.x, y = ref.y;
    switch (this.direction) {
      case 'up':
        return S.height - y;
      case 'right':
        return x;
      case 'down':
        return y;
      case 'left':
        return S.width - x;
    }
  };

  Car.prototype.move = function(next_car) {
    if (this.stopped > 0) {
      return this.stopped--;
    } else if (((next_car != null ? next_car.trajectory : void 0) - this.trajectory) < S.gap) {
      return this.stop();
    } else {
      return this.position.move(this.direction);
    }
  };

  Car.prototype.move_final = function() {
    return this.position.advance_final();
  };

  Car.prototype.turn = function() {
    return this.direction = this.turns.shift();
  };

  return Car;

})();

Intersection = (function() {
  function Intersection(x2, y2) {
    this.x = x2;
    this.y = y2;
    this.cars = [];
    this.lanes = {};
  }

  Intersection.prototype.add_lane = function(lane, direction) {
    return this.lanes[direction] = direction;
  };

  Intersection.prototype.receive = function(car) {
    this.cars.push(car);
    return car.stop();
  };

  Intersection.prototype.tick = function() {
    var car;
    if (this.cars.length > 0) {
      car = this.cars.shift();
      car.turn();
      return this.lanes[car.direction].receive(car);
    }
  };

  return Intersection;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    var col, direction, intersection, j, k, l, lane, len, ref, ref1, ref2, ref3, row, x, y;
    this.scope = scope;
    this.el = el;
    this.paused = true;
    this.width = 100;
    this.height = 100;
    this.sel = d3.select(this.el[0]).select('.g-main');
    ref = [[], []], this.intersections = ref[0], this.lanes = ref[1];
    for (row = j = 1, ref1 = S.grid_size - 1; 1 <= ref1 ? j <= ref1 : j >= ref1; row = 1 <= ref1 ? ++j : --j) {
      x = row * 100 / S.grid_size;
      for (col = k = 1, ref2 = S.grid_size - 1; 1 <= ref2 ? k <= ref2 : k >= ref2; col = 1 <= ref2 ? ++k : --k) {
        y = col * 100 / S.grid_size;
        intersection = new Intersection(x, y);
        this.intersections.push(intersection);
        ref3 = ['left', 'right', 'up', 'down'];
        for (l = 0, len = ref3.length; l < len; l++) {
          direction = ref3[l];
          lane = new Lane(x, y, intersection, direction);
          this.lanes.push(lane);
          intersection.add_lane(lane);
        }
      }
    }
    this.draw_lanes();
  }

  Ctrl.prototype.draw_lanes = function() {
    return this.sel.select('.g-roads').selectAll('roads').data(this.lanes).enter().append('rect').attr({
      width: (function(_this) {
        return function(d) {
          return _this.width / S.grid_size;
        };
      })(this),
      height: 1.5,
      "class": 'road',
      transform: (function(_this) {
        return function(d) {
          var rotation;
          rotation = (function() {
            switch (false) {
              case d.direction !== 'up':
                return 90;
              case d.direction !== 'down':
                return -90;
              case d.direction !== 'right':
                return 180;
              default:
                return 0;
            }
          })();
          return "translate(" + d.x + "," + d.y + ") rotate(" + rotation + ")";
        };
      })(this)
    });
  };

  Ctrl.prototype.scale = function(n) {
    return n / S.grid_size * 100;
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
          var i, j, k, lane, len, len1, ref, ref1;
          S.advance();
          ref = _this.intersections;
          for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            i.tick();
          }
          ref1 = _this.lanes;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            lane = ref1[k];
            lane.tick();
          }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLFNBQUEsRUFBVyxDQUFYO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxNQUFBLEVBQVEsR0FGUjtFQUdBLEtBQUEsRUFBTyxHQUhQOzs7QUFLSztFQUNPLGNBQUMsRUFBRCxFQUFJLEVBQUosRUFBTyxhQUFQLEVBQXFCLFVBQXJCO0lBQUMsSUFBQyxDQUFBLElBQUQ7SUFBRyxJQUFDLENBQUEsSUFBRDtJQUFHLElBQUMsQ0FBQSxlQUFEO0lBQWMsSUFBQyxDQUFBLFlBQUQ7SUFDaEMsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVg7SUFDTixJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7O2lCQUlaLElBQUEsR0FBSyxTQUFBO0FBQ0osUUFBQTtBQUFBO0FBQUEsU0FBQSw2Q0FBQTs7TUFDQyxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRjtNQUNqQixHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQ7QUFGRDtBQUlBO1NBQUEsd0NBQUE7O01BQ0MsR0FBRyxDQUFDLFVBQUosQ0FBQTtNQUNBLElBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFDLENBQUEsWUFBVixDQUFIO3FCQUErQixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsQ0FBb0IsR0FBcEIsR0FBL0I7T0FBQSxNQUFBOzZCQUFBOztBQUZEOztFQUxJOztpQkFTTCxPQUFBLEdBQVEsU0FBQyxHQUFEO1dBQ1AsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsR0FBWDtFQURPOzs7Ozs7QUFHSDtFQUNPLGtCQUFDLEVBQUQsRUFBSSxFQUFKO0FBQ1gsUUFBQTtJQURZLElBQUMsQ0FBQSxJQUFEO0lBQUcsSUFBQyxDQUFBLElBQUQ7SUFDZixNQUFZLENBQUMsSUFBQyxDQUFBLENBQUYsRUFBSSxJQUFDLENBQUEsQ0FBTCxDQUFaLEVBQUMsSUFBQyxDQUFBLFdBQUYsRUFBSyxJQUFDLENBQUE7RUFESzs7cUJBR1osT0FBQSxHQUFRLFNBQUMsU0FBRDtBQUNQLFlBQU8sU0FBUDtBQUFBLFdBQ00sSUFETjtlQUNnQixJQUFDLENBQUEsRUFBRDtBQURoQixXQUVNLE9BRk47ZUFFbUIsSUFBQyxDQUFBLEVBQUQ7QUFGbkIsV0FHTSxNQUhOO2VBR2tCLElBQUMsQ0FBQSxFQUFEO0FBSGxCLFdBSU0sTUFKTjtlQUlrQixJQUFDLENBQUEsRUFBRDtBQUpsQjtFQURPOztxQkFPUixhQUFBLEdBQWUsU0FBQTtBQUNkLFFBQUE7V0FBQSxNQUFVLENBQUMsSUFBQyxDQUFBLEVBQUYsRUFBSyxJQUFDLENBQUEsRUFBTixDQUFWLEVBQUMsSUFBQyxDQUFBLFVBQUYsRUFBSSxJQUFDLENBQUEsVUFBTCxFQUFBO0VBRGM7Ozs7OztBQUdWO0VBQ1EsYUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLFVBQUwsRUFBZ0IsS0FBaEI7SUFBSyxJQUFDLENBQUEsWUFBRDtJQUFXLElBQUMsQ0FBQSxRQUFEO0lBQzVCLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLFFBQUYsQ0FBVyxNQUFYO0lBQ04sSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxRQUFBLENBQVMsQ0FBVCxFQUFXLENBQVg7RUFGSjs7Z0JBSWIsSUFBQSxHQUFNLFNBQUE7V0FDTCxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsQ0FBQztFQURSOztnQkFHTixJQUFBLEdBQU0sU0FBQyxHQUFEO0FBQ0wsUUFBQTtJQUFBLE1BQVEsSUFBQyxDQUFBLFFBQVQsRUFBQyxRQUFBLENBQUQsRUFBRyxRQUFBO0lBQ0YsU0FBQSxFQUFELEVBQUksU0FBQTtXQUNKLEVBQUEsS0FBSSxDQUFKLElBQVUsRUFBQSxLQUFJO0VBSFQ7O2dCQUtOLFVBQUEsR0FBVyxTQUFBO0FBQ1YsUUFBQTtJQUFBLE1BQVEsSUFBQyxDQUFBLFFBQVQsRUFBQyxRQUFBLENBQUQsRUFBRyxRQUFBO0FBQ0gsWUFBTyxJQUFDLENBQUEsU0FBUjtBQUFBLFdBQ00sSUFETjtlQUNpQixDQUFDLENBQUMsTUFBRixHQUFXO0FBRDVCLFdBRU0sT0FGTjtlQUVtQjtBQUZuQixXQUdNLE1BSE47ZUFHa0I7QUFIbEIsV0FJTSxNQUpOO2VBSW1CLENBQUMsQ0FBQyxLQUFGLEdBQVU7QUFKN0I7RUFGVTs7Z0JBUVgsSUFBQSxHQUFNLFNBQUMsUUFBRDtJQUNMLElBQUcsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFkO2FBQ0MsSUFBQyxDQUFBLE9BQUQsR0FERDtLQUFBLE1BRUssSUFBRyxxQkFBQyxRQUFRLENBQUUsb0JBQVYsR0FBcUIsSUFBQyxDQUFBLFVBQXZCLENBQUEsR0FBbUMsQ0FBQyxDQUFDLEdBQXhDO2FBQ0osSUFBQyxDQUFBLElBQUQsQ0FBQSxFQURJO0tBQUEsTUFBQTthQUdKLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxTQUFoQixFQUhJOztFQUhBOztnQkFRTixVQUFBLEdBQVksU0FBQTtXQUNYLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO0VBRFc7O2dCQUdaLElBQUEsR0FBTSxTQUFBO1dBQ0wsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtFQURSOzs7Ozs7QUFHRDtFQUNPLHNCQUFDLEVBQUQsRUFBSSxFQUFKO0lBQUMsSUFBQyxDQUFBLElBQUQ7SUFBRyxJQUFDLENBQUEsSUFBRDtJQUNmLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsS0FBRCxHQUFTO0VBRkU7O3lCQUlaLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxTQUFQO1dBQ1QsSUFBQyxDQUFBLEtBQU0sQ0FBQSxTQUFBLENBQVAsR0FBb0I7RUFEWDs7eUJBR1YsT0FBQSxHQUFRLFNBQUMsR0FBRDtJQUNQLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVg7V0FDQSxHQUFHLENBQUMsSUFBSixDQUFBO0VBRk87O3lCQUlSLElBQUEsR0FBTSxTQUFBO0FBQ0wsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7TUFDQyxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUE7TUFDTixHQUFHLENBQUMsSUFBSixDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQU0sQ0FBQSxHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsT0FBdEIsQ0FBOEIsR0FBOUIsRUFIRDs7RUFESzs7Ozs7O0FBTUQ7RUFDTyxjQUFDLEtBQUQsRUFBUSxFQUFSO0FBQ1gsUUFBQTtJQURZLElBQUMsQ0FBQSxRQUFEO0lBQU8sSUFBQyxDQUFBLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFFLENBQUMsTUFBSCxDQUFVLElBQUMsQ0FBQSxFQUFHLENBQUEsQ0FBQSxDQUFkLENBQ04sQ0FBQyxNQURLLENBQ0UsU0FERjtJQUVQLE1BQTBCLENBQUMsRUFBRCxFQUFJLEVBQUosQ0FBMUIsRUFBQyxJQUFDLENBQUEsc0JBQUYsRUFBZ0IsSUFBQyxDQUFBO0FBQ2pCLFNBQVcsbUdBQVg7TUFDQyxDQUFBLEdBQUksR0FBQSxHQUFNLEdBQU4sR0FBVSxDQUFDLENBQUM7QUFDaEIsV0FBVyxtR0FBWDtRQUNDLENBQUEsR0FBSSxHQUFBLEdBQU0sR0FBTixHQUFVLENBQUMsQ0FBQztRQUNoQixZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLENBQWIsRUFBZSxDQUFmO1FBQ25CLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixZQUFwQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7VUFDQyxJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxZQUFULEVBQXNCLFNBQXRCO1VBQ1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtVQUNBLFlBQVksQ0FBQyxRQUFiLENBQXNCLElBQXRCO0FBSEQ7QUFKRDtBQUZEO0lBVUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQWpCVzs7aUJBc0JaLFVBQUEsR0FBWSxTQUFBO1dBQ1gsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksVUFBWixDQUNDLENBQUMsU0FERixDQUNZLE9BRFosQ0FFQyxDQUFDLElBRkYsQ0FFTyxJQUFDLENBQUEsS0FGUixDQUdDLENBQUMsS0FIRixDQUFBLENBSUMsQ0FBQyxNQUpGLENBSVMsTUFKVCxDQUtDLENBQUMsSUFMRixDQU1FO01BQUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFNLEtBQUMsQ0FBQSxLQUFELEdBQU8sQ0FBQyxDQUFDO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVA7TUFDQSxNQUFBLEVBQVEsR0FEUjtNQUVBLE9BQUEsRUFBTyxNQUZQO01BR0EsU0FBQSxFQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ1YsY0FBQTtVQUFBLFFBQUE7QUFBVyxvQkFBQSxLQUFBO0FBQUEsbUJBQ0wsQ0FBQyxDQUFDLFNBQUYsS0FBZSxJQURWO3VCQUNvQjtBQURwQixtQkFFTCxDQUFDLENBQUMsU0FBRixLQUFlLE1BRlY7dUJBRXNCLENBQUM7QUFGdkIsbUJBR0wsQ0FBQyxDQUFDLFNBQUYsS0FBZSxPQUhWO3VCQUd1QjtBQUh2Qjt1QkFJTDtBQUpLOztpQkFLWCxZQUFBLEdBQWEsQ0FBQyxDQUFDLENBQWYsR0FBaUIsR0FBakIsR0FBb0IsQ0FBQyxDQUFDLENBQXRCLEdBQXdCLFdBQXhCLEdBQW1DLFFBQW5DLEdBQTRDO1FBTmxDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhYO0tBTkY7RUFEVzs7aUJBa0JaLEtBQUEsR0FBTSxTQUFDLENBQUQ7V0FDTCxDQUFBLEdBQUUsQ0FBQyxDQUFDLFNBQUosR0FBYztFQURUOztpQkFHTixLQUFBLEdBQU8sU0FBQyxHQUFEO0lBQVMsSUFBRyxDQUFDLEdBQUo7YUFBYSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBQWI7O0VBQVQ7O2lCQUNQLEtBQUEsR0FBTyxTQUFBO1dBQUcsSUFBQyxDQUFBLE1BQUQsR0FBVTtFQUFiOztpQkFDUCxJQUFBLEdBQU0sU0FBQTtJQUNMLElBQUcsSUFBQyxDQUFBLE9BQUo7YUFDQyxFQUFFLENBQUMsS0FBSCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNQLGNBQUE7VUFBQSxDQUFDLENBQUMsT0FBRixDQUFBO0FBQ0E7QUFBQSxlQUFBLHFDQUFBOztZQUFBLENBQUMsQ0FBQyxJQUFGLENBQUE7QUFBQTtBQUNBO0FBQUEsZUFBQSx3Q0FBQTs7WUFBQSxJQUFJLENBQUMsSUFBTCxDQUFBO0FBQUE7VUFDQSxLQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBQTtVQUNBLElBQUcsQ0FBQyxLQUFDLENBQUEsTUFBTDtZQUFpQixLQUFDLENBQUEsSUFBRCxDQUFBLEVBQWpCOztpQkFDQTtRQU5PO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULEVBT0csQ0FBQyxDQUFDLElBUEwsRUFERDs7RUFESzs7aUJBV04sSUFBQSxHQUFNLFNBQUE7SUFDTCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFULENBQUE7SUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO1dBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQUpLOzs7Ozs7QUFNUCxNQUFBLEdBQVMsU0FBQTtBQUNSLE1BQUE7U0FBQSxTQUFBLEdBQ0M7SUFBQSxLQUFBLEVBQU8sRUFBUDtJQUNBLFlBQUEsRUFBYyxJQURkO0lBRUEsV0FBQSxFQUFhLGlCQUZiO0lBR0EsVUFBQSxFQUFZLENBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsSUFBdkIsQ0FIWjs7QUFGTzs7QUFPVCxPQUFPLENBQUMsTUFBUixDQUFlLFNBQWYsRUFBMkIsQ0FBQyxPQUFBLENBQVEsa0JBQVIsRUFBNkIsT0FBQSxDQUFRLGlCQUFSLENBQTdCLENBQUQsQ0FBM0IsQ0FDQyxDQUFDLFNBREYsQ0FDWSxRQURaLEVBQ3NCLE1BRHRCLENBRUMsQ0FBQyxTQUZGLENBRVksT0FGWixFQUVxQixPQUFBLENBQVEsb0JBQVIsQ0FGckIsQ0FHQyxDQUFDLFNBSEYsQ0FHWSxPQUhaLEVBR3FCLE9BQUEsQ0FBUSxvQkFBUixDQUhyQixDQUlDLENBQUMsU0FKRixDQUlZLFVBSlosRUFJd0IsT0FBQSxDQUFRLFlBQVIsQ0FKeEIsQ0FLQyxDQUFDLFNBTEYsQ0FLWSxVQUxaLEVBS3dCLE9BQUEsQ0FBUSxPQUFSLENBTHhCOzs7OztBQ3BLQSxJQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUVFO0VBQ08sY0FBQyxLQUFELEVBQVEsRUFBUjtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxLQUFBLEVBQU8sR0FBUDtNQUNBLE1BQUEsRUFBUSxHQURSO01BRUEsQ0FBQSxFQUNDO1FBQUEsQ0FBQSxFQUFHLEVBQUg7UUFDQSxDQUFBLEVBQUcsRUFESDtRQUVBLENBQUEsRUFBRyxFQUZIO1FBR0EsQ0FBQSxFQUFHLEVBSEg7T0FIRDtLQUREO0lBU0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNMLENBQUMsTUFESSxDQUNHLENBQUMsQ0FBRCxFQUFHLENBQUMsQ0FBQyxXQUFGLEdBQWMsR0FBakIsQ0FESCxDQUVMLENBQUMsS0FGSSxDQUVFLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxLQUFKLENBRkY7SUFJUCxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ04sQ0FBQyxNQURLLENBQ0UsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLFFBQU4sQ0FERixDQUVOLENBQUMsS0FGSyxDQUVDLENBQUMsSUFBQyxDQUFBLE1BQUYsRUFBVSxDQUFWLENBRkQ7SUFJUCxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1QsQ0FBQyxDQURRLENBQ04sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxJQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE0sQ0FFVCxDQUFDLENBRlEsQ0FFTixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLEtBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGTTtJQUlWLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVCxDQUFDLENBRFEsQ0FDTixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLElBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETSxDQUVULENBQUMsQ0FGUSxDQUVOLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsS0FBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZNO0lBSVYsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNWLENBQUMsS0FEUyxDQUNILElBQUMsQ0FBQSxHQURFLENBRVYsQ0FBQyxNQUZTLENBRUYsUUFGRSxDQUdWLENBQUMsS0FIUyxDQUdILENBSEc7SUFNWCxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1YsQ0FBQyxLQURTLENBQ0gsSUFBQyxDQUFBLEdBREUsQ0FFVixDQUFDLE1BRlMsQ0FFRixNQUZFO0VBaENBOztpQkFxQ1osRUFBQSxHQUFJLFNBQUE7V0FDSCxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxHQUFUO0VBREc7O2lCQUVKLEVBQUEsR0FBSSxTQUFBO1dBQ0gsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsR0FBVDtFQURHOzs7Ozs7QUFHTCxHQUFBLEdBQU0sU0FBQTtBQUNMLE1BQUE7U0FBQSxTQUFBLEdBQ0M7SUFBQSxnQkFBQSxFQUFrQixJQUFsQjtJQUNBLFlBQUEsRUFBYyxJQURkO0lBRUEsS0FBQSxFQUNDO01BQUEsR0FBQSxFQUFLLEdBQUw7S0FIRDtJQUlBLFdBQUEsRUFBYSxtQkFKYjtJQUtBLFVBQUEsRUFBWSxDQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLElBQXZCLENBTFo7O0FBRkk7O0FBU04sTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDeERqQixJQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRVYsR0FBQSxHQUFNLFNBQUMsTUFBRDtBQUNMLE1BQUE7U0FBQSxTQUFBLEdBQ0M7SUFBQSxRQUFBLEVBQVUsR0FBVjtJQUNBLEtBQUEsRUFDQztNQUFBLEtBQUEsRUFBTyxHQUFQO01BQ0EsSUFBQSxFQUFNLEdBRE47S0FGRDtJQUlBLElBQUEsRUFBTSxTQUFDLEtBQUQsRUFBUSxFQUFSLEVBQVksSUFBWjtBQUNMLFVBQUE7TUFBQSxHQUFBLEdBQU0sRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiO01BQ04sQ0FBQSxHQUFJLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFBO01BQ1gsZUFBQSxHQUFrQjthQUNsQixLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsRUFDRyxTQUFDLENBQUQ7UUFDRCxJQUFHLEtBQUssQ0FBQyxJQUFOLElBQWUsZUFBbEI7VUFDQyxlQUFBLEdBQWtCO2lCQUNsQixHQUFHLENBQUMsVUFBSixDQUFlLENBQWYsQ0FDQyxDQUFDLElBREYsQ0FDTyxDQURQLENBRUMsQ0FBQyxJQUZGLENBRU8sS0FBSyxDQUFDLElBRmIsRUFGRDtTQUFBLE1BQUE7VUFNQyxlQUFBLEdBQWtCO2lCQUNsQixHQUFHLENBQUMsSUFBSixDQUFTLENBQVQsRUFQRDs7TUFEQyxDQURILEVBVUcsSUFWSDtJQUpLLENBSk47O0FBRkk7O0FBcUJOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ3hCakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFEO1NBQ2hCLFNBQUMsS0FBRCxFQUFRLEVBQVIsRUFBWSxJQUFaO1dBQ0MsRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFaLENBQUEsQ0FBbUIsS0FBbkIsQ0FBdkI7RUFERDtBQURnQjs7Ozs7QUNBakI7QUFFQSxRQUFRLENBQUEsU0FBRSxDQUFBLFFBQVYsR0FBcUIsU0FBQyxJQUFELEVBQU8sSUFBUDtTQUNuQixNQUFNLENBQUMsY0FBUCxDQUFzQixJQUFDLENBQUEsU0FBdkIsRUFBa0MsSUFBbEMsRUFBd0MsSUFBeEM7QUFEbUI7Ozs7O0FDRnJCLElBQUE7O0FBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBRUU7RUFDTyxjQUFDLEtBQUQsRUFBUSxFQUFSO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFDWixDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFDQztNQUFBLEtBQUEsRUFBTyxHQUFQO01BQ0EsTUFBQSxFQUFRLEdBRFI7TUFFQSxDQUFBLEVBQ0M7UUFBQSxDQUFBLEVBQUcsRUFBSDtRQUNBLENBQUEsRUFBRyxFQURIO1FBRUEsQ0FBQSxFQUFHLEVBRkg7UUFHQSxDQUFBLEVBQUcsRUFISDtPQUhEO0tBREQ7SUFTQSxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ0wsQ0FBQyxNQURJLENBQ0csQ0FBQyxDQUFELEVBQUcsQ0FBQyxDQUFDLFFBQUYsR0FBVyxFQUFkLENBREgsQ0FFTCxDQUFDLEtBRkksQ0FFRSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsS0FBSixDQUZGO0lBSVAsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNOLENBQUMsTUFESyxDQUNFLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBQyxRQUFGLEdBQVcsR0FBZixDQURGLENBRU4sQ0FBQyxLQUZLLENBRUMsQ0FBQyxJQUFDLENBQUEsTUFBRixFQUFVLENBQVYsQ0FGRDtJQUlQLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDUCxDQUFDLENBRE0sQ0FDSixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLENBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FESSxDQUVQLENBQUMsQ0FGTSxDQUVKLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsQ0FBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZJO0lBSVIsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNWLENBQUMsS0FEUyxDQUNILElBQUMsQ0FBQSxHQURFLENBRVYsQ0FBQyxNQUZTLENBRUYsUUFGRSxDQUdWLENBQUMsS0FIUyxDQUdILENBSEc7SUFLWCxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1YsQ0FBQyxLQURTLENBQ0gsSUFBQyxDQUFBLEdBREUsQ0FFVixDQUFDLE1BRlMsQ0FFRixNQUZFO0VBM0JBOztpQkErQlosQ0FBQSxHQUFHLFNBQUE7V0FBRyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQUMsQ0FBQSxNQUFQO0VBQUg7Ozs7OztBQUdKLEdBQUEsR0FBTSxTQUFBO0FBQ0wsTUFBQTtTQUFBLFNBQUEsR0FDQztJQUFBLGdCQUFBLEVBQWtCLElBQWxCO0lBQ0EsWUFBQSxFQUFjLElBRGQ7SUFFQSxLQUFBLEVBQ0M7TUFBQSxNQUFBLEVBQVEsR0FBUjtLQUhEO0lBSUEsV0FBQSxFQUFhLHNCQUpiO0lBS0EsVUFBQSxFQUFZLENBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsSUFBdkIsQ0FMWjs7QUFGSTs7QUFTTixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUNoRGpCLElBQUE7O0FBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixPQUFBLENBQVEsV0FBUjs7QUFFTTtFQUNPLGtCQUFBO0lBQ1gsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxRQUFBLEVBQVUsR0FBVjtNQUNBLElBQUEsRUFBTSxDQUROO01BRUEsS0FBQSxFQUFPLENBRlA7TUFHQSxJQUFBLEVBQU0sRUFITjtNQUlBLGFBQUEsRUFBZSxDQUpmO01BS0EsUUFBQSxFQUFVLEVBTFY7TUFNQSxJQUFBLEVBQU0sRUFOTjtNQU9BLEtBQUEsRUFBTyxDQVBQO01BUUEsV0FBQSxFQUFhLEdBUmI7TUFTQSxTQUFBLEVBQVcsQ0FUWDtNQVVBLEVBQUEsRUFBSSxJQVZKO01BV0EsS0FBQSxFQUFPLEVBWFA7TUFZQSxLQUFBLEVBQU8sRUFaUDtNQWFBLElBQUEsRUFBTSxHQWJOO01BY0EsV0FBQSxFQUFhLEVBZGI7TUFlQSxHQUFBLEVBQUssQ0FmTDtNQWdCQSxNQUFBLEVBQVEsQ0FoQlI7S0FERDtJQW1CQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1QsQ0FBQyxNQURRLENBQ0QsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVUsSUFBQyxDQUFBLEVBQVgsRUFBYyxJQUFDLENBQUEsRUFBRCxHQUFJLENBQWxCLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBV1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxFQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUEvQkU7O3FCQW1DWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUQ7V0FDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cblMgPVxuXHRncmlkX3NpemU6IDhcblx0c3RvcHBpbmdfdGltZTogNlxuXHRoZWlnaHQ6IDEwMFxuXHR3aWR0aDogMTAwXG5cbmNsYXNzIExhbmVcblx0Y29uc3RydWN0b3I6KEB4LEB5LEBpbnRlcnNlY3Rpb24sQGRpcmVjdGlvbiktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3JvYWQtJ1xuXHRcdEBjYXJzID0gW11cblxuXHR0aWNrOi0+XG5cdFx0Zm9yIGNhcixpIGluIEBjYXJzXG5cdFx0XHRuZXh0X2NhciA9IEBjYXJzW2krMV1cblx0XHRcdGNhci5tb3ZlIG5leHRfY2FyXG5cblx0XHRmb3IgY2FyIGluIGNhcnNcblx0XHRcdGNhci5tb3ZlX2ZpbmFsKClcblx0XHRcdGlmIGNhci5pc0F0IEBpbnRlcnNlY3Rpb24gdGhlbiBAaW50ZXJzZWN0aW9uLmVudGVyIGNhclxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cbmNsYXNzIFBvc2l0aW9uXG5cdGNvbnN0cnVjdG9yOihAeCxAeSktPlxuXHRcdFtAX3gsQF95XSA9IFtAeCxAeV0gI3VuZGVyc2NvcmUgaXMgZm9yIHRlbXBvcmFyeSB2YXJpYWJsZXNcblxuXHRhZHZhbmNlOihkaXJlY3Rpb24pLT5cblx0XHRzd2l0Y2ggZGlyZWN0aW9uXG5cdFx0XHR3aGVuICd1cCcgdGhlbiBAX3ktLVxuXHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gQF94Kytcblx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4gQF95Kytcblx0XHRcdHdoZW4gJ2xlZnQnIHRoZW4gQF94LS1cblxuXHRhZHZhbmNlX2ZpbmFsOiAtPlxuXHRcdFtAeCxAeV0gPSBbQF94LEBfeV1cblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOiAoeCx5LEBkaXJlY3Rpb24sQHR1cm5zKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2FyLSdcblx0XHRAcG9zaXRpb24gPSBuZXcgUG9zaXRpb24geCx5XG5cblx0c3RvcDogLT5cblx0XHRAc3RvcHBlZCA9IFMuc3RvcHBpbmdfdGltZVxuXG5cdGlzQXQ6IChwb3MpLT5cblx0XHR7eCx5fSA9IEBwb3NpdGlvblxuXHRcdHt4MSx5MX0gPSBwb3Ncblx0XHR4MT09eCBhbmQgeTE9PXlcblxuXHR0cmFqZWN0b3J5Oi0+XG5cdFx0e3gseX0gPSBAcG9zaXRpb25cblx0XHRzd2l0Y2ggQGRpcmVjdGlvblxuXHRcdFx0d2hlbiAndXAnIHRoZW4gKFMuaGVpZ2h0IC0geSlcblx0XHRcdHdoZW4gJ3JpZ2h0JyB0aGVuIHhcblx0XHRcdHdoZW4gJ2Rvd24nIHRoZW4geVxuXHRcdFx0d2hlbiAnbGVmdCcgdGhlbiAoUy53aWR0aCAtIHgpXG5cblx0bW92ZTogKG5leHRfY2FyKS0+XG5cdFx0aWYgQHN0b3BwZWQgPiAwXG5cdFx0XHRAc3RvcHBlZC0tXG5cdFx0ZWxzZSBpZiAobmV4dF9jYXI/LnRyYWplY3RvcnktQHRyYWplY3RvcnkpPFMuZ2FwXG5cdFx0XHRAc3RvcCgpXG5cdFx0ZWxzZVxuXHRcdFx0QHBvc2l0aW9uLm1vdmUgQGRpcmVjdGlvblxuXG5cdG1vdmVfZmluYWw6IC0+XG5cdFx0QHBvc2l0aW9uLmFkdmFuY2VfZmluYWwoKVxuXG5cdHR1cm46IC0+IFxuXHRcdEBkaXJlY3Rpb24gPSBAdHVybnMuc2hpZnQoKVxuXG5jbGFzcyBJbnRlcnNlY3Rpb25cblx0Y29uc3RydWN0b3I6KEB4LEB5KS0+XG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBsYW5lcyA9IHt9XG5cblx0YWRkX2xhbmU6IChsYW5lLCBkaXJlY3Rpb24pLT5cblx0XHRAbGFuZXNbZGlyZWN0aW9uXSA9IGRpcmVjdGlvblxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cdFx0Y2FyLnN0b3AoKVxuXG5cdHRpY2s6IC0+XG5cdFx0aWYgQGNhcnMubGVuZ3RoID4gMFxuXHRcdFx0Y2FyID0gQGNhcnMuc2hpZnQoKVxuXHRcdFx0Y2FyLnR1cm4oKSAjdHVybiB0aGUgY2FyIGluIHRoZSBuZXcgZGlyZWN0aW9uXG5cdFx0XHRAbGFuZXNbY2FyLmRpcmVjdGlvbl0ucmVjZWl2ZSBjYXJcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLEBlbCktPlxuXHRcdEBwYXVzZWQgPSB0cnVlXG5cdFx0QHdpZHRoID0gMTAwXG5cdFx0QGhlaWdodCA9IDEwMFxuXHRcdEBzZWwgPSBkMy5zZWxlY3QgQGVsWzBdXG5cdFx0XHQuc2VsZWN0ICcuZy1tYWluJ1xuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXNdID0gW1tdLFtdXVxuXHRcdGZvciByb3cgaW4gWzEuLlMuZ3JpZF9zaXplLTFdXG5cdFx0XHR4ID0gcm93ICogMTAwL1MuZ3JpZF9zaXplXG5cdFx0XHRmb3IgY29sIGluIFsxLi5TLmdyaWRfc2l6ZS0xXVxuXHRcdFx0XHR5ID0gY29sICogMTAwL1MuZ3JpZF9zaXplXG5cdFx0XHRcdGludGVyc2VjdGlvbiA9IG5ldyBJbnRlcnNlY3Rpb24geCx5XG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGZvciBkaXJlY3Rpb24gaW4gWydsZWZ0JywncmlnaHQnLCd1cCcsJ2Rvd24nXVxuXHRcdFx0XHRcdGxhbmUgPSBuZXcgTGFuZSB4LHksaW50ZXJzZWN0aW9uLGRpcmVjdGlvblxuXHRcdFx0XHRcdEBsYW5lcy5wdXNoIGxhbmVcblx0XHRcdFx0XHRpbnRlcnNlY3Rpb24uYWRkX2xhbmUgbGFuZVxuXHRcdEBkcmF3X2xhbmVzKClcblxuXHQjIGRyYXdfY2FyOi0+XG5cdCMgXHRjYXIgPSBuZXcgQ2FyIFxuXG5cdGRyYXdfbGFuZXM6IC0+XG5cdFx0QHNlbC5zZWxlY3QgJy5nLXJvYWRzJ1xuXHRcdFx0LnNlbGVjdEFsbCAncm9hZHMnXG5cdFx0XHQuZGF0YSBAbGFuZXNcblx0XHRcdC5lbnRlcigpXG5cdFx0XHQuYXBwZW5kICdyZWN0J1xuXHRcdFx0LmF0dHJcblx0XHRcdFx0d2lkdGg6IChkKT0+IEB3aWR0aC9TLmdyaWRfc2l6ZVxuXHRcdFx0XHRoZWlnaHQ6IDEuNVxuXHRcdFx0XHRjbGFzczogJ3JvYWQnXG5cdFx0XHRcdHRyYW5zZm9ybTogKGQpPT4gXG5cdFx0XHRcdFx0cm90YXRpb24gPSBzd2l0Y2ggXG5cdFx0XHRcdFx0XHR3aGVuIGQuZGlyZWN0aW9uIGlzICd1cCcgdGhlbiA5MFxuXHRcdFx0XHRcdFx0d2hlbiBkLmRpcmVjdGlvbiBpcyAnZG93bicgdGhlbiAtOTBcblx0XHRcdFx0XHRcdHdoZW4gZC5kaXJlY3Rpb24gaXMgJ3JpZ2h0JyB0aGVuIDE4MFxuXHRcdFx0XHRcdFx0ZWxzZSAwXG5cdFx0XHRcdFx0XCJ0cmFuc2xhdGUoI3tkLnh9LCN7ZC55fSkgcm90YXRlKCN7cm90YXRpb259KVwiXG5cblx0c2NhbGU6KG4pLT5cblx0XHRuL1MuZ3JpZF9zaXplKjEwMFxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRpZiBAcGh5c2ljc1xuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdGkudGljaygpIGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRcdFx0bGFuZS50aWNrKCkgZm9yIGxhbmUgaW4gQGxhbmVzXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cdCMgLmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0IyAuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5hbmltYXRpb24gJy5zaWduYWwnLCBzaWduYWxBblxuXHQjIC5hbmltYXRpb24gJy5nLWNhcicsIGxlYXZlclxuXHQjIC5kaXJlY3RpdmUgJ3NsaWRlckRlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zbGlkZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDI1MFxuXHRcdFx0aGVpZ2h0OiAyNTBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aCoxLjJdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAxNVxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
