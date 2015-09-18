_ = require 'lodash'
S = require './settings'
Signal = require './signal'

class Intersection
	constructor:(@row,@col)->
		@id = _.uniqueId 'intersection-'
		@lanes = {}
		up_down = []
		left_right = []
		@cars_waiting = 
			up: up_down
			down: up_down
			left: left_right
			right: left_right
			up_down: up_down
			left_right: left_right

		@pos = 
			x: @col*100/S.size
			y: @row*100/S.size

		@signal = new Signal

	receive:(car, direction)->
		car.set_at_intersection true
		@cars_waiting[direction].push car

	set_beg_lane: (lane)->
		@lanes[lane.direction] = lane

	turn_car: (c,i,k) ->
			new_lane = @lanes[c.turns[0]]
			if new_lane.is_free()
				_.remove k, c
				c.turns.shift()
				c.lane?.remove c
				c.set_lane new_lane
				new_lane.receive c

	tick: ->
		@signal.tick()
		cars = @cars_waiting[@signal.direction]
		_.forEach cars, @turn_car,this

module.exports = Intersection