function chunkArrayInGroups(arr, num) {
   var resultArray = [];
  // how many times the loop should run
   var howManyTimes = arr.length % num === 0 ? howManyTimes = arr.length / num : howManyTimes = Math.floor(arr.length / num + 1);
  
  // pushes slices of the original array of the length
   for (var i = 0; i < howManyTimes ; i++){
     resultArray.push(arr.slice(i * num, i * num + num));
     console.log(arr.slice(i * num, i * num + num));
   }
  return resultArray;
}
