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
   level: document.querySelector('.level'), // game level display
   difficulty: { // the four levels of difficulty
      list: document.querySelectorAll('.check-difficulty'), 
      get checked() {
         return document.querySelector('.check-difficulty:checked');
      }
   },
   strictMode: document.getElementById('strict-mode'),
   powerSwitch: document.getElementById('power-switcher'),
   startGame: document.getElementById('start-game')
};

/* 
   TRANSITIOON WITH THE REMOVAL OF THE NEW GAME BUTTOn
   AND INSTEAD USE THE ON-OFF switcher
*/


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
   startLevel: 5000,
   currentLevel: 'one', // current difficulty level
   currentValues: {}, // place where the actual game values are stored
   setValues: function() { // reset the values of the values based on the level
      // don't apply the values when the game is running 
      this.currentValues.showDuration = this.levelsValues[this.currentLevel].showDuration;
      this.currentValues.itemWait = this.levelsValues[this.currentLevel].itemWait;
      this.currentValues.advanceLevel = this.levelsValues[this.currentLevel].advanceLevel;
   },
   valuesPercentages: 0.95, // game level difficulty incrementor
   applyPercentages: function() { // change the values of the values based on the percentages
      var ctx = this;
      Object.keys(ctx.currentValues).forEach(function(key) {
         ctx.currentValues[key] *= ctx.valuesPercentages;
      });
   }
};


var blinker = {
   showDuration: 500,
   periodWait: 1000,
   turnOn: function () {
      this.turnOff();
      var ctx = this;
      this.interval = setInterval(function () {
         elements.level.classList.add('blink-on');
         setTimeout(function () {
            elements.level.classList.remove('blink-on');
         }, ctx.showDuration);
      }, ctx.periodWait);
   },
   interval: {},
   turnOff: function () {
      clearInterval(this.interval);
      elements.level.classList.remove('blink-on');
   }
};





/* 
==================================
      INACTIVE INPUT TIMEOUT
==================================
*/
var pressTimeout = {
   duration: 3000,
   timeout: [],
   start: function() {
      var timeout = setTimeout(function() {
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
   values: ['blue', 'red', 'green', 'yellow'],
   isStrict: false,
   gameLogicTimeouts: [],
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
      gameDisplayEvents.endGame();
      this.sequences.reset();
      this.cancelAll();
   },
   levelValue: 0,
   newGame: function() {
      var ctx = this;
      clearTimeout(this.gameStartTimeout);
      gameDisplayEvents.newGame();
      pressTimeout.end();
      var gameTimeout = setTimeout(function(){
         // game values settings for new game
   
         difficultyValues.setValues(); // reset difficulty data
         ctx.sequences.reset();
         ctx.level = 0;
         ctx.advanceLevel();

      }, difficultyValues.startLevel);
      this.gameLogicTimeouts.push(gameTimeout);
      // visual changes for new games

   },
   gameStartTimeout: {},
   advanceLevel: function() {
      // chooses a random value to add to the sequence, from the values array
      var ind = Math.floor( Math.random() * this.values.length);
      this.sequences.player = [];
      this.sequences.computer.push(this.values[ind]);
      if(this.level === 20) {
         console.log('WON THE GAME --- LEVEL 20 BEAT');
      }
      this.level++;
      
      difficultyValues.applyPercentages();
      gameDisplayEvents.displaySequence();
      
   },
   playerPushBtn: function(value) {
      pressTimeout.refresh();
      // adds the value of the button to the player sequence
      var index = this.values.indexOf(value);
      this.sequences.player.push(this.values[index]);
      this.checkGameOver();

   },
   checkGameOver: function() {
      if (!this.checkEquality()) {
         this.roundOver();
         pressTimeout.end();
      } else if (this.sequences.player.length === this.sequences.computer.length) {
         gameDisplayEvents.preNextLevel();
         // advance next level delay
         pressTimeout.end();
         var gameTimeout = setTimeout(function () {
            simon.advanceLevel();
         }, difficultyValues.currentValues.advanceLevel);
         this.gameLogicTimeouts.push(gameTimeout);
      }
   },
   roundOver: function() {
      var ctx = this, gameTimeout;
      gameDisplayEvents.endGame();
      
      this.sequences.reset('player');
      display.disabled(true);
      // strict mode, start from round 1
      if(this.isStrict) {
         this.endGame();
         console.log('STRICT MODE -- GAME END');
         
         gameTimeout = setTimeout(function () {
            ctx.newGame();
         }, difficultyValues.startLevel);
         this.gameLogicTimeouts.push(gameTimeout);
      } else {
         // non-strict, repeat the current sequence
         console.log('NON-STRICT MODE -- REPEAT SEQUENCE');
         elements.level.innerText = 'repeat';
         blinker.turnOn();
         
         gameTimeout = setTimeout(function () {
            gameDisplayEvents.displaySequence();
            elements.level.innerText = ctx.levelValue;
            blinker.turnOff();
         }, difficultyValues.startLevel);
         this.gameLogicTimeouts.push(gameTimeout);
      }
   },
   isOn: false
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
      elements.level.innerText = 'New';
      blinker.turnOn();
   },
   displaySequence: function () {
      display.disabled(true);
      display.showSequence(0);
   },
   endGame: function () {
      display.disabled(true);
      elements.level.innerText = 'New';
      blinker.turnOff();
   },
   // what happens when the next level is due, but before the displaying of elements actually starts
   preNextLevel: function () {
      display.disabled(true);
   },
   levelChange: function () {
      elements.level.innerText = simon.level;
      blinker.turnOff();      
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
   });
});


