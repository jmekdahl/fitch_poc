var controllers = {
	dealsListController: function($scope, $location, filterFilter, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		//add variables to local scope for editing
		$scope.predicate = $scope.sharedData.defaultPredicate;
		$scope.deals     = $scope.sharedData.deals;
		$scope.selection = $scope.sharedData.selection.group; 
		
		
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
				return deal.id;
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
		}
	},
	
	
	compareController: function($scope, $q, $location, sharedService, compare) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedDeals = [];
		angular.forEach($scope.sharedData.deals, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedDeals.push(entValue);
				}
			});
		});
		
		//iterate over entity objects to create displayData expected by view
		$scope.displayData = [];
		
		//If the dataMap for a section does not have labels 
		if(!$scope.sharedData.dataMap[compare].length){
			var longest = 0;
			angular.forEach($scope.selectedDeals, function(value, key){
				longest = ( value[compare].length > longest ) ? value[compare].length : longest;
			});
			for(var i = 0; i < longest; i++ ){
				var row = { cols:[] };
				angular.forEach($scope.selectedDeals, function(dealValue, dealKey){
					row.cols.push(dealValue[compare][i]);
				});
				$scope.displayData.push(row);
			}
			
		//otherwise use dataMap to set labels and iterate and set column data
		} else {
			angular.forEach($scope.sharedData.dataMap[compare], function(mapValue, mapKey){
				var row = { name: $scope.sharedData.dataMap[compare][mapKey], cols: [] };
				angular.forEach($scope.selectedDeals, function(dealValue, dealKey){
					row.cols.push(dealValue[compare][mapKey]);
				});
				$scope.displayData.push(row);
			});
		}
	},
	
	
	compareChartController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedDeals = [];
		angular.forEach($scope.sharedData.deals, function(dealValue, dealKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === dealValue.id){
					$scope.selectedDeals.push(dealValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.chart.names, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.chart.names[mapKey], cols: [] }
			angular.forEach($scope.selectedDeals, function(dealValue, dealKey){
				row.cols.push(dealValue.chart[mapKey]);
			});
			$scope.displayData.push(row);
		});
		
		//calculate data if necessary
		$scope.calcData = { titles: ["Average", "Min", "Max"] };
		
		angular.forEach($scope.sharedData.dataMap.chart.calcs, function(mapValue, mapKey){
			if(!mapValue){
				tempArray = [0, 0, 0];
			} else {
				var average = 0, min = 0, max = 0,
					temp = 0, tempArray = [], 
					colLength = $scope.displayData[mapKey].cols.length;
				
				//Calculation for Average
				for (var i = 0; i < colLength; i++) {
					average += parseFloat($scope.displayData[mapKey].cols[i]) / colLength || 0;
				}
				tempArray.push(parseFloat(average).toFixed(2));
				
				//Calculation for Min
				tempArray.push(parseFloat(average * .9123).toFixed(2) || 0);
				
				//Calculation for Max
				tempArray.push(parseFloat(average * 1.175).toFixed(2) || 0);
			}
			angular.forEach(tempArray, function(value,key){
				$scope.displayData[mapKey].cols.push(value);
			});
		});
	}
}
