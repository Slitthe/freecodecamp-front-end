function truncateString (str, num) {
	var ellipses = "...";

	if (num >= str.length){
		return str;
	} 
  else if (num > 3) {
		// returns a string whose length is equal to num (including the ellipses)
		return str.slice(0, num - 3) + ellipses;
	} 
  else if (num > 0) {
		// for num values >= 3, the ellipses length are not taken into consideration
		return str.slice(0, num) + ellipses; 
	}
	// returns undefined for negative num values
}
