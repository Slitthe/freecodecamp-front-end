//#region SOUNDS
const SOUNDS = {
   workOver: new Howl({ src: ['./media/complete.mp3'], volume: 0.5 }),
   workStart: new Howl({ src: ['./media/work.mp3'], volume: 0.4 })
};
//#endregion

//#region Durations constructor
class Durations {
   constructor(args) {
      this.VISUALS = args.VISUALS;
      this.work = args.work; // work round duration (ms)
      this.pause = args.pause; // pause round duration
      this.workDefault = args.work;
      this.pauseDefault = args.pause;
      this.current = {}; // default round start (work or pause)
      this.currentMax = this[args.startWithState]; // temp max duration (to calculate the percentages display)
      this.current._value = this[args.startWithState];
      Object.defineProperty(this.current, 'value', { // getter and setter to execute a callback every time the value is changed
         get: function () {
            return this._value;
         },
         set: function (value) {
            this._value = value;
            args.modifyCallback();
         }
      });
   }
   setToDefault() { // reset durations to their default value
      this.work = this.workDefault;
      this.pause = this.pauseDefault;
      this.VISUALS.syncValues();
   }
   checkEnd() { // check if the current timer is over
      return this.current.value <= 0;
   }
   setDurationToState(stateType) { // change current duration to match the argument state (work or pause)
      this.currentMax = this[stateType];
      this.current.value = this[stateType];
   }
   changeDurationOfType(type, newValue) { // change the value of a duration type
      this[type] = newValue;
      $(`#${type}`).val(newValue);
   }
   currentDurationChange(changeBy) { // increment or decrement the current duration, input in ms
      this.current.value += changeBy;
      if (this.current.value < 0) { // don't allow negative time
         this.current.value = 0;
      } else {
         this.current.value = Math.floor(this.current.value);
      }

      this.VISUALS.timeChange(this.current.value); // update the time display
   }
}
//#endregion

//#region Timer constructor
class Timer {
   // "setInterval"-based timer
   constructor(args) {
      this.intervals = [];
      this.intervalCallback = args.intervalCallback;
      this.intervalDelay = args.intervalDelay;
   }
   reset() {
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];
   }
   start() {
      let interval = setInterval(this.intervalCallback, this.intervalDelay);
      this.intervals.push(interval);
   }
}
//#endregion

//#region ANGLES
const ANGLES = {
   stateMinMax: {
      // what angles are 0% and 100% for the given timer state
      work: {
         min: 225,
         max: 405
      },
      pause: {
         min: 45,
         max: 225
      },
   },
   changeAngleTo(deg) {
      // visually change the angle of the progress bar
      $('.spinner').css('transform', 'rotateZ(' + deg + 'deg)');
   },
   calcProgressAngle: function (current, max, state) {
      // match the angle of the progress bar to match that of the percentage difference betweent he current duration and the maximum current duration
      let percentages = 1 - (current / max),
         angleStartFrom = this.stateMinMax[state].max - this.stateMinMax[state].min,
         finalAngle = angleStartFrom * percentages + this.stateMinMax[state].min;
      this.changeAngleTo(finalAngle);
   }
};
//#endregion

//#region TIME_HELPERS
const TIME_HELPERS = {
   // time related helpers
   msToSeconds: ms => Math.floor(ms / 1000),
   msToMinutes: ms => Math.floor(ms / 60000),
   msFormatTime: function (ms) {
      // ms --> mm:ss formatter, with 0 prefixes for under 10 values
      let minutes = this.msToMinutes(ms),
         remainingSeconds = this.msToSeconds(ms) % 60,
         underTenM = minutes < 10,
         underTenS = remainingSeconds < 10;

      return `${underTenM ? '0' : ''}${minutes}:${underTenS ? '0' : ''}${remainingSeconds}`;
   },
   calcModifyCurrentDuration: function (type, currentDuration) {
      // increase/decrease the current timer
      let isIncrease = type === 'increase',
         remainder = currentDuration % 60000;
      remainder = !remainder && !isIncrease ? 60000 : remainder;
      let increaseAmount = isIncrease ? 60000 - remainder : -remainder;

      if (Math.abs(increaseAmount) < 15000) { // offsets of 15 seconds will be considered 0, ex increase from 2:46 --> 4:00
         if (!isIncrease) {
            increaseAmount -= 60000;
         } else {
            increaseAmount += 60000;
         }
      }
      return increaseAmount;
   }
};
//#endregion

