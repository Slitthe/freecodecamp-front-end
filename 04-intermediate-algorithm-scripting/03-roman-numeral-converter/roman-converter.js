function convertToRoman (num) {
	
	var total = num;
	var result = "";
	var i = 0;
	// used an array because order matters
	var numerals = [
		[1000, 'M'],
		[900, 'CM'],
		[500, 'D'],
		[400, 'CD'],
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I']
	];
	
	for ( i = 0 ; i < numerals.length ; i++ ) { // this loop will stop when the total is less than the smallest numeral (1)
		// checks if the total is higher than any of the Roman numbers, if it is, deletes that amount from the total and adds the corresponding roman string to the result string
		if (total / numerals[i][0] >= 1){
			total -= numerals[i][0];
			result += numerals[i][1];
			// resets the for loop if a match is found
			i = -1;
		}
	}
	
 return result;
}
