/* This function is mainly used to ENCODE string to Caesar's Cipher by using the shift parameter
   Note: it only encodes alphabetical characters

   However, you can also use this to as a decoder, if you know the shift amount (ROT),
   make the shiftAmount argument be equal to 26 - ROT
*/
function caesarCipher (str, shiftAmount) {
	var initialStr = str;
  // uppercasing the string and then splitting it into an array
  initialStr = initialStr.toUpperCase();
	initialStr = initialStr.split("");

	var answer = initialStr.map(function(value){
		// shifts the uppercase alphabet characters by shiftAmount, ignore the rest
		if (value.charCodeAt() >= 65 && value.charCodeAt() <= 90){
     // substracting 65 from the character code to work with the 1-26 numbers, which represents the alphabet
			var characterCode = ((value.charCodeAt() - 65) + shiftAmount) % 26 ;
			return String.fromCharCode(characterCode + 65);
		}
		else {
			return value;
		}
	});
	return answer.join("");
}
