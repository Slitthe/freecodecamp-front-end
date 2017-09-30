var factorialize = function (num) {
	// set the initial value to be 1,  so 0! -> 1 and 1! -> 2
	var factorialize = 1;
	// returns undefined for any negative number
	if ( num < 0) {
		return undefined; // Only positive integers can be factorialized
	}
	else {
		// for num parameter being 2 or higher, make the result a product of every integer between them and 2
		for ( var i = num; i >= 2 ; i-- ) {
			factorialize *= i;
		}
	}
	return factorialize;
};
