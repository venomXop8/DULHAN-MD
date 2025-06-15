/**
 * DULHAN-MD - Google Image Search
 */

const google = require('google-it');

module.exports = {
  command: ['photo', 'image', 'picture'],
  description: 'Searches for an image on Google.',
  category: 'search',
  
  async handler(m, { text, sock }) {
    if (!text) {
      return m.reply('Kis cheez ki photo chahiye, bataein to sahi...');
    }

    try {
      await m.reply(`Aapki farmayish par *"${text}"* ki photo dhoondi jaa rahi hai... 🖼️`);

      const results = await google({ query: text, 'safe': 'on', 'no-display': 'true', 'filter': 'isz:l', 'disable-navigations': 'true', 'hl': 'en', 'gl': 'US' });

      if (!results.length || !results[0].image) {
        return m.reply("Sorry, iski koi achi photo nahi mili. Kuch aur dhoondein?");
      }
      
      // Send the first high-quality image found
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: results[0].image },
        caption: `Yeh lijiye, aapki photo. Bilkul aapki tarah, ek dum perfect! ✨\n\n*Source:* Google Images`
      }, { quoted: m });

    } catch (error) {
      console.error("Google Image Search Error:", error);
      m.reply("Photo dhoondne mein masla aa raha hai. Thori der baad try karein.");
    }
  }
};
