angular.module( 'info', [] )

.config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/info', {
		templateUrl:'info/info.tpl.html'
	});
}])