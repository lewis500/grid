_ = require 'lodash'
S = require './settings'


class Car
	constructor: (@start_cell,@perm_turns, @des)->
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 4,300
			color: _.sample @colors

	# at_destination: (x,y)->
	# 	(@des.x == x) and (@des.y == y)

	colors: ['#03A9F4','#8BC34A','#E91E63','#FF5722','#607D8B','#3F51B5']

	enter:->
		_.assign this,
			cost0: @cost
			exited: false
			stopped: 0
			turns: _.clone @perm_turns
			
		@start_cell.receive this,S.time

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -2,2)

	stop: ->
		@stopped = S.stopping_time 

	set_xy: (@x,@y,@x2,@y2)->
		# if @x2 == @des.x and @y2 = @des.y
		# 	@exit()

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