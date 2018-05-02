/* 
==================================
         PAGE ELEMENTS
==================================
*/
var elements = {
   // the four game buttons
   items: {
      blue: document.getElementById('blue'),
      yellow: document.getElementById('yellow'),
      red: document.getElementById('red'),
      green: document.getElementById('green')
   },
   roundInfo: document.getElementById('round-info'),
   newGameBtn: document.getElementById('new-game'),
   level: document.querySelector('.level'), // game level display
   gameStatus: document.querySelector('.game-status'), // game status -- computer or player is active
   difficulty: { // the four levels of difficulty
      list: document.querySelectorAll('.check-difficulty'), 
      get checked() {
         return document.querySelector('.check-difficulty:checked');
      }
   },
   strictMode: document.getElementById('strict-mode') // strict mode check
};


/* 
==================================
      DIFFICULTY VALUES
==================================
*/
var difficultyValues = {
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
   currentLevel: 'one', // current difficulty level
   currentValues: {}, // place where the actual game values are stored
   setValues: function() { // reset the values of the values based on the level 
      this.currentValues.showDuration = this.levelsValues[this.currentLevel].showDuration;
      this.currentValues.itemWait = this.levelsValues[this.currentLevel].itemWait;
      this.currentValues.advanceLevel = this.levelsValues[this.currentLevel].advanceLevel;
   },
   valuesPercentages: 0.97, // game level difficulty incrementor
   applyPercentages: function() { // change the values of the values based on the percentages
      var ctx = this;
      Object.keys(ctx.currentValues).forEach(function(key) {
         ctx.currentValues[key] *= ctx.valuesPercentages;
      });
   }
};



/* 
==================================
      GAME DATA & ACTIONS
==================================
*/
var simon = {
   values: ['blue'],
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
      gameDisplayEvents.endGame();
      this.level = 0;
      this.sequences.reset();
   },
   levelValue: 0,
   newGame: function() {
      // visual changes for new games
      gameDisplayEvents.newGame();

      // game values settings for new game
      difficultyValues.setValues(); // reset difficulty data
      this.sequences.reset();
      this.level = 0;
      this.advanceLevel();
   },
   advanceLevel: function() {
      // chooses a random value to add to the sequence, from the values array
      var ind = Math.floor( Math.random() * this.values.length);
      this.sequences.player = [];
      this.sequences.computer.push(this.values[ind]);
      this.level++;
      
      difficultyValues.applyPercentages();
      gameDisplayEvents.advanceLevel();
      
   },
   playerPushBtn: function(value) {
      // adds the value of the button to the player sequence
      var index = this.values.indexOf(value);
      this.sequences.player.push(this.values[index]);
      this.checkGameOver();

   },
   checkGameOver: function() {
      if (!this.checkEquality()) {
         this.endGame();
      } else if (this.sequences.player.length === this.sequences.computer.length) {
         gameDisplayEvents.preNextLevel();
         setTimeout(function () {
            simon.advanceLevel();
         }, difficultyValues.currentValues.advanceLevel);
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


/* 
==================================
VISUAL CHANGE FOR GAME EVENTS
==================================
*/
var gameDisplayEvents = {
   newGame: function () {
      display.disableControls(true);
   },
   advanceLevel: function () {
      elements.gameStatus.innerText = 'Displaying sequence';
      display.disabled(true);
      display.showSequence(0);
   },
   endGame: function () {
      display.disableControls(false);
      display.disabled(true);
   },
   // what happens when the next level is due, but before the displaying of elements actually starts
   preNextLevel: function () {
      display.disabled(true);
   },
   levelChange: function () {
      elements.level.innerText = simon.level;
   }
};




































/* 
==================================
         PAGE INTERACTIONS
==================================
*/
Object.keys(elements.difficulty.list).forEach(function (key) {
   // level difficulty change
   elements.difficulty.list[key].addEventListener('change', function () {
      difficultyValues.currentLevel = this.value;
      difficultyValues.setValues();
   });
});

   // start new game
elements.newGameBtn.addEventListener('click', function() {
   simon.newGame();
});

Object.keys(elements.items).forEach(function(key) {
   // that button is pressed when its the palyer's turn
   elements.items[key].addEventListener('click', function () {
      let id = this.id;
      simon.playerPushBtn(id);
      display.activeBtns(id); // light up that button
   });
});







var display = {
   timeoutDisplays: [],
   showSequence: function(inx) {
      if(inx === 0) {
         this.disabled(true);
      }
      if(inx === simon.sequences.computer.length) {
         this.disabled(false);
         return false;
      }

      console.log(simon.sequences.computer[inx]);
      
      inx++;
      display.showSequence(inx);
   
   },
   // disabled or enables the game sequence buttons
   disabled: function(state) {
      Object.keys(elements.items).forEach(function(key) {
         let disabledState = elements.items[key].disabled;
         if (state) {
            elements.items[key].setAttribute('disabled', true);
         } else {
            elements.items[key].removeAttribute('disabled');
         }
      });
   },
   activeBtns: function(btnName) {
      display.timeoutDisplays = display.timeoutDisplays.filter(function (el) {
         if(btnName === el.name) {
            // remove the 
            clearTimeout(el.timeout);
            elements.items[btnName].classList.remove('active');
            return false;
         }
         return true;
      });

      elements.items[btnName].classList.add('active');
      setTimeout(function() {

         let delayRemove = setTimeout(function() {
            elements.items[btnName].classList.remove('active');
         }, difficultyValues.currentValues.showDuration);
         display.timeoutDisplays.push({
            name: btnName,
            timeout: delayRemove
         });
      }, 500);
   },
   // disable the game controls
   disableControls: function(state) {
      let listKeys = Object.keys(elements.difficulty.list);
      if (state) {
         listKeys.forEach(function(key) {
            elements.difficulty.list[key].setAttribute('disabled', true);
         });
         elements.newGameBtn.setAttribute('disabled', true);
         elements.strictMode.setAttribute('disabled', true);
      } else {
         listKeys.forEach(function (key) {
            elements.difficulty.list[key].removeAttribute('disabled');
         });
         elements.newGameBtn.removeAttribute('disabled');
         elements.strictMode.removeAttribute('disabled');
      }
   }
};




