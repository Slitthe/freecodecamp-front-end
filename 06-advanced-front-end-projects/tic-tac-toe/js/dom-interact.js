// game
var querySelectorArray = function(selector) {
   return Array.prototype.slice.call(document.querySelectorAll(selector));
};
var boardItems = querySelectorArray('[data-column]');
var playerChangeBtns = querySelectorArray('.player-change');
var modeChangeBtns = querySelectorArray('.mode-change');
var board = [
   [boardItems[0], boardItems[1], boardItems[2]],
   [boardItems[3], boardItems[4], boardItems[5]],
   [boardItems[6], boardItems[7], boardItems[8]]
];






var fillValues = function() {
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
var changePlayer = function(player) {
   var p2Index;
   game.ttToe.p1 = player;

   p2Index = game.ttToe.p2 = game.ttToe.players.indexOf(player);

   game.ttToe.p2 = game.ttToe.players[!p2Index + 0];
   document.querySelector('.player-mode').classList.add('hide');
   document.querySelector('.player-selection').classList.add('hide');
   document.querySelector('.reset-choice').classList.remove('hide');
};
var changeMode = function(mode) {
   console.log(mode);
   if(mode === '1p') {
      game.ttToe.computer = true;
   } else {
      game.ttToe.computer = false;
   }
   document.querySelector('.player-mode').classList.add('hide');
   document.querySelector('.player-selection').classList.remove('hide');
};
var reset = function() {
   game.ttToe.board.map(function(row, rowInd) {
      row.forEach(function(col, colInd) {
         col = null;
         board[rowInd][colInd].setAttribute('data-value', '');
      });
   });
   fillValues();
};
var switchPlayers = function(player) {
   if (player === 'p1') {
      game.ttToe.currentPlayer = 'p2';
   } else {
      game.ttToe.currentPlayer = 'p1';
   }
   document.body.setAttribute('data-active-player', game.ttToe[game.ttToe.currentPlayer]);
};

var computerAdvance = function() {
   var computerChoice;
   if(game.ttToe.computer && game.ttToe.currentPlayer === 'p2') {
      computerChoice = game.moveDecision.getNextMove(game.ttToe.p2);
      board[computerChoice[0]][computerChoice[1]].click();
   }
};

var win = function() {
   var   win = game.ttToe.checkWin(game.ttToe.board),
         draw = game.ttToe.isDraw(game.ttToe.board);
   if (win || draw) {
      // win animation
      if(win) {
         alert(win);
      } else {
         alert('game draw');
      }
      reset();
   }
};




boardItems.forEach(function(item) {
   item.addEventListener('click', function() {
      this.setAttribute('data-value', game.ttToe[game.ttToe.currentPlayer]);
      fillValues();
      switchPlayers(game.ttToe.currentPlayer);
      win();
      computerAdvance();
   });
});
modeChangeBtns.forEach(function(btn) {
   btn.addEventListener('click', function() {
      changeMode(this.innerText);
   });
});
playerChangeBtns.forEach(function(btn) {
   btn.addEventListener('click', function() {
      this.setAttribute('data-value', this.innerText);
      document.body.setAttribute('data-active-player', this.innerText);
      console.log(this.innerText);
      changePlayer(this.innerText);
   });
});
