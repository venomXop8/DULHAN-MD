// 
const { GoogleGenerativeAI } = require("@google/generative-ai");
module.exports = {
  command: ['code', 'gencode'],
  description: 'Generates code in any programming language.',
  category: 'ai',
  async handler(m) {
    const { text, config, reply } = m;
    if (!config.GEMINI_API_KEY) return reply("Gemini API key not set.");
    if (!text) return reply('Kis language mein code chahiye aur kya kaam karwana hai? \n\n*Example:*\n*.code javascript make a login button*');
    try {
        await reply("Aapke liye code generate kar rahi hoon...");
        const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Act as an expert programmer. Generate a clean, efficient, and well-commented code snippet for the following request. Provide only the code block, without any extra explanation. Request: "${text}"`;
        const result = await model.generateContent(prompt);
        const code = (await result.response).text();
        reply(code);
    } catch(e) { reply('Sorry, is waqt coding karne ka dil nahi chah raha.'); }
  }
};
