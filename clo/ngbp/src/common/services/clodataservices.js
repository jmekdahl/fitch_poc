angular.module('cloDataServices', [])

.factory( 'cloDealServices', function ( $http ){
	var cloDealServices = {
		getAllDeals: function(){
			var promise =  $http.get("http://jeferico.com/demo/fitch/min/ng/data/getDealsList.php")
				.then(function(response) { 
					return response.data; 
				}
			);
			return promise;
		},
		getDealInfo: function( compare, dealsObjectList ){
			var promise = $http(
				{ 
					url: "http://jeferico.com/demo/fitch/min/ng/data/getDealInfo.php",
					method: "GET",
					params: { 
						compare: compare, 
						deals: dealsObjectList.map( function( deal ){
							return deal.id; 
						}).join(",")
					}
				})
				.then(function(response) {
					return response.data;
				}
			);
			return promise;
		}
	};
	
	return cloDealServices;
});