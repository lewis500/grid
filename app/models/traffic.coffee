_ = require 'lodash'
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

		@grid = [0..S.size].map (row)=>
			[0..S.size].map (col)=>
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
						@inner.push lane
					else
						@outer.push lane

		_.forEach [0..S.num_cars], => @create_car()

	create_car: ->
		a = _.sample @outer
		b = _.sample @inner
		ud = if b.row < a.row then 'up' else 'down'
		lr = if b.col < a.col then 'left' else 'right'
		uds = [0..Math.abs(b.row-a.row)].map (i)-> ud
		lrs = [0..Math.abs(b.col-a.col)].map (i)-> lr
		turns = _.shuffle _.flatten [uds,lrs]
		# turns.shift
		cells = _.filter a.cells, (d)-> d.is_free S.time
		if cells.length==0 then return
		start_cell = _.sample cells
		des = _.sample(b.cells)._pos
		car = new Car start_cell,turns,des
		@cars.push car

	tick: ->
		(i.tick() for i in @intersections)
		(l.tick() for l in @lanes)
		for car in @waiting
			if car
				if car.t_en < S.time
					car.enter()
					car.turns.pop()
					_.remove @waiting, car
					@traveling.push car

		@traveling = _.filter @traveling, (c)-> !c.exited

		for l in @lanes
			for c in l.cells
				c.finalize()

		@log()

		if (S.time%S.frequency==0) then @remember()

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
			cumEn: @cumEn
			cumEx: @cumEx

	done: ->
		(@waiting.length+@traveling.length)==0

	remove: (car)->
		@cumEx++
		_.remove @traveling, car

	day_end:->
		c.eval_cost() for c in @cars
		c.choose() for c in _.sample @cars, 25

	day_start:->
		_.assign this,
			traveling: []
			cum: []
			memory: []
			cumEn: 0
			cumEx: 0
			waiting: _.clone(@cars)

		_.invoke @cars, 'assign_error'

module.exports = Traffic