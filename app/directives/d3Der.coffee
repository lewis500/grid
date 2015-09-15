d3 = require 'd3'
angular = require 'angular'

der = ($parse)-> #goes on a svg element
	directive = 
		restrict: 'A'
		scope: 
			d3Der: '='
			tran: '='
		link: (scope, el, attr)->
			sel = d3.select el[0]
			u = 't-' + Math.random()
			hasTransitioned = false
			scope.$watch 'd3Der'
				, (v)->
					if scope.tran and hasTransitioned
						hasTransitioned = true
						sel.transition u
							.attr v
							.call scope.tran
					else
						hasTransitioned = true
						sel.attr v
				, true
module.exports = der