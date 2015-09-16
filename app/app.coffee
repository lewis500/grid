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
		@at_intersection = false

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

		{@row,@col} = @end

		@cars = []

	move_car: (car,i,k)->
		if car.at_intersection
			return
		if car.stopped
			car.subtract_stop()
		

	tick: ->
		_.forEach @cars,(c,i,k)->
			if @car.


	receive: (car)->
		@cars.unshift car

	remove: (car)->
		@cars.splice @cars.indexOf car

	get_coords: (loc)->
		@scale loc

class Car
	constructor: (@lane)->
		@id = _.uniqueId 'car-'
		@loc = @_loc = _.random 2,5
		@stopped = 0
		@move_final()
		@lane.receive this
		@set_at_intersection false
		@color = _.sample ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']

	set_at_intersection: (bool)->
		@at_intersection = bool

	stop: ->
		@stopped = S.stopping_time 

	move: ->
		if @at_intersection
			return

		if @stopped>0
			@stopped--
			return

		cars = @lane.cars

		next_car = cars[cars.indexOf(this) + 1]

		if !next_car
			@_loc++
			return

		if (next_car.loc-@loc)>=S.space
			@_loc++
			return

		@stop()

	move_final: ->
		@loc = @_loc
		coords = @lane.get_coords @loc
		{@x,@y} = coords

	turn: (new_lane) -> 
		@lane.remove this
		@lane = new_lane
		@lane.receive this
		@loc = @_loc = 0

# class Signal
# 	constructor: (@i,@loc)->
# 		@green = true
# 		@id = _.uniqueId 'signal-'
# 		@reset_offset()

# 	@property 'offset', 
# 		get: -> 
# 			S.phase*((@i*S.offset)%1)

# 	reset_offset: ->
# 		[@count, @green] = [@offset, true]

# 	tick: ->
# 		@count++
# 		if @count >= S.phase
# 			[@count, @green] = [0, true]
# 		else if @count>= (S.green*S.phase)
# 			@green = false

class Intersection
	constructor:(@row,@col)->
		@id = _.uniqueId 'intersection-'
		@lanes = {}
		@cars = []
		@pos = 
			x: @col*100/S.size
			y: @row*100/S.size

		# @signal = new Signal

	receive:(car)->
		car.set_at_intersection true
		@cars.push car

	set_beg_lane: (lane)->
		@lanes[lane.direction] = lane

	tick: ->
		# @signal.tick()
		if @cars.length > 0
			lane = _.sample _.values @lanes
			if lane.cars.length>0
				if lane.cars[0].loc == 0
					return
			car = @cars.shift()
			car.set_at_intersection false
			car.turn lane

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
		_.invoke @lanes, 'move'

		# _.invoke @cars,'move'
		_.invoke @intersections,'tick'
		
		_.forEach @cars, (c)->
			c.move_final()
			if c.loc == S.lane_length and !c.at_intersection
				c.lane.end.receive c

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
