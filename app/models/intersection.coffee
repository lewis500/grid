_ = require 'lodash'
S = require './settings'
Signal = require './signal'

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

	can_go: (direction)->
		direction in @directions[@signal.direction]

	tick: ->
		@signal.tick()

module.exports = Intersection