var btnPress = function () {
   if ( !this.getAttribute('disabled') ) {
      let id = this.id;
      display.btnPress(this.id);
      console.log('-------------' + id.toUpperCase() + '-------------');
      simon.playerPushBtn(id);
   }
};

Object.keys(elements.items).forEach(function(key) {
   // that button is pressed when its the palyer's turn
   elements.items[key].addEventListener('mousedown', btnPress);
   elements.items[key].addEventListener('touchstart', btnPress);
});

elements.strictMode.addEventListener('input', function() {
   simon.isStrict = this.checked;
   console.log(simon.isStrict);
});


elements.powerSwitch.addEventListener('input', function() {
   if(!this.checked) {
      simon.isOn = false;
      simon.endGame();
      display.shutDown();
      elements.startGame.setAttribute('disabled', true);
      document.body.classList.add('power-off');
      elements.strictMode.setAttribute('disabled', true);
   } else {
      gameDisplayEvents.levelChange();
      simon.isOn = true;
      document.body.classList.remove('power-off');
      elements.strictMode.removeAttribute('disabled');
      elements.startGame.removeAttribute('disabled');
      
   }
});

elements.startGame.addEventListener('click', function() {
   simon.endGame();
   simon.newGame();
   display.shutDown();
});







var display = {
   timeoutDisplays: [],
   showSequence: function(inx) {
      // disableds input on show start
      if(inx === simon.sequences.computer.length) {
         // re-enables them on show end
         console.log('enabled inputs');
         pressTimeout.start();
         this.disabled(false);
         return false;
      }
      else if (inx === 0) {
         console.log('disabled inputs');
         this.disabled(true);
      }

      console.log(simon.sequences.computer[inx]);
      this.activeBtns(inx, this.showSequence);

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
   activeBtns: function(inx, func) {
      var btnName = simon.sequences.computer[inx] || null;

      // if the same type of btn is found in the timeouts, removes the active and removes it from the array
      display.timeoutDisplays = display.timeoutDisplays.filter(function (el) {
         if(btnName === el.name) {
            clearTimeout(el.timeout);
            elements.items[el.name].classList.remove('active');
            return false;
         }
         return true;
      });

      this.miscTimeouts.push( setTimeout(function() {
         elements.items[btnName].classList.add('active');
         
         let delayRemove = setTimeout(function() {
            elements.items[btnName].classList.remove('active');
            inx++;
            func.call(display, inx, func);
         }, difficultyValues.currentValues.showDuration);

         display.timeoutDisplays.push({
            name: btnName,
            timeout: delayRemove
         });
      }, difficultyValues.currentValues.itemWait) );
   },
   btnPressTimeouts: [],
   btnPress: function(btnName) {
      var showDelay = 0;
      display.btnPressTimeouts = display.btnPressTimeouts.filter(function (el) {
         if (btnName === el.name) {
            clearTimeout(el.timeout);
            elements.items[el.name].classList.remove('active');
            showDelay = 400;
            return false;
         }
         return true;
      });

      this.miscTimeouts.push( setTimeout(function() {
         var el = elements.items[btnName];
         el.classList.add('active');
         let delay = setTimeout(function() {
            el.classList.remove('active');
         }, 300);
   
         display.timeoutDisplays.push({
            name: btnName,
            timeout: delay
         });
      }, showDelay) );
   },
   miscTimeouts: [],
   shutDown: function() {
      var combined = this.btnPressTimeouts.concat(this.timeoutDisplays);
      combined = this.miscTimeouts.concat(combined);
      combined.forEach(function(el) {
         if(el.hasOwnProperty('timeout')){
            clearTimeout(el.timeout);
         } else {
            clearTimeout(el);
         }
      });
      this.btnPressTimeouts = [];
      this.timeoutDisplays = [];
      this.miscTimeouts = [];
      Object.keys(elements.items).forEach(function(key) {
         var item = elements.items[key];
         item.classList.remove('active');
      });
      elements.level.classList.remove('repeat');

      // hide level
      
   }
};

// game status blink

/* 
   ON when:
      displaying: NEW && REPEATING && WHEN BEATING THE GAME
   OFF when game is off && level is displayed


*/


// implement the ON-OFF switcher




