//#region ELEMENTS
var querySelectorArray = function(selector) {
   // returns an array of elements selected using querySelectorAll
   return Array.prototype.slice.call(document.querySelectorAll(selector));
};

var   boardItems = querySelectorArray('[data-column]'),
      playerChangeBtns = querySelectorArray('.player-change'),
      modeChangeBtns = querySelectorArray('.mode-change'),
      board = [
         [boardItems[0], boardItems[1], boardItems[2]],
         [boardItems[3], boardItems[4], boardItems[5]],
         [boardItems[6], boardItems[7], boardItems[8]]
      ],
      display = {
         activePlayer: {
            p1: document.querySelector('.display .active-player .p1 .value'),
            p2: document.querySelector('.display .active-player .p2 .value')
         },
      },
      whoStart = {
         players: querySelectorArray('.who-starts > button'),
         container: document.querySelector('.who-starts')
      };
//#endregion

//#region SCORES
var scoresModify = function() {
   var scores = {
      values: {
         p1: 0,
         p2: 0,
         tie: 0
      },
      elements: {
         p1: document.querySelector('.display .score .p1 .value'),
         p2: document.querySelector('.display .score .p2 .value'),
         tie: document.querySelector('.display .score .tie .value')
      }
   };

   var reset = function() {
      Object.keys(scores.values).forEach(function(score) {
         scores.values[score] = 0;
         scores.elements[score].innerText = scores.values[score];
      });
   };
   var getPlayer = function(player) {
      return game.ttToe.p1 === player ? 'p1' : 'p2'; 
   };

   var visualUpdate = function() {
      Object.keys(scores.elements).forEach(function (score) {
         scores.elements[score].innerText = scores.values[score];
      });
   };

   var add = function(winStatus) {
      var player;
      if(winStatus === 'tie') {
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


//#region TIMEOUTS
var timeouts = function() {
   var list = [];

   var removeAll = function() {
      console.log(list);
      list = list.filter(function(timeout) {
         clearTimeout(timeout);
         return false;
      });
   }

   var add = function(timeout) {
      list.push(timeout);
   };

   return {
      add: add,
      removeAll: removeAll
   };
}();
//#endregion timeouts




var playerInputs = function() {
   var enabled = false;

   var enable = function() {
     enabled = true; 
   };

   var disable = function() {  
      enabled = false;
   };

   var isEnabled = function() {
      return enabled;
   };

   return {
      enable: enable,
      disable: disable,
      isEnabled: isEnabled
   };
}();



var startRound = function(changeStartPlayer) {
   blinker.reset();
   if(changeStartPlayer) {
      switchPlayers(game.ttToe.currentPlayer, true);
   }
   
   playerInputs.disable();
   timeouts.removeAll();
   resetValues(); // reset board

   if(game.ttToe.isComputerActive) {
      computerMove();
   } else {
      console.log('startRound || enable');
      playerInputs.enable();
   }
};

// sync visual with game values
var fillValues = function() {
   // console.log('fillValues');
   var   i, j, rowLen, value,
         len = board.length;

   for(i = 0; i < len; i++) {
      rowLen = board[i].length;
      for(j = 0; j < board[i].length; j++) {
         value = board[i][j].getAttribute('data-value');
         game.ttToe.board[i][j] = value ? value : null;
      }
   }
};

// reset the visual and game values
var resetValues = function() {
   // console.log('resetValues');
   // reset the board values, both visually and in the game object
   game.ttToe.board.map(function(row, rowInd) {
      row.forEach(function(col, colInd) {
         col = null;
         board[rowInd][colInd].setAttribute('data-value', '');
      });
   });
   fillValues();
};

// switch the active player to be the other one
var switchPlayers = function(player, newRound) {
   if(newRound) {
      game.ttToe.playerRoundStart = game.ttToe.inactivePlayer(game.ttToe.playerRoundStart);
      game.ttToe.currentPlayer = game.ttToe.playerRoundStart;  
   } else {
      if (player === 'p1') {
         game.ttToe.currentPlayer = 'p2';
      } else {
         game.ttToe.currentPlayer = 'p1';
      }
      
   }

   if (!game.ttToe.isComputerActive) {
      document.body.setAttribute('data-active-player', game.ttToe[game.ttToe.currentPlayer]);
   } else {
      document.body.setAttribute('data-active-player', ''); 
   }
   activePlayerHighlight.activate();
   
   
};


var activePlayerHighlight = {
   activate: function() {
      display.activePlayer[game.ttToe.inactivePlayer(game.ttToe.currentPlayer)].classList.remove('current-active-player');
      display.activePlayer[game.ttToe.currentPlayer].classList.add('current-active-player');
   },
   disable: function() {
      display.activePlayer.p1.classList.remove('current-active-player');
      display.activePlayer.p1.classList.remove('current-active-player');
      
   }
};
   


// win state of the current game board
var win = function() {
   // console.log('win');
   
   fillValues();
   // check for end game and start again
   var winIndex;
   var   winValue = game.ttToe.checkWin(game.ttToe.board),
      draw = game.ttToe.isDraw(game.ttToe.board) ? 'tie' : false;

      winValue = winValue ? winValue.player : winValue;

      if(winValue) {
         winIndex = game.ttToe.getWinIndex(game.ttToe.board);
      }

   
   if (winValue || draw) {
      scoresModify.add(winValue || draw);
   }
      
   return {
      status: winValue || draw,
      winIndex: winIndex || null
   };
};

var advanceMove = function(newRound) {
   // console.log('advanceMove');
   var   winData = win(),
         winStatus = winData.status;
   
   
   playerInputs.disable();
   switchPlayers(game.ttToe.currentPlayer);
   if (!winStatus) {
      var computerChoice;
      if(game.ttToe.isComputerActive) {
         computerMove();
      } else {
         // debugger;
         console.log('advanceMove || enable');
         
         playerInputs.enable();
      }
   } else {
      // start new round 
      playerInputs.disable();
      blinker.on(winData.winIndex, true);
      document.body.setAttribute('data-active-player', '');
      activePlayerHighlight.disable();
      setTimeout(function() {
         startRound(true);
      }, 5000);  
   }



};

var computerMove = function() {
   // console.log('computerMove');
   
   var timeout = setTimeout(function () {
      computerChoice = game.moveDecision.getNextMove(game.ttToe.p2);
      playerInputs.enable();
      clickBoardItem(board[computerChoice[0]][computerChoice[1]]);
      console.log('computerMove || enabled');
   }, 1500);

   timeouts.add(timeout);
};





var clickBoardItem = function(item) {
   item.setAttribute('data-value', game.ttToe[game.ttToe.currentPlayer]);
   advanceMove();
};


//#region EVENTS
boardItems.forEach(function(item) {
   item.addEventListener('click', function() {
      if (!this.getAttribute('data-value') && playerInputs.isEnabled()) {
         clickBoardItem(this);
      }
   });
});








































//#region || Mode and Player Choice

var changeMode = function (mode) {
   if (mode === '1p') {
      game.ttToe.computer = true;
   } else {
      game.ttToe.computer = false;
   }
   document.querySelector('.player-mode').classList.add('hide');
   document.querySelector('.player-selection').classList.remove('hide');
};

var changePlayer = function (player) {
   var p2Index;
   game.ttToe.p1 = player;
   
   p2Index = game.ttToe.players.indexOf(player);
   game.ttToe.p2 = game.ttToe.players[!p2Index + 0];
   
   document.querySelector('.player-mode').classList.add('hide');
   whoStart.container.classList.remove('hide');
   document.querySelector('.player-selection').classList.add('hide');  
   
   display.activePlayer.p1.innerText = game.ttToe.p1;
   display.activePlayer.p2.innerText = game.ttToe.p2;
   
   document.querySelector('.who-starts .p1').innerText = game.ttToe.p1;
   document.querySelector('.who-starts .p2').innerText = game.ttToe.p2;
};

// var whoStarts = function (player) {
//    game.ttToe.playerRoundStart = player;

   
//    startRound();
// };




modeChangeBtns.forEach(function(btn) {
   btn.addEventListener('click', function() {
      changeMode(this.innerText);
   });
});
playerChangeBtns.forEach(function(btn) {
   btn.addEventListener('click', function() {
      document.body.setAttribute('data-active-player', this.innerText);
      changePlayer(this.innerText);
   });
});

whoStart.players.forEach(function(btn) {
   btn.addEventListener('click', function() {
      document.querySelector('.reset-choice').classList.remove('hide');
      whoStart.container.classList.add('hide');
      var player = this.getAttribute('data-player');
      var otherPlayerStart = game.ttToe.inactivePlayer(game.ttToe.playerRoundStart);

      if(player === otherPlayerStart) {
         startRound(true);
      } else {
         startRound();
      }
   });
});
//#endregion


//#endregion

var blinker = {
   intervals: [],
   reset: function() {
      this.intervals.forEach(function(interval) {
         clearInterval(interval);
      });
      this.intervals = [];
      board.forEach(function(row) {
         row.forEach(function(col) {
            col.classList.remove('invisible');
         });
      });
   },
   on: function(indices, all) {
      var i, len = indices.length, interval, row, col;
      for(i = 0; i < len; i++) {
         row = indices[i].index[0];
         col = indices[i].index[1];
         this.setBlink(all ,row, col);

      }
   },
   setBlink: function(all ,row, col) {
      var ctx = this;
      if(all) {
         board.forEach(function (row) {
            row.forEach(function (col) {
               interval = setInterval(function () {
                  board[row][col].classList.toggle('invisible');
               }, 300);
               ctx.intervals.push(interval);
            });
         });
      } else {

      }
      interval = setInterval(function () {
         board[row][col].classList.toggle('invisible');
      }, 300);
      this.intervals.push(interval);
   }
};

/* 

TO DO
   -- IMPLEMENT THE BLINKER FOR THE GAME WIN AS WELL AS EQUAL

      GAME WIN: blink the winning combo
      DRAW: BLINK THE ENTIRE BOARD

*/