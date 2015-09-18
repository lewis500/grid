d3 = require 'd3'
_ = require 'lodash'
S = require './settings'

class Lane
	constructor: (@beg,@end,@direction)->
		@id = _.uniqueId 'lane-'
		@length = S.lane_length-1
		@beg.set_beg_lane this
		@end.set_end_lane this
		@cars = []
		@setup()

	setup: ->
		@_scale = d3.scale.linear()
			.domain [0,S.lane_length]

		if @direction in ['down','right']
			@_scale.range [@beg.pos,@end.pos]
		else
			@_scale.range [@beg.pos,@end.pos]

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

	is_free:->
		if @cars.length==0
			true
		else
			@cars[0].loc>0

	move_car: (car)->
		if car.loc == @length
			if @end.can_go @direction
				target = @end.beg_lanes[car.turns[0]]
				if target.is_free()
					car.turns.shift()
					_.remove @cars, car
					target.receive car
				else 
					car.stop()
			else 
				car.stop()
		else 
			car.advance()
			car.set_xy( @scale(car.loc),@_scale(car.loc))
			if car.at_destination()
				_.remove @cars, car

	tick: ->
		_.forEach @cars,(car,i,k)=>
			if car.stopped
				car.subtract_stop()
			else if k[i+1]
				if (k[i+1].loc-car.loc)>=S.space
					@move_car car
				else
					car.stop()
			else
				@move_car car

	receive: (car)->
		car.set_at_intersection false
		car.stopped = 0
		car.loc = 0
		@cars.unshift car
		car.set_xy(@scale(car.loc),@_scale(car.loc))

	remove: (car)->
		@cars.splice @cars.indexOf car


module.exports = Lane
