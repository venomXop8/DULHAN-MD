/**
 * DULHAN-MD - All-in-One Media Downloader
 * Uses the Cobalt API to download media from various websites like Instagram, TikTok, etc.
 */

const axios = require('axios');

// Function to check if a string is a valid URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

module.exports = {
  command: ['get', 'download', 'fetch', 'dl'],
  description: 'Downloads media (video/image) from a given URL.',
  category: 'downloader',
  
  async handler(m, { text, sock }) {
    if (!text || !isValidUrl(text)) {
      return m.reply('Please ek aisi link to dein jahan se main download kar sakun! 🙄\n\n*Example:*\n*.get https://www.instagram.com/p/C...*');
    }

    const url = text.trim();

    try {
      await m.reply(`*〝Downloading from link...〞* ⏳\n\nAapki farmayish par download kar rahi hoon, thora sabar karein...`);

      // Call the Cobalt API
      const response = await axios.post('https://co.wuk.sh/api/json', {
        url: url,
        isNoTTWatermark: true, // For TikTok, remove watermark
        dubLang: false
      }, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;

      if (data.status === 'error') {
        throw new Error(data.text || 'API failed to process the link.');
      }
      
      if (data.status === 'stream') {
        const downloadUrl = data.url;
        
        // Let Baileys figure out if it's a video or image based on the content
        await sock.sendMessage(m.key.remoteJid, { 
            video: { url: downloadUrl },
            caption: `Yeh lijiye, aapki video. Bilkul HD! ✨`
        }, { quoted: m }).catch(async () => {
            // If sending as video fails, try sending as image
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: downloadUrl },
                caption: `Yeh lijiye, aapki photo. Ek dum clear! ✨`
            }, { quoted: m });
        });
        
        await m.reply(`✅ *Downloaded Successfully!*`);
        
      } else {
         throw new Error('Unsupported link or could not find downloadable media.');
      }

    } catch (error) {
      console.error("Downloader API Error:", error);
      m.reply(`❌ Maazrat, is link se download karne mein masla aa gaya.\n\n*Reason:* ${error.message}`);
    }
  }
};
