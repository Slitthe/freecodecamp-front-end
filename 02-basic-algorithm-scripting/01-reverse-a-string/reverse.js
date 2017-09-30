var reverseString = function (str) {
	// splits the string into an array of each individual characters
	var splitString = str.split("");
	// reverses that array of characters
	var reversedSplit = splitString.reverse();
	// joins the reversed array back into a string
	var joinedStr = reversedSplit.join("");
	// returns that string
	return joinedStr;
};
