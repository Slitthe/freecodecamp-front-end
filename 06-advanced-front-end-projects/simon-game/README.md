# FreeCodeCamp's Simon Game
#### Web replica of the famous Simon Game

## Objectives
--- 


1. Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/FreeCodeCamp/full/obYBjE.

2. Fulfill the below user stories. Use whichever libraries or APIs you need. Give it your own personal style.

3. **User Story**: I am presented with a random series of button presses.

4. **User Story**: Each time I input a series of button presses correctly, I see the same series of button presses but with an additional step.

5. **User Story**: I hear a sound that corresponds to each button both when the series of button presses plays, and when I personally press a button.

6. **User Story**: If I press the wrong button, I am notified that I have done so, and that series of button presses starts again to remind me of the pattern so I can try again.

7. **User Story**: I can see how many steps are in the current series of button presses.

8. **User Story**: If I want to restart, I can hit a button to do so, and the game will return to a single step.

9. **User Story**: I can play in strict mode where if I get a button press wrong, it notifies me that I have done so, and the game restarts at a new random series of button presses.

10. **User Story**: I can win the game by getting a series of 20 steps correct. I am notified of my victory, then the game starts over.

11. Hint: Here are mp3s you can use for each button: `https://s3.amazonaws.com/freecodecamp/simonSound1.mp3`, `https://s3.amazonaws.com/freecodecamp/simonSound2.mp3`, `https://s3.amazonaws.com/freecodecamp/simonSound3.mp3`, `https://s3.amazonaws.com/freecodecamp/simonSound4.mp3`.

---

## Libraries Used
- [Howler.js](https://github.com/goldfire/howler.js) (sound)

## Features:
- Four difficulty levels
- Current level display
- ON/OFF switcher
- Strict mode (start from scratch upon failure)
- Ability to start a new game
- Button sounds, even when game is off
- When game is on, for relevant settings, there are indicator "led"s; Example : Strict Mode
- Difficulty increases by a percentage basis after each level (from the base current difficulty mode selected before starting a new game)


---

###  <a href="https://slitthe.github.io/simon-game/" target="_blank">Codepen DEMO</a> <img src="https://cdn1.iconfinder.com/data/icons/simple-icons/256/codepen-256-black.png" height="30">
