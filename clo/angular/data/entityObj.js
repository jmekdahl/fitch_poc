 var entityObj = [
	{
		id: 12341234,
		name: "Anchorage Capital CLO 2013-1, Limited/LLC",
		issued: "27-Jun-13",
		published: "8-Aug-13",
		profile: "Some data about Achorage",
		glossary:[ 
			"The sum of the principal balances of all collateral obligations or pledged obligations.(Achorage)",
			"Fitch Interpretation",
			"New Data",
			"Defined as \"target initial par amount.\" An amount equal to $500,000,000."
		],
		chart: [
			"GoldenTree Asset Mgmt",
			"650",
			"5/2/13",
			"4.0",
			"2.0",
			"4/25/25"
		]
	},
	{
		id: 23452345,
		name: "Avery Point II CLO, Limited/Corp.",
		issued: "20-Jun-13",
		published: "12-Aug-13",
		profile: "Some data about Avery Point",
		glossary:[ 
			"The sum of the principal balances of all collateral obligations or pledged obligations.(Avery)",
			"Moody Interpretation",
			"New Data 1",
			"An amount equal to $500,000,000."
		],
		chart: [
			"Sanktay Advisors",
			"500",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		]
	},
	{
		id: 43563456,
		name: "Brookside Mill CLO Ltd./LLC",
		issued: "23-May-13",
		published: "26-Aug-13",
		profile: "Some data about Brookside",
		glossary:[ 
			"The sum of the principal balances of all collateral debt obligations.(Brookside)",
			"Fitch Interpretation",
			"New Data 3",
			""
		],
		chart: [
			"Sanktay Advisors",
			"500",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		]
	}
];
 
 var mapObj = {
	 glossary: ["Aggregate Principal Balance (APB)", "Document Provision", "New Data", "Aggregate Ramp-Up Par Amount (ARUPA)"],
	 chart: {
		 names: ["Collateral Manager", "Target Portfolio Amount ($ Mil.)", "Closing Date", "Reinvestment (Years)", "Non-Call (Years)", "Maturity Date" ],
		 calcs: [0, 1, 0, 1, 1, 0]
	 }
 };
 
