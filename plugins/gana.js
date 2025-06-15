/**
 * DULHAN-MD - YouTube Song Downloader
 */

const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
  command: ['gana', 'song', 'yt'],
  description: 'Searches and downloads a song from YouTube.',
  category: 'downloader',
  
  async handler(m, { text, sock }) {
    if (!text) {
      return m.reply('Gaane ka naam to likhein, Shehzade! 😉');
    }

    try {
      await m.reply(`*〝${text}〞* dhoond rahi hoon... Music meri bhi kamzori hai! 🎶`);
      
      const searchResult = await yts(text);
      const video = searchResult.videos[0];

      if (!video) {
        return m.reply('Uff! Yeh gaana to mila hi nahi. Kuch aur try karein?');
      }

      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      // Send the audio file
      await sock.sendMessage(m.key.remoteJid, {
        audio: stream,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
      }, { quoted: m });

    } catch (error) {
      console.error("YouTube Download Error:", error);
      m.reply("Sorry, is gaane ko download karne mein koi masla aa gaya. 😢");
    }
  }
};
