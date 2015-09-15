der = ->
	res = 
		scope: 
			label: '@'
			myData: '='
			min: '='
			max: '='
			step: '='
		controllerAs: 'vm'
		replace: true
		controller: ->
		bindToController: true
		templateUrl: './dist/slider.html'

module.exports = der