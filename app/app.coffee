angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

S =
	size: 10
	stopping_time: 5
	pace: 100
	space: 2

S.lane_length = 10

class Lane
	constructor: (@beg,@end,@direction)->
		@id = _.uniqueId 'lane-'
		@length = S.lane_length-1
		# {@row,@col} = @end

		a = 
			x: @beg.pos.x
			y: @beg.pos.y

		b = 
			x: @end.pos.x  
			y: @end.pos.y 

		switch @direction
			when 'up'
				a.x++
				b.x++
				a.y-=2
				b.y+=2
			when 'right'
				a.x+=2
				b.x-=2
				a.y++
				b.y++
			when 'down'
				a.x--
				b.x--
				a.y+=2
				b.y-=2
			when 'left'
				a.x-=2
				b.x+=2
				a.y--
				b.y--

		[@a,@b] = [a,b]

		@scale = d3.scale.linear()
			.domain [0,S.lane_length]
			.range [a,b]


		@cars = []

	is_free:->
		if @cars.length==0
			return true
		!(@cars[0].loc==0)

	move_car: (car,i,k)->
		if car.at_intersection
			return
		if car.stopped
			return car.subtract_stop()
		if car.loc == @length
			return @end.receive car
		if (next_car=k[i+1])
			if (next_car.loc-car.loc)>=S.space
				car.advance()
				car.set_xy @get_coords car.loc
			else 
				car.stop()
		else
			car.advance()
			car.set_xy @get_coords car.loc

	tick: ->
		_.forEach @cars,@move_car,this

	receive: (car)->
		@cars.unshift car

	remove: (car)->
		@cars.splice @cars.indexOf car

	get_coords: (loc)->
		@scale loc

class Car
	constructor: (@lane)->
		@id = _.uniqueId 'car-'
		@loc = _.random 2,5
		@stopped = 0
		# @move_final()
		@lane.receive this
		@set_at_intersection false
		@color = _.sample ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']
		{@x,@y} = @lane.get_coords @loc

	subtract_stop:->
		@stopped--

	set_at_intersection: (@at_intersection)->

	set_lane: (@lane)->

	stop: ->
		@stopped = S.stopping_time 

	advance:->
		@loc++

	set_xy: (pos)->
		{@x,@y} = pos

	reset_loc: ->
		@loc=0

class Intersection
	constructor:(@row,@col)->
		@id = _.uniqueId 'intersection-'
		@lanes = {}
		@cars = []
		@pos = 
			x: @col*100/S.size
			y: @row*100/S.size

	receive:(car)->
		car.set_at_intersection true
		@cars.push car

	set_beg_lane: (lane)->
		@lanes[lane.direction] = lane

	turn_car:(car,lane)->
		car.lane.remove car
		car.set_at_intersection false
		lane.receive car
		car.set_lane lane
		car.reset_loc()

	tick: ->
		if @cars.length > 0
			lane = _.sample _.values @lanes
			if lane.is_free()
				@turn_car @cars.shift(),lane

class Traffic
	constructor: ->

	directions: ['up','right','down','left']

	setup:->
		[@intersections,@lanes] = [[],[]]

		@grid = [0..S.size].map (row)=>
			[0..S.size].map (col)=>
				@intersections.push (intersection = new Intersection row,col)
				intersection

		for i in @intersections
			for dir in @directions
				j = switch dir
					when 'up' then @grid[i.row-1]?[i.col]
					when 'right' then @grid[i.row][i.col+1]
					when 'down' then @grid[i.row+1]?[i.col]
					when 'left' then @grid[i.row][i.col-1]

				if j 
					@lanes.push (lane = new Lane i,j,dir) #i is the end
					i.set_beg_lane lane
		@cars = _.map @lanes, (lane)->new Car lane

	tick: ->
		_.invoke @lanes, 'tick'
		_.invoke @intersections,'tick'

class Ctrl
	constructor:(@scope,@el)->
		@paused = true
		@scope.S = S
		@scope.traffic = new Traffic

	place_car: (car)->
		"translate(#{car.x},#{car.y})"

	place_intersection: (d)->
		"translate(#{d.pos.x},#{d.pos.y})"

	place_lane: (d)->
		"M #{d.a.x},#{d.a.y} L #{d.b.x},#{d.b.y}"		

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
				@scope.traffic.tick()
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
