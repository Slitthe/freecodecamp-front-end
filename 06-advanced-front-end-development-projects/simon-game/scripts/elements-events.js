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
   level: document.querySelector('.level .display'), // game level display
   difficulty: { // difficulty pickers
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

function init() {
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
     elements.difficulty.list[key].addEventListener('click', function () {
        sounds.button.play();
      });
   });
   // game sequence button press
   var btnPress = function () {
      sounds.btnSwitch.play();
      if(this.classList.contains('player-input')) {
         gameControl.playerPushBtn(this.id);
      }
   };
   Object.keys(elements.items).forEach(function (key) {
      // that button is pressed when its the palyer's turn
      elements.items[key].addEventListener('click', btnPress);
      elements.items[key].addEventListener('touchstart', btnPress);
   });
   elements.strictMode.addEventListener('input', function () {
      var parent = this.parentElement.parentElement;
      // change strict mode
      gameControl.changeStrict(this.checked);
      sounds.button.play();
      if(this.checked) {
         parent.classList.add('led-on');
      } else {
         parent.classList.remove('led-on');
      }
   });
   elements.powerSwitch.addEventListener('input', function () {
      // turn ON-FF
      gameControl.powerSwitch(this.checked);
      sounds.button.play();
   });
   elements.startGame.addEventListener('click', function () {
      // start a new game
      sounds.button.play();
      gameControl.newGame();
   });
}
document.addEventListener('DOMContentLoaded', function() {
   init();
});

