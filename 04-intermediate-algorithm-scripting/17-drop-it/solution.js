function dropElements (arr, func) {
	var index;
	var result = [];

	for (var i = 0; i < arr.length ; i++){
		//loops through the array and stops once the argument function returns true, and saves that location
		if (func(arr[i])) {
			index = i;
			result = arr.slice(index); // uses .slice to return the portion of the at the point where the arg func returns true for the first time
			break; // stops the for loop

		}
	}

	return result;
}
