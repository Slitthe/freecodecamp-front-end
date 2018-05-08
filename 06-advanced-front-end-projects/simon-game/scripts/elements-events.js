/*Mouse event polyfill for IE*/
(function (window) {
  try {
    new MouseEvent('test');
    return false; // No need to polyfill
  } catch (e) {
    // Need to polyfill - fall through
  }

  // Polyfills DOM4 MouseEvent
  var MouseEvent = function (eventType, params) {
    params = params || { bubbles: false, cancelable: false };
    var mouseEvent = document.createEvent('MouseEvent');
    mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    return mouseEvent;
  }

  MouseEvent.prototype = Event.prototype;

  window.MouseEvent = MouseEvent;
})(window);

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
   var simulateClick = function (elem) {
      // Create our event (with options)
      var evt = new MouseEvent('click', {
         bubbles: true,
         cancelable: true,
         view: window
      });
      // If cancelled, don't dispatch our event
      var canceled = !elem.dispatchEvent(evt);
   };
   var clickNext = function() {
      simulateClick(this.nextElementSibling);
   };
   var btns = Array.prototype.slice.call(document.getElementsByClassName('btn'));
   btns.forEach(function(btn) {
      btn.addEventListener('click', clickNext);
   });
   /* 
   ==================================
   PAGE INTERACTIONS
   ==================================
   // */
   Array.prototype.slice.call(elements.difficulty.list).forEach(function (element) {
     // change difficulty selectors
      element.addEventListener('change', function () {
         delayValues.changeDifficulty(this.value);
      });
      element.addEventListener('click', function () {
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
   });

   elements.strictMode.addEventListener('change', function () {
      var parent = this.parentElement.parentElement;
      // change strict mode
      gameControl.changeStrict(this.checked);
      sounds.button.play();
 
      

   });
   
   elements.powerSwitch.addEventListener('change', function () {
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

