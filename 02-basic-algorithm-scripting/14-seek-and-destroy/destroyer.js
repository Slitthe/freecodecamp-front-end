function destroyer (arr) {
	// adds any additional arguments into an array
	var additionalArgs = Object.values(arguments).slice(1);
	var resultArray = arr;
  
	// iterates through the additionalArgs array
	for ( var i = 0; i < additionalArgs.length ; i++){
		// checks if any of the arguments are found in the resultArray items
		for (var j = 0 ; j < resultArray.length ; j++){
			if (resultArray[j] === additionalArgs[i]){
				// if any match is found, that element is remove by splicing
				resultArray.splice(j, 1);
				// decrements the j counter to not skip any items (because of the length change made by .splice() )
				j--;
			}
		}
	}
	return resultArray;
}
