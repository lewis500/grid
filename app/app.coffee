_ = require 'lodash'
angular = require 'angular'
d3 = require 'd3'
S = require './models/settings'
Traffic = require './models/traffic'

class Ctrl
	constructor:(@scope,@el)->
		@paused = true
		@scope.S = S
		@scope.traffic = new Traffic
		@day_start()

	place_car: (car)->
		"translate(#{car.x},#{car.y})"

	place_intersection: (d)->
		"translate(#{d.pos.x},#{d.pos.y})"

	place_lane: (d)->
		"M #{d.a.x},#{d.a.y} L #{d.b.x},#{d.b.y}"		

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		# if @physics
		# 	setTimeout =>
		# 			if @scope.traffic.done()
		# 				@day_end()
		# 				return
		# 			S.advance()
		# 			@scope.traffic.tick()
		# 			@scope.$evalAsync()
		# 			# @paused
		# 			if !@paused then @tick()
		# 			# true
		# 		, S.pace
			d3.timer =>
					if @scope.traffic.done()
						@day_end()
						return true
					S.advance()
					@scope.traffic.tick()
					@scope.$evalAsync()
					# @paused
					if !@paused then @tick()
					true
				, S.pace

	play: ->
		@pause()
		# d3.timer.flush()
		@paused = false
		@tick()

	day_start: ->
		S.reset_time()
		@physics = true #physics stage happening
		@scope.traffic.day_start()
		@tick()

	day_end: ->
		@physics = false #physics stage not happening
		# d3.timer.flush()
		@scope.traffic.day_end()
		# @day_start()
		setTimeout => @day_start()

twoDer = ->
	directive = 
		scope: 
			cars: '='
		link: (scope,el,attr)->
			params = { width: 700, height: 700, type: Two.Types.webgl }
			two = new Two(params).appendTo el[0]
			sel = d3.select el[0]

			data = []
			map = {}
			twos = {}

			scope.$watch ->
					S.time
				, ->
					newD = scope.cars
					new_map = {}
					enter = {}
					for d in newD
						new_map[d.id] = d
						if !map[d.id]
							data.push d
							map[d.id] = d
							enter[d.id] = d
							if !(twos[d.id])
								twos[d.id] = two.makeRectangle -2,-2,4,4
								twos[d.id].fill = d.color
								twos[d.id].stroke = 'white'

					for d in data
						if !new_map[d.id]
							delete map[d.id]
							two.remove twos[d.id]
						else
							if !enter[d.id]
								two.add twos[d.id]
							twos[d.id].translation.set d.x*7, d.y*7

					two.update()

visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', '$element', Ctrl]

signalDer = ->
	directive = 
		scope: 
			direction:'='
		link:(scope,el,attr)->
			signals = d3.select el[0]
				.selectAll 'signals'
				.data ['up_down','left_right','up_down','left_right']
				.enter()
				.append 'rect'
				.attr
					width: 1.2
					height: .6
					class: 'signal'
					y: -1.2
					x:-.6
					transform: (d,i)->
						"rotate(#{90*i})"

			scope.$watch 'direction',(newVal)->
				signals
					# .attr 
					.classed 'on', (d)-> d==newVal

angular.module 'mainApp' , [require 'angular-material' , require 'angular-animate']
	.directive 'visDer', visDer
	.directive 'signalDer',signalDer
	.directive 'twoDer',twoDer
	.directive 'mfdDer',require './mfd'
	.directive 'horAxis', require './directives/xAxis'
	.directive 'verAxis', require './directives/yAxis'
	# .directive 'canDer', canDer



# canDer = ->
# 	directive = 
# 		scope: 
# 			cars: '='
# 		link: (scope,el,attr)->

# 			ctx = d3.select el[0]
# 					.append 'canvas'
# 					.attr
# 						width: 700
# 						height: 700
# 					.node()
# 					.getContext '2d'

# 			ctx.fRect= (x,y,w,h)->
# 				x = parseInt x
# 				y = parseInt y
# 				ctx.fillRect x,y,w,h

# 			ctx.sRect = (x,y,w,h)->
# 				x = .5+parseInt x
# 				y = .5+parseInt y
# 				ctx.strokeRect x,y,w,h

# 			ctx.strokeStyle = '#ccc'
# 			scope.$watch ->
# 					S.time
# 				, ->
# 					ctx.clearRect 0, 0, 700,700
# 					_.forEach scope.cars, (c)->
# 						ctx.fillStyle = c.color
# 						{x,y} = c
# 						ctx.fRect x*7,y*7,4,4
# 						ctx.sRect x*7,y*7,4,4


