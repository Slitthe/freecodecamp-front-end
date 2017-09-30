function palindrome (str) {
	var expression = /[^a-z0-9]/g;// expression which finds anything that's NOT a-z or 0-9
	var alphanumStr;
	var arrayedStr;
	var reversedStr;

	alphanumStr = str.toLowerCase().replace(expression,"");// deletes any non-alphanumerical characters, by replacing them with ""
	arrayedStr = alphanumStr.split("");// turns the alphanumerical string into an array
	arrayedStr = arrayedStr.reverse();// reverses the order of the array
	reversedStr = arrayedStr.join("");//joins back the reversed array into a string

	if (alphanumStr === reversedStr){//if the initial alphanumerical string is equal to the reversed alphanumerical one, return true (is a palidrome);
		return true;
	}
	return false;
}
