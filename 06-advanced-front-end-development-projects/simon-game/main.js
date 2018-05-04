/* 
==================================
      DIFFICULTY VALUES
==================================
*/
var delayValues = {
   // values for the different difficulty values
   levelsValues: {
      one: {
         showDuration: 700,
         itemWait: 500,
         advanceLevel: 3000,
      },
      two: {
         showDuration: 630,
         itemWait: 450,
         advanceLevel: 2700,
      },
      three: {
         showDuration: 560,
         itemWait: 400,
         advanceLevel: 2400,
      },
      four: {
         showDuration: 490,
         itemWait: 350,
         advanceLevel: 2100,
      }
   },
   startLevel: 5000, // between levels delay
   winGameShow: 11000, // how long to wait until restarting the game when game is won
   currentLevel: 'one', // current difficulty level
   currentValues: {}, // current difficulty values and level-based percentages-adjusted values
   setValues: function () { // reset the values of the values based on the level
      // don't apply the values when the game is running 
      var types = ['showDuration', 'itemWait', 'advanceLevel'], i;
      for (i = 0; i < types.length; i++) {
         this.currentValues[types[i]] = this.levelsValues[this.currentLevel][types[i]];
      }
   },
   valuesPercentages: 0.95, // game level difficulty incrementor
   applyPercentages: function () { // change the values of the values based on the percentages
      var ctx = this;
      Object.keys(ctx.currentValues).forEach(function (key) {
         ctx.currentValues[key] *= ctx.valuesPercentages;
      });
   },
   changeDifficulty: function (level) {
      this.currentLevel = level;
      if (simon.isOn) {
         sounds.beep.play();
      }
   }
};








/* 
==================================
      INACTIVE INPUT TIMEOUT
==================================
*/
var pressTimeout = {
   duration: 6000,
   timeout: [],
   start: function () {
      var timeout = setTimeout(function () {
         if (simon.isStrict) {
            sounds.startBeep.play(); //SOUND
         }
         gameControl.roundOver();
      }, this.duration);
      this.timeout = timeout;
   },
   end: function () {
      clearTimeout(this.timeout);
      this.timeout = {};
   },
   refresh: function () {
      this.end();
      this.start();
   }
};


