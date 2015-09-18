_ = require 'lodash'
S = require './settings'
Lane = require './lane'
Intersection = require './intersection'
Signal = require './signal'
Car = require './car'

class Traffic
	constructor: ->

	directions: ['up','right','down','left']

	create_car: ->
		start = _.sample @outer
		end = _.sample @inner
		# if start.
		# i = _.last(@grid)[3]
		d = {x: i.pos.x + 20, y: i.pos.y - 35}
		turns = ['up','up','up','up','right','right','down']
		lane = i.beg_lanes[turns.shift()]
		car = new Car turns,d
		lane.receive car
		@cars.push car

	setup:->
		[@intersections,@lanes,@cars] = [[],[],[]]
		@outer = []
		@inner = []

		@grid = [0..S.size].map (row)=>
			[0..S.size].map (col)=>
				@intersections.push (intersection = new Intersection row,col)
				if row<S.size and col<S.size
					@inner.push intersection
				else
					@outer.push intersection
				intersection

		for i in @intersections
			for dir in @directions
				j = switch dir
					when 'up' then @grid[i.row-1]?[i.col]
					when 'right' then @grid[i.row][i.col+1]
					when 'down' then @grid[i.row+1]?[i.col]
					when 'left' then @grid[i.row][i.col-1]
				if j 
					@lanes.push new Lane i,j,dir

		@create_car()

	tick: ->
		_.invoke @intersections,'tick'
		_.invoke @lanes, 'tick'

module.exports = Traffic