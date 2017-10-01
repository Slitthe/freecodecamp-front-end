function whatIsInAName (collection, source) {
	// store the properties of the source
	var sourceProps = Object.keys(source);
	var filteredArr = collection;

	filteredArr = filteredArr.filter(function(value){
		for (var i = 0 ; i < sourceProps.length ; i++){
			// only keep the array objects who contain both the properties of the source, and if they checks their corresponding value as well
			if (!(value.hasOwnProperty(sourceProps[i]) && value[sourceProps[i]] === source[sourceProps[i]])) {
				return false
			}
		}
		return true;
	});

	return filteredArr;
}
