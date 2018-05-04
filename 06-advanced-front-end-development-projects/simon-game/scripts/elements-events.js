/* 
==================================
         HTML ELEMENTS
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
   level: document.querySelector('.level'), // game level display
   difficulty: { // the four levels of difficulty
      list: document.querySelectorAll('.check-difficulty'),
      get checked() { // simulating live-results for 'querySelector' with a getter
         return document.querySelector('.check-difficulty:checked');
      }
   },
   strictMode: document.getElementById('strict-mode'),
   powerSwitch: document.getElementById('power-switcher'),
   startGame: document.getElementById('start-game'),
   gameArea: document.querySelector('.simon')
};

/* 
==================================
         PAGE INTERACTIONS
==================================
*/
Object.keys(elements.difficulty.list).forEach(function (key) {
   // change difficulty selectors
   elements.difficulty.list[key].addEventListener('change', function () {
      delayValues.changeDifficulty(this.value);
   });
});


var btnPress = function () {
   if (!this.disabled) {
      simon.playerPushBtn(this.id);
   }
};

Object.keys(elements.items).forEach(function (key) {
   // that button is pressed when its the palyer's turn
   elements.items[key].addEventListener('click', btnPress);
   elements.items[key].addEventListener('touchstart', btnPress);
});

elements.strictMode.addEventListener('input', function () {
   simon.changeStrict(this.checked);
});

elements.powerSwitch.addEventListener('input', function () {
   simon.powerSwitch(this.checked);
});

elements.startGame.addEventListener('click', function () {
   soundEvents.btnPress();
   simon.newGame();
});