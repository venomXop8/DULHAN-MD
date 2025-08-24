// plugins/dalle.js
const axios = require('axios');
module.exports = {
  command: ['dalle', 'imagine'],
  description: 'Generates an image from text using DALL-E.',
  category: 'ai',
  async handler(m, { text }) {
    if (!text) return m.reply('Mujhe bataein to sahi, kaisi photo banani hai?');
    try {
      await m.reply('Aapke khayalon ko tasveer mein badal rahi hoon... 🎨');
      const response = await axios.get(`https://api.lolhuman.xyz/api/dall-e?apikey=GataDios&text=${encodeURIComponent(text)}`);
      await m.sock.sendMessage(m.key.remoteJid, { image: { url: response.data.result } }, { quoted: m });
    } catch (e) { m.reply('Sorry, is waqt drawing ka mood nahi hai.'); }
  }
};
