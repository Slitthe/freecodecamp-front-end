function checkCashRegister(price, cash, cid){
	/* Avoided using decimal values to prevent floating point estimating error */
	var cidCopy,
		 total = 0,
		 change = [],
		 changeAmount = (cash - price) * 100,
		 values = { // denominators values
			"PENNY": 1,
			"NICKEL": 5,
			"DIME": 10,
			"QUARTER": 25,
			"ONE": 100,
			"FIVE": 500,
			"TEN": 1000,
			"TWENTY": 2000,
			"ONE HUNDRED": 10000
		 };

	cid.forEach(function(curr){ // calculates current cash in drawer & multiplies values by 100
		curr[1] = curr[1] * 100;
		total += curr[1];
	});
	cidCopy = JSON.parse(JSON.stringify(cid)); // cid object soft clone
	if(changeAmount === total){ 	// CASE: change is exactly total cash in drawer
		return "Closed";
	}

	else {
		// attempts to give out change by substracting values from the cash in drawer
		// does so until there's nothing left to give or until changeAmount has reached 0
		var i = cid.length - 1;
		for(; i >= 0; i--){
			if ( changeAmount >= values[ cid[i][0] ] && cid[i][1] !== 0) {
				// substracts the value from the change and from the cash in drawer
				changeAmount -= values[ cid[i][0]];
				cid[i][1] -= values[ cid[i][0]];
				i++;
			}
		}
	}
	// CASE: Not enough $ to give change OR cannot give out change with current currency in drawer (example change is 0.5 and the only currency in drawer is a one dollar bill)
	if(changeAmount > 0){
		return "Insufficient Funds";
	}
	// difference cid and cidCopy (before the change has been given)
	change = cid.map(function(current, index){
		// for non-used currency from cid
		if(current[1] === cidCopy[index][1]) {
			return undefined;
		}
		else {
			// for used currencies from cid, makes the difference from before & after giving change to find out the actual change value(s)
			current[1] = (cidCopy[index][1] - current[1]) / 100; // returns the decimal values
			return [current[0], current[1]];
		}
	}).reverse(); // reversed the order
	//filters out undefined values
	change = change.filter(function(curr){
		return curr !== undefined;
	});
	return change;
}
