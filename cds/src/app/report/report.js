angular.module('report', [])

.config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/report/:reporttype', {
		controller: 'reportCtrl',
		templateUrl: 'report/report.tpl.html',
		resolve: {
			responseData: function(cdsRestServices, sharedService, $route){
				return cdsRestServices.getDataById( $route.current.params.reporttype, '2014-02-04', '20' );
			}
		}
	});
}])

.controller( 'reportCtrl', ['$scope', '$location', '$filter', 'responseData', function($scope, $location, $filter, responseData){
	$scope.responseRaw = responseData.raw; //todo: remove the raw resopnse and corresponding scope var
	$scope.displayTitles = responseData.titles;

	$scope.pagination = {
		current: 1, 
		numPerPage: 50, 
		count: responseData.data.length,

		previous: function(){
			$scope.pagination.current--;
		},

		next: function(){
			$scope.pagination.current++;
		},
		setPage: function( page ){
			$scope.pagination.current = page;
			var arrayIndex = $scope.pagination.current - 1;
			$scope.displayData = responseData.data.slice( arrayIndex, ( arrayIndex + $scope.pagination.numPerPage ) );
		}
	} 

	$scope.csvExport = {
		filename: "20_stale_20140204.csv",
		titleRow: [],
		/* todo: update title row for CSV with returned title object
		$scope.displayTitles.map( function( obj ){
				return obj.displayTitle;
			}),*/
		data: responseData.data
	}

	$scope.updateFilter = function(){
		if( !$scope.filter.basic ){
			$scope.pagination.setPage(1); //todo: error msg handler
		} else {
			$scope.displayData = $filter('filter')(responseData.data, $scope.filter.basic);
		}
	}
	
	$scope.pagination.setPage($scope.pagination.current);	 

	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
}]);