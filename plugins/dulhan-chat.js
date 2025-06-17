const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  command: ['dulhan', 'biwi', 'ask'],
  description: 'Talk to Dulhan, your witty AI assistant.',
  category: 'fun',
  async handler(m, { text }) {
    const { config } = m; // FIX: Destructure from 'm'
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      return m.reply("❌ Gemini API key is not set in config.js.");
    }

    if (!text) {
      return m.reply("Kuch poochna hai to likhein to sahi, jaan... 😏\n\n*Example:*\n.dulhan aap kon ho?");
    }

    try {
      await m.reply("Soch rahi hoon, ek minute... 🤔");

      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const personalityPrompt = `
        You are "DULHAN-MD", a witty, sassy, and sometimes romantic AI WhatsApp bot from Pakistan. 
        Always reply in ROMAN URDU. Keep your replies short, fun, and engaging. 
        The user has asked you: "${text}"
        Now, reply as DULHAN-MD.
      `;

      const result = await model.generateContent(personalityPrompt);
      const response = await result.response;
      const aiReply = response.text();

      m.reply(`*👰‍♀️ Dulhan says:*\n\n${aiReply}`);
    } catch (error) {
      console.error("Gemini API Error:", error);
      m.reply("Uff, dimaag ki dahi ho gayi hai! 🤯 Thori der baad try karein.");
    }
  }
};
