function getIndexToIns (arr, num) {
	var index = 0; // setting the initial value to 0 in case the num is less than any of the arr numbers
	// sorting the array from least to greatest
	var sorted = arr.sort(function(a, b){
		return a - b;
	});
	// checking the index at which all the array items are greater than the num(second argument)
	arr.forEach(function(val, ind){
		if (val < num){
			index = ind + 1; // adding one to the index to account for the inserted item
		}
	});
	return index;
}
