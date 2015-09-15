angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

S =
	grid_size: 8
	stopping_time: 6
	height: 100
	width: 100

class Lane
	constructor:(@x,@y,@intersection,@direction)->
		@id = _.uniqueId 'road-'
		@cars = []

	tick:->
		for car,i in @cars
			next_car = @cars[i+1]
			car.move next_car

		for car in cars
			car.move_final()
			if car.isAt @intersection then @intersection.enter car

	receive:(car)->
		@cars.push car

class Position
	constructor:(@x,@y)->
		[@_x,@_y] = [@x,@y] #underscore is for temporary variables

	advance:(direction)->
		switch direction
			when 'up' then @_y--
			when 'right' then @_x++
			when 'down' then @_y++
			when 'left' then @_x--

	advance_final: ->
		[@x,@y] = [@_x,@_y]

class Car
	constructor: (x,y,@direction,@turns)->
		@id = _.uniqueId 'car-'
		@position = new Position x,y

	stop: ->
		@stopped = S.stopping_time

	isAt: (pos)->
		{x,y} = @position
		{x1,y1} = pos
		x1==x and y1==y

	trajectory:->
		{x,y} = @position
		switch @direction
			when 'up' then (S.height - y)
			when 'right' then x
			when 'down' then y
			when 'left' then (S.width - x)

	move: (next_car)->
		if @stopped > 0
			@stopped--
		else if (next_car?.trajectory-@trajectory)<S.gap
			@stop()
		else
			@position.move @direction

	move_final: ->
		@position.advance_final()

	turn: -> 
		@direction = @turns.shift()

class Intersection
	constructor:(@x,@y)->
		@cars = []
		@lanes = {}

	add_lane: (lane, direction)->
		@lanes[direction] = direction

	receive:(car)->
		@cars.push car
		car.stop()

	tick: ->
		if @cars.length > 0
			car = @cars.shift()
			car.turn() #turn the car in the new direction
			@lanes[car.direction].receive car

class Ctrl
	constructor:(@scope,@el)->
		@paused = true
		@width = 100
		@height = 100
		@sel = d3.select @el[0]
			.select '.g-main'
		[@intersections,@lanes] = [[],[]]
		for row in [1..S.grid_size-1]
			x = row * 100/S.grid_size
			for col in [1..S.grid_size-1]
				y = col * 100/S.grid_size
				intersection = new Intersection x,y
				@intersections.push intersection
				for direction in ['left','right','up','down']
					lane = new Lane x,y,intersection,direction
					@lanes.push lane
					intersection.add_lane lane
		@draw_lanes()

	draw_lanes: ->
		@sel.select '.g-roads'
			.selectAll 'roads'
			.data @lanes
			.enter()
			.append 'rect'
			.attr
				width: (d)=> @width/S.grid_size
				height: 1.5
				class: 'road'
				transform: (d)=> 
					rotation = switch 
						when d.direction is 'up' then 90
						when d.direction is 'down' then -90
						when d.direction is 'right' then 180
						else 0
					"translate(#{d.x},#{d.y}) rotate(#{rotation})"

	scale:(n)->
		n/S.grid_size*100

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		if @physics
			d3.timer =>
					S.advance()
					i.tick() for i in @intersections
					lane.tick() for lane in @lanes
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
	# .directive 'horAxis', require './directives/xAxis'
	# .directive 'verAxis', require './directives/yAxis'
	# .animation '.signal', signalAn
	# .animation '.g-car', leaver
	# .directive 'sliderDer', require './directives/slider'
