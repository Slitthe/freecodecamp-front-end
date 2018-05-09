
function PossMoves(values, parent) {
   var ctx = this;
   this.values = values;
   this.children = {
      list: []
   };
};




var ttToe = {
   players: [ // the players and their indentificators -- 'x' and 'o'
      'x', 'o'
   ],
   // null -- a spot not yet filled by any players
   currentValues: [
      [null, 'o', null],
      [null, 'x', null],
      ['x', null, 'o']
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
      // debugger;
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
      // debugger;
      values = this.valuesCopy(values);
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
   /* accepts a current set of game data, replaces each empty spot with both player's options
      returns a list of possible outcomes, with a winner propery containings the player and the coordination, false otherwise */
   testCurrent: function(gameData) {
      var replacedList = [];
      var winList, j, i;
      for(i = 0; i < this.players.length; i++) {
         j = 0;
         var emptyPlaces = this.getBlankInputs(gameData);
         for(j = 0; j < emptyPlaces.length; j++) {
            // debugger;
            var filledValue = this.fillInputs(this.valuesCopy(gameData),this.players[i], { row: emptyPlaces[j][0],  col: emptyPlaces[j][1]});
            // console.log(filledValue);
            replacedList.push(
               {
                  values: filledValue,
                  isWinner: ttToe.checkWin(filledValue) ? { col: emptyPlaces[j][1], row: emptyPlaces[j][0], value: this.players[i]} : false
               }
            );
         }
      }
      var winOnly = replacedList.filter(function (element) {
         return element.isWinner && element.isWinner.value;
      });
      winOnly.concat(winList);

      
      return !replacedList.length ? null : {
         list: replacedList,
         winOnly: winOnly,
      };
   },
   // should input a current set of game data, and return all of the possible outcomes for that game set as well
   // nested as many levels deep as it needs, each nest parent having a score based on the future children outcomes
   pickSpot: function(gameData, container, isRoot, otherInfo) {
      var outcomes = isRoot ? {isRoot: true, dataList: container} : container;
      var parento = otherInfo.hasOwnProperty('trueParent') ? otherInfo.trueParent: null;
      if(parento) {
         outcomes.parent = parento;
      };
      outcomes.getParent = PossMoves.prototype.getParent;
      outcomes.calcNestLevel = PossMoves.prototype.calcNestLevel;
      // console.log(outcomes);

      var tempOutcomes;
      var testResults = this.testCurrent(gameData);
      if(outcomes.hasOwnProperty('isRoot')) {
         tempOutcomes = outcomes.dataList;
      }
      if(testResults && outcomes.calcNestLevel() <= 3) {
         testResults.list.forEach(function(item) {
            
            var pushData = new PossMoves(item, outcomes);
            // console.log(outcomes);
            var pushTarget = tempOutcomes || outcomes;
            console.log(outcomes.calcNestLevel());
            if(outcomes.calcNestLevel() < 2) {
               pushData.children.list = ttToe.pickSpot(pushData.values.values, pushData.children.list, false, {
                  trueParent: outcomes
               }) ;
               pushTarget.push(pushData);
            }

            // console.log(pushTarget)
            // times++;
            // console.log(pushData);
         
         });
      }
      
      return outcomes;
   }
};


PossMoves.prototype.getParent = function (context, count) {
   if (!this.hasOwnProperty('isRoot') && !this.isRoot) {
      return this.parent;
   } else {
      return null;
   }
};

/* 
   calculate how many parents this current item has, used to for performance and gameplay purposes

      performance --> not calculate every possible outcome recursevly, takes too long
      gameplay    --> not make the computer too difficulty to play against \
*/
PossMoves.prototype.calcNestLevel = function() {
   var   ctx = this,
         count = 0;

   // console.log(ctx.getParent());
   while(ctx.getParent()) {
      ctx = ctx.getParent();
      count++;
   }
   return count;
}



var test = [];
ttToe.pickSpot(ttToe.currentValues, test, true, {});