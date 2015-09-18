_ = require 'lodash'
S = require './settings'
Lane = require './lane'
Intersection = require './intersection'
Signal = require './signal'
Car = require './car'

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
		
		i = @grid[-1][3]
		destination = {x: i.pos.x + 20, y: i.pos.y + 35}
		turns = ['up','up','up','up','right','right','down']
		car = new Car turns,destination
		@cars.push car
		i.receive car
		# car = 
		# @cars = _.map @lanes[85..87], (lane)->
		# 	turns = _.sample ['up','right','left','down'],10
		# 	new Car lane, turns

	tick: ->
		_.invoke @intersections,'tick'
		_.invoke @lanes, 'tick'

module.exports = Traffic