var cloApp = angular.module( 'cloApp', ['ngRoute'] );

	cloApp.factory("sharedService", function(){
		return { sharedObject: { 
			selection:{
				group:[],
				min:2,
				max:5
			},
			entities: entityObj,
			dataMap: mapObj,
			defaultPredicate: "name"
		}}
	});

cloApp.config( function( $routeProvider ){
	$routeProvider
	.when('/list',
			{
				controller: 'entityListController',
				templateUrl: 'partials/entityListView.html'
			})
	.when('/entity',
			{
				controller: 'entityController',
				templateUrl: 'partials/entityView.html'
			})
	.when('/compare_glossary',
			{
				controller: 'compareGlossaryController',
				templateUrl: 'partials/compareView.html'
			})
	.when('/compare_chart',
			{
				controller: 'compareChartController',
				templateUrl: 'partials/compareView.html'
			})
	.otherwise({redirectTo: '/list'});
});

cloApp.controller( controllers );