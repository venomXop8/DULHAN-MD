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
```javascript
// plugins/instagram.js
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
