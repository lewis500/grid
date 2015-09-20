_ = require 'lodash'
class Settings
	constructor:->
		_.assign this,
			size: 10
			stopping_time: 5
			pace: 5
			space: 2
			phase: 50
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