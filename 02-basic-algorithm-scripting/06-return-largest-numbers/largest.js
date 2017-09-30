function largestNums (arr) {
	var workArr = arr;
	var largestArr = []; // empty container for the largest numbers from each sub-array
	//sorts each sub-array from greater to least by using .sort inside of .map
	workArr.map(function (current) {
		current.sort(function (a, b) {
			return b - a;
		});
	});
	// pushes the first element from each sub-array(which is the greatest) in the largetArr variable
	workArr.forEach(function (current) {
		largestArr.push(current[0]);
	});

	return largestArr;
}
