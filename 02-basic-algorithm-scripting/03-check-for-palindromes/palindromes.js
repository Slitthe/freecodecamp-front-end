function palindrome (str) {
	var expression = /[^a-z0-9]/g;// expression which finds anything that's not a-z,  A-Z or a number 0-9
	var alphanumStr;
	var arrayedStr;
	var reversedStr;

	
	alphanumStr = str.replace(expression,"");// deletes any non-alphanumerical characters, by replacing them with ""
	arrayedString = alphanumStr.split("");// turns the alphanumerical string into an array
	reversedStr = arrayedString.reverse();// reverses the order of the array
	reversedStr = reversedStr.join("");//joins back the reversed array into a string

	if (alphanumStr === reversedStr){//if the initialal alphanumerical string is equal to the reversed alphanumerical one, return true (is a palindrome);
		return true;
	}
	return false;
}
