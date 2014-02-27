//Setup Main App and inject dependencies
angular.module( 'app', [
	'ngRoute',
	'ngCsv',
	'loader',
	'report',
	'info',
	'cdsDataServices',
	'templates-app', 
	'templates-common']);

angular.module( 'app' ).config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.otherwise({redirectTo:'/info'});
}]);

angular.module( 'app' ).controller('appCtrl', ['$scope', '$location', function( $scope, $location ){
	//returns boolean value based on current route path for class toggle
	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
}]);