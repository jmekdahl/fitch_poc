angular.module('cdsDataServices', [])

.factory( 'cdsRestServices', function ( $http ){
	var cdsRestServices = {
		getDataById: function( query, date, contribid ){
			var colConfig = {
				stale: [
					{ displayTitle: "Name", key: "NameFull", filter: false },
					{ displayTitle: "Stale Price", key: "StalePrice", filter: false},
					{ displayTitle: "Value", key: "Value1", filter: false },
					{ displayTitle: "Years", key: "Years", filter: false },
					{ displayTitle: "Maturity", key: "MaturityCode", filter: false },
					{ displayTitle: "Currency", key: "CurrencyCode", filter: false },
					{ displayTitle: "Mean", key: "mean", filter: false },
					{ displayTitle: "Rank", key: "RankShortCode", filter: false },
					{ displayTitle: "Restructuring", key: "RestructShortCode", filter: false }
				], 
				
				stats: [
					{ displayTitle: "Unchanged", key: "Unchanged", filter: false },
					{ displayTitle: "Stale", key: "Stale", filter: false },
					{ displayTitle: "Date", key: "Date", filter: false },
					{ displayTitle: "Flat", key: "Flat", filter: false },
					{ displayTitle: "Total Credits", key: "TotalCredits", filter: false },
					{ displayTitle: "Total Points", key: "TotalPoint", filter: false }
				],

				outlier: [
					{ displayTitle: "Name", key: "NameFull", filter: false },
					{ displayTitle: "LRCC Mean", key: "lrccmean", filter: false },
					{ displayTitle: "Difference", key: "Diff", filter: false }
				],
				
				flat: [
					{ displayTitle: "Name", key: "NameFull", filter: false },
					{ displayTitle: "Currency Code", key: "CurrencyCode", filter: false }
				]
				//http://us-lonfswebd01:8021/rest/jersey/FPS/flat/2014-02-04/20
				/*
				[
   					{
					   "NameFull":"Blue Fin Ltd.",
					   "RestructShortCode":"EXR",
					   "RankShortCode":"SEN",
					   "CurrencyCode":"EUR",
					   "reference":null,
					   "NameShortCode":"BLUFIN"
					}
 					...
 				]
				*/
			}
			var promise = $http.get('http://us-lonfswebd01:8021/rest/jersey/FPS/'+ query +'/'+ date  +'/'+ contribid )
				.then(function(response){
					var responseObj = {};
					var tmpArray = [];

					responseObj.raw = response;

					angular.forEach(colConfig[query], function(value, key){
						tmpArray.push(value);
					});

					responseObj.titles = tmpArray;
					tmpArray = [];

					angular.forEach(response.data, function(dataValue, dataKey){
						var localTmp = [];
						angular.forEach(colConfig[query], function(rowValue, rowKey){
							localTmp.push(dataValue[rowValue.key]);
						});
						tmpArray.push(localTmp);
					});
					responseObj.data = tmpArray;

					return responseObj;
				});
			return promise;
		}
	};

	return cdsRestServices;
});

/**
Stats 
	http://us-lonfswebd01:8021/rest/jersey/FPS/stats/{contribution date}/{contributor id}
Outlier
	http://us-lonfswebd01:8021/rest/jersey/FPS/outlier/{contribution date}/{contributor id}
Stale
	http://us-lonfswebd01:8021/rest/jersey/FPS/stale/{contribution date}/{contributor id}
Stale Rejected
	http://us-lonfswebd01:8021/rest/jersey/FPS/stale_r/{contribution date}/{contributor id}
Flat
	http://us-lonfswebd01:8021/rest/jersey/FPS/flat/{contribution date}/{contributor id}
Rank
	http://us-lonfswebd01:8021/rest/jersey/FPS/rank/{contribution date}/{contributor id}
Restructuring
	http://us-lonfswebd01:8021/rest/jersey/FPS/restructuring/{contribution date}/{contributor id}
High Yield
	http://us-lonfswebd01:8021/rest/jersey/FPS/highyield/{contribution date}/{contributor id}

13	Barclays		520
20	BNP			1952
7	CS			1192
12	Deutche		6720
18	Goldman Sachs	344
42	HSBC			632
4	JPM			1464
43	Mizuho			32
11	Nomura		1672
35	RBS			1152
28	Wachovia		32

**/