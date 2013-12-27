var controllers = {
	entityListController: function($scope, $location, filterFilter, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		//add vars to local scope for editing
		$scope.predicate = $scope.sharedData.defaultPredicate;
		$scope.entities  = $scope.sharedData.entities;
		$scope.selection = $scope.sharedData.selection.group; 
		
		//add "selected" node to each entity data object
		if(!$scope.selection.length && !$scope.entities[0].selected){
			angular.forEach($scope.entities, function addSelectedNode(value, key){
				value.selected = false;
			});
		}
		
		//get the currently entites which should be selected
		$scope.selectedEntities = function selectedEntities(){
			return filterFilter( $scope.entities, { selected: true } );
		};
		
		//watch the state of the "selected" node on each data object and modify the selection array
		$scope.$watch( 'entities|filter:{selected:true}', function( nv ){
			$scope.selection = nv.map( function( entity ){
				return entity.id;
			});
		}, true);
		
		//validates and sets the current selection in the shared service var
		$scope.setSelection = function(){
			if(!$scope.selection.length || $scope.selection.length <= 1 ){
				alert("Select at least two deals to compare.");
			} else if($scope.selection.length >= 5 ){
				alert("You can select a maximum of ");
			} else {
				sharedService.sharedObject.selection.group = $scope.selection;
				$location.path( "/compare_chart" );
			}
		}
	},
	
	entityController: function($scope) {
		//Simple entity View - Possible removal
		$scope.sharedData = sharedService.sharedObject;
		$scope.entities  = $scope.sharedData.entities;
	},
	
	
	//TODO - Abstract this so that it can be used for all basic comparisons
	compareGlossaryController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.glossary, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.glossary[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.glossary[mapKey]);
			});
			$scope.displayData.push(row);
		});
	},
	
	compareChartController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.chart.names, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.chart.names[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.chart[mapKey]);
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
				
				//Calculate Average
				for (var i = 0; i < colLength; i++) {
					average += parseFloat($scope.displayData[mapKey].cols[i]) / colLength || 0;
				}
				tempArray.push(average);
				
				//Calculage Min
				tempArray.push(average * .9123 || 0);
				
				//Calculate Max
				tempArray.push(average * 1.175 || 0);
			}
			angular.forEach(tempArray, function(value,key){
				$scope.displayData[mapKey].cols.push(value);
			});
		});
	}
}
