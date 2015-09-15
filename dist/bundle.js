(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, Intersection, Lane, S, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  size: 8,
  stopping_time: 6,
  height: 100,
  width: 100
};

Lane = (function() {
  function Lane(beg, end, direction1) {
    this.beg = beg;
    this.end = end;
    this.direction = direction1;
    this.id = _.uniqueId('lane-');
    this.length = Math.abs(this.beg.pos.x - this.end.pos.x) + Math.abs(this.beg.pos.y - this.end.pos.y);
    this.scale.domain([0, length]).range([this.beg.pos, this.end.pos]);
  }

  Lane.prototype.scale = d3.scale.linear();

  Lane.prototype.get_coords = function(loc) {
    return this.scale(loc);
  };

  return Lane;

})();

Car = (function() {
  function Car(lane1) {
    this.lane = lane1;
    this.turns = ['right', 'up', 'right', 'up'];
    this.id = _.uniqueId('car-');
    this.loc = 0;
  }

  Car.prototype.stop = function() {
    return this.stopped = S.stopping_time;
  };

  Car.prototype.set_lane = function(lane) {
    return this.lane = lane;
  };

  Car.prototype.move = function() {
    return this.loc++;
  };

  Car.prototype.move_final = function() {
    var ref;
    this.loc = this._loc;
    return ref = this.lane.get_coords(this.loc), this.x = ref.x, this.y = ref.y, ref;
  };

  Car.prototype.turn = function(lanes) {
    var new_lane;
    return new_lane = lanes[this.turns.shift()];
  };

  return Car;

})();

