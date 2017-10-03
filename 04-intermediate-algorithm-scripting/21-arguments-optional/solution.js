function addTogether (x) {
	// stores the first and second(optional) argument
	var numOne = x;
	var numTwo = arguments[1];

	// first, checks if only one number is given , if so return a function
	if (typeof numOne === "number" && typeof numTwo === "undefined"){
		return function (num) { // this functions returns the sum of the first arg of addTogether and returns the sum of that + the parameter "num"
			if (typeof num === "number"){
				return num + numOne;
			}
			 // this function remembers the value of numOne variable from the outer function even when that func stops executing
		};
	}
	// the other case is where 2 numbers are given, and if so returns their sum
	else if (typeof numOne === "number" && typeof numTwo === "number" ){
		return numOne + numTwo;
	}
	// in all other cases, returns undefined
}
