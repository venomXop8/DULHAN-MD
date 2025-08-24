// 
const axios = require('axios');
module.exports = {
  command: ['instagram', 'ig'],
  description: 'Downloads a video or image from Instagram.',
  category: 'downloader',
  async handler(m, { text }) {
    if (!text || !text.includes('instagram.com')) return m.reply('Please provide a valid Instagram link.');
    try {
      await m.reply('Instagram se post download kar rahi hoon...');
      const response = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=GataDios&url=${text}`);
      const media = response.data.result[0];
      if(media.includes(".mp4")) {
         await m.sock.sendMessage(m.key.remoteJid, { video: { url: media } }, { quoted: m });
      } else {
         await m.sock.sendMessage(m.key.remoteJid, { image: { url: media } }, { quoted: m });
      }
    } catch (e) { m.reply('Sorry, yeh post download nahi ho saki.'); }
  }
};
