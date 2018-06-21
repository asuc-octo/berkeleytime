var secretApp = angular.module('Secret', []);

secretApp.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

secretApp.controller('secretController', function($scope) {
	$scope.secretColors = [
		{
			"name": "Red",
			"hex": "#ed5565"
		},
		{
			"name": "Orange",
			"hex": "#fc6e51"
		},
		{
			"name": "Yellow",
			"hex": "#ffce54"
		},
		{
			"name": "Grass",
			"hex": "#a0d468"
		},
		{
			"name": "Mint",
			"hex": "#48cfad"
		},
		{
			"name": "Aqua",
			"hex": "#4fc1e9"
		},
		{
			"name": "Lavander",
			"hex": "#ac92ec"
		},
	];

	$scope.secretDefaultColor = $scope.secretColors[0].hex;
	$scope.secretOrgName = "Advertise with Us!";
	$scope.secretOrgURL = "yuxinzhu@berkeley.edu";
	$scope.secretDescription = "Email yuxinzhu@berkeley.edu to get started. Spend $1 a day and advertise directly on berkeleytime.com! ";

	
	$scope.toggleColor = function(color) {
		$scope.secretDefaultColor = color;
		$scope.secretBorderColor = modifyColor(color, -0.2);
	}
});