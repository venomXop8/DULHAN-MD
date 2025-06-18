/**
 * DULHAN-MD - Freepik Image Downloader
 * Powered by MALIK SAHAB
 */
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

function isFreepikUrl(url) { try { const u = new URL(url); return u.hostname.includes('freepik.com'); } catch { return false; } }

module.exports = {
  command: ['freepik', 'fp'],
  description: 'Downloads an image from a Freepik URL.',
  category: 'downloader',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text || !isFreepikUrl(text)) return reply('Mujhe Freepik ka link to dein! 🧐');
    try {
      await reply(`*Downloading Freepik image...* ⏳`);
      const { data } = await axios.get(text);
      const $ = cheerio.load(data);
      const imageUrl = $('img#main-image').attr('src');
      if (!imageUrl) throw new Error('Could not find the main image.');
      const filename = path.basename(new URL(text).pathname).replace('.htm', '.jpg');
      await sock.sendMessage(m.key.remoteJid, { document: { url: imageUrl }, mimetype: 'image/jpeg', fileName: filename }, { quoted: m });
    } catch (e) { 
        console.error("Freepik DL Error:", e);
        reply(`❌ Maazrat, download mein masla aa gaya.`); 
    }
  }
};
