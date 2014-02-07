angular.module( 'list', [] )

.config( ['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/list', {
		templateUrl:'list/list.tpl.html',
		controller: 'listCtrl',
		resolve: {
			responseData: function( cloDealServices ){ 
				return cloDealServices.getAllDeals();
			}
		}
	});
}])

.controller( 'listCtrl', ['$scope', '$http', '$location', 'filterFilter', 'sharedService', 'responseData', function($scope, $http, $location, filterFilter, sharedService, responseData) {
		$scope.sharedData = sharedService.sharedObject;
		
		//add variables to local scope for editing
		$scope.predicate = $scope.sharedData.defaultPredicate;
		$scope.selection = $scope.sharedData.selection.group;
		$scope.deals     = responseData.deals;
		
		//add "selected" node to each entity data object
		if($scope.deals.length && !$scope.selection.length && !$scope.deals[0].selected){
			angular.forEach($scope.deals, function addSelectedNode(value, key){
				value.selected = false;
			});
		}
		
		//get the currently entites which should be selected
		$scope.selectedDeals = function selectedDeals(){
			return filterFilter( $scope.deals, { selected: true } );
		};
		
		//watch the state of the "selected" node on each data object and modify the selection array
		$scope.$watch( 'deals|filter:{selected:true}', function( nv ){
			$scope.selection = nv.map( function( deal ){
				return {id: deal.id, name: deal.name};
			});
		}, true);
		
		//validates and sets the current selection in the shared service var
		$scope.setSelection = function(){
			if(!$scope.selection.length || $scope.selection.length < sharedService.sharedObject.selection.min ){
				alert("Select at least two deals to compare.");
			} else if($scope.selection.length > sharedService.sharedObject.selection.max ){
				alert("You can select a maximum of "+ sharedService.sharedObject.selection.max);
			} else {
				sharedService.sharedObject.selection.group = $scope.selection;
				$location.path( sharedService.sharedObject.comparison.dflt );
			}
		};

		$scope.unselect = function( id ){
			$scope.deals.map( function( deal ) { 
				if( deal.id === id ) {
					deal.selected = false; 
				}
			});
		};
	}]);

