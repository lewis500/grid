_ = require 'lodash'
S = require './settings'


class Car
	constructor: (@orig,@perm_turns,@des)->
		#des is an intersection
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 4,600
			color: _.sample @colors

	is_destination: (i)->
		i.id == @des.id

	colors: ['#03A9F4','#03A9F4','#8BC34A','#FF5722','#607D8B','#3F51B5','#4CAF50','#651FFF','#1DE9B6']

	day_start: ->
		_.assign this,
			cost0: @cost
			entered: false
			exited: false
			cell: undefined
			t_en: Math.max 0,(@target + _.random -2,2)
			turns: _.shuffle _.clone @perm_turns

	set_xy: (@x,@y,@x2,@y2)->

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if @cost < @cost0
			[@cost0,@target] = [@cost, @t_en]

module.exports = Car