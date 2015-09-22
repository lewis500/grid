_ = require 'lodash'
class Settings
	constructor:->
		_.assign this,
			size: 9
			stopping_time: 5
			pace: 1
			space: 4
			phase: 80
			green: .5
			lane_length: 10
			wish: 150
			num_cars: 2000
			time: 0
			beta: .5
			gamma: 2
			frequency: 25
			day: 0

	advance: ->
		@time++
	reset_time: ->
		@day++
		@time = 0

module.exports = new Settings()