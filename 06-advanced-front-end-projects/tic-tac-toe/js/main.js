
function PossMoves(values, parent) {
   var ctx = this;;
   this.values = values;
   this.children = [];
   this.score = 0;
}
PossMoves.prototype.calcScore = function(player, isRoot) {
   if(this.values.isWinner) {
      for(var i = 0; i < this.values.isWinner.value.length; i++) {
         var scoreModify = Math.pow(10, (this.nestLevel * -0.7));
         if(isRoot) {
            if (this.values.isWinner.value[i] !== player) {
               scoreModify *= 100;
            } else {
               scoreModify *= 200;
            }
         } else {
            if(this.values.isWinner.value[0] !== player) {
               scoreModify *= -5;
            } else {
               scoreModify *= 2;
            }
         }
         this.score += scoreModify;
      }
   }
};

function Outcome(parent) {
   this.children = [];
   if(parent) { this.parent = parent; }
}
Outcome.prototype.getParent = function (context, count) {
   if (!this.hasOwnProperty('isRoot') && !this.isRoot) {
      return this.parent;
   } else {
      return null;
   }
};
Outcome.prototype.getTotalScore = function () {
   var score = 0;
   var keepOn = true;
   this.children.forEach(function(child) {
      
      score += child.score;
      if(child.children.children.length) {
         score += child.children.getTotalScore();
      } else {
         keepOn = false;
      }
   });
   return score;

};
Outcome.prototype.calcNestLevel = function () {
   var   ctx = this,
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
Outcome.prototype.listChildren = function() {
   this.children.forEach(function(child) {
      if(child.values.isWinner) {
         console.log(child.values);
      }
   });
};
Outcome.prototype.calcRootScores = function() {
   if (this.hasOwnProperty('isRoot') && this.isRoot) {
      this.children.forEach(function(child) {
         child.score += child.children.getTotalScore();
      });
   }
};
Outcome.prototype.orderByScore = function() {
   if(this.isRoot) {
      this.children = this.children.sort(function(a, b) {
         return b.score - a.score;
      });
   }
}


var ttToe = {
   players: [ // the players and their indentificators -- 'x' and 'o'
      'x', 'o'
   ],
   // null -- a spot not yet filled by any players
   currentValues: [
      [null, null, 'x'],
      [null, 'o', null],
      ['x', null, null,]
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
               winPatterns.push(actualValues[0]);
            }
         }
      }
      return winPatterns.length ? winPatterns : null;

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
                  isWinner: ttToe.checkWin(filledValue) ? {value: ttToe.checkWin(filledValue)} : false,
                  position: { col: emptyPlaces[j][1], row: emptyPlaces[j][0]}
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
   pickSpot: function(gameData, isRoot, parent, player) {
      var outcomes = new Outcome(parent);
      if(isRoot) {
         outcomes.isRoot = true;
      }

      var testResults = this.testCurrent(gameData);
      // console.log(testResults);

      // console.log(outcomes.calcNestLevel());
      if (testResults && outcomes.calcNestLevel() < 6) {
         testResults.list.forEach(function(item) {
            var pushData = new PossMoves(item, outcomes);
            pushData.nestLevel = outcomes.calcNestLevel();
            pushData.calcScore(player, isRoot);
            // console.log(outcomes);
            var pushTarget = outcomes.children;
            // console.log(outcomes.calcNestLevel());
            if (!item.isWinner) {
               pushData.children = ttToe.pickSpot(pushData.values.values, false, outcomes, player) ;
            } else {
               pushData.children = new Outcome();
            }
            pushTarget.push(pushData);
            
            
            // console.log(pushTarget)
            // times++;
            // console.log(pushData);
            
         });
      }
      // console.log(outcomes);
      
      return outcomes;
   }
};






var test = ttToe.pickSpot(ttToe.currentValues, true, null, 'o');
test.calcRootScores();
test.orderByScore();
console.log(test.children[0].values.position);