Intersection = (function() {
  function Intersection(row1, col1) {
    this.row = row1;
    this.col = col1;
    this.id = _.uniqueId('intersection-');
    this.lanes = {};
    this.pos = {
      x: this.col * 100 / S.size,
      y: this.row * 100 / S.size
    };
  }

  Intersection.prototype.receive = function(car) {
    return this.cars.push(car);
  };

  Intersection.prototype.set_beg_lane = function(lane) {
    return this.lanes[lane];
  };

  Intersection.prototype.tick = function(lanes) {
    var car, direction;
    if (this.cars.length > 0) {
      car = this.cars.shift();
      return direction = car.turn(this.lanes);
    }
  };

  return Intersection;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    this.el = el;
    this.paused = true;
    this.width = 100;
    this.height = 100;
    this.sel = d3.select(this.el[0]).select('.g-main');
    this.setup();
  }

  Ctrl.prototype.setup = function() {
    var dir, directions, i, j, k, l, lane, len, len1, m, ref, ref1, ref2, results;
    ref = [[], [], []], this.intersections = ref[0], this.lanes = ref[1], this.grid = ref[2];
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
          intersection = new Intersection(row, col);
          _this.intersections.push(intersection);
          return intersection;
        });
      };
    })(this));
    directions = ['up', 'right', 'down', 'left'];
    ref2 = this.intersections;
    for (l = 0, len = ref2.length; l < len; l++) {
      i = ref2[l];
      for (m = 0, len1 = directions.length; m < len1; m++) {
        dir = directions[m];
        j = (function() {
          var ref3, ref4;
          switch (false) {
            case dir !== 'up':
              return (ref3 = this.grid[i.row - 1]) != null ? ref3[i.col] : void 0;
            case dir !== 'right':
              return this.grid[i.row][i.col + 1];
            case dir !== 'down':
              return (ref4 = this.grid[i.row + 1]) != null ? ref4[i.col] : void 0;
            case dir !== 'left':
              return this.grid[i.row][i.col - 1];
          }
        }).call(this);
        if (j) {
          this.lanes.push((lane = new Lane(i, j, dir)));
          i.set_beg_lane(lane);
        }
      }
    }
    return this.cars = [new Car(this.grid[3][3].lanes.right)];
  };

  Ctrl.prototype.place_intersection = function(d) {
    return "translate(" + d.pos.x + "," + d.pos.y + ")";
  };

  Ctrl.prototype.place_lane = function(d) {
    var angle;
    angle = (function() {
      switch (false) {
        case d.direction !== 'up':
          return -90;
        case d.direction !== 'down':
          return 90;
        case d.direction !== 'left':
          return -180;
        default:
          return 0;
      }
    })();
    return "translate(" + d.beg.pos.x + "," + d.beg.pos.y + ") rotate(" + angle + ")";
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
        var c, i, k, l, len, len1, len2, m, ref, ref1, ref2;
        S.advance();
        ref = _this.cars;
        for (k = 0, len = ref.length; k < len; k++) {
          c = ref[k];
          car.move();
        }
        ref1 = _this.cars;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          c = ref1[l];
          car.move_final();
          if (car.loc === car.lane.length) {
            car.lane.end.receive(car);
          }
        }
        ref2 = _this.intersections;
        for (m = 0, len2 = ref2.length; m < len2; m++) {
          i = ref2[m];
          i.tick();
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvYXBwLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9jdW1DaGFydC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvZGlyZWN0aXZlcy9kYXR1bS5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvZ3JpZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9ncmlkL2FwcC9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLENBQUEsR0FDQztFQUFBLElBQUEsRUFBTSxDQUFOO0VBQ0EsYUFBQSxFQUFlLENBRGY7RUFFQSxNQUFBLEVBQVEsR0FGUjtFQUdBLEtBQUEsRUFBTyxHQUhQOzs7QUFLSztFQUNRLGNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxVQUFYO0lBQUMsSUFBQyxDQUFBLE1BQUQ7SUFBSyxJQUFDLENBQUEsTUFBRDtJQUFLLElBQUMsQ0FBQSxZQUFEO0lBQ3ZCLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLFFBQUYsQ0FBVyxPQUFYO0lBQ04sSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQVQsR0FB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QSxFQUFhLEVBZGI7TUFlQSxHQUFBLEVBQUssQ0FmTDtNQWdCQSxNQUFBLEVBQVEsQ0FoQlI7S0FERDtJQW1CQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1QsQ0FBQyxNQURRLENBQ0QsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVUsSUFBQyxDQUFBLEVBQVgsRUFBYyxJQUFDLENBQUEsRUFBRCxHQUFJLENBQWxCLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBV1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxFQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUEvQkU7O3FCQW1DWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUQ7V0FDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cblMgPVxuXHRzaXplOiA4XG5cdHN0b3BwaW5nX3RpbWU6IDZcblx0aGVpZ2h0OiAxMDBcblx0d2lkdGg6IDEwMFxuXG5jbGFzcyBMYW5lXG5cdGNvbnN0cnVjdG9yOiAoQGJlZyxAZW5kLEBkaXJlY3Rpb24pLT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdsYW5lLSdcblx0XHRAbGVuZ3RoID0gTWF0aC5hYnMoIEBiZWcucG9zLngtQGVuZC5wb3MueCkgKyBNYXRoLmFicyggQGJlZy5wb3MueS1AZW5kLnBvcy55KVxuXHRcdEBzY2FsZS5kb21haW4gWzAsbGVuZ3RoXVxuXHRcdFx0LnJhbmdlIFtAYmVnLnBvcyxAZW5kLnBvc11cblxuXHRzY2FsZTogZDMuc2NhbGUubGluZWFyKClcblxuXHRnZXRfY29vcmRzOiAobG9jKS0+XG5cdFx0QHNjYWxlIGxvY1xuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6IChAbGFuZSktPlxuXHRcdEB0dXJucyA9IFsncmlnaHQnLCd1cCcsJ3JpZ2h0JywndXAnXVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2Nhci0nXG5cdFx0QGxvYyA9IDBcblxuXHRzdG9wOiAtPlxuXHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lXG5cblx0c2V0X2xhbmU6IChsYW5lKS0+XG5cdFx0QGxhbmUgPSBsYW5lXG5cblx0IyBtb3ZlOiAobmV4dF9jYXIpLT5cblx0bW92ZTogLT5cblx0XHQjIGlmIEBzdG9wcGVkID4gMFxuXHRcdCMgXHRAc3RvcHBlZC0tXG5cdFx0IyBlbHNlIGlmIEBsb2Ncblx0XHQjIGVsc2Vcblx0XHRAbG9jKytcblx0XHQjIGlmIEBsb2MgPT0gQGxhbmUubGVuZ3RoXG5cdFx0IyBcdEBsYW5lLmVuZC5yZWNlaXZlIHRoaXNcblxuXHRcdCMgZWxzZSBpZiAobmV4dF9jYXI/LmxvYy1AbG9jKTxTLmdhcFxuXHRcdCMgXHRAX2xvYysrXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBzdG9wKClcblxuXHRtb3ZlX2ZpbmFsOiAtPlxuXHRcdEBsb2MgPSBAX2xvY1xuXHRcdHtAeCxAeX0gPSBAbGFuZS5nZXRfY29vcmRzIEBsb2NcblxuXHR0dXJuOiAobGFuZXMpIC0+IFxuXHRcdG5ld19sYW5lID0gbGFuZXNbQHR1cm5zLnNoaWZ0KCldXG5cbmNsYXNzIEludGVyc2VjdGlvblxuXHRjb25zdHJ1Y3RvcjooQHJvdyxAY29sKS0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnaW50ZXJzZWN0aW9uLSdcblx0XHRAbGFuZXMgPSB7fVxuXHRcdEBwb3MgPSBcblx0XHRcdHg6IChAY29sKjEwMC9TLnNpemUpXG5cdFx0XHR5OiAoQHJvdyoxMDAvUy5zaXplKVxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdEBjYXJzLnB1c2ggY2FyXG5cdFx0IyBjYXIuc3RvcCgpXG5cblx0c2V0X2JlZ19sYW5lOiAobGFuZSktPlxuXHRcdEBsYW5lc1tsYW5lXVxuXG5cdHRpY2s6IChsYW5lcyktPlxuXHRcdGlmIEBjYXJzLmxlbmd0aCA+IDBcblx0XHRcdGNhciA9IEBjYXJzLnNoaWZ0KClcblx0XHRcdGRpcmVjdGlvbiA9IGNhci50dXJuIEBsYW5lc1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsQGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAd2lkdGggPSAxMDBcblx0XHRAaGVpZ2h0ID0gMTAwXG5cdFx0QHNlbCA9IGQzLnNlbGVjdCBAZWxbMF1cblx0XHRcdC5zZWxlY3QgJy5nLW1haW4nXG5cdFx0QHNldHVwKClcblxuXHRzZXR1cDotPlxuXHRcdFtAaW50ZXJzZWN0aW9ucyxAbGFuZXMsQGdyaWRdID0gW1tdLFtdLFtdXVxuXG5cdFx0QGdyaWQgPSBbMC4uUy5zaXplXS5tYXAgKHJvdyk9PlxuXHRcdFx0WzAuLlMuc2l6ZV0ubWFwIChjb2wpPT5cblx0XHRcdFx0aW50ZXJzZWN0aW9uID0gbmV3IEludGVyc2VjdGlvbiByb3csY29sXG5cdFx0XHRcdEBpbnRlcnNlY3Rpb25zLnB1c2ggaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGludGVyc2VjdGlvblxuXG5cdFx0ZGlyZWN0aW9ucyA9IFsndXAnLCdyaWdodCcsJ2Rvd24nLCdsZWZ0J11cblxuXHRcdGZvciBpIGluIEBpbnRlcnNlY3Rpb25zXG5cdFx0XHRmb3IgZGlyIGluIGRpcmVjdGlvbnNcblx0XHRcdFx0aiA9IHN3aXRjaFxuXHRcdFx0XHRcdHdoZW4gZGlyPT0ndXAnIHRoZW4gQGdyaWRbaS5yb3ctMV0/W2kuY29sXVxuXHRcdFx0XHRcdHdoZW4gZGlyPT0ncmlnaHQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sKzFdXG5cdFx0XHRcdFx0d2hlbiBkaXI9PSdkb3duJyB0aGVuIEBncmlkW2kucm93KzFdP1tpLmNvbF1cblx0XHRcdFx0XHR3aGVuIGRpcj09J2xlZnQnIHRoZW4gQGdyaWRbaS5yb3ddW2kuY29sLTFdXG5cdFx0XHRcdGlmIGogXG5cdFx0XHRcdFx0QGxhbmVzLnB1c2ggKGxhbmUgPSBuZXcgTGFuZSBpLGosZGlyKSAjaSBpcyB0aGUgZW5kXG5cdFx0XHRcdFx0aS5zZXRfYmVnX2xhbmUgbGFuZVxuXG5cdFx0QGNhcnMgPSBbbmV3IENhciBAZ3JpZFszXVszXS5sYW5lcy5yaWdodCBdXG5cblxuXHRwbGFjZV9pbnRlcnNlY3Rpb246IChkKS0+XG5cdFx0XCJ0cmFuc2xhdGUoI3tkLnBvcy54fSwje2QucG9zLnl9KVwiXG5cblx0cGxhY2VfbGFuZTogKGQpLT5cblx0XHRhbmdsZSA9IHN3aXRjaCBcblx0XHRcdHdoZW4gZC5kaXJlY3Rpb24gaXMgJ3VwJyB0aGVuIC05MFxuXHRcdFx0d2hlbiBkLmRpcmVjdGlvbiBpcyAnZG93bicgdGhlbiA5MFxuXHRcdFx0d2hlbiBkLmRpcmVjdGlvbiBpcyAnbGVmdCcgdGhlbiAtMTgwXG5cdFx0XHRlbHNlIDBcblx0XHRcInRyYW5zbGF0ZSgje2QuYmVnLnBvcy54fSwje2QuYmVnLnBvcy55fSkgcm90YXRlKCN7YW5nbGV9KVwiXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcblx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0Zm9yIGMgaW4gQGNhcnNcblx0XHRcdFx0XHRjYXIubW92ZSgpXG5cdFx0XHRcdGZvciBjIGluIEBjYXJzXG5cdFx0XHRcdFx0Y2FyLm1vdmVfZmluYWwoKVxuXHRcdFx0XHRcdGlmIGNhci5sb2MgPT0gY2FyLmxhbmUubGVuZ3RoXG5cdFx0XHRcdFx0XHRjYXIubGFuZS5lbmQucmVjZWl2ZSBjYXJcblx0XHRcdFx0aS50aWNrKCkgZm9yIGkgaW4gQGludGVyc2VjdGlvbnNcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0LCBTLnBhY2VcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMjUwXG5cdFx0XHRoZWlnaHQ6IDI1MFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE1XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLnJ1c2hfbGVuZ3RoKjEuMl1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2Fyc11cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lRW4gPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FblxuXG5cdFx0QGxpbmVFeCA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUV4XG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cblx0ZXg6IC0+XG5cdFx0QGxpbmVFeCBAY3VtXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQGN1bVxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRjdW06ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L2NoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCIndXNlIHN0cmljdCdcblxuRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAyNTBcblx0XHRcdGhlaWdodDogMjUwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMubnVtX2NhcnMqLjhdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnMqLjU1XVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC5uXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5mXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NhcnM6IDI1MFxuXHRcdFx0dGltZTogMFxuXHRcdFx0c3BhY2U6IDVcblx0XHRcdHBhY2U6IDE1XG5cdFx0XHRzdG9wcGluZ190aW1lOiA2XG5cdFx0XHRkaXN0YW5jZTogNjBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0cnVzaF9sZW5ndGg6IDI1MFxuXHRcdFx0ZnJlcXVlbmN5OiA4XG5cdFx0XHRybDogMTAwMFxuXHRcdFx0cGhhc2U6IDUwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdHdpc2g6IDE1MFxuXHRcdFx0bnVtX3NpZ25hbHM6IDEwXG5cdFx0XHRkYXk6IDBcblx0XHRcdG9mZnNldDogMFxuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAcmwsQHJsLzZcblx0XHRcdC5yYW5nZSBbXG5cdFx0XHRcdCcjRjQ0MzM2JywgI3JlZFxuXHRcdFx0XHQnIzIxOTZGMycsICNibHVlXG5cdFx0XHRcdCcjRTkxRTYzJywgI3Bpbmtcblx0XHRcdFx0JyMwMEJDRDQnLCAjY3lhblxuXHRcdFx0XHQnI0ZGQzEwNycsICNhbWJlclxuXHRcdFx0XHQnIzRDQUY1MCcsICNncmVlblxuXHRcdFx0XHRdXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxAcmxdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
