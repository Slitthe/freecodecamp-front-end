function smallestCommons (arr) {
	var numList = [];
	var min = Math.min(arr[0], arr[1]);
	var max = Math.max(arr[0], arr[1]);
	
	for (var i = min ; i <= max ; i++){ // gets all the integers between the two array numbers
		numList.push(i);
	}

	function smallestOfTwo (x, y) { // function which finds the smallest common multiple of two items
		var min = Math.min(x, y);
		var max = Math.max(x, y);
		var result;
		var multiplier = 1;
		while (true) {
			// multiples the maximum number by the multipler
			// if that number is found to be divisible by the smaller number, then that is the smallest common multiple of two
			if (((multiplier * max) % min) === 0){
				result = multiplier * max;
				break; // stops the loop if a positive match has been found
			}
			multiplier++; // increments the multiplier on "failed" attempts
		}

		return result;
	}

	while (numList.length > 1){ // runs this as long as only one item remains in the array (which is the final result)
		// .shift(s) two elements of the array and uses them as arguments in the smallestOfTwo function and .unshift(s) the result back into the array
		numList.unshift(smallestOfTwo(numList.shift(), numList.shift()));
	}

	return numList[0];
}
