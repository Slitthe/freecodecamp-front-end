function findLongestWord (str) {
	var expression = /[_-\s]+/g;// Considers whitespaces, underscores _ and dashes - as word delimiters
	str = str.split(expression);// split at the points where the delimiters are found

	var lengths = str.map(function(current){//converts the words array into the array of their lengths
		return current.length;
	});

	var highest = lengths[0];
	for (var i = 1; i < lengths.length; i++){// checks lor largest number in the array of numbers 
		if(lengths[i] > highest){
			highest = lengths[i];
		}
	}
	return highest;
}
