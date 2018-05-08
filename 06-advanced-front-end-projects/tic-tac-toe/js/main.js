var ttToe = {
   players: [ // the players and their indentificators -- 'x' and 'o'
      'x', 'o'
   ],
   // null -- a spot not yet filled by any players
   currentValues: [
      ['x',null,'x'],
      [null,'x',null],
      [null,null,null]
   ],
   // defines what 'winning' looks like
   winValues: [
      ['00','01','02'],
      ['10','11','12'],
      ['20','21','22'],
      ['00','10','20'],
      ['01','11','21'],
      ['02','12','22'],
      ['00','11','22'],
      ['02','11','20'],
   ],
   // IN PROGRESS
   checkWin: function(values) {
      var   winner, 
            winPatterns = [];
      /* Check each win values pattern */
      for(var i = 0; i < this.winValues.length; i++) {
         // translate winning patterns into values
         var actualValues = [];
         this.winValues[i].forEach(function(vals) {
            var row = vals[0];
            var col = vals[1];
            actualValues.push(values[row][col]);
         });
         actualValues = actualValues.filter(function(element) {
            return element !== null;
         });
         if(actualValues.length === 3) {
            var win = true;
            for(var j = 0; j < actualValues.length - 1; j++) {
               if(actualValues[j] !== actualValues[j + 1]) {
                  win = false;
                  break;
               }
            }
            if(win) {
               return actualValues[0];
            }
         }
      }
      return null;

      /* Convert this to return the winner's name or null if none */
   },
   // Get the idices of the blank inputs
   getBlankInputs: function(values) {
      var empty = [];
      for(var row = 0; row < values.length; row++) {
         for(var col = 0; col < values[row].length; col++) {
            if(values[row][col] === null) {
               empty.push([row, col]);
            }
         }
      }
      return empty;
   },
   // fill an index spot with a values
   fillInputs: function(values, inputValue, index) {
      values[index.row][index.col] = inputValue;
      return values;
   },
   // Get the a copy of the current values
   valuesCopy: function(values) {
      var container = [];
      for(var row = 0; row < values.length; row++) {
         container[row] = [];
         for(var col = 0; col < values[row].length; col++) {
            container[row][col] = values[row][col];
         }
      }
      return container;
   },
   
   // test a set of values for the winning of a particular player by attempting to replace the empty spots with their indicator

   // if the first loop doesn't yield any results, then go down recursively until you find a winning combo

   // don't stop at the first winning combo, however do not go down recursvely it at least 1 winning combo has been found in this stage

   // if no winnings has yet to be found going down in all of the recursive levels, just pick a random empty spot to fill it
   testCurrent: function(values) {
      var replacedList = [];
      var winList;
      for(var val = 0; val < values.length; val++) {
         for(var i = 0; i < this.players.length; i++) {
            var emptyPlaces = this.getBlankInputs(values[val]);
            for(var j = 0; j < emptyPlaces.length; j++) {
               // debugger;
               var filledValue = this.fillInputs(this.valuesCopy(values[val]),this.players[i], { row: emptyPlaces[j][0],  col: emptyPlaces[j][1]});
               console.log(val);
               replacedList.push(
                  {
                     values: values,
                     isWinner: ttToe.checkWin(filledValue) ? { col: emptyPlaces[j][1], row: emptyPlaces[j][0], value: this.players[i]} : false
                  }
               );
            }
         }
         var winOnly = replacedList.filter(function (element) {
            return element.isWinner && element.isWinner.value;
         });
         winOnly.concat(winList);
         
      }
      return replacedList;
   }
};