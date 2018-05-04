var sounds = {
   btns: {
      red: new Howl({
         src: ['../sounds/simonSound1.mp3'],
         volume: 1
      }),
      green: new Howl({
         src: ['../sounds/simonSound2.mp3'],
         volume: 1
      }),
      blue: new Howl({
         src: ['../sounds/simonSound3.mp3'],
         volume: 1
      }),
      yellow: new Howl({
         src: ['../sounds/simonSound4.mp3'],
         volume: 1
      }),
   },
   incorrect: new Howl({
      src: ['../sounds/incorrect.mp3'],
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
   beep: new Howl({
      src: ['../sounds/beep.wav'],
      volume: 0.7
   }),
   win: new Howl({
      src: ['../sounds/win.wav'],
      volume: 0.7
   }),
   startBeep: new Howl({
      src: ['../sounds/start-beep.mp3'],
      volume: 0.6
   }),
   button: new Howl({
      src: ['../sounds/button.mp3'],
      volume: 1
   })
   
};

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

var soundEvents = {
   btnPress: function(beep) {
      if(beep) {
         sounds.beep.play()
      }
      sounds.button.play();
   }
};
