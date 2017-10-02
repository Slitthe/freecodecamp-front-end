function sumFibs (num) {
	var fiboNums = [1,1];
	var fiboSum = 0;
	// this loop will return all the fibo numbers up to that point, plus one more to account for the case where the number is equal to the input argument
	while (fiboNums[fiboNums.length - 1] <= num){
		fiboNums.push(fiboNums[fiboNums.length - 1] + fiboNums[fiboNums.length - 2]); // next element becomes the sum of the previous 2 elements
	}
	fiboNums.pop(); // removes that last number from the array
	fiboNums = fiboNums.filter(function(currVal){ // only keeps the odd numbers
		return currVal % 2 !== 0;
	});

	fiboSum = fiboNums.reduce(function(total,curr){ // sums up the filtered (odd numbers) array
		return total + curr;
	});

	return fiboSum;

}
