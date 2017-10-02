function spinalCase (str) {
	var workStr = str;
	// replaces every uppercase letter (after the first) with a whitespace + that letter (using RegExp capture groups)
	workStr = workStr[0] + workStr.substring(1).replace(/([A-Z])/g, " $1");
	// replaces every one or more word delimiters (_, whitespaces and -) with only one dash(-)
	workStr = workStr.toLowerCase().replace(/[-_ ]+/g, "-");
	return workStr;
}
