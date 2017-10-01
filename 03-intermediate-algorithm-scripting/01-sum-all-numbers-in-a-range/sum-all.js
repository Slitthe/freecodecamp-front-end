function sumAll (arr){
	//find the lowest and highest numbers in the array
	var min = Math.min(arr[0], arr[1]);
	var max = Math.max(arr[0], arr[1]);
  var total = 0;
	
	for (var i = min; i <= max ; i++ ) { // adds each number between that range (including the argument numbers themselves)
		total += i;
	}

	return total;
}
