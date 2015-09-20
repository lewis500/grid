!_ = require 'lodash'
S = require './settings'
Lane = require './lane'
Intersection = require './intersection'
Signal = require './signal'
Car = require './car'


class Traffic
	constructor: ->
		_.assign this,
			intersections: []
			lanes: []
			outer: []
			inner: []
			directions: ['up','right','down','left']
			cars: []

		@grid = [0...S.size].map (row)=>
			[0...S.size].map (col)=>
				@intersections.push (intersection = new Intersection row,col)
				intersection

		for i in @intersections
			for dir in @directions
				j = switch dir
					when 'up' then @grid[i.row-1]?[i.col]
					when 'right' then @grid[i.row][i.col+1]
					when 'down' then @grid[i.row+1]?[i.col]
					when 'left' then @grid[i.row][i.col-1]
				if j 
					@lanes.push (lane=new Lane i,j,dir)
					if (0<i.row<(S.size-1)) and (0<i.col<(S.size-1))
						@inner.push i
					else
						if (i.row>0) or (i.col>0)
							@outer.push i
							i.outer = true

		@create_car() for i in [0...S.num_cars]

	create_car: ->
		a = _.sample @outer
		b = _.sample @inner
		ud = if b.row < a.row then 'up' else 'down'
		lr = if b.col < a.col then 'left' else 'right'
		uds = (ud for i in [0...Math.abs(b.row-a.row)])
		lrs = (lr for i in [0...Math.abs(b.col-a.col)])
		turns = _.shuffle _.flatten([uds,lrs])
		car = new Car a,turns,b
		@cars.push car

	tick: ->
		(i.tick() for i in @intersections)
		(l.tick() for l in @lanes)
		@waiting.forEach (car)=>
			if car.t_en < S.time
				if car.orig.can_go car.turns[0]
					car.orig.turn_car car

		@waiting = _.filter @cars,(c)-> !c.entered
		@traveling = _.filter @cars, (c)-> c.entered and !c.exited

		for l in @lanes
			for c in l.cells
				c.finalize()

		if S.time %S.frequency ==0
			@log()
			@remember()

	remember: ->
		mem = 
			n: @traveling.length
			v: 0
			f: 0

		for c in @traveling
			if c.stopped == 0
				mem.f++
				mem.v+=(1/mem.n)
				
		@memory.push mem

	log: ->
		@cum.push
			time: S.time
			cumEn: S.num_cars - @waiting.length 
			cumEx: S.num_cars - @traveling.length-@waiting.length

	done: ->
		(@waiting.length+@traveling.length)==0

	remove: (car)->
		@cumEx++
		_.remove @traveling, car

	day_end:->
		c.eval_cost() for c in @cars
		c.choose() for c in _.sample @cars, 25
		setTimeout => @day_start()

	day_start:->
		_.assign this,
			traveling: []
			cum: []
			memory: []
			cumEn: 0
			cumEx: 0
			waiting: _.clone @cars
		S.reset_time()
		for intersection in @intersections
			intersection.day_start() 
		for lane in @lanes
			lane.day_start()
		for car in @cars
			car.day_start()

module.exports = Traffic