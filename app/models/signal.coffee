_ = require 'lodash'
S = require './settings'

class Signal
	constructor: ->
		@count = 0
		@direction = 'up_down'
		@id = _.uniqueId 'signal-'

	tick: ->
		@count++
		if @count >= S.phase
			[@count, @direction] = [0, 'up_down'] #add offset later
			return
		if @count >= (S.green*S.phase)
			@direction = 'left_right'

module.exports = Signal