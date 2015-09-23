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
			directions: ['up','right','down','left']
			cars: []
			inner: []
			outer: []

		@grid = [0...S.size].map (row)=>
			[0...S.size].map (col)=>

				@intersections.push (i = new Intersection row,col)
				if (0<row<(S.size-1)) and (0<col<(S.size-1))
					@inner.push i
				else 
					@outer.push i
				i

		for i in @intersections
			for dir in @directions
				j = switch dir
					when 'up' then @grid[i.row-1]?[i.col]
					when 'right' then @grid[i.row][i.col+1]
					when 'down' then @grid[i.row+1]?[i.col]
					when 'left' then @grid[i.row][i.col-1]
				if j 
					@lanes.push new Lane i,j,dir


		@create_car() for i in [0...S.num_cars]

	choose_intersection: ->
		a = _.sample @intersections
		b = _.sample @intersections
		if a.id==b.id then @choose_intersection() else {a: a, b: b}

	create_car: ->
		# {a,b} = @choose_intersection()
		a = _.sample @outer
		b = _.sample @inner
		ud = if b.row < a.row then 'up' else 'down'
		lr = if b.col < a.col then 'left' else 'right'
		uds = (ud for i in [0...Math.abs(b.row-a.row)])
		lrs = (lr for i in [0...Math.abs(b.col-a.col)])
		car = new Car a,uds,lrs,b
		@cars.push car

	tick_lane: (lane)->
		lane.count_cars()
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

	turn_car: (c,i)->
		if c.des.id == i.id
			c.exited = true
			c.t_ex = S.time
			true
		else
			{uds,rls} = c
			l1 = i.beg_lanes[uds[0]]
			l2 = i.beg_lanes[rls[0]]
			if l1?.is_free() and l2?.is_free()
				if l1.num_cars < l2.num_cars
					lane_chosen = l1
					arr_chosen = uds
				else
					lane_chosen = l2
					arr_chosen = rls
			else if l1?.is_free()
				lane_chosen = l1
				arr_chosen = uds
			else if l2?.is_free()
				lane_chosen = l2
				arr_chosen = rls
			if lane_chosen
				lane_chosen.receive c
				c.entered = true
				arr_chosen.shift()
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