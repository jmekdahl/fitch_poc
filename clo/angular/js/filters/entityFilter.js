angular.module('entityFilter', []).
filter('byEntity', function () {
	return function (entities, ids) {
		var items = {
				id: id,
				out: []
		};
		angular.forEach(entities, function (value, key) {
			if (this.id[value.id] === true) {
				this.out.push(value);
			}
		}, items);
		return items.out;
	};
});