var id = 0;
function PossMoves(values, parent) {
   id++;
   var ctx = this;
   this.id = id;
   this.values = values;
   this.children = [];
   this.score = 0;
}
var possMovesItems = [];
var maxNest = 0;
PossMoves.prototype.calcScore = function(player, isRoot) {
   if(this.values.isWinner.value) {
      for(var i = 0; i < this.values.isWinner.value.length; i++) {
         var scoreModify = 1;
         if(isRoot) {
            if (this.values.isWinner.value[i] !== player) {
               scoreModify *= 10000;
            } else if (this.values.isWinner.value[i] === player){
               scoreModify *= 5000;
            } else {
               scoreModify *= 2500;
            }
            this.score += scoreModify;
         } else {
            if(this.values.isWinner.value !== player) {
               this.score = -10 + this.nestLevel;
            } else {
               this.score = 10 - this.nestLevel;
            }
            
         }
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
         return a.score - b.score;
      });
   }
}


var ttToe = {
   players: [ // the players and their indentificators -- 'x' and 'o'
      'x', 'o'
   ],
   // null -- a spot not yet filled by any players
   currentValues: [
      [null, null, null],
      [null, null, 'o'],
      ['x', null, 'x',]
   ],
   valuesLength: function(values) {
      var len = 0;
      for(var i = 0; i < values.length; i++) {
         for(var j = 0; j < values[i].length; j++) {
            if (values[i][j] !== null) {
               len++;
            }
         }
      }
      return len;
   },
   // currentValues: [
   //    [null, null, null],
   //    [null, 'x', 'o'],
   //    [null, null, 'x',]
   // ],
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

      return winPatterns.length ? winPatterns[0] : null;

      /* Convert this to return the winner's name or null if none */
   },
   equalTest: function(values, player) {
      var isEqual = false;
      var winValue = this.checkWin(values);
      if (player && this.valuesLength(values) >= 7 && !winValue) {
         var tested = ttToe.pickSpot(values, true, null, player);
         tested.calcRootScores();
         var total = 0;
         tested.children.forEach(function(child) {
            child.score += total;
         });
         if(total === 0) {
            isEqual = 'equal';
         }
      }
      return isEqual;
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
   testCurrent: function(gameData, player) {
      var replacedList = [];
      var winList, j, i;
      
         j = 0;
         var emptyPlaces = this.getBlankInputs(gameData);
         for(j = 0; j < emptyPlaces.length; j++) {
            // debugger;
            var filledValues = this.fillInputs(this.valuesCopy(gameData),player, { row: emptyPlaces[j][0],  col: emptyPlaces[j][1]});
            isWinner = this.checkWin(filledValues);
            replacedList.push(
               {
                  values: filledValues,
                  isWinner: isWinner ? {value: isWinner} : false,
                  position: { col: emptyPlaces[j][1], row: emptyPlaces[j][0]}
               }
            );
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
      var outcomes = new Outcome(parent), checkPlayer;
      if(isRoot) {
         outcomes.isRoot = true;
      }

      if ( (outcomes.calcNestLevel() % 2) !== 0) {
         var playerIndex = !this.players.indexOf(player) + 0;
         checkPlayer = this.players[playerIndex];
      } else {
         checkPlayer = player;
      }
      var testResults = this.testCurrent(gameData, checkPlayer);
      if (testResults && outcomes.calcNestLevel() < 8) {
         testResults.list.forEach(function(item) {
            var pushData = new PossMoves(item, outcomes);
            possMovesItems.push(pushData);
            pushData.nestLevel = outcomes.calcNestLevel();
            if (pushData.nestLevel > maxNest) { 
               maxNest = pushData.nestLevel;
            }
            pushData.player = checkPlayer;
            pushData.calcScore(player, isRoot);
            var pushTarget = outcomes.children;
            if (!item.isWinner) {
               pushData.children = ttToe.pickSpot(pushData.values.values, false, outcomes, player) ;
            } else {
               pushData.children = new Outcome();
            }
            pushTarget.push(pushData);
            
            
         });
      }
      return outcomes;
   }
};






var test = ttToe.pickSpot(ttToe.currentValues, true, null, 'o');
// test.calcRootScores();
// test.calcRootScores();

// console.log(test.children[test.children.length - 1].values.position);
// var testChild = test.children["0"].children.children["0"].children.children["0"].children.children[2].children.children["0"];




// var sameScore = function(possMoveItem) {
//    var total = 0;
//    var children = possMoveItem.children.children;
//    if (children.length) {
//       // console.log(children);

//       children.forEach(function(child) {
//          total += child.score;
//       });
//       if( Math.abs(total) / children.length  === 1) {
//          possMoveItem.score = total / children.length;
//          possMoveItem.children.children = [];
//       } 

//    }
// };

// for(var i = maxNest; i >= 0; i--) {
//    var filtered = possMovesItems.filter(function(item) {
//       return item.nestLevel === i;
//    });
//    filtered.forEach(function(crNestItem) {
//       sameScore(crNestItem);
//    });
// }

// PossMoves.prototype.removeZeroes = function() {
//    var children = this.children.children;
//    if(children.length) {
//       var hasNonZeroes = false;
//       children.forEach(function(child) {
//          if(child.score !== 0) {
//             hasNonZeroes = true;
//          }
//       });
//       if (hasNonZeroes) {
//          console.log(this.children);
//       }

//       if (hasNonZeroes) {
//          this.children = children.filter(function(item) {
//             return item.score !== 0;
//          });
//          console.log(children);
//       }
//    }
// };


var removeZeroes = function(arr) {
   var onlyZeroes = true;
   arr.forEach(function(el) {
      if(el !== 0) {
         onlyZeroes = false;
      }
   });
   if(!onlyZeroes) {
      return arr.filter(function(item) {
         return item !== 0;
      });
   } else {
      return arr;
   }
}
var pickLowest = function(arr) {
   return arr.sort(function(a, b) {
      return a - b;
   })[0];
};
var pickGreatest = function(arr) {
   return arr.sort(function(a, b) {
      return b - a;
   })[0];
};

PossMoves.prototype.determineKeeper = function() {
   var ctx = this;
   return new Promise(function(res, rej) {
      var isYou;
      if(ctx.player === 'x') {
         isYou = false;
      } else {
         isYou = true;
      }
      var children = ctx.children.children;
      if(children.length) {
         var values = [];
         children.forEach(function(child) {
            values.push(child.score);
         });
         

         values = removeZeroes(values);
         var returnValue;
         if(!isYou) {
            returnValue = pickGreatest(values);
         } else {
            returnValue = pickLowest(values);
         }
         ctx.score = returnValue;
         res(values);
      } else {
         res();
      }
   });
};





var nestActions = function(currentNest) {
   if(currentNest < 0) {
      return false;
   } else {
      var promiseList = [];
      currentNest--;
      var filtered = possMovesItems.filter(function (item) {
         return item.nestLevel === currentNest;
      });
      filtered.forEach(function (crNestItem) {
         promiseList.push(crNestItem.determineKeeper());
      });
      Promise.all(promiseList).then(function(){
         nestActions(currentNest);
      });
   }
};
nestActions(maxNest);

test.orderByScore();