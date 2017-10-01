function diffArray (arrOne, arrTwo) {
  var combinedArray = arrOne.concat(arrTwo);
	var diff = combinedArray.filter(function(val){ // 
		// leave only the items found in the difference between either of the two
		return arrTwo.indexOf(val) === -1 || arrOne.indexOf(val) === -1 ? true : false ;
	});

	return diff;
}
