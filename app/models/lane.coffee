d3 = require 'd3'
_ = require 'lodash'
S = require './settings'

class Lane
	constructor: (@beg,@end,@direction)->
		@id = _.uniqueId 'lane-'
		@length = S.lane_length-1
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

		@cars = []

	is_free:->
		if @cars.length==0
			return true
		!(@cars[0].loc==0)

	move_car: (car)->
		car.advance()
		car.set_xy( @scale(car.loc),@_scale(car.loc))
		if car.at_destination()
			return _.remove @cars, car
		if car.loc == @length
			@end.receive car,@direction

	tick: ->
		_.forEach @cars,(car,i,k)=>
			if car.at_intersection
				return
			if car.stopped
				return car.subtract_stop()
			if (next_car=k[i+1])
				if (next_car.loc-car.loc)>=S.space
					return @move_car car
				return car.stop()
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
