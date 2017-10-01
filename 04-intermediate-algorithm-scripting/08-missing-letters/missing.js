function fearNotLetter (str) {
	var answer;
	for (var i = 1 ; i < str.length  ; i++) { // checks if every subsequent chracter code in the string is consecutive
		if (str.charCodeAt(i) !== str.charCodeAt(i - 1) + 1 ) {
			// using .fromCharCode to set the answer be equal to the missing letter, by adding 1 to the character code of the letter at the point where the letters are not consectuive anymore
			answer = String.fromCharCode(str.charCodeAt(i - 1) + 1); 
		}
	}
	return answer;
}
