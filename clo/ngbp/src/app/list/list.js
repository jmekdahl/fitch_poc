angular.module( 'list', [] )

.config( ['$routeProvider', function( $routeProvider ){
	console.log($routeProvider);
	$routeProvider.when('/list', {
		templateUrl:'list/list.tpl.html',
		controller: 'listCtrl',
		resolve: {
			responseData: function(){ return "in" }
		}
	});
}])

.controller( 'listCtrl', ['$scope', function ($scope){
	$scope.responseData = responseData;
}]);