_ = require 'lodash'
S = require './settings'
class Car
	constructor: (@turns,@d_loc)->
		@id = _.uniqueId 'car-'
		@stopped = 0
		@color = _.sample @colors
		@exited = false

	subtract_stop:->
		@stopped--

	at_destination: ->
		(@turns.length == 0) and (@loc==@d_loc)

	colors: ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']

	set_at_intersection: (@at_intersection)->

	set_lane: (@lane)->

	exit: ->
		@exited = true

	stop: ->
		@stopped = S.stopping_time 

	advance:->
		@loc++

	set_xy: (pos)->
		{@x,@y} = pos

module.exports = Car