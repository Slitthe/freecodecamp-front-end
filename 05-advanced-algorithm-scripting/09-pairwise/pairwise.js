function pairwise(arr, target){
	var total = 0;
	var valueBanList = [];
	var indexBanList = [];
	// for every element loop through the entire array to get pairs
	for(var i = 0; i < arr.length; i++){
		for(var j = 0; j < arr.length; j++){
			// don't compare identical indices and check for pairing equality
			if((arr[i] + arr[j] === target) && j!== i){
				// checks if the indices are not banned and neither is the first value (i)
				// and since the comparison goes from left to right this makes sure this is the smallest indices sum for these values and their indices
				if((indexBanList.indexOf(j) < 0) && (indexBanList.indexOf(i) < 0) && (valueBanList.indexOf(arr[i]) < 0)){
					// bans the indices element from being paired again
					indexBanList.push(i, j);
					// bans the first value from ever being the first value
					valueBanList.push(arr[i]);
					// adds indices sum to the total
					total += (i + j);
				}
			}
		}
	}
	return total;
}
