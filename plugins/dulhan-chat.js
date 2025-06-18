/**
 * DULHAN-MD - AI Chat with Gemini
 * Powered by MALIK SAHAB
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  command: ['dulhan', 'biwi', 'ask'],
  description: 'Talk to Dulhan, your witty AI assistant.',
  category: 'ai',
  async handler(m) {
    const { text, config, reply } = m;
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        return reply("❌ Gemini API key set nahi hai. Please config.js file mein add karein.");
    }
    if (!text) {
        return reply("Kuch poochna hai to likhein to sahi, jaan... 😏\n\n*Example:*\n*.dulhan aap kon ho?*");
    }

    try {
      await reply("Soch rahi hoon, ek minute... 🤔");
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const personalityPrompt = `You are "DULHAN-MD", a witty, sassy, and sometimes romantic AI WhatsApp bot from Pakistan. Your creator is Malik Sahab. Always reply in ROMAN URDU. Keep your replies short, fun, and engaging. The user has asked you: "${text}". Now, reply as DULHAN-MD.`;
      
      const result = await model.generateContent(personalityPrompt);
      const response = await result.response;
      const aiReply = response.text();

      reply(`*👰‍♀️ Dulhan says:*\n\n${aiReply}`);
    } catch (e) {
      console.error("Gemini API Error:", e);
      reply("Uff, mera dimaag ghhom raha hai! 🤯 Baad mein try karein.");
    }
  }
};
