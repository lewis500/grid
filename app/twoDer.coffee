S = require './models/settings'
twoDer = ->
	directive = 
		scope: 
			cars: '='
		link: (scope,el,attr)->
			params = { width: 700, height: 700, type: Two.Types.webgl }
			two = new Two(params).appendTo el[0]

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
							map[d.id] = d
							enter[d.id] = d
							if !(t= twos[d.id])
								t=twos[d.id] = two.makeRectangle -1.5,-1.5,3,3
								t.fill = d.color
								t.stroke = 'white'
								t.linewidth=.7

					for id,d of map
						if !new_map[d.id]
							map[id] = false
							two.remove twos[id]
						else
							if !enter[id]
								two.add twos[id]
							twos[id].translation.set d.x*7, d.y*7

					two.update()

module.exports = twoDer