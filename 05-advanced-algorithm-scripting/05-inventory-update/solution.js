function updateInventory(inv, deliv) {
	for(var i = 0; i < deliv.length; i++){ // loops through delivery array
		for(var j = 0; j < inv.length; j++){ // loops through inventory array
			if(deliv[i][1] === inv[j][1]){ // checks if the delivery name matches inventory item name
				inv[j][0] += deliv[i][0]; // update value if so
				break; // exits from the loop to not get into the next condition
			}
			else if(j === (inv.length - 1)){ // if last item has been reaches and no break encountered
				inv.push(deliv[i]);
				break; // push changes the inv length, so need to either break out or add one to to "j" so the loop never runs in the first place
			}
		}
		if(!inv.length){ // adds the first item if inventory is empty
			inv.push(deliv[i]);
		}
	}

	// extracts only the names from the 2d array
	var sorted = inv.map(function(curr){
		return curr[1];
	}).sort(); // sorts them alphabetically
	// joins the sorted names with their corresponding values
	sorted = sorted.map(function(current){
		for(var k = 0; k < inv.length; k++){
			if(current === inv[k][1]){
				return [inv[k][0], current];
			}
		}
	});

	return sorted;
}
