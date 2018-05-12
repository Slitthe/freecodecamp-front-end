/* 

   Game code that is idependent of the run environment

*/
var game = function() {
   //==============
   //#region ||| generic numeric arrays manipulation helpers
   var helpers = {
      // remove all the zeroes from an array ONLY if there are other values than 0
      removeZeroes: function (arr) {
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
   //#endregion
   //==============

   //==============
   //#region ||| PossMoves_constructor
   // container for the possible moves and its data
   function PossMoves(values, parent, player) {
      this.values = values;
      this.children = [];
      this.score = 0;
      this.player = player;
      this.nestLevel = parent.calcNestLevel();
   }
   // calculate the score of the current possible outcome, based on its winning status
   PossMoves.prototype.calcScore = function (player, isRoot) {
      var len, i,
         winVal = this.values.isWinner.value;
      // only modify score if value is winning for either player, but have opposite scores
      if (winVal) {
         len = winVal.length;
         for (i = 0; i < len; i++) {
            this.score = winVal !== player ? -10 + this.nestLevel : this.score = 10 - this.nestLevel;
         }
      }
   };
   // only keep one values from the children possible outcomes, the best outcome for the current player
   PossMoves.prototype.determineKeeper = function () {
      var isPlayer, i, returnValue, values,
         children = this.children.children,
         len = children.length;

      if (children.length) {
         // store only the score values of the children outcomes
         values = [];
         for (i = 0; i < len; i++) {
            values.push(children[i].score);
         }
         // remove zeroes from that score list only if there are other scores
         values = helpers.removeZeroes(values);

         if (this.player === ttToe.p2) {
            isPlayer = false;
         } else {
            isPlayer = true;
         }
         // pick the lowest score or the highest based on the current player
         this.score = !(isPlayer) ? helpers.pickGreatest(values) : helpers.pickLowest(values);
      }
   };
//#endregion PossMoves_constructor
   //==============

   //==============
   //#region ||| Outcome_constructor

   // outcome constructor, is the middleman between the PossMoves and children outcome
   function Outcome(parent, isRoot) {
      this.children = [];
      if (isRoot) { this.isRoot = isRoot; }
      if (parent) { this.parent = parent; }
   }
   // retrun the parent of the current outcome list
   Outcome.prototype.getParent = function () {
      return !this.isRoot ? this.parent : null;
   };
   // 0 -> root nest level 
   Outcome.prototype.calcNestLevel = function () {
      var ctx = this,
         parent = ctx.getParent(),
         count = 0;

      while (ctx.getParent()) {
         ctx = ctx.getParent();
         count++;
      }
      return count;
   };
   // order the root moves scores, lowest to highest
   Outcome.prototype.orderByScore = function () {
      if (this.isRoot) {
         this.children = this.children.sort(function (a, b) {
            return a.score - b.score;
         });
      }
   };
//#endregion Outcome_constructor
   //==============

   //==============
   //#region ||| methods related to move deicison making process
   var moveDecision = {
      nestLevelScorePicker: function (currentNest, results) {
         var len, i, nestLevelItems, nestItems;

         if (currentNest <= 0) {
            results.orderByScore();
            return false;
         } else {
            currentNest--;

            nestItems = ttToe.possMovesItems[currentNest];
            len = nestItems.length;
            for (i = 0; i < len; i++) {
               nestItems[i].determineKeeper(ttToe.p2);
            }

            this.nestLevelScorePicker(currentNest, results);
         }
      },
      pickSpot: function (gameData, isRoot, parent, player) {
         var outcomes = new Outcome(parent, isRoot),
            checkPlayer, playerIndex, testResults, pushData, pushTarget;


         // alternate the POV of the current neste level (player or enemy player), to be able to use the minmax alogirthm
         if (outcomes.calcNestLevel() % 2 !== 0) {
            playerIndex = !ttToe.players.indexOf(player) + 0;
            checkPlayer = ttToe.players[playerIndex];
         } else {
            checkPlayer = player;
         }

         testResults = this.testCurrent(gameData, checkPlayer);
         testResults.forEach(function (item) {
            pushData = new PossMoves(item, outcomes, checkPlayer);
            pushData.calcScore(player, isRoot);

            ttToe.possMovesItems[pushData.nestLevel] = ttToe.possMovesItems[pushData.nestLevel] || [];
            ttToe.possMovesItems[pushData.nestLevel].push(pushData);

            // keep track of the max nesting level
            if (pushData.nestLevel > ttToe.maxNest) ttToe.maxNest = pushData.nestLevel;

            // don't go deeper if for winning scenarios
            if (!item.isWinner) {
               pushData.children = moveDecision.pickSpot(pushData.values.values, false, outcomes, player);
            } else {
               pushData.children = new Outcome();
            }

            outcomes.children.push(pushData);
         });

         return outcomes;
      },
      testCurrent: function (gameData, player) {

         var winList, j, i, emptyPlaces, filledValues, emptyL, isWinner,
            replacedList = [];

         emptyPlaces = ttToe.getBlankInputs(gameData);
         emptyL = emptyPlaces.length;
         for (j = 0; j < emptyL; j++) {
            // debugger;
            filledValues = ttToe.fillInputs(ttToe.valuesCopy(gameData), player, {
               row: emptyPlaces[j][0],
               col: emptyPlaces[j][1]
            });
            isWinner = ttToe.checkWin(filledValues);
            replacedList.push({
               values: filledValues,
               isWinner: isWinner ? { value: isWinner } : false,
               position: { col: emptyPlaces[j][1], row: emptyPlaces[j][0] }
            });
         }
         return !replacedList.length ? [] : replacedList;
      },
      getNextMove: function getNextMove(player) {
         var bestMoveResults, best, testOutcomes;
         var now = new Date().getTime();

         if (!ttToe.isBoardEmpty()) {
            testOutcomes = this.pickSpot(ttToe.board, true, null, player);
            this.nestLevelScorePicker(ttToe.maxNest, testOutcomes);
            bestMoveResults = testOutcomes.children[testOutcomes.children.length - 1].values.position;
            best = [bestMoveResults.row, bestMoveResults.col];
         } else {
            best = [1, 1];
         }
         return best;
      }
   };
//#endregion
   //==============


   //==============
   // #region ||| Game values and related board helper methods
   var ttToe = {
      players: ["x", "o"],
      currentPlayer: 'p2',
      board: [
         ['o', 'o', null],
         [null, null, null],
         ['o', "x", "x"]
      ],
      p1: 'o',
      p2: 'x',
      computer: false,
      maxNest: 0,
      possMovesItems: [],
      // defines what winning looks like (used string for compact storage "<row><col>")
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
      isBoardEmpty: function () {
         var i = 0, j, innerL,
            outL = this.board.length;

         for (; i < outL; i++) {
            innerL = this.board[i].length;
            for (j = 0; j < innerL; j++) {
               if (this.board[i][j] !== null) {
                  return false;
               }
            }
         }
         return true;
      },
      // returns the winner of the current board or none if no winner
      checkWin: function (values) {
         var i, j, boardPattern,
            len = this.winPatterns.length,
            win = false;

         for (i = 0; i < len; i++) {
            boardPattern = [];

            // translate winning patterns into values
            this.winPatterns[i].forEach(function (vals) {
               boardPattern.push(values[vals[0]][vals[1]]);
            });
            // only keep non-empty board spots
            boardPattern = boardPattern.filter(function (boardSpot) {
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

            if (win) break; // don't try the other win values if one is succesful
         }
         return win ? boardPattern[0] : null; // returns winner player or null if none
      },
      // get the empty board spots, represented as an array of rows and columns
      getBlankInputs: function (values) {
         var row, col, colL,
            empty = [],
            rowL = values.length;
         // search row
         for (row = 0; row < rowL; row++) {
            colL = values[row].length;
            // search col
            for (col = 0; col < colL; col++) {
               if (!values[row][col]) {
                  // push the empty value's indices
                  empty.push([row, col]);
               }
            }
         }
         // returns the array of empty indices
         return empty;
      },
      isDraw: function() {
         return !this.getBlankInputs(this.board).length;
      },
      // fills a spot with a value, doesn't change the actual board, returns a copy
      fillInputs: function (values, inputValue, index) {
         values = this.valuesCopy(values);
         values[index.row][index.col] = inputValue;
         return values;
      },
      // Get the a copy of the input board  values
      valuesCopy: function (values) {
         var rowL, row, col,
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
   };
// #endregion
   //==============

   return {
      moveDecision: moveDecision,
      ttToe: ttToe
   };
}();