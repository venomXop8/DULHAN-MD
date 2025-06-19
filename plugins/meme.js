const axios = require('axios');
module.exports = {
  command: ['meme'],
  description: 'Sends a random meme.',
  category: 'fun',
  async handler(m) {
    const { sock, reply } = m;
    try {
        const { data } = await axios.get('https://meme-api.com/gimme');
        await sock.sendMessage(m.key.remoteJid, { image: { url: data.url }, caption: `*${data.title}*`}, { quoted: m });
    } catch (e) {
        console.error("Meme API Error:", e);
        reply('Sorry, memes ka server aaram kar raha hai.');
    }
  }
};