//#region VISUALS
const VISUALS = {
   // DOM Modifications methods
   selfHelpers: {
      hideResume: function (isResume) { // show/hide the pause/play
         let hide = isResume ? 'resume' : 'pause';
         let show = isResume ? 'pause' : 'resume';
         $('#pause-resume .' + show).removeClass('hide');
         $('#pause-resume .' + hide).addClass('hide');
      },
      disableSkip: function (newValue) { // display or hide the skip button
         $('#remove-cr-timer, #add-cr-timer, #skip').attr('disabled', newValue);
      },
      updateTime: function (time) {
         $('#cr-timer').text(time);
      }
   },
   start: function (state) {
      $('.pomo-container').attr('data-active-state', state);
      this.selfHelpers.disableSkip(null);
   },
   pause: function () {
      this.selfHelpers.hideResume(false);
   },
   resume: function () {
      this.selfHelpers.hideResume(true);
      VISUALS.syncValues();
   },
   reset: function () {
      $('.pomo-container').attr('data-timer-running', 'false');
      $('.pomo-container').attr('data-active-state', '');
      this.selfHelpers.updateTime('');
      this.selfHelpers.disableSkip('disabled');
      this.selfHelpers.hideResume(false);
   },
   stateSwitch: function (state) {
      $('.pomo-container').attr('data-active-state', state);
   },
   startStop: function (roundActive) { // play/pause toggler
      if (roundActive) {
         $('.pomo-container').attr('data-timer-running', 'true');
      }
   },
   skip: function (duration) {
      $('#cr-timer').text(TIME_HELPERS.msFormatTime(duration));
   },
   syncValues: function (work = POMO.durations.work, pause = POMO.durations.pause) {
      // sync DOM-JS time values
      $('#modifiy-timers #work-duration').val(TIME_HELPERS.msToMinutes(work));
      $('#modifiy-timers #pause-duration').val(TIME_HELPERS.msToMinutes(pause));
      $('.faux-input').each(function (ind, item) {
         $(item).find('.input-display').text($(item).find('input').val());
      });
   },
   timeChange: function (value) {
      this.selfHelpers.updateTime(TIME_HELPERS.msFormatTime(value));
   },
   resetProgressDisplay: function () {
      // reset current max values
      POMO.durations.currentMax = POMO.durations.current.value;
      POMO.durations.current.value = POMO.durations.current.value;
   }
};
//#endregion

