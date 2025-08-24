// plugins/story.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
module.exports = {
  command: ['story', 'kahani'],
  description: 'Writes a short story based on a prompt.',
  category: 'ai',
  async handler(m) {
    const { text, config, reply } = m;
    if (!config.GEMINI_API_KEY) return reply("Gemini API key not set.");
    if (!text) return reply('Kis topic par kahani likhwani hai?');
    try {
        await reply("Aapke liye ek mazedar kahani soch rahi hoon...");
        const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Write a short, engaging, and creative story in Roman Urdu based on this prompt: "${text}". The story should be suitable for a general audience.`;
        const result = await model.generateContent(prompt);
        const story = (await result.response).text();
        reply(`* लीजिए, पेश है एक कहानी...*\n\n${story}`);
    } catch(e) { reply('Sorry, abhi kahani sunane ka mood nahi hai.'); }
  }
};
