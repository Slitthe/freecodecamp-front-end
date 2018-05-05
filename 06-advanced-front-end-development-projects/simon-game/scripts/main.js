/* 
==================================
      DIFFICULTY VALUES
==================================
*/
var delayValues = {
   // values for the different difficulty values
   levelsValues: {
      one: {
         showDuration: 300,
         itemWait: 200,
         advanceLevel: 1500,
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
   changePercentages: 0.965, // game level difficulty incrementor
   currentValues: {}, // current difficulty values and level-based percentages-adjusted values
   setValues: function () { // reset the values of the values based on the level
      // don't apply the values when the game is running 
      var types = ['showDuration', 'itemWait', 'advanceLevel'], i;
      for (i = 0; i < types.length; i++) {
         this.currentValues[types[i]] = this.levelsValues[this.currentLevel][types[i]];
      }
   },
   applyPercentages: function () { // change the values of the values based on the percentages
      var ctx = this;
      Object.keys(ctx.currentValues).forEach(function (key) {
         ctx.currentValues[key] *= ctx.changePercentages;
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
   values: ['yellow', 'red', 'green', 'blue'], // the possible combination values
   isStrict: false,
   winGameLevel: 20,
   isOn: false,
   levelValue: 0,
   gameLogicTimeouts: [],
   gameStartTimeout: {},
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
   changeStrict: function (value, func) { //--------------------------------------------
      if (this.isOn) {
         this.isStrict = !!value;
         func();
      }
   },
   cancelAll: function () { //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ Helper Method, doesn't need externalizing
      this.gameLogicTimeouts.forEach(function (timeout) {
         clearTimeout(timeout);
      });
      this.gameLogicTimeouts = [];
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
   endGame: function (func) { //+++++++++++++++++++++++++++++++++++++++++++
      pressTimeout.end();
      this.sequences.reset();
      this.cancelAll();
      func();
   },
   newGame: function () { //++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      return (function (funcs) {
         if (this.isOn) {
            gameControl.endGame();
            clearTimeout(this.gameStartTimeout);
            funcs.before();
            pressTimeout.end();
            var gameTimeout = setTimeout((function () {
               // game values settings for new game

               delayValues.setValues(); // reset difficulty data
               this.sequences.reset();
               this.level = 0;
               gameControl.advanceLevel();
               funcs.after();
            }).bind(this), delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
            // visual changes for new games
         }
      }).bind(this);
   },
   advanceLevel: function (func) { //+++++++++++++++++++++++++++++++++++++++++++++++++++++===
      // chooses a random value to add to the sequence, from the values array
      var ind = Math.floor(Math.random() * this.values.length);
      this.sequences.player = [];
      this.sequences.computer.push(this.values[ind]);
      this.level++;
      delayValues.applyPercentages();
      func();
   },
   playerPushBtn: function (value, func) { //++++++++++++++++++++++++++++++++++++++++++++
      func();
      pressTimeout.refresh();
      // adds the value of the button to the player sequence
      var index = this.values.indexOf(value);
      this.sequences.player.push(this.values[index]);
      gameControl.checkGameOver();
   },
   checkGameOver: function () { //+++++++++++++++++++++++++++++++++++++++++++++
      return (function(funcs) {
         if (!this.checkEquality()) { 
            gameControl.roundOver();
            pressTimeout.end();
            funcs.notEqual();
         }
         else if (this.sequences.player.length === this.sequences.computer.length) {
            if (this.level === this.winGameLevel) {
               gameControl.winGame();
               funcs.equal.win();
            } else {
               funcs.equal.noWin();
               // advance next level delay
               pressTimeout.end();
               var gameTimeout = setTimeout(function () {
                  gameControl.advanceLevel();
               }, delayValues.currentValues.advanceLevel);
               this.gameLogicTimeouts.push(gameTimeout);
            }
         }
      }).bind(this);
   },
   winGame: function () { //++++++++++++++++++++++++++++++++++++++++++++
      return (function (funcs) {
         gameControl.endGame();
         funcs.before();
         this.gameLogicTimeouts.push(setTimeout(function () {
            gameControl.newGame();
            funcs.after();
         }, delayValues.winGameShow));
      }).bind(this);
   },
   roundOver: function () { //++++++++++++++++++++++++++++++++++++++++++++
      return (function(funcs) {
         var gameTimeout;
         this.sequences.reset('player');
         funcs.always();
         // strict -- restart the game
         if (this.isStrict) {
            gameControl.endGame();
            this.level = 0;
            funcs.strict.before();
            gameTimeout = setTimeout(function () {
               funcs.strict.after();
               gameControl.newGame();
            }, delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
         } else {
            // non-strict, repeat the current sequence        
            funcs.noStrict.before();
            gameTimeout = setTimeout(function () {
               funcs.noStrict.after();
            }, delayValues.startLevel);
            this.gameLogicTimeouts.push(gameTimeout);
         }
      }).bind(this);
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
var gameControl = {
   powerSwitch: function (state) {
      gameDisplayEvents.powerSwitch(state); 
      simon.powerSwitch(state);
   },
   roundOver: function () {
      var round = simon.roundOver();
      round({
         always: function() {
            gameDisplayEvents.endGame(); 
            display.disabled(true);
         },
         strict: {
            before: function() { gameDisplayEvents.levelChange(); },
            after: function() {}
         },
         noStrict: {
            before: function() { blinker.turnOn(); },
            after: function() {
               gameDisplayEvents.displaySequence();
               blinker.turnOff();  
               gameDisplayEvents.levelChange();
            }
         }
      });
   },
   winGame: function () {
      var win = simon.winGame();
      win({
         before: function () { blinker.turnOn('win');},
         after: function () { display.shutDown();}
      });
   },
   checkGameOver: function (unequal, equal) {
      var gameOver = simon.checkGameOver();
      gameOver({
         notEqual: function () { sounds.incorrect.play(); },
         equal: {
            win: function () { sounds.win.play(); },
            noWin: function () { gameDisplayEvents.preNextLevel(); }
         }
      });
   },
   playerPushBtn: function (value) {
      simon.playerPushBtn(value, function () { display.btnPress(value); });
   },
   advanceLevel: function () {
      // chooses a random value to add to the sequence, from the values array
      simon.advanceLevel(function () { gameDisplayEvents.displaySequence(); });
   },
   newGame: function () { //--------------------------------------------
      var nGame = simon.newGame();
      nGame({
         before: function () { gameDisplayEvents.newGame(); },
         after: function() {}
      });
   },
   endGame: function () {
      simon.endGame(function() { gameDisplayEvents.endGame(); });
   },
   changeStrict: function (value) { //--------------------------------------------
      simon.changeStrict(value, function() { sounds.beep.play(); });
   },
};