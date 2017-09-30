function checkEnding (str, end) {
	// get the last n characters from the string (where n is the length of the end string)
	var substring = str.substring(str.length - end.length);
	// checks the last n characters with the end string, returns the result
	return substring === end;
}
