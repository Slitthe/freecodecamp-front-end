(function(){
   
   //#region GAME LOGIC ONLY
   var game = function () {
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
            // values = helpers.removeZeroes(values);

            if (this.player === ttToe[ttToe.currentPlayer]) {
               isPlayer = false;
            } else {
               isPlayer = true;
            }
            // pick the lowest score or the highest based on the current player
            this.score = (isPlayer) ? helpers.pickGreatest(values) : helpers.pickLowest(values);
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
         getNextMove: function getNextMove(player, test) {
            var bestMoveResults, best, testOutcomes;
            var now = new Date().getTime();

            if (!ttToe.isBoardEmpty()) {
               testOutcomes = this.pickSpot(ttToe.board, true, null, player);
               this.nestLevelScorePicker(ttToe.maxNest, testOutcomes);
               bestMoveResults = testOutcomes.children[testOutcomes.children.length - 1].values.position;
               best = [bestMoveResults.row, bestMoveResults.col];
               if (test) {
                  console.log(testOutcomes);
               }
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
         playerRoundStart: 'p1',
         players: ["x", "o"],
         currentPlayer: 'p1',
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
         get isComputerActive() {
            return this.computer && this.currentPlayer === 'p2';
         },
         inactivePlayer: function (player) {
            return player === 'p1' ? 'p2' : 'p1';
         },
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
         getWinIndex: function (values) {

            var boardPatterns = [],
               winPatterns;
            for (i = 0; i < this.winPatterns.length; i++) {
               boardPatterns = [];

               this.winPatterns[i].forEach(function (pattern) {
                  boardPatterns.push({
                     value: values[pattern[0]][pattern[1]],
                     index: [pattern[0], pattern[1]]
                  });
               });


               if (boardPatterns[0].value === boardPatterns[1].value && boardPatterns[0].value === boardPatterns[2].value) {
                  boardPatterns = boardPatterns.filter(function (el) {
                     return el !== null;
                  });
                  if (boardPatterns.length) {
                     winPatterns = this.boardPatterns;
                     break;
                  }
               }
               // only keep non-empty board spots

            }
            return boardPatterns;
         },
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
               boardPattern = boardPattern.filter(function (boardSpot, ind) {
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

               if (win) {
                  winInde = this.winPatterns[i];
                  break;
               } // don't try the other win values if one is succesful
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
         isDraw: function () {
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
   //#endregion
  
   /* 
         ▲▲▲   GAME LOGIC ▲▲▲

      =========================
      =========================
      =========================

         ▼▼▼  IMPLEMENTATION  ▼▼▼
   */

   
   //#region ELEMENTS
   var elements = function () {
      var querySelectorArray = function (selector) {
         // returns an array of elements selected using querySelectorAll
         return Array.prototype.slice.call(document.querySelectorAll(selector));
      },
         boardItems = querySelectorArray('[data-column]');

      return {
         board: [
            [boardItems[0], boardItems[1], boardItems[2]],
            [boardItems[3], boardItems[4], boardItems[5]],
            [boardItems[6], boardItems[7], boardItems[8]]
         ],
         playerChangeBtns: querySelectorArray('.player-change'),
         modeChangeBtns: querySelectorArray('.mode-change'),
         whoStart: querySelectorArray('.who-starts > button'),
         resetBtn: document.querySelector('.reset-choice button')
      };
   }();
   //#endregion

   //#region GAME LOGIC IMPLEMENTATION HELPERS
   var gameHelpers = {};
   gameHelpers.endGameState = function () {
      gameHelpers.fillValues();
      // check for end game and start again
      var winIndex;
      var winValue = game.ttToe.checkWin(game.ttToe.board),
         draw = game.ttToe.isDraw(game.ttToe.board) ? 'tie' : false;
      if (winValue) {
         winIndex = game.ttToe.getWinIndex(game.ttToe.board);
      }

      if (winValue || draw) {
         visuals.scoresModify.add(winValue || draw);
      }

      return {
         status: winValue || draw,
         winIndex: winIndex || null,
         win: winValue,
         draw: draw
      };
   };
   gameHelpers.resetValues = function () {
      // console.log('gameHelpers.resetValues');
      // reset the board values, both visually and in the game object
      game.ttToe.board.map(function (row, rowInd) {
         row.forEach(function (col, colInd) {
            col = null;
            elements.board[rowInd][colInd].setAttribute('data-value', '');
         });
      });
      gameHelpers.fillValues();
   };
   gameHelpers.fillValues = function () {
      // console.log('gameHelpers.fillValues');
      var i, j, rowLen, value,
         len = elements.board.length;

      for (i = 0; i < len; i++) {
         rowLen = elements.board[i].length;
         for (j = 0; j < elements.board[i].length; j++) {
            value = elements.board[i][j].getAttribute('data-value');
            game.ttToe.board[i][j] = value ? value : null;
         }
      }
   };
   gameHelpers.playerInputs = function () {
      var enabled = false,
         enable = function () {
            enabled = true;
            document.body.setAttribute('data-active-player', game.ttToe[game.ttToe.currentPlayer]);
         },
         disable = function () {
            enabled = false;
            document.body.setAttribute('data-active-player', '');
         },
         isEnabled = function () {
            return enabled;
         };
      return {
         enable: enable,
         disable: disable,
         isEnabled: isEnabled
      };
   }();
   gameHelpers.timeouts = function () {
      var list = [];
      var removeAll = function () {
         list = list.filter(function (timeout) {
            clearTimeout(timeout);
            return false;
         });
      };
      var add = function (timeout) {
         list.push(timeout);
      };
      return {
         add: add,
         removeAll: removeAll
      };
   }();
   //#endregion

   //#region GAME CONTROLS
   var gameControls = {};
   gameControls.clickBoardItem = function (item) {
      item.setAttribute('data-value', game.ttToe[game.ttToe.currentPlayer]);
      gameControls.advanceMove();
   };
   // start a new round
   gameControls.startRound = function (changeStartPlayer) {
      // general resets
      visuals.blinker.reset();
      gameHelpers.playerInputs.disable();
      gameHelpers.timeouts.removeAll();
      gameHelpers.resetValues();

      // optional starting player switch
      if (changeStartPlayer) gameControls.switchPlayers(game.ttToe.currentPlayer, true);

      // computer or player next move (depending on the game mode, 1P or 2P)
      if (game.ttToe.isComputerActive) { gameControls.computerMove(); }
      else { gameHelpers.playerInputs.enable(); }

   };

   // switch the active player to the other player
   gameControls.switchPlayers = function (player, newRound) {
      // optionally change the player who starts the round to be the other one (compared to the previous's round starting player)
      if (newRound) {
         game.ttToe.playerRoundStart = game.ttToe.inactivePlayer(game.ttToe.playerRoundStart);
      }
      // switches the active player
      game.ttToe.currentPlayer = player === 'p1' ? 'p2' : 'p1';

      // disable the tile controls if the next move is the computers'
      if (!game.ttToe.isComputerActive) {
         document.body.setAttribute('data-active-player', game.ttToe[game.ttToe.currentPlayer]);
      } else {
         document.body.setAttribute('data-active-player', '');
      }

      // highlights the current active player upon change
      visuals.activePlayerDisplay.activate();
   };

   // activates when a player has made a move (computer or not)
   gameControls.advanceMove = function (newRound) {
      // get the winning status of the current board
      var winData = gameHelpers.endGameState(),
         winStatus = winData.status,
         timeout, blinkAll;
      // disables inputs and switch the player
      gameHelpers.playerInputs.disable();
      gameControls.switchPlayers(game.ttToe.currentPlayer);

      // non-final game board
      if (!winStatus) {
         if (game.ttToe.isComputerActive) { gameControls.computerMove(); }
         else { gameHelpers.playerInputs.enable(); }

      } else {
         // win or tie game board
         gameHelpers.playerInputs.disable();

         // win or tie values blinking start
         blinkAll = winData.win ? false : true;
         visuals.blinker.on(winData.winIndex, blinkAll);


         // prepare for the next round via a delay
         visuals.activePlayerDisplay.disable();
         timeout = setTimeout(function () {
            gameControls.startRound(true);
         }, 5000);
         gameHelpers.timeouts.add(timeout);
      }
   };

   // calculates the computer's move
   gameControls.computerMove = function () {
      var computerChoice;
      // delays the computer move to not be instant
      var timeout = setTimeout(function () {
         // calculate the next move
         computerChoice = game.moveDecision.getNextMove(game.ttToe.p2, true);
         // activate the calulated tile
         gameHelpers.playerInputs.enable();
         gameControls.clickBoardItem(elements.board[computerChoice[0]][computerChoice[1]]);
      }, 1500);

      gameHelpers.timeouts.add(timeout);
   };
   //#endregion
   
   //#region VISUALS
   var visuals = {};
   visuals.blinker = {
      // blink the selected board items / all dependin, on the end game state
      intervals: [],
      reset: function () {
         // turn off the blinkers by resettings/deleting the intervals
         this.intervals.forEach(function (interval) {
            clearInterval(interval);
         });
         this.intervals = [];
         elements.board.forEach(function (row) {
            row.forEach(function (col) {
               col.classList.remove('invisible');
            });
         });
      },
      on: function (indices, all) {
         // turn on the blinking, all or the selected
         var i, len, row, col;
         if (all) {
            this.blinkAll();
         } else {
            len = indices.length;
            for (i = 0; i < len; i++) {
               row = indices[i].index[0];
               col = indices[i].index[1];
               this.setBlink(row, col);
            }
         }
      },
      setBlink: function (row, col) {
         // blink that row/col board tile
         var interval;
         interval = setInterval(function () {
            elements.board[row][col].classList.toggle('invisible');
         }, 300);

         this.intervals.push(interval);

      },
      blinkAll: function () {
         // blink every board item
         var ctx = this, interval;
         elements.board.forEach(function (row) {
            row.forEach(function (col) {
               interval = setInterval(function () {
                  col.classList.toggle('invisible');
               }, 300);
               ctx.intervals.push(interval);
            });
         });
      }
   };

   visuals.activePlayerDisplay = {
      elements: {
         p1: document.querySelector('.display .active-player .p1 .value'),
         p2: document.querySelector('.display .active-player .p2 .value'),
         get list() { return [this.p1, this.p2]; }
      },
      activate: function () {
         this.elements[game.ttToe.inactivePlayer(game.ttToe.currentPlayer)].classList.remove('current-active-player');
         this.elements[game.ttToe.currentPlayer].classList.add('current-active-player');
      },
      disable: function () {
         this.elements.list.forEach(function (el) { el.classList.remove('current-active-player'); });
      },
      remove: function () {
         this.elements.list.forEach(function (el) { el.classList.innerText = ''; });
      },
      updateText: function () {
         this.elements.p1.innerText = game.ttToe.p1;
         this.elements.p2.innerText = game.ttToe.p2;
      }
   };

   visuals.scoresModify = function () {
      var scores = {
         values: {
            p1: 0,
            p2: 0,
            tie: 0
         },
         elements: {
            p1: document.querySelector('.score .p1 .value'),
            p2: document.querySelector('.score .p2 .value'),
            tie: document.querySelector('.score .tie .value')
         }
      },
         reset = function () {
            Object.keys(scores.values).forEach(function (score) {
               scores.values[score] = 0;
               scores.elements[score].innerText = scores.values[score];
            });
         },
         getPlayer = function (player) {
            return game.ttToe.p1 === player ? 'p1' : 'p2';
         },
         visualUpdate = function () {
            Object.keys(scores.elements).forEach(function (score) {
               scores.elements[score].innerText = scores.values[score];
            });
         },
         add = function (winStatus) {
            var player;
            if (winStatus === 'tie') {
               scores.values.tie++;
            } else {
               player = getPlayer(winStatus);
               scores.values[player]++;
            }
            visualUpdate();
         };
      return {
         add: add,
         reset: reset
      };
   }();
   //#endregion

   //#region GAME SETTINGS
   var gameSettings = {};
   gameSettings.display = function () {
      // visual changes for the game settings elements
      var elements = [
         { name: '.reset-choice', el: document.querySelector('.reset-choice') },
         { name: '.player-mode', el: document.querySelector('.player-mode') },
         { name: '.player-selection', el: document.querySelector('.player-selection') },
         { name: '.who-starts', el: document.querySelector('.who-starts') }
      ];

      var showOnly = function (nameList) {
         // only show the given input 
         elements.forEach(function (item) {
            if (nameList.indexOf(item.name) !== -1) {
               item.el.classList.remove('hide');
            } else {
               item.el.classList.add('hide');
            }
         });
      };
      return { showOnly: showOnly };
   }();
   gameSettings.changeMode = function (mode) {
      // change the game mode, computer vs player(1p) or player vs player(2p)
      game.ttToe.computer = mode === '1p' ? true : false;
      gameSettings.display.showOnly(['.player-selection']);
   };
   gameSettings.changePlayer = function (player) {
      // change who's the p1 and p2

      var p2Index;
      game.ttToe.p1 = player;
      // reverses the index in a 2 elements array transforming boolean values to numbers ( + 0)
      p2Index = game.ttToe.players.indexOf(player);
      game.ttToe.p2 = game.ttToe.players[!p2Index + 0];


      visuals.activePlayerDisplay.updateText();
      document.querySelector('.who-starts .p1').innerText = game.ttToe.p1;
      document.querySelector('.who-starts .p2').innerText = game.ttToe.p2;

      gameSettings.display.showOnly('.who-starts');
   };
   gameSettings.hardResetGame = function () {
      // preparations for a new game
      gameHelpers.timeouts.removeAll();
      gameHelpers.resetValues();
      visuals.scoresModify.reset();

      visuals.blinker.reset();
      gameHelpers.playerInputs.disable();
      visuals.activePlayerDisplay.remove();

      gameSettings.display.showOnly(['.player-mode']);
   };
   gameSettings.whoStarts = function (player) {
      // selects which player to start the round
      var otherPlayerStart = game.ttToe.inactivePlayer(game.ttToe.playerRoundStart),
         switchPlayerStart = player === otherPlayerStart;

      gameControls.startRound(gameControls.switchPlayerStart);
      gameSettings.display.showOnly(['.reset-choice']);
   };
   //#endregion

   //#region EVENTS
   var eventsInit = function () {
      elements.board.forEach(function (row) {
         row.forEach(function (col) {
            col.addEventListener('click', function () {
               // disallow inputs for already selected tiles and when inputs are explicitly disbled
               if (!this.getAttribute('data-value') && gameHelpers.playerInputs.isEnabled()) {
                  gameControls.clickBoardItem(this);
               }
            });
         });
      });
      elements.modeChangeBtns.forEach(function (btn) {
         btn.addEventListener('click', function () {
            gameSettings.changeMode(this.innerText);
         });
      });
      elements.playerChangeBtns.forEach(function (btn) {
         btn.addEventListener('click', function () {
            gameSettings.changePlayer(this.innerText);
         });
      });

      elements.whoStart.forEach(function (btn) {
         btn.addEventListener('click', function () {
            gameSettings.whoStarts(this.getAttribute('data-player'));
         });
      });
      elements.resetBtn.addEventListener('click', function () {
         gameSettings.hardResetGame();
      });
   };
   document.addEventListener('DOMContentLoaded', eventsInit);
//#endregion
})();