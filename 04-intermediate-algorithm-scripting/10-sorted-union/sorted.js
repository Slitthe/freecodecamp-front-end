function uniteUnique () {
	var values = Object.values(arguments);
	var combArr = [];
	
	for (var i = 0 ; i < values.length ; i++) {
		for (var j = 0 ; j < values[i].length ; j++) {
			combArr.push(values[i][j]);//pushes the values of the the individual argument array elements into a commbined array
		}
	}
	
	for (var k = 0 ; k <= combArr.length - 1 ; k++){
		// for every element in the array, loop through all the subsequent
		for (var l = k + 1; l <= combArr.length ; l++){
			if (combArr[k] === combArr[l]){
				// checks duplicated and splices the array at that point
				combArr.splice(l,1); 
			}
		}
	}
	return combArr;

}
