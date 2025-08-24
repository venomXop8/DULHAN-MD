// plugins/tiktok.js
const axios = require('axios');
module.exports = {
  command: ['tiktok', 'tt'],
  description: 'Downloads a video from TikTok.',
  category: 'downloader',
  async handler(m, { text }) {
    if (!text || !text.includes('tiktok.com')) return m.reply('Please provide a valid TikTok video link.');
    try {
      await m.reply('TikTok se video laa rahi hoon...');
      const response = await axios.get(`https://api.lolhuman.xyz/api/tiktok?apikey=GataDios&url=${text}`);
      await m.sock.sendMessage(m.key.remoteJid, { video: { url: response.data.result.link }, caption: response.data.result.title }, { quoted: m });
    } catch (e) { m.reply('Sorry, yeh video download nahi ho saki.'); }
  }
};
