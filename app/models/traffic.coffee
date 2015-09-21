!_ = require 'lodash'
S = require './settings'
Lane = require './lane'
Intersection = require './intersection'
# Signal = require './signal'
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
					@lanes.push new Lane i,j,dir
					if (0<i.row<(S.size-1)) and (0<i.col<(S.size-1))
						@inner.push i
					else
						if (i.row>0) or (i.col>0)
							@outer.push i
							i.outer = true

		@create_car() for i in [0...S.num_cars]

	choose_intersection: ->
		a = _.sample @intersections
		b = _.sample @intersections
		if a.id==b.id then @choose_intersection() else {a: a, b: b}


	create_car: ->
		# a = _.sample @intersections
		# b = _.sample @intersections
		{a,b} = @choose_intersection()
		ud = if b.row < a.row then 'up' else 'down'
		lr = if b.col < a.col then 'left' else 'right'
		uds = (ud for i in [0...Math.abs(b.row-a.row)])
		lrs = (lr for i in [0...Math.abs(b.col-a.col)])
		turns = _.shuffle _.flatten([uds,lrs])
		car = new Car a,turns,b
		@cars.push car

	tick_lane: (lane)->
		num_moving = 0
		k = lane.cells
		if (car=k[k.length-1].car)
			if lane.end.can_go lane.direction
				if @turn_car car, lane.end
					k[k.length-1].remove()
					num_moving++

		for cell,i in k[0...k.length-1]
				target = k[i+1]
				if target.is_free() and (car=cell.car)
					num_moving++
					target.receive car
					cell.remove()
		num_moving

	turn_car: (car,i)->
		if car.des.id == i.id
			car.exited = true
			car.t_ex = S.time
			true
		else
			lane = i.beg_lanes[car.turns[0]]
			if lane.is_free()
				lane.receive car
				car.entered=true
				car.turns.shift()
				true

	tick: ->
		i.tick() for i in @intersections
		num_moving = _.sum (@tick_lane lane for lane in @lanes)

		for car in @waiting
			if car.t_en<S.time then @turn_car car,car.orig

		for l in @lanes
			for c in l.cells
				c.finalize()

		@waiting = _.filter @cars,(c)-> !c.entered
		@traveling = _.filter @cars, (c)-> c.entered and !c.exited

		if S.time %S.frequency ==0
			@memory.push 
				n: @traveling.length
				v: num_moving/@traveling.length
				f: num_moving
				id: _.uniqueId()

	log: ->
		@cum.push
			time: S.time
			cumEn: S.num_cars - @waiting.length 
			cumEx: S.num_cars - @traveling.length-@waiting.length

	done: ->
		(@waiting.length+@traveling.length)==0

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
			waiting: _.clone @cars
		for intersection in @intersections
			intersection.day_start() 
		for lane in @lanes
			lane.day_start()
		for car in @cars
			car.day_start()

module.exports = Traffic