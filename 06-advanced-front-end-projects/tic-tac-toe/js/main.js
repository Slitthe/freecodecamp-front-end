(function(){
   
   //#region GAME LOGIC ONLY
   var game = function () {

      //==============
      //#region ||| PossMoves_constructor
      function PossMoves(values, parent, player) {
         // container for the possible moves and its data
         this.values = values;
         this.children = [];
         this.score = 0;
         this.player = player;
         this.nestLevel = parent.calcNestLevel();
      }
      PossMoves.prototype.calcScore = function(player, isRoot) {
         // calculate the score of the current possible outcome, based on its winning status
         var   len, i,
               winVal = this.values.isWinner.value;
         // only modify score if value is winning for either player, but have opposite scores
         if (winVal) {
            len = winVal.length;
            for (i = 0; i < len; i++) {
               this.score = winVal !== player ? -10 + this.nestLevel : this.score = 10 - this.nestLevel;
            }
         }
      };
      PossMoves.prototype.determineKeepValue = function () {
         // keep only one value from the list of possible outcomes based on their score
         var   i, values,
               children = this.children.children,
               len = children.length;

         if (children.length) {
            values = [];
            for (i = 0; i < len; i++) { 
               values.push(children[i].score);
            }

            // pick the lowest score or the highest based on the current nest levels' player
            this.score =   (this.player !== ttToe[ttToe.currentPlayer]) ?
                           values.sort(function (a, b) { return b - a; })[0] : // lowest val
                           values.sort(function (a, b) { return a - b; })[0] ; // highest val
         }
      };
      //#endregion PossMoves_constructor
      //==============

      //==============
      //#region ||| Outcome_constructor

      function Outcome(parent, isRoot) {
         // outcome constructor,  the middleman between the PossMoves and children outcome
         this.children = [];
         if (isRoot) { this.isRoot = isRoot; }
         if (parent) { this.parent = parent; }
      }
      Outcome.prototype.getParent = function () {
         return !this.isRoot ? this.parent : null;
      };
      Outcome.prototype.calcNestLevel = function () {
         // 0 -> root nest level 
         var   ctx = this,
               count = 0;

         while (ctx.getParent()) {
            ctx = ctx.getParent();
            count++;
         }
         return count;
      };
      Outcome.prototype.orderByScore = function () {
         // order the root moves scores, lowest to highest
         if (this.isRoot) {
            this.children = this.children.sort(function (a, b) {
               return a.score - b.score;
            });
         }
      };
      //#endregion Outcome_constructor
      //==============

      //==============
      //#region ||| methods related to move decision making process
      var moveDecision = {
         nestLevelScorePicker: function (currentNest, results) {
            // determine the keeper score for the possible results, starting from the deepest nesting level
            var len, i, nestItems;

            if (currentNest <= 0) {
               results.orderByScore();
               return false;
            } else {
               currentNest--;
               nestItems = ttToe.possMovesItems[currentNest];
               len = nestItems.length;

               for (i = 0; i < len; i++) {
                  nestItems[i].determineKeepValue(ttToe.p2);
               }

               this.nestLevelScorePicker(currentNest, results);
            }
         },
         possibleOutcomesCalc: function (gameData, isRoot, parent, player) {
            // calculates/returns the possible outcomes for the given game data and the player // called recursevely
            var   outcomes = new Outcome(parent, isRoot),
                  checkPlayer, playerIndex, testResults, pushData;

            // alternate the POV of the current nmest level (player or enemy player), to be able to use the minmax alogirthm
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
               if (item.isWinner) {
                  pushData.children = new Outcome();
               } else {
                  // calls the possibleOutcomesCalc function again, this time with the current 'testResults' outcome instead
                  pushData.children = moveDecision.possibleOutcomesCalc(pushData.values.values, false, outcomes, player);
               }

               outcomes.children.push(pushData);
            });

            return outcomes;
         },
         testCurrent: function (gameData, player) {
            // test a given game board data input by filling every empty spot and testing for win status (based on player)
            var   i, emptyPlaces, filledValues, emptyL, isWinner,
                  replacedList = [];

            emptyPlaces = ttToe.getBlankInputs(gameData);
            emptyL = emptyPlaces.length;
            for (i = 0; i < emptyL; i++) {
               filledValues = ttToe.fillInputs(ttToe.valuesCopy(gameData), player, {
                  row: emptyPlaces[i][0],
                  col: emptyPlaces[i][1]
               });
               isWinner = ttToe.checkWin(filledValues);
               replacedList.push({
                  values: filledValues,
                  isWinner: isWinner ? { value: isWinner } : false,
                  position: { col: emptyPlaces[i][1], row: emptyPlaces[i][0] }
               });
            }
            return !replacedList.length ? [] : replacedList;
         },
         bestMove: function(player, test) {
            // returns the board index where to place the next move for that player
            var bestMoveResults, best, testOutcomes;

            if ( ttToe.getBlankInputs(ttToe.board).length === 9 ) {
               // empty board, always choose center, saves some computing time
               best = [1, 1];
            } else {
               testOutcomes = this.possibleOutcomesCalc(ttToe.board, true, null, player);
               this.nestLevelScorePicker(ttToe.maxNest, testOutcomes);
               bestMoveResults = testOutcomes.children[testOutcomes.children.length - 1].values.position;
               best = [bestMoveResults.row, bestMoveResults.col];
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
         otherPlayer: function (player) {
            return player === 'p1' ? 'p2' : 'p1';
         },
         winPatterns: [ // defines what winning looks like (used string for compact storage "<row><col>")
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
            // gets the actual indices of the winning combo
            var   winPatterns, i,
                  boardPatterns = [];

            for (i = 0; i < this.winPatterns.length; i++) {
               boardPatterns = [];
               this.winPatterns[i].forEach(function(pattern) {
                  boardPatterns.push({
                     value: values[pattern[0]][pattern[1]],
                     index: [pattern[0], pattern[1]]
                  });
               });

               // check if the current pattern is a winning one
               if (boardPatterns[0].value === boardPatterns[1].value && boardPatterns[0].value === boardPatterns[2].value) {
                  boardPatterns = boardPatterns.filter(function (el) { // removes null values
                     return el !== null;
                  });
                  if (boardPatterns.length === 3) {
                     winPatterns = this.boardPatterns;
                     break;
                  }
               }
            }
            return boardPatterns;
         },
         checkWin: function (values) {
            // returns the winner of the current board
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

               if (win) { break; } // don't try the other win values if one is succesful
            }
            return win ? boardPattern[0] : null; // returns winner player or null if none
         },
         getBlankInputs: function (values) {
            // get the empty board spots, represented as an array of rows and columns
            var   row, col, colL,
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
         isDraw: function () { return !this.getBlankInputs(this.board).length; },
         fillInputs: function (values, inputValue, index) {
            // fills a spot with a value, doesn't change the actual board, returns a copy
            values = this.valuesCopy(values);
            values[index.row][index.col] = inputValue;
            return values;
         },
         valuesCopy: function (values) {
            // returns a copy of the input board values
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
      var  querySelectorArray = function (selector) {
         // returns an array of elements selected using querySelectorAll
         return Array.prototype.slice.call( document.querySelectorAll(selector) );
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
      // check end game status of the current board
      gameHelpers.mirrorValues();
      var   winIndex,
            winValue = game.ttToe.checkWin(game.ttToe.board),
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
      // reset the board values, both visually and in the game object
      game.ttToe.board.map(function (row, rowInd) {
         row.forEach(function (col, colInd) {
            col = null;
            elements.board[rowInd][colInd].setAttribute('data-value', '');
         });
      });
      gameHelpers.mirrorValues();
   };

   gameHelpers.mirrorValues = function () {
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
      // handle enabling/disabling of the board tiles
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
      // general game timouts, to reset them at will
      var list = [],
      removeAll = function () {
         list = list.filter(function (timeout) {
            clearTimeout(timeout);
            return false;
         });
      },
      add = function (timeout) {
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
      // what happens when a game tile is activated, by a player or the computer
      item.setAttribute('data-value', game.ttToe[game.ttToe.currentPlayer]);
      gameControls.advanceMove();
   };

   gameControls.startRound = function (changeStartPlayer) {
      // start a new round

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

   gameControls.switchPlayers = function (player, newRound) {
      // switch the active player to the other player

      // optionally change the player who starts the round to be the other one (compared to the previous's round starting player)
      if (newRound) {
         game.ttToe.playerRoundStart = game.ttToe.otherPlayer(game.ttToe.playerRoundStart);
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

   gameControls.advanceMove = function (newRound) {
      // activates when a player has made a move (computer or not)

      // get the winning status of the current board
      var   winData = gameHelpers.endGameState(),
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

   gameControls.computerMove = function () {
      // calculates the computer's move

      // delays the computer move to not be instant
      var timeout = setTimeout(function () {
         var computerChoice;
         // calculate the next move
         computerChoice = game.moveDecision.bestMove(game.ttToe.p2, true);
         // activate the calulated tile
         gameHelpers.playerInputs.enable();
         gameControls.clickBoardItem(elements.board[computerChoice[0]][computerChoice[1]]);
      }, 1300);

      gameHelpers.timeouts.add(timeout);
   };
   //#endregion
   
   //#region VISUALS
   var visuals = {};

   visuals.blinker = {
      // blink the selected board items / all depending on the end game state
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
         // blink that individual row/col board tile
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
         this.elements[game.ttToe.otherPlayer(game.ttToe.currentPlayer)].classList.remove('current-active-player');
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
      visuals.activePlayerDisplay.disable();
      gameHelpers.timeouts.removeAll();
      gameHelpers.resetValues();
      visuals.scoresModify.reset();

      visuals.blinker.reset();
      gameHelpers.playerInputs.disable();

      gameSettings.display.showOnly(['.player-mode']);
   };

   gameSettings.whoStarts = function (player) {
      // selects which player to start the round
      gameControls.startRound(gameControls.switchPlayerStart);
      gameSettings.display.showOnly(['.reset-choice']);

      visuals.activePlayerDisplay.activate();
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