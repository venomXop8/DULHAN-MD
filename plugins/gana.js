/**
 * DULHAN-MD - YouTube Song Downloader
 * Powered by MALIK SAHAB
 */
const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
  command: ['gana', 'song', 'yt'],
  description: 'Searches and downloads a song from YouTube.',
  category: 'downloader',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text) return reply('Gaane ka naam to likhein, Shehzade! 😉');
    try {
      await reply(`*〝${text}〞* dhoond rahi hoon... 🎶`);
      const searchResult = await yts(text);
      const video = searchResult.videos[0];
      if (!video) return reply('Uff! Yeh gaana to mila hi nahi.');
      
      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      await sock.sendMessage(m.key.remoteJid, {
        audio: stream,
        mimetype: 'audio/mpeg',
        ptt: false, // Send as a song, not a voice note
        fileName: `${video.title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error("YT Download Error:", e);
      reply("Sorry, is gaane ko download karne mein koi masla aa gaya. 😢");
    }
  }
};