//#region POMO
const POMO = {
   isActive: false, // true unless the game is stopped
   isTimerRunning: false, // timer running state
   totalWorkTime: 0,
   totalWorkPeriods: 0,
   durations: new Durations({
      work: 1500000,
      pause: 300000,
      startWithState: 'work',
      modifyCallback: function () {
         ANGLES.calcProgressAngle(POMO.durations.current.value, POMO.durations.currentMax, POMO.states.current);
      },
      VISUALS: VISUALS
   }),
   states: { // game states, current, list and switch
      current: 'work',
      types: ['work', 'pause'],
      switch: function () {
         let indexOf = this.types.indexOf(this.current);
         this.current = this.types[!indexOf + 0];
         VISUALS.stateSwitch(this.current);
      }
   },
   start: function () { // start the timer
      this.timer.reset();
      this.durations.setDurationToState(this.states.current);
      this.resume();

      VISUALS.start(this.states.current);

   },
   reset: function () { // reset values and state
      this.durations.setToDefault();
      this.timer.reset();
      this.isTimerRunning = false;
      if (this.states.current === 'pause') {
         this.states.switch();
      }

      VISUALS.reset();
   },
   // pause the current game state
   pause: function () {
      this.setActiveStateTo(false);
      this.timer.reset();
      VISUALS.pause();
   },
   pauseResumeToggle: function () {
      if (!this.isTimerRunning) { // start the game if it is stopped
         this.isTimerRunning = true;
         this.start();

         VISUALS.startStop(true);
      } else { // pause/resume it otherwise
         if (this.isActive) {
            this.pause();
         } else {
            this.resume();
         }
      }
   },
   resume: function () {
      this.setActiveStateTo(true);
      this.timer.start();


      VISUALS.resume();
   },
   // skip to the next game state
   skip: function () {
      this.pause();
      this.states.switch();
      this.durations.setDurationToState(this.states.current);
      if (this.isActive) this.start();

      VISUALS.skip(this.durations[this.states.current]);

   },
   setActiveStateTo: function (newState) {
      let disabledState = newState ? 'true' : null;
      this.isActive = newState;

   },
   timer: new Timer({
      intervalDelay: 1000,
      intervalCallback: function () {
         // interval callback
         let current = POMO.states.current,
            isWork = POMO.states.current === 'work';

         POMO.durations.currentDurationChange(-1000); // substract 1 sec from the current duration for every 1s interval

         if (isWork) POMO.totalWorkTime += 1000;
         if (POMO.durations.checkEnd()) {
            if (isWork) {
               POMO.totalWorkPeriods++;
               SOUNDS.workOver.play();
            } else {
               SOUNDS.workStart.play();

            }
            POMO.skip();
            POMO.start();
         }
      }
   })
};
//#endregion

//#region init
let init = function () {
   VISUALS.syncValues();

   let modifyDuration = function (thatEl) {
      // modify a type's time value
      let inputValid = $(thatEl).val() >= 1 && $(thatEl).val() <= 90;
      if (inputValid) {
         let forProp = $(thatEl).attr('data-duration-for'),
            newVal = parseInt($(thatEl).val());
         POMO.durations.changeDurationOfType(forProp, newVal * 60000);
      }
   };

   let inputValueChange = function (inputEl, valueChangeBy) {
      let   min = Number(inputEl.getAttribute('min')),
            max = Number(inputEl.getAttribute('max'));

      let newVal = Number(inputEl.value) + valueChangeBy;

      if(newVal >= min && newVal <= max) {
         inputEl.value = Number(inputEl.value) + valueChangeBy;
      }

   };

   let stepDurationChange = function (input, isPositive) {
      // change time values for a type from both the DOM and the JS object
      input = $(input).siblings('input')[0];

      if (isPositive) {
         inputValueChange(input, 1);
      } else {
         inputValueChange(input, -1);
      }
      modifyDuration(input);

      VISUALS.syncValues();
   };

   let currentTimeStepper = function (increase) {
      // change the time of the current period ONLY
      let type = increase ? 'increase' : 'decrease',
         modifyBy = TIME_HELPERS.calcModifyCurrentDuration(type, POMO.durations.current.value);

      POMO.pause();
      POMO.durations.currentDurationChange(modifyBy);

      VISUALS.resetProgressDisplay();
   };


   let attachEvents = function () {
      /* Control buttons */
      $('#pause-resume').on('click', POMO.pauseResumeToggle.bind(POMO));
      $('#skip').on('click', POMO.skip.bind(POMO));
      $('#start').on('click', POMO.start.bind(POMO));
      $('#reset').on('click', POMO.reset.bind(POMO));

      /* Values incrementors/decrementors */
      $('.time-display .increment').on('click', () => currentTimeStepper(true));
      $('.time-display .decrement').on('click', () => currentTimeStepper(false));
      $('.change-timer .increment').on('click', (el) => stepDurationChange(el.currentTarget, true));
      $('.change-timer .decrement').on('click', (el) => stepDurationChange(el.currentTarget, false));
   }();

};

$(document).ready(init);
//#endregion