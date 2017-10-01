function myReplace (str, before, after) {
	// stores the after argument into an array to be able to change the individual letters
	var afterArr = after.split("");

	var doUntil = Math.min(before.length, after.length); //preserves the case for the first n characters (the shortest string)
	for (var i = 0; i < doUntil ; i++){
		if (before[i].charCodeAt() >= 65 && before[i].charCodeAt() <= 90){ // mirrors the case of the before argument for the length of the shortest string
			afterArr[i] = afterArr[i].toUpperCase();
		}
		else {
			afterArr[i] = afterArr[i].toLowerCase();
		}
	}

	return str.replace(before, afterArr.join(""));
}
