function steamrollArray (arr) {
	
	var containerArr = []; 
	var arrayIndicator = true; // variable based on which the while loop runs
  
	while (arrayIndicator){
		arrayIndicator = false; // resets the conditional each loop
		for (var i = 0 ; i < arr.length ; i++){
			if (Array.isArray(arr[i])){ // if any item is an array, then pushes the sub-array items into the result array (thus keeping the order and getting rid of 1 level of the array)
				for (var j = 0; j < arr[i].length ; j++){
					containerArr.push(arr[i][j]);
					arrayIndicator = true; // switches the conditional so the loop will run once again
				}
			}
			else {
				containerArr.push(arr[i]); // if the array item is not an array, just pushes that element itself into the result array
			}
		}
		
		arr = containerArr; // makes the working array equal to the container arr(which keeps the 1 level flattened items)
		containerArr = []; // resets the result array
	}

	return arr;

}
