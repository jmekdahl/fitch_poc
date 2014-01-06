var cloApp = angular.module( 'cloApp', ['ngRoute'] );

cloApp.factory("sharedService", function(){
	return { sharedObject: { 
		selection:{
			group:[],
			min:2,
			max:5
		},
		deals: dealsObj,
		dataMap: mapObj,
		defaultPredicate: "name",
		comparison: { dflt: "/compare_chart" }
	}}
});

cloApp.config( function( $routeProvider ){
	$routeProvider
	.when('/list',
			{
				controller: 'dealsListController',
				templateUrl: 'tmpl/partials/dealsListView.html'
			})
	.when('/compare_glossary',
			{
				controller: 'compareController',
				templateUrl: 'tmpl/partials/compareView.html',
				resolve: { compare: function(){ return "glossary"; } }	
			})
	.when('/compare_priority',
			{
				controller: 'compareController',
				templateUrl: 'tmpl/partials/compareBasicView.html',
				resolve: { compare: function(){ return "priority"; } }
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