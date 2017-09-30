function mutation(arr) {
    var check = arr[0].toLowerCase();
    var checkAgainst = arr[1].toLowerCase();

    // iterates throught the first string for every character in the second string
	for (var i = 0; i < checkAgainst.length; i++){
		for (var j = 0 ; j < check[0].length; j++){
            // checks if any of the letter from the second str are NOT found in the first
			if( check.search(checkAgainst[i]) === - 1) {
				return false;
			}
		}
	}

  return true;
}
