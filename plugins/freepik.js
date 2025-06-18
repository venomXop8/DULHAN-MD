/**
 * DULHAN-MD - Freepik Image Downloader
 * This command scrapes a Freepik page to find and download the high-quality image.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

// Function to check if a string is a valid Freepik URL
function isFreepikUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes('freepik.com');
    } catch (e) {
        return false;
    }
}

module.exports = {
  command: ['freepik', 'fp'],
  description: 'Downloads an image from a Freepik URL.',
  category: 'downloader',
  
  // Use the safe handler signature
  async handler(m) {
    const { text, sock, reply } = m; // Destructure necessary items from 'm'

    if (!text || !isFreepikUrl(text)) {
      return reply('Mujhe Freepik ka aesa link to dein jahan se main photo download kar sakun! 🧐\n\n*Example:*\n*.freepik https://www.freepik.com/free-ai-image/...*');
    }

    const url = text.trim();

    try {
      await reply(`*〝Downloading Freepik image... Please wait.〞* ⏳`);

      // 1. Fetch the HTML of the Freepik page
      const { data } = await axios.get(url, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
          }
      });
      
      // 2. Load the HTML into Cheerio to parse it
      const $ = cheerio.load(data);
      
      // 3. Find the main image element and extract its URL
      // Freepik usually places the main image in a <img id="main-image"> tag
      const imageUrl = $('img#main-image').attr('src');
      
      if (!imageUrl) {
        throw new Error('Could not find the main image on the page. The website structure might have changed.');
      }

      // 4. Extract a filename from the URL
      const filename = path.basename(new URL(url).pathname).replace('.htm', '.jpg');

      // 5. Send the image as a document to preserve quality and filename
      await sock.sendMessage(m.key.remoteJid, { 
          document: { url: imageUrl },
          mimetype: 'image/jpeg',
          fileName: filename
      }, { quoted: m });
      
      await sock.sendMessage(m.key.remoteJid, { text: `✅ *Downloaded from Freepik*` }, { quoted: m });

    } catch (error) {
      console.error("Freepik Downloader Error:", error);
      reply(`❌ Maazrat, is link se photo download karne mein masla aa gaya.\n\n*Reason:* ${error.message}`);
    }
  }
};
