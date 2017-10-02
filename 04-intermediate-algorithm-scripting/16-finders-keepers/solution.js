function findElement (arr, func) {
	// filters the array based on the argument function
	var filtered = arr.filter(func);
	return filtered[0]; // returns the first element of that array, which is also the first element that passes the function test 
}
