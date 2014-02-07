//Setup Main App and inject dependencies
angular.module( 'cloApp', [
	'ngRoute',
	'info',
	'list',
	'compare',
	'loader',
	'cloDataServices',
	'templates-app', 
	'templates-common']);

angular.module('cloApp').factory("sharedService", function(){
	return { sharedObject: { 
		selection:{
			group:[],
			min:2,
			max:5
		},
		deals: {},
		dataMap: {},
		defaultPredicate: "name",
		comparison: { dflt: "/compare/chart" }
	}}
});

angular.module( 'cloApp' ).config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.otherwise({redirectTo:'/info'});
}]);

angular.module( 'cloApp' ).controller('cloAppCtrl', ['$scope', '$location', function( $scope, $location ){
	//returns boolean value based on current route path for class toggle
	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
}]);