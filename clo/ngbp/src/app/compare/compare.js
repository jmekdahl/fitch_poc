angular.module( 'compare', [] )

.config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/compare/:comparetype', {
		controller: 'compareController',
		templateUrl: 'compare/compare.tpl.html',
		resolve: {
			responseData: function(cloDealServices, sharedService, $route){
				return cloDealServices.getDealInfo( 
					$route.current.params.comparetype, 
					sharedService.sharedObject.selection.group
				);
			}
		}	
	});
}])

.controller( 'compareController', ['$scope', '$q', '$http', '$location', 'sharedService', 'responseData', function($scope, $q, $http, $location, sharedService, responseData) {
	$scope.sharedData = sharedService.sharedObject;

	if(!$scope.sharedData.selection.group.length){
		$location.path( "/list" );
	}
	
	$scope.displayData  = [];
	$scope.responseData = responseData;
	
	//If the dataMap for a section does not have labels 
	if(!$scope.responseData.map){
		var longest = 0;
		angular.forEach($scope.responseData.deals, function(value, key){
			longest = ( value.compareData.length > longest ) ? value.compareData.length : longest;
		});
		for(var i = 0; i < longest; i++ ){
			var row = { cols:[] };
			angular.forEach($scope.responseData.deals, function(dealValue, dealKey){
				row.cols.push(dealValue.compareData[i]);
			});
			$scope.displayData.push(row);
		}
		
	//otherwise use dataMap to set labels and iterate and set column data
	} else {
		angular.forEach($scope.responseData.map, function(mapValue, mapKey){
			var row = { name: $scope.responseData.map[mapKey], cols: [] };
			angular.forEach($scope.responseData.deals, function(dealValue, dealKey){
				row.cols.push(dealValue.compareData[mapKey]);
			});
			$scope.displayData.push(row);
		});
	}
	
	//returns boolean value based on current route path for class toggle
	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
}]);



