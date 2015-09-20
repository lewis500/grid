_ = require 'lodash'
S = require './settings'

class Signal
	constructor: ->
		@count = 0
		@direction = 'up_down'
		@id = _.uniqueId 'signal-'

	tick: ->
		@count++
		if @count >= (S.phase + _.random -5,5)
			[@count, @direction] = [0, 'up_down'] #add offset later
			return
		if @count >= (S.green*S.phase)
			@direction = 'left_right'

class Intersection
	constructor:(@row,@col)->
		@id = _.uniqueId 'intersection-'
		[@beg_lanes,@end_lanes] = [{},{}]

		@pos = 
			x: @col*100/S.size
			y: @row*100/S.size

		@signal = new Signal

		@directions = 
			'up_down': ['up','down']
			'left_right': ['left','right']

	set_beg_lane: (lane)->
		@beg_lanes[lane.direction] = lane

	set_end_lane: (lane)->
		@end_lanes[lane.direction] = lane

	day_start: ->
		@signal.count = 0

	can_go: (direction)->
		direction in @directions[@signal.direction]

	tick: ->
		@signal.tick()

module.exports = Intersection