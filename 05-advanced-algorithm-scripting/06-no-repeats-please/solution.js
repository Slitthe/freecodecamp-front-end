function permAlone(str){
	var expression = /(\w)\1/i,
	len = str.length,
	total = 0,
	overflowNum = len - 1,
	testValue = overflowNum * len,
	permContainer = [];
	for(var i = 0; i < len; i++){
		permContainer.push(0);
	}
	if(len === 1){
		return 1;
	}
	// checks if the maximum number of possibilites have been reaches,thus having to end
	var checkCompletion = function(arr, num){
		if(arr[0] !== num){
			return false;
		}
		else {
			var total = 0;
			for(var i = 0; i < len; i++){
				total += arr[i];
			}
			return testValue === total;
		}
	};
	// returns true only if the elements in the array are unique numbers
	var checkNoRepeats = function(arr){
		for(var i = 0; i < len; i++){
			if(arr.indexOf(i) < 0){
				return false;
			}
		}
		return true;
	};
	// translates the numeric array into a characters from the str variable, returned as a string
	var numbersToChars = function(arr){
		var combined = "";
		for (var i = 0; i < len; i++){
			combined += str[arr[i]];
		}
		return combined;
	};
	while( !checkCompletion( permContainer, overflowNum ) ){
		permContainer[overflowNum]++;
		for(var i = len - 1; i > 0; i--){
			if (permContainer[i] > overflowNum){
				permContainer[i] = 0;
				permContainer[i-1]++;
			}
			else {
				break;
			}
		}
		if(checkNoRepeats(permContainer)){
			if(numbersToChars(permContainer).search(expression) < 0){
				total++;
			}
		}
	}
	return total;
}
