function convertHTML (str) {
	var entities = [ // stores the elements in an array to convert the & -> &amp; first
		["&", "&amp;"],
		["<", "&lt;"],
		[">", "&gt;"],
		["\"", "&quot;"],
		["'", "&apos;"],
	];
	var convStr = str;
	var expression;

	for (var i = 0 ; i < entities.length ; i++){
		expression = new RegExp (entities[i][0], "g"); // new RegExp expression with the global "g" flag
		convStr = convStr.replace(expression, entities[i][1]); // replacing every character with its matching html entity
	}

	return convStr;
}
