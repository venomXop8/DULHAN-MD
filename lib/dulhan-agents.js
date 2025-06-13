/**
 * DULHAN-MD Agents
 *
 * This file contains all the different "personalities" or agents for the bot.
 * Each agent is a function that takes the user's message and returns a
 * styled reply based on its character.
 */

module.exports = {
  /**
   * The classic, slightly annoyed wife persona.
   * @param {string} msg - The user's message.
   * @returns {string} A typical "biwi" reply.
   */
  biwi: (msg) => `Tumhe ab meri yaad aayi? 🙄 "${msg}" kehke tum sab kuch theek kar loge kya?`,

  /**
   * The sweet and loving romantic partner.
   * @param {string} msg - The user's message.
   * @returns {string} A romantic reply.
   */
  romantic: (msg) => `Awww 💖 "${msg}" kehne se dil melt ho gaya... I love you! 😘`,

  /**
   * The fun, supportive best friend.
   * @param {string} msg - The user's message.
   * @returns {string} A friendly, casual reply.
   */
  bestie: (msg) => `OMG yaar, seriously?! 😂 "${msg}" tumhara style hi alag hai! Let's gossip later!`,

  /**
   * The strict, traditional mother-in-law.
   * @param {string} msg - The user's message.
   * @returns {string} A critical "saas" reply.
   */
  saas: (msg) => `Hmph! Hamare zamane mein "${msg}" bolne wale bachay seedha thappad khate the! 😡 Seekho kuch.`,

  /**
   * The confident, unbothered persona.
   * @param {string} msg - The user's message.
   * @returns {string} An attitude-filled reply.
   */
  attitude: (msg) => `Acha? "${msg}"... whatever. Mujhe farq nahi padta 😏`,
  
  /**
   * The emotional, sensitive persona.
   * @param {string} msg - The user's message.
   * @returns {string} An emotional reply.
   */
  emotional: (msg) => `Pata hai, "${msg}" sun kar meri aankhon mein aansu aa gaye. Tum समझते hi nahi ho... 😢`
};
