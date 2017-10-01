function translatePigLatin(str) {
	 // RegExp matching one or more vowels
	var expression = /[^aeiou]+/i;
	var result = str;
	var firstConsonants = str.match(expression)[0];// stores the first consonant or consonant groups
	
	var matches = str.match(expression);
	if (str[0].search(expression) === -1){// checks if first word is a voewel
		return result + "way";
	}
	// deletes the consonant group
	result = result.replace(firstConsonants, "");
	// adds that deleted consonant group to the end of the string + "ay"
	return result + firstConsonants + "ay";

}
