var blinker = {
   showDuration: 500,
   periodWait: 1000,
   turnOn: function (option) {
      var showDuration = option ? this.showDuration / 2 : this.showDuration;
      var periodWait = option ? this.periodWait / 2 : this.periodWait;
      this.turnOff();
      if (option) { elements.level.classList.add('win'); }
      this.interval = setInterval(function () {
         elements.level.classList.add('blink-on');
         setTimeout(function () {
            elements.level.classList.remove('blink-on');
         }, showDuration);
      }, periodWait);
   },
   interval: {},
   turnOff: function () {
      elements.level.classList.remove('win');
      clearInterval(this.interval);
      elements.level.classList.remove('blink-on');
   }
};


/* 
==================================
VISUAL CHANGE FOR GAME EVENTS
==================================
*/
var gameDisplayEvents = {
   newGame: function () {
      elements.level.innerText = '00';
      blinker.turnOn();
   },
   displaySequence: function () {
      display.disabled(true);
      display.showSequence(0);
   },
   endGame: function () {
      display.disabled(true);
      blinker.turnOff();
      display.shutDown();
   },
   // what happens when the next level is due, but before the displaying of elements actually starts
   preNextLevel: function () {
      display.disabled(true);
   },
   levelChange: function () {
      var level = simon.level < 10 ? '0' + simon.level : simon.level;
      elements.level.innerText = level;
      blinker.turnOff();
   },
   powerSwitch: function(state) {
      if (!state) {
         simon.isOn = false;
         simon.endGame();
         
         display.shutDown();
         // elements.startGame.setAttribute('disabled', true);
         document.body.classList.remove('power-on');
         // elements.strictMode.setAttribute('disabled', true);
         // Object.keys(elements.difficulty.list).forEach(function (key) {
         //    elements.difficulty.list[key].setAttribute('disabled', true);
         // });
      } else {
         // Object.keys(elements.difficulty.list).forEach(function (key) {
         //    elements.difficulty.list[key].removeAttribute('disabled');
         // });
         simon.levelValue = 0;
         simon.isOn = true;
         gameDisplayEvents.levelChange();
         document.body.classList.add('power-on');
         // elements.strictMode.removeAttribute('disabled');
         // elements.startGame.removeAttribute('disabled');
      }
   }
};



































var display = {
   timeoutDisplays: [],
   showSequence: function (inx) {
      // disableds input on show start
      if (inx === simon.sequences.computer.length) {
         // re-enables them on show end
         pressTimeout.start();
         this.disabled(false);
         return false;
      }
      else if (inx === 0) {
         this.disabled(true);
      }

      this.activeBtns(inx, this.showSequence);

   },
   // disabled or enables the game sequence buttons
   disabled: function (state) {
      Object.keys(elements.items).forEach(function (key) {
         let disabledState = elements.items[key].disabled;
         if (state) {
            elements.gameArea.classList.remove('player-input');
            elements.items[key].setAttribute('disabled', true);
         } else {
            elements.items[key].removeAttribute('disabled');
            elements.gameArea.classList.add('player-input');
         }
      });
   },
   activeBtns: function (inx, func) {
      var btnName = simon.sequences.computer[inx] || null;

      // if the same type of btn is found in the timeouts, removes the active and removes it from the array
      display.timeoutDisplays = display.timeoutDisplays.filter(function (el) {
         if (btnName === el.name) {
            clearTimeout(el.timeout);
            elements.items[el.name].classList.remove('active');
            return false;
         }
         return true;
      });

      this.miscTimeouts.push( setTimeout(function () {
         elements.items[btnName].classList.add('active');
         sounds.btns[btnName].play();

         let delayRemove = setTimeout(function () {
            elements.items[btnName].classList.remove('active');
            inx++;
            func.call(display, inx, func);
         }, delayValues.currentValues.showDuration);

         display.timeoutDisplays.push({
            name: btnName,
            timeout: delayRemove
         });
      }, delayValues.currentValues.itemWait));
   },
   btnPressTimeouts: [],
   btnPress: function (btnName) {
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

      this.miscTimeouts.push(setTimeout(function () {
         var el = elements.items[btnName];
         el.classList.add('active');
         sounds.btns[btnName].play();
         let delay = setTimeout(function () {
            el.classList.remove('active');
         }, 300);

         display.timeoutDisplays.push({
            name: btnName,
            timeout: delay
         });
      }, showDelay));
   },
   miscTimeouts: [],
   // cancels all the visual-related timeouts
   shutDown: function () {
      var combined = this.btnPressTimeouts.concat(this.timeoutDisplays);
      combined = this.miscTimeouts.concat(combined);
      combined.forEach(function (el) {
         if (el.hasOwnProperty('timeout')) {
            clearTimeout(el.timeout);
         } else {
            clearTimeout(el);
         }
      });
      this.btnPressTimeouts = [];
      this.timeoutDisplays = [];
      this.miscTimeouts = [];
      Object.keys(elements.items).forEach(function (key) {
         var item = elements.items[key];
         item.classList.remove('active');
      });
      elements.level.classList.remove('repeat');

   }
};