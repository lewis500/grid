d3 = require 'd3'
_ = require 'lodash'
S = require './models/settings'

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			width: 250
			height: 250
			m: 
				t: 10
				l: 40
				r: 18
				b: 35

		params = 
			width: @width
			height: @height
			type: Two.Types.webgl

		sel = d3.select el[0]
			.append "div"
			.style
				position: 'absolute'
				left: @m.l
				top: @m.t

		two = new Two params
			.appendTo sel.node()

		@hor = d3.scale.linear()
				.domain [0,S.num_cars]
				.range [0,@width]

		@ver = d3.scale.linear()
			.domain [0, S.num_cars*.2]
			.range [@height, 0]

		data = []
		map = {}
		twos = {}

		@scope.$watch ->
				S.time
			, (newD)=>
				newD = @memory
				new_map = {}
				for d,i in newD
					new_map[d.id] = d
					if !map[d.id]
						data.push d
						map[d.id] = d
						t = twos[d.id] = two.makeCircle 0,0,4
						t.fill = '#03A9F4'
						t.stroke = 'white'

				for d,i in data
					if !new_map[d.id]
						delete map[d.id]
						delete (t = twos[d.id])
						two.remove t
					else
						t = twos[d.id]
						t.opacity = (i/newD.length)
						t.translation.set @hor(d.n), @ver(d.f)

				two.update()

		# @line = d3.svg.line()
		# 	.x (d)=>@hor d.n
		# 	.y (d)=>@ver d.f

		@horAxis = d3.svg.axis()
			.scale @hor
			.orient 'bottom'
			.ticks 5

		@verAxis = d3.svg.axis()
			.scale @ver
			.orient 'left'

	d: -> @line @memory

	
der = ->
	directive = 
		bindToController: true
		controllerAs: 'vm'
		scope: 
			memory: '='
		templateUrl: './dist/mfdChart.html'
		controller: ['$scope', '$element', Ctrl]

module.exports = der