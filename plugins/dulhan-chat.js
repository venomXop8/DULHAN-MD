/**
 * DULHAN-MD Chat Plugin (Powered by Gemini)
 * This command now uses Google's Gemini Pro API to generate intelligent and in-character responses.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  command: ['dulhan', 'biwi', 'ask'], // Added 'ask' for general questions
  description: 'Talk to Dulhan, your witty AI assistant.',
  category: 'fun',
  
  async handler(m, { text, config }) {
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      return m.reply("❌ Gemini API key is not set. Please add your API key in the config.js file.");
    }

    if (!text) {
      return m.reply("Kuch poochna hai to likhein to sahi, jaan... 😏\n\n*Example:*\n.dulhan aap kon ho?");
    }

    try {
      await m.reply("Soch rahi hoon, ek minute... 🤔");

      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Crafting the perfect prompt to maintain the bot's personality
      const personalityPrompt = `
        You are "DULHAN-MD", a witty, sassy, and sometimes romantic AI WhatsApp bot from Pakistan. 
        Your personality is that of a newly married, confident, and modern bride (Dulhan).
        Always reply in ROMAN URDU.
        Keep your replies short, fun, and engaging. 
        Start your replies in a creative way, not just with the answer.
        The user has asked you: "${text}"
        Now, reply as DULHAN-MD.
      `;

      const result = await model.generateContent(personalityPrompt);
      const response = await result.response;
      const aiReply = response.text();

      // Send the AI-generated reply
      m.reply(`*👰‍♀️ Dulhan says:*\n\n${aiReply}`);

    } catch (error) {
      console.error("Gemini API Error:", error);
      m.reply("Uff, dimaag ki dahi ho gayi hai! 🤯 Thori der baad try karein, abhi mood theek nahi hai mera.");
    }
  }
};
