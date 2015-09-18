_ = require 'lodash'
class Settings
	constructor:->
		_.assign this,
			size: 10
			stopping_time: 5
			pace: 15
			space: 2
			phase: 50
			green: .5
			lane_length: 10
			wish: 150
			num_cars: 250
			time: 0
			beta: .5
			gamma: 2
			frequency: 8
			day: 0

	advance: ->
		@time++
	reset_time: ->
		@day++
		@time = 0

module.exports = new Settings()