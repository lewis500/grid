angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

S =
	size: 8
	stopping_time: 6
	height: 100
	width: 100

class Lane
	constructor: (@beg,@end,@direction)->
		@id = _.uniqueId 'lane-'
		@length = Math.abs( @beg.pos.x-@end.pos.x) + Math.abs( @beg.pos.y-@end.pos.y)
		@scale.domain [0,length]
			.range [@beg.pos,@end.pos]

	scale: d3.scale.linear()

	get_coords: (loc)->
		@scale loc

class Car
	constructor: (@lane)->
		@turns = ['right','up','right','up']
		@id = _.uniqueId 'car-'
		@loc = 0

	stop: ->
		@stopped = S.stopping_time

	set_lane: (lane)->
		@lane = lane

	# move: (next_car)->
	move: ->
		# if @stopped > 0
		# 	@stopped--
		# else if @loc
		# else
		@loc++
		# if @loc == @lane.length
		# 	@lane.end.receive this

		# else if (next_car?.loc-@loc)<S.gap
		# 	@_loc++
		# else
		# 	@stop()

	move_final: ->
		@loc = @_loc
		{@x,@y} = @lane.get_coords @loc

	turn: (lanes) -> 
		new_lane = lanes[@turns.shift()]

class Intersection
	constructor:(@row,@col)->
		@id = _.uniqueId 'intersection-'
		@lanes = {}
		@pos = 
			x: (@col*100/S.size)
			y: (@row*100/S.size)

	receive:(car)->
		@cars.push car
		# car.stop()

	set_beg_lane: (lane)->
		@lanes[lane]

	tick: (lanes)->
		if @cars.length > 0
			car = @cars.shift()
			direction = car.turn @lanes

class Ctrl
	constructor:(@scope,@el)->
		@paused = true
		@width = 100
		@height = 100
		@sel = d3.select @el[0]
			.select '.g-main'
		@setup()

	setup:->
		[@intersections,@lanes,@grid] = [[],[],[]]

		@grid = [0..S.size].map (row)=>
			[0..S.size].map (col)=>
				intersection = new Intersection row,col
				@intersections.push intersection
				intersection

		directions = ['up','right','down','left']

		for i in @intersections
			for dir in directions
				j = switch
					when dir=='up' then @grid[i.row-1]?[i.col]
					when dir=='right' then @grid[i.row][i.col+1]
					when dir=='down' then @grid[i.row+1]?[i.col]
					when dir=='left' then @grid[i.row][i.col-1]
				if j 
					@lanes.push (lane = new Lane i,j,dir) #i is the end
					i.set_beg_lane lane

		@cars = [new Car @grid[3][3].lanes.right ]


	place_intersection: (d)->
		"translate(#{d.pos.x},#{d.pos.y})"

	place_lane: (d)->
		angle = switch 
			when d.direction is 'up' then -90
			when d.direction is 'down' then 90
			when d.direction is 'left' then -180
			else 0
		"translate(#{d.beg.pos.x},#{d.beg.pos.y}) rotate(#{angle})"

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
			
				S.advance()
				for c in @cars
					car.move()
				for c in @cars
					car.move_final()
					if car.loc == car.lane.length
						car.lane.end.receive car
				i.tick() for i in @intersections
				@scope.$evalAsync()
				if !@paused then @tick()
				true
			, S.pace

	play: ->
		@pause()
		d3.timer.flush()
		@paused = false
		@tick()

visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', '$element', Ctrl]

angular.module 'mainApp' , [require 'angular-material' , require 'angular-animate']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
	.directive 'd3Der', require './directives/d3Der'
	.directive 'cumChart', require './cumChart'
	.directive 'mfdChart', require './mfd'

