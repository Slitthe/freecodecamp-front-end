function sym(args) {
	// arguments to array transform
	var list = [];
	for (var i = 0 ; i < arguments.length ; i++){
		list.push(arguments[i]);
		}
	while(list.length > 1) {
		var one = list.shift(),
		two = list.shift(),
		// difference function
		difference = function(arrOne, arrTwo){
			return arrOne.filter(function(curr, ind, arr){
				return arrTwo.indexOf(curr) === -1;
			});
		};
		// keeps only the unique items relative to each other
		var filteredOne = difference(one, two);
		var filteredTwo = difference(two, one);
		list.unshift( filteredOne.concat(filteredTwo) );
	}
	list = list[0];
	// duplicate remover
	for(i = 0; i < list.length; i++){
		var ind = list.indexOf(list[i], (i + 1));
		if(ind !== -1){
			i--;
			list.splice(ind,1);
		}
	}
	return list;
}
