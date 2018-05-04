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
   setValues: function() { // reset the values of the values based on the level
      // don't apply the values when the game is running 
      var types = ['showDuration', 'levelValues', 'advanceLevel'], i;
      for( i = 0; i < types.length; i++) {
         this.currentValues[types[i]] = this.levelsValues[this.currentLevel][types[i]];    
      }
   },
   valuesPercentages: 0.95, // game level difficulty incrementor
   applyPercentages: function() { // change the values of the values based on the percentages
      var ctx = this;
      Object.keys(ctx.currentValues).forEach(function(key) {
         ctx.currentValues[key] *= ctx.valuesPercentages;
      });
   },
   changeDifficulty: function(level) {
      this.currentLevel = level;
      if(simon.isOn) {
         soundEvents.btnPress('beep');
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
   start: function() {
      var timeout = setTimeout(function() {
         if(simon.isStrict) {
            sounds.startBeep.play();
         }
         simon.roundOver();
      }, this.duration);
      this.timeout = timeout;
   },
   end: function() {
      clearTimeout(this.timeout);
      this.timeout = {};
   },
   refresh: function() {
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
   winGameLevel: 5,  
   isOn: false,
   levelValue: 0,    
   gameLogicTimeouts: [],
   changeStrict: function(value) {
      if(this.isOn) {
         this.isStrict = !!value;
         soundEvents.btnPress(value);
      }
   },
   cancelAll: function() {
      this.gameLogicTimeouts.forEach(function(timeout) {
         clearTimeout(timeout);
      });
      this.gameLogicTimeouts = [];
   },
   sequences: {
      // stores the sequences of values for the computer and player
      player: [],
      computer: [],
      reset: function(type) {
         if(!type) {
            this.computer = [];
            this.player = [];
         } else {
            this[type] = [];
         }
      }
   },
   // checks for equality (same order) but not length
   checkEquality: function () {
      let pSeq = this.sequences.player;
      let cSeq = this.sequences.computer;
      for (var i = 0; i < pSeq.length; i++) {
         if (pSeq[i] !== cSeq[i]) {
            return false;
         }
      }
      return true;
   },
   endGame: function () {
      pressTimeout.end();
      
      gameDisplayEvents.endGame(); //DISPLAY
      this.sequences.reset();
      this.cancelAll();
   },
   newGame: function() {
      if(this.isOn) {
         this.endGame();
         var ctx = this;
         clearTimeout(this.gameStartTimeout);
         gameDisplayEvents.newGame(); //DISPLAY
         pressTimeout.end();
         var gameTimeout = setTimeout(function(){
            // game values settings for new game
      
            delayValues.setValues(); // reset difficulty data
            ctx.sequences.reset();
            ctx.level = 0;
            ctx.advanceLevel();
   
         }, delayValues.startLevel);
         this.gameLogicTimeouts.push(gameTimeout);
         // visual changes for new games
      }

   },
   gameStartTimeout: {},
   advanceLevel: function() {
      // chooses a random value to add to the sequence, from the values array
      var ind = Math.floor( Math.random() * this.values.length);
      this.sequences.player = [];
      this.sequences.computer.push(this.values[ind]);

         this.level++;
         delayValues.applyPercentages();
         gameDisplayEvents.displaySequence(); //DISPLAY
      
      
   },
   playerPushBtn: function(value) {
      display.btnPress(value);
      pressTimeout.refresh();
      // adds the value of the button to the player sequence
      var index = this.values.indexOf(value);
      this.sequences.player.push(this.values[index]);
      this.checkGameOver();
   },
   checkGameOver: function() {
      if (!this.checkEquality()) {
         sounds.incorrect.play();
         this.roundOver();
         pressTimeout.end();
      } else if (this.sequences.player.length === this.sequences.computer.length) {
         if(this.level === this.winGameLevel) {
            this.winGame();
            sounds.win.play();
         } else {
            gameDisplayEvents.preNextLevel(); //DISPLAY
            // advance next level delay
            pressTimeout.end();
            var gameTimeout = setTimeout(function () {
               simon.advanceLevel();
            }, delayValues.currentValues.advanceLevel);
            this.gameLogicTimeouts.push(gameTimeout);
         }
      }
   },
   winGame: function() {
      this.endGame();
      blinker.turnOn('win'); //DISPLAY
      var ctx = this;
      this.gameLogicTimeouts.push( setTimeout(function () {
         ctx.endGame();
         ctx.newGame();
         display.shutDown(); //DISPLAY
      }, delayValues.winGameShow) );
   },
   roundOver: function() {
      var ctx = this, gameTimeout;
      gameDisplayEvents.endGame(); //DISPLAY
      
      this.sequences.reset('player');
      display.disabled(true);
      // strict mode, start from round 1
      if(this.isStrict) {
         
         this.endGame();
         this.level = 0;
         gameDisplayEvents.levelChange(); //DISPLAY
         gameTimeout = setTimeout(function () {
            ctx.newGame();
         }, delayValues.startLevel);
         this.gameLogicTimeouts.push(gameTimeout);
      } else {
         // non-strict, repeat the current sequence
         blinker.turnOn(); //DISPLAY
         gameTimeout = setTimeout(function () {
            gameDisplayEvents.displaySequence(); //DISPLAY
            gameDisplayEvents.levelChange(); 
            blinker.turnOff(); //DISPLAY
         }, delayValues.startLevel);
         this.gameLogicTimeouts.push(gameTimeout);
      }
   },
   powerSwitch: function(state) {
      gameDisplayEvents.powerSwitch(state); //DISPLAY
      soundEvents.btnPress();
      if (!state) {
         this.isOn = false;
         this.endGame();
      } else {
         this.levelValue = 0;
         this.isOn = true;
      }
   }
};
Object.defineProperty(simon, 'level', {
   get: function() {
      return this.levelValue;
   },
   set: function(value) {
      this.levelValue = value;
      gameDisplayEvents.levelChange();
      return value;
   }
});

var gameControl = {
   powerSwitch: function() {}
};