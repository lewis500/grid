S = require './settings'
_ = require 'lodash'
require './helpers'

class Traffic
	constructor: ->
		@change_signals S.num_signals

	reset:(waiting)->
		_.assign this,
			traveling: []
			cum: []
			memory: []
			waiting: _.clone( waiting)

		@signals.forEach (s)->
			s.reset_offset()

	done: ->
		(@waiting.length+@traveling.length)==0

	# receive: (car)->
	# 	@cumEn++
	# 	loc = _.random 0,S.rl
	# 	g0 = 0
	# 	_.forEach @traveling, (c)->
	# 		g = c.get_gap()
	# 		if g >= g0
	# 			loc = Math.floor(c.loc + g/2)%S.rl
	# 			g0 = g

	# 	if (g0 > 0 and @traveling.length>0) or (@traveling.length==0)
	# 		_.remove @waiting, car
	# 		car.enter loc
	# 		@traveling.push car
	# 		@order_cars()

	remove: (car)->
		# @cumEx++
		_.remove @traveling, car

	update: ->
		reds = []
		@signals.forEach (s)->
			s.update()
			if !s.green
				reds.push s.loc

		@waiting.forEach (car)=>
			if _.lt car.t_en,S.time then @receive car
		@traveling.forEach (car)=>
			car.move reds
			if car.exited then @remove car

		@log()
		if (S.time%S.frequency==0) then @remember()

		@order_cars()

	order_cars: ->
		if (l = @traveling.length) > 1
			@traveling.sort (a,b)-> a.loc - b.loc
			@traveling.forEach (car,i,k)->
				car.set_next k[(i+1)%l]
		if l == 1
			@traveling[0].set_next null

class Car
	constructor:(@distance)->
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 4,(S.rush_length - S.distance-35)
			exited: false

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -2,2)

	# setters
	set_next: (@next)->

	get_gap:->
		if !@next then return Math.floor S.rl/2
		gap = @next.loc - @loc
		if _.lte gap,0 then (gap+S.rl) else gap

	exit: ->
		[@next, @t_ex, @exited] = [undefined, S.time, true]

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if _.lte @cost,@cost0 then [@cost0,@target] = [@cost, @t_en]

	enter:(@loc)->
		@destination = Math.floor (@loc + @distance)%S.rl
		# @destination = Math.floor @destination
		[@cost0, @exited, @stopped, @color] = [@cost,false,0, S.colors(@destination)]

	move: (reds)->
		if @stopped > 0 then @stopped--
		else
			if @loc == @destination
				@exit()
			else 
				next_loc = (@loc + 1)%S.rl
				if (@get_gap() >= S.space) and (next_loc not in reds)
					@loc = next_loc
				else
					@stopped = S.stopping_time

module.exports = 
	Car: Car
	Traffic: Traffic
	Signal: Signal
