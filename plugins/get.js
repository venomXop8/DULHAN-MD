/**
 * DULHAN-MD - All-in-One Media Downloader
 * Powered by MALIK SAHAB
 */
const axios = require('axios');

function isValidUrl(s) { try { new URL(s); return true; } catch { return false; } }

module.exports = {
  command: ['get', 'download', 'fetch'],
  description: 'Downloads media (video/image) from a given URL.',
  category: 'downloader',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text || !isValidUrl(text)) return reply('Please ek link to dein jahan se main download kar sakun! 🙄');
    try {
      await reply(`*Downloading from link...* ⏳`);
      const { data } = await axios.post('https://co.wuk.sh/api/json', { url: text, isNoTTWatermark: true });
      if (data.status === 'error') throw new Error(data.text);
      
      const mediaUrl = data.url;
      if (data.status === 'stream') {
        const caption = data.title || `Downloaded by DULHAN-MD`;
        await sock.sendMessage(m.key.remoteJid, { video: { url: mediaUrl }, caption: caption })
          .catch(() => sock.sendMessage(m.key.remoteJid, { image: { url: mediaUrl }, caption: caption }));
      } else { 
        throw new Error('Unsupported link or could not find downloadable media.');
      }
    } catch (e) {
        console.error("Get DL Error:", e);
        reply(`❌ Maazrat, download mein masla aa gaya.`);
    }
  }
};
