
// generic data-manipulation helpers
var helpers = {
   removeZeroes: function (arr) {
      // doesn't remove zeroes if all the items are zeroes
      var onlyZeroes = true, i;
      for (i = 0; i < arr.length; i++) {
         if (arr[i] !== 0) {
            onlyZeroes = false;
            break;
         }
      }
      if (!onlyZeroes) {
         return arr.filter(function (item) {
            return item !== 0;
         });
      } else {
         return arr;
      }
   },
   pickLowest: function (arr) {
      return arr.sort(function (a, b) {
         return a - b;
      })[0];
   },
   pickGreatest: function (arr) {
      return arr.sort(function (a, b) {
         return b - a;
      })[0];
   }
};

//#region PossMoves_constructor
function PossMoves(values, parent, player) {
   this.values = values;
   this.children = [];
   this.score = 0;
   this.player = player;
   this.nestLevel = parent.calcNestLevel();
}
// calculate the score of the current outcome
PossMoves.prototype.calcScore = function(player, isRoot) {
   
   var len, i, scoreModify, winVal;
   if(this.values.isWinner.value) {
      len = this.values.isWinner.value.length;
      for(i = 0; i < len; i++) {
         scoreModify = 1;
         winVal = this.values.isWinner.value[i];

         if(isRoot) {
            if (winVal !== player) {
               scoreModify *= 10000;
            } else if (winVal === player){
               scoreModify *= 5000;
            } else {
               scoreModify *= 2500;
            }
            this.score += scoreModify;
         } else {
            if (winVal !== player) {
               this.score = -10 + this.nestLevel;
            } else {
               this.score = 10 - this.nestLevel;
            }
            
         }
      } 
   }
};
PossMoves.prototype.determineKeeper = function () {
   var isPlayer, i, returnValue, values,
      children = this.children.children,
      len = children.length;
   if (this.player === ttToe.currentPlayer) {
      isPlayer = false;
   } else {
      isPlayer = true;
   }

   if (children.length) {
      values = [];
      for (i = 0; i < len; i++) {
         values.push(children[i].score);
      }
      values = helpers.removeZeroes(values);
      this.score = !(isPlayer) ? helpers.pickGreatest(values) : helpers.pickLowest(values);
   }
};
//#endregion PossMoves_constructor


//#region Outcome_constructor
function Outcome(parent, isRoot) {
   this.children = [];
   this.isRoot = isRoot || null;
   if(parent) { this.parent = parent; }
}
Outcome.prototype.getParent = function (context, count) {
   if (!this.isRoot) {
      return this.parent;
   } else {
      return null;
   }
};
Outcome.prototype.calcNestLevel = function () {
   var   ctx = this,
         parent = ctx.getParent(), 
         count = 0;

   while (ctx.getParent()) {
      ctx = ctx.getParent();
      count++;
   }
   return count;
};
Outcome.prototype.getRoot = function () {
   var ctx = this;
   while (ctx.getParent()) { ctx = ctx.getParent(); }
   return ctx;
};
Outcome.prototype.orderByScore = function() {
   if(this.isRoot) {
      this.children = this.children.sort(function(a, b) {
         return a.score - b.score;
      });
   }
};
//#endregion Outcome_constructor

