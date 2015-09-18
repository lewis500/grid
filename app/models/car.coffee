_ = require 'lodash'
S = require './settings'


class Car
	constructor: (@_turns,@d_loc,@start_lane)->
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 4,300
			color: _.sample @colors

	subtract_stop:->
		@stopped--

	at_destination: ->
		(@turns.length == 0) and (@loc==@d_loc)

	colors: ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']

	set_at_intersection: (@at_intersection)->

	enter:->
		_.assign this,
			cost0: @cost
			exited: false
			stopped: 0
			turns: _.clone @_turns
		@turns.shift()

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -2,2)

	stop: ->
		@stopped = S.stopping_time 

	advance:->
		@loc++

	set_xy: (pos)->
		{@x,@y} = pos

	exit: ->
		[@t_ex, @exited] = [S.time, true]

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if @cost < @cost0
			[@cost0,@target] = [@cost, @t_en]

module.exports = Car