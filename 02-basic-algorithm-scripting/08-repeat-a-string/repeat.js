function repeatStr (str, num) {
	result = "";
	if (num > 0){//only runs for positive numbers
		// concatenates the input string num numbers of times
		for(var i = 1; i <= num; i++){// 
			result += str;
		}
	}
	return result;
}
