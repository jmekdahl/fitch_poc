//Setup Main App and inject dependencies
angular.module( 'cloApp', [
	'ngRoute',
	'list',
	//'cloDataServices',
	//'directives.loader'
	'templates-app', 
	'templates-common']);

angular.module( 'cloApp' ).config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.otherwise({redirectTo:'/list'});
}]);

angular.module( 'cloApp' ).controller('cloAppCtrl', ['$scope', function( $scope ){
	$scope.temp = "in app";
}]);