var ttToe = {
  players: [ "x", "o" ],
  currentPlayer: "o",
  board: [
     ['x', null, "o"],
     [null, null, null],
     [null, null, null]
   ],
   maxNest: 0,
   possMovesItems: [],
   winPatterns: [
     ["00", "01", "02"],
     ["10", "11", "12"],
     ["20", "21", "22"],
     ["00", "10", "20"],
     ["01", "11", "21"],
     ["02", "12", "22"],
     ["00", "11", "22"],
     ["02", "11", "20"]
   ],
   isBoardEmpty: function() {
      var   i = 0, j, innerL,
            outL = this.board.length;
            
      for(;i < outL; i++) {
         innerL = this.board[i].length;
         for (j = 0; j < innerL; j++) {
            if (this.board[i][j] !== null) {
               return false;
            }
         }
      }
      return true;
   },

  checkWin: function(values) {
     
      var   i, j, boardPattern,
            len = this.winPatterns.length,
            win = false;

      for (i = 0; i < len; i++) {
         boardPattern = [];

         // translate winning patterns into values
         this.winPatterns[i].forEach(function(vals) {
            boardPattern.push(values[vals[0]][vals[1]]);
         });
         // only keep non-empty board spots
         boardPattern = boardPattern.filter(function(boardSpot) {
            return boardSpot !== null;
         });

         if (boardPattern.length === 3) {
            win = true;
            for (j = 0; j < boardPattern.length - 1; j++) {
               if (boardPattern[j] !== boardPattern[j + 1]) {
                  win = false;
                  break;
               }
            }
         }
         if(win) break; // don't try the other win values if one is succesful


      }
     return win ? boardPattern[0] : null; // returns winner player or null if none
  },
  // get the empty board spots, represented as an array of rows and columns
  getBlankInputs: function(values) {
     
     var row, col, colL,
         empty = [],
         rowL = values.length;

    for (row = 0; row < rowL; row++) {
      colL = values[row].length;
      for (col = 0; col < colL; col++) {
        if (!values[row][col]) {
          empty.push([row, col]);
        }
      }
    }
    return empty;
  },
  // fill an index spot with a values
  fillInputs: function(values, inputValue, index) {
    
    values = this.valuesCopy(values);
    values[index.row][index.col] = inputValue;
    return values;
  },
   // Get the a copy of the current values
   valuesCopy: function(values) {
      
      var   rowL, row, col,
            container = [],
            valL = values.length;

      for (row = 0; row < valL; row++) {
         container[row] = [];
         rowL = values[row].length;

         for (col = 0; col < rowL; col++) {
            container[row][col] = values[row][col];
         }
      }
      return container;
   },
  /* fills every empty spot of the input board with the input player's value, tests each for winning value */
  testCurrent: function(gameData, player) {
     
     var winList, j, i, emptyPlaces, filledValues, emptyL, isWinner,
         replacedList = [];

    emptyPlaces = this.getBlankInputs(gameData);
     emptyL = emptyPlaces.length;
    for (j = 0; j < emptyL; j++) {
      // debugger;
      filledValues = this.fillInputs(this.valuesCopy(gameData), player, {
        row: emptyPlaces[j][0],
        col: emptyPlaces[j][1]
      });
      isWinner = this.checkWin(filledValues);
      replacedList.push({
        values: filledValues,
        isWinner: isWinner ? { value: isWinner } : false,
        position: { col: emptyPlaces[j][1], row: emptyPlaces[j][0] }
      });
    }



    return !replacedList.length ? [] : replacedList ;
  },

   pickSpot: function(gameData, isRoot, parent, player) {
      
      var   outcomes = new Outcome(parent, isRoot),
            checkPlayer, playerIndex, testResults, pushData, pushTarget;


      // alternate the POV of the current neste level (player or enemy player), to be able to use the minmax alogirthm
      if (outcomes.calcNestLevel() % 2 !== 0) {
         playerIndex = !this.players.indexOf(player) + 0;
         checkPlayer = this.players[playerIndex];
      } else {
         checkPlayer = player;
      }

      testResults = this.testCurrent(gameData, checkPlayer);
      testResults.forEach(function(item) {
         pushData = new PossMoves(item, outcomes, checkPlayer);
         pushData.calcScore(player, isRoot);

         ttToe.possMovesItems[pushData.nestLevel] = ttToe.possMovesItems[pushData.nestLevel] || [];
         ttToe.possMovesItems[pushData.nestLevel].push(pushData);

         // keep track of the max nesting level
         if (pushData.nestLevel > ttToe.maxNest) ttToe.maxNest = pushData.nestLevel;

         // don't go deeper if for winning scenarios
         if (!item.isWinner) {
            pushData.children = ttToe.pickSpot(pushData.values.values, false, outcomes, player);
         } else {
            pushData.children = new Outcome();
         }

         outcomes.children.push(pushData);
      });
      
      return outcomes;
   }
};

var nestLevelScorePicker = function(currentNest, results) {
   var len, i, nestLevelItems, nestItems;

   if(currentNest <= 0) {
      results.orderByScore();
      return false;
   } else {
      currentNest--;

      nestItems = ttToe.possMovesItems[currentNest];
      len = nestItems.length;     
      for(i = 0; i < len; i++) {
         nestItems[i].determineKeeper();   
      }

      nestLevelScorePicker(currentNest, results);
   }
};




var now = performance.now();
if(!ttToe.isBoardEmpty()) {

   var test = ttToe.pickSpot(ttToe.board, true, null, "x");
   nestLevelScorePicker(ttToe.maxNest, test);
   console.log(performance.now() - now, test.children);
}