d3 = require 'd3'
_ = require 'lodash'
S = require './settings'

class Cell
	constructor: (@pos,@_pos)->
			@x = @pos.x
			@y = @pos.y
			@x2 = Math.floor @_pos.x
			@y2 = Math.floor @_pos.y
			@last = -Infinity
			@temp_car = false

	space: S.space

	receive:(car)->
		car.set_xy @x,@y,@x2,@y2
		@last=S.time
		@temp_car = car

	remove: ->
		@temp_car = false

	finalize: ->
		@car = @temp_car
		if @car
			@last = S.time

	is_free: ->
		(S.time-@last)>@space

class Lane
	constructor: (@beg,@end,@direction)->
		@id = _.uniqueId 'lane-'
		@beg.set_beg_lane this
		@end.set_end_lane this
		@setup()
		@row = Math.min @beg.row,@end.row
		@col = Math.min @beg.col,@end.col

	day_start:->
		for cell in @cells
			cell.car = cell.temp_car = false
			cell.last = -Infinity

	is_free: ->
		@cells[0].is_free()

	receive: (car)->
		@cells[0].receive car

	setup: ->
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

		scale = d3.scale.linear()
			.domain [0,S.lane_length-1]
			.range [a,b]
			
		scale2 = d3.scale.linear()
			.domain [0,S.lane_length-1]
			.range [@beg.pos,@end.pos]

		[@a,@b]=[a,b]

		@cells = [0..(S.lane_length-1)].map (n)=> 
			pos = scale n
			_pos = scale2 n
			new Cell pos,_pos

module.exports = Lane
