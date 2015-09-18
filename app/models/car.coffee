_ = require 'lodash'

class Car
	constructor: (@turns,@destination)->
		@id = _.uniqueId 'car-'
		@stopped = 0
		# @lane.receive this
		@at_intersection = true
		# @set_at_intersection true
		# {@x,@y} = @lane.scale (@loc = _.random 2,5)
		@color = _.sample @colors

	subtract_stop:->
		@stopped--

	at_destination: ->
		(@destination.x == @x) and (@destination.y == @y)

	colors: ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']

	set_at_intersection: (@at_intersection)->

	set_lane: (@lane)->

	stop: ->
		@stopped = S.stopping_time 

	advance:->
		@loc++

	set_xy: (pos)->
		{@x,@y} = pos

	reset_loc: ->
		@loc=0

module.exports = Car