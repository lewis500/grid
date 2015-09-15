d3 = require 'd3'

der = ->
	directive = 
		restrict: 'A'
		scope: 
			fun: '='
		link: (scope, el, attr)->
			scale = scope.fun.scale()

			sel = d3.select el[0]
				.classed 'hor axis', true

			sel.call scope.fun
			
module.exports = der