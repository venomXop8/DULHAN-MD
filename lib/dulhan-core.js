/**
 * DULHAN-MD Core
 *
 * This file manages the core mood mechanics of the bot.
 * It decides which mood the bot is currently in.
 */

// A list of all possible moods Dulhan can be in.
const moods = ['romantic', 'attitude', 'emotional', 'biwi', 'saas', 'bestie', 'silent'];

/**
 * Selects a random mood from the list.
 * This is the heart of the "Smart Mood Engine".
 * @returns {string} The name of the randomly selected mood.
 */
function getRandomMood() {
  const randomIndex = Math.floor(Math.random() * moods.length);
  return moods[randomIndex];
}

/**
 * A placeholder for a more complex time-based mood decider.
 * For now, it just returns a random mood.
 * @returns {string} The name of the mood.
 */
function getMoodByTime() {
  // Future idea: Could be 'romantic' at night, 'saas' in the morning, etc.
  return getRandomMood();
}

module.exports = {
  getRandomMood,
  getMoodByTime,
  moods // Exporting moods array for potential use in settings
};
