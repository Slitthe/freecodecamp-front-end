/* 
   ---> HOWLER.JS used for sounds control
         => howler.js v2.0.9
         => howlerjs.com
 */
var sounds = {
   btns: { // sounds associated with each button
      green: new Howl({
         src: ['media/sounds/simonSound1.mp3'],
         volume: 1
      }),
      red: new Howl({
         src: ['media/sounds/simonSound2.mp3'],
         volume: 1
      }),
      blue: new Howl({
         src: ['media/sounds/simonSound3.mp3'],
         volume: 1
      }),
      yellow: new Howl({
         src: ['media/sounds/simonSound4.mp3'],
         volume: 1
      }),
   },
   incorrect: new Howl({ // wrong button pressed
      src: ['media/sounds/incorrect.mp3'],
      volume: 0.4,
      onend: function() {
         sounds.btns.unmute();
         sounds.startBeep.volume(0.6);
      },
      onplay: function() {
         sounds.btns.mute();
         sounds.startBeep.volume(0);
      }
   }),
   beep: new Howl({ // game settings beep
      src: ['media/sounds/beep.wav'],
      volume: 0.5
   }),
   btnSwitch: new Howl({ // game settings beep
      src: ['media/sounds/btn-switch.wav'],
      volume: 0.6,
      rate: 1.8
   }),
   win: new Howl({ // win sound
      src: ['media/sounds/win.wav'],
      volume: 0.7
   }),
   startBeep: new Howl({ // sequence restart beep (because of timeout)
      src: ['media/sounds/start-beep.mp3'],
      volume: 0.6
   }),
   button: new Howl({ // "physical" button sound
      src: ['media/sounds/button.mp3'],
      volume: 1
   })
};
// mute and unmute the btn sounds
Object.defineProperty(sounds.btns, 'unmute', {
   enumerable: false,
   configurable: true,
   writable: true,
   value: function() {
      var keys = Object.keys(this);
      for(var i = 0; i < keys.length; i++) {
         this[keys[i]].volume(1);
      }
   }
});
Object.defineProperty(sounds.btns, 'mute', {
   enumerable: false,
   configurable: true,
   writable: true,
   value: function() {
      var keys = Object.keys(this);
      for(var i = 0; i < keys.length; i++) {
         this[keys[i]].volume(0);
      }
   }
});
// btn press with or without a beep
var soundEvents = {
   btnPress: function(beep) {
      if(beep) {
         sounds.beep.play()
      }
      sounds.button.play();
   }
};