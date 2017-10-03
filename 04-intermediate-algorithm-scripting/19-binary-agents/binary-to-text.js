function binaryAgent (str) {
	var splitted = str.split(/ +/);
	splitted = splitted.map(function(val){
		// uses parseInt to convert the binary (which is base 2) to base 10
		return String.fromCharCode(parseInt(val, 2)); // gets the characters code based on the unicode number
	});
	return splitted.join(""); // returns the converted string by .join 'ing the array items
}
