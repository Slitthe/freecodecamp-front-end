function pairElement (strand) {
	var result = [];
	// stores the dna pairs in an object for easier lookup
	var dnaPairs = {
		"A": "T",
		"T": "A",
		"C": "G",
		"G": "C"
	};

	for (var i = 0 ; i < strand.length ; i++) {
		// making a 2 element array of the DNA strand and its corresponding match, and pushing it into the result array
		result.push([strand[i], dnaPairs[strand[i]]]);
	}
	
	return result;
}
