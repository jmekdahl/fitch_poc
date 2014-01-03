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
			defaultPredicate: "name",
			comparison: { dflt: "/compare_chart" }
		}}
	});

cloApp.config( function( $routeProvider ){
	$routeProvider
	.when('/list',
			{
				controller: 'entityListController',
				templateUrl: 'tmpl/partials/entityListView.html'
			})
	.when('/compare_glossary',
			{
				controller: 'compareController',
				templateUrl: 'tmpl/partials/compareView.html',
				resolve: { compare: function(){ return "glossary"; } }	
			})
	.when('/compare_priority',
			{
				controller: 'basicCompareController',
				templateUrl: 'tmpl/partials/compareView.html',
				resolve: {
					compare: "priority"
				}
			})
	.when('/compare_replacements',
			{
				controller: 'compareController',
				templateUrl: 'tmpl/partials/compareView.html',
				resolve: { compare: function(){ return "replacements"; } }
			})
	.when('/compare_chart',
			{
				controller: 'compareChartController',
				templateUrl: 'tmpl/partials/compareView.html',
			})
	.otherwise({redirectTo: '/list'});
});

cloApp.controller( controllers );