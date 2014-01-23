//Module for Data Services
var cloData = angular.module('cloDataServices', []);

cloData.factory( 'cloDealServices', function ( $http ){
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

//Main Application
var cloApp = angular.module( 'cloApp', ['ngRoute', 'cloDataServices'] );

cloApp.factory("sharedService", function(){
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

cloApp.factory('httpInterceptor', function ($q, $rootScope, $log) {
	var numLoadings = 0;
	return {
		request: function (config) {
			numLoadings++;
			
			// Show loader
			$rootScope.$broadcast("loader_show");
			return config || $q.when(config)
		},
		
		response: function (response) {
			if ((--numLoadings) === 0) {
				// Hide loader
				$rootScope.$broadcast("loader_hide");
			}
			return response || $q.when(response);
		},
		
		responseError: function (response) {
			if (!(--numLoadings)) {
				// Hide loader
				$rootScope.$broadcast("loader_hide");
			}
			
			return $q.reject(response);
		}
	};
});

cloApp.config( function( $routeProvider, $httpProvider, sharedService ){
	$httpProvider.interceptors.push('httpInterceptor');
	
	$routeProvider
	.when('/list',
		{
			controller: 'dealsListController',
			templateUrl: 'tmpl/partials/dealsListView.html', 
			resolve: { 
				responseData: function( cloDealServices ){
					return cloDealServices.getAllDeals();
				}
			}
		})
	.when('/compare/:comparetype',
		{
			controller: 'compareController',
			templateUrl: 'tmpl/partials/compareView.html',
			resolve: {
				responseData: function(cloDealServices, sharedService, $route){
					return cloDealServices.getDealInfo( 
						$route.current.params.comparetype, 
						sharedService.sharedObject.selection.group
					);
				}
			}	
		})
	.otherwise({redirectTo: '/list'});
});

cloApp.directive("loader", function ($rootScope) {
	return function ($scope, element, attrs) {
		$scope.$on("loader_show", function () {
			return element.css("display", "block");
		});
		return $scope.$on("loader_hide", function () {
			return element.css("display", "none");
		});
	};
});

cloApp.controller( controllers );