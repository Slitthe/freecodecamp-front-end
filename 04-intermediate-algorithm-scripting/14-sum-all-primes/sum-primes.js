function sumPrimes (num){
	var total = 0;
	// cheks if a number is prime
	function isPrime (x) {
		if (x > 1){ // only numbers greater than 1 can be primes
			for (var i = 2; i <= x - 1 ; i++){
				// checks if any of the integers between 2(inclusive) and x - 1 are divisible with x, returns false if any match is found
				if (x % i === 0){
					return false;
				}
			}
		}
		return true;
	}
	// adds the prime numbers between this range: (1 < ... <= argument number)
	for (var i = num; i > 1 ; i--) {
		if (isPrime(i)){
			total += i;
		}
	}
	return total;
}
