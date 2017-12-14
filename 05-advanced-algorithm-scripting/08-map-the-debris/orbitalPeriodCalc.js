function orbitalPeriod(arr){
	const earthRadius = 6367.4447;
	const gm = 398600.4418;
	function oribtalCalc(averageAlt){
		var result = 1;
		/*
		Formula is: (2 * π * √(a³/GM))
			a -- semi-major axis
			GM -- Earths gravitational parameter
		*/
		var semiMajorAxi = averageAlt + earthRadius; // a
		result *= Math.pow(semiMajorAxi, 3) / gm; // a³/GM
		result = Math.sqrt(result); // √(a³/GM)
		result *= 2 * Math.PI; // 2 * π * √(a³/GM)
		return Math.round(result);
	}
	arr.forEach(function(curr){
		curr.orbitalPeriod = oribtalCalc(curr.avgAlt);
		delete curr.avgAlt;
	});
	return arr;
}
