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
		a = _.sample @outer
		b = _.sample @inner
		ud = if b.row < a.row then 'up' else 'down'
		lr = if b.col < a.col then 'left' else 'right'
		uds = [0..Math.abs(b.row-a.row)].map (i)-> ud
		lrs = [0..Math.abs(b.col-a.col)].map (i)-> lr
		turns = _.shuffle _.flatten [uds,lrs]
		turns.pop()
		lane = a.beg_lanes[turns.shift()]
		car = new Car turns,_.random 2,8
		car.b = b
		lane.receive car
		@cars.push car

	setup:->
		[@intersections,@lanes,@cars] = [[],[],[]]
		@outer = []
		@inner = []

		@grid = [0..S.size].map (row)=>
			[0..S.size].map (col)=>
				@intersections.push (intersection = new Intersection row,col)
				if (0<row<S.size) and (0<col<S.size)
					@inner.push intersection
					intersection.inner = true
				else
					@outer.push intersection
					intersection.outer = true
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

		@create_car() for i in [0..200]

	tick: ->
		_.invoke @intersections,'tick'
		_.invoke @lanes, 'tick'
		@cars.forEach (c,i,k)->	if c.exited then _.remove k, c

module.exports = Traffic