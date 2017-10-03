function truthCheck (collection, pre) {
	for (var i = 0 ; i < collection.length ; i++){
		// checks the truthiness or falsiness of the pre arg for every element of the collection(first arg)
		if (collection[i][pre]){

		}
		else { // if it fails any 1 test, the function returns false
			return false;
		} 
	}
	// only returns true if it passes the test for every element
	return true;
}
