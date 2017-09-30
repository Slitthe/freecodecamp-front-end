function titleCasing (str) {
	var expression = /[\s_-]+/g; //RegExp for word delimiters (-,_ and " ")
	var titleCased = []; // empty array for the capitalized words
	var capitalize= str; // setting the argument to another variable to not change to original argument's value

	capitalize = capitalize.toLowerCase(); //lowercasing the input string
	capitalize = capitalize.split(expression); //split into array of words

	for (var i = 0; i < capitalize.length; i++) {
		// capitalize each word and copying it into the empty titleCased array
		// by taking the first letter of word, uppercasing it and then concatenating it with the rest of the word
		titleCased[i] = capitalize[i][0].toUpperCase() + capitalize[i].substring(1);
	}

	titleCased = titleCased.join(" "); // Making a sentence from the capitalized array
	return titleCased;
}
