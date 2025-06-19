/**
 * DULHAN-MD - YouTube Audio Player
 * Powered by MALIK SAHAB
 */
const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
  command: ['play', 'audio', 'naat'],
  description: 'Searches and sends a Naat, Kalam, or any audio from YouTube.',
  category: 'downloader',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text) return reply('Kisi Naat ya Kalam ka naam to likhein, Shehzade!  Islamic content search karein. 😉');
    try {
      await reply(`*〝${text}〞* dhoond rahi hoon... 🎶`);
      const searchResult = await yts(text);
      const video = searchResult.videos[0];
      if (!video) return reply('Uff! Yeh to mila hi nahi. Kuch aur try karein?');
      
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });

      await sock.sendMessage(m.key.remoteJid, {
        audio: stream,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error("YT Download Error:", e);
      reply("Sorry, is audio ko download karne mein koi masla aa gaya. 😢");
    }
  }
};