/* 
==================================
      GAME DATA & ACTIONS
==================================
*/
var simon = {
   values: ['yellow'], // the possible combination values
   isStrict: false,
   winGameLevel: 5,
   isOn: false,
   levelValue: 0,
   gameLogicTimeouts: [],
   changeStrict: function (value) { //--------------------------------------------
      return (function(func) {
         if (this.isOn) {
            this.isStrict = !!value;
            func();
         }
      }).bind(this);
   },
   cancelAll: function () { //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ Helper Method, doesn't need externalizing
      this.gameLogicTimeouts.forEach(function (timeout) {
         clearTimeout(timeout);
      });
      this.gameLogicTimeouts = [];
   },
   sequences: {
      // stores the sequences of values for the computer and player
      player: [],
      computer: [],
      reset: function (type) { //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ Helper Method, doesn't need externalizing
         if (!type) {
            this.computer = [];
            this.player = [];
         } else {
            this[type] = [];
         }
      }
   },
   // checks for equality (same order) but not length
   checkEquality: function () { // //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ Helper Method, doesn't need externalizing
      var pSeq = this.sequences.player;
      var cSeq = this.sequences.computer;
      for (var i = 0; i < pSeq.length; i++) {
         if (pSeq[i] !== cSeq[i]) {
            return false;
         }
      }
      return true;
   },
   endGame: function () { //+++++++++++++++++++++++++++++++++++++++++++
      return (function(func) {
         pressTimeout.end();
         this.sequences.reset();
         this.cancelAll();
         func();
      }).bind(this);
   },
   newGame: function () { //++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      return (function (before) {
         if (this.isOn) {
            this.endGame();
            clearTimeout(this.gameStartTimeout);
            before();
            pressTimeout.end();
            var gameTimeout = setTimeout((function () {
               // game values settings for new game

               delayValues.setValues(); // reset difficulty data
               this.sequences.reset();
               this.level = 0;
               gameControl.advanceLevel();
            }).bind(this), delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
            // visual changes for new games
         }
      }).bind(this);
   },
   gameStartTimeout: {},
   advanceLevel: function () { //+++++++++++++++++++++++++++++++++++++++++++++++++++++===
      // chooses a random value to add to the sequence, from the values array
      return (function (func) {
         var ind = Math.floor(Math.random() * this.values.length);
         this.sequences.player = [];
         this.sequences.computer.push(this.values[ind]);
         this.level++;
         delayValues.applyPercentages();
         func();
      }).bind(this);
   },
   playerPushBtn: function (value) { //+++++++++++++++++++++++++++++++++++++++++++++++++++++===
      return (function (func) {
         func();
         pressTimeout.refresh();
         // adds the value of the button to the player sequence
         var index = this.values.indexOf(value);
         this.sequences.player.push(this.values[index]);
         gameControl.checkGameOver();
      }).bind(this);
   },
   checkGameOver: function () { //+++++++++++++++++++++++++++++++++++++++++++++
      if (!this.checkEquality()) {
         return (function (func) {
            gameControl.roundOver();
            pressTimeout.end();
            func();
         }).bind(this);
      } else if (this.sequences.player.length === this.sequences.computer.length) {
         return (function (win, notWin) {
            if (this.level === this.winGameLevel) {
               gameControl.winGame();
               win();
            } else {
               notWin();
               // advance next level delay
               pressTimeout.end();
               var gameTimeout = setTimeout(function () {
                  gameControl.advanceLevel();
               }, delayValues.currentValues.advanceLevel);
               this.gameLogicTimeouts.push(gameTimeout);
            }
         }).bind(this);
      }
   },
   winGame: function () { //++++++++++++++++++++++++++++++++++++++++++++
      return (function (before, after) {
         gameControl.endGame();
         before();

         this.gameLogicTimeouts.push(setTimeout(function () {
            gameControl.endGame();
            gameControl.newGame();
            after();
         }, delayValues.winGameShow));
      }).bind(this);
   },
   roundOver: function () { //++++++++++++++++++++++++++++++++++++++++++++
      var gameTimeout;
      this.sequences.reset('player');

      // strict mode, start from round 1
      if (this.isStrict) {
         return (function (before, after) {
            gameControl.endGame();
            this.level = 0;
            before();
            gameTimeout = setTimeout(function () {
               after();
               gameControl.newGame();
            }, delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
         }).bind(this);
      } else {
         // non-strict, repeat the current sequence
         return (function (before, after) {
            before();
            gameTimeout = setTimeout(function () {
               after();

            }, delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
         }).bind(this);
      }
   },
   powerSwitch: function (state) { //++++++++++++++++++++++++++++++++++++++++++++
      if (!state) {
         this.isOn = false;
         gameControl.endGame();
      } else {
         this.levelValue = 0;
         this.isOn = true;
      }
   }
};
Object.defineProperty(simon, 'level', {
   get: function () {
      return this.levelValue;
   },
   set: function (value) {
      this.levelValue = value;
      gameDisplayEvents.levelChange();
      return value;
   }
});

// CONTROL THE GAME ACTIONS FROM WITHIN HERE
// This is where the sounds/visual changes should be made from
var gameControl = {
   powerSwitch: function (state) {
      gameDisplayEvents.powerSwitch(state); //DISPLAY
      simon.powerSwitch(state);
   },
   roundOver: function () {
      var round = simon.roundOver();
      gameDisplayEvents.endGame(); //DISPLAY
      display.disabled(true);

      if (simon.isStrict) {
         round(function () {
            gameDisplayEvents.levelChange(); //DISPLAY -- before
         }, function () { })
      } else {
         round(function () {
            blinker.turnOn(); //DISPLAY -- before
         }, function () {
            gameDisplayEvents.displaySequence(); //DISPLAY -- after
            blinker.turnOff(); //DISPLAY -- after
            gameDisplayEvents.levelChange();
         });
         // non-strict, repeat the current sequence
      }
   },
   winGame: function () {
      var win = simon.winGame();
      win(function () {
         blinker.turnOn('win');
      }, function () {
         display.shutDown();
      });
   },
   checkGameOver: function (unequal, equal) {
      var gameOver = simon.checkGameOver();
      if (!simon.checkEquality()) {
         gameOver(function () {
            sounds.incorrect.play();
         });
      } else if (simon.sequences.player.length === simon.sequences.computer.length) {
         gameOver(function () {
            sounds.win.play();
         }, function () {
            gameDisplayEvents.preNextLevel();
         });
      }
   },
   playerPushBtn: function (value) {
      var ppBtn = simon.playerPushBtn(value);
      ppBtn(function () {
         display.btnPress(value);
      });
   },
   advanceLevel: function () {
      var aLevel = simon.advanceLevel();
      // chooses a random value to add to the sequence, from the values array
      aLevel(function () {
         gameDisplayEvents.displaySequence(); //DISPLAY
      });
   },
   newGame: function () { //--------------------------------------------
      var nGame = simon.newGame();
      nGame(function () {
         gameDisplayEvents.newGame(); //DISPLAY
      });
   },
   endGame: function () {
      var eGame = simon.endGame;
      eGame(function() {
         gameDisplayEvents.endGame(); //DISPLAY
      });
   },
   changeStrict: function (value) { //--------------------------------------------
      var cStrict = simon.changeStrict(value);
      cStrict(function() {
         sounds.beep.play(); //SOUND
      });
   },
};