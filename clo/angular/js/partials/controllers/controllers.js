var controllers = {
	dealsListController: function($scope, $http, $location, filterFilter, sharedService, responseData) {
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
	}, //end dealsListController
	
	
	compareController: function($scope, $q, $http, $location, sharedService, responseData) {
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
		
	} //end compareController
}
