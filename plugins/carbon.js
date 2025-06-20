/**
 * DULHAN-MD - Carbon.now.sh Code Image Generator
 * Powered by MALIK SAHAB
 */
const axios = require('axios');

module.exports = {
  command: ['carbon', 'codeimg'],
  description: 'Creates a beautiful image of your code.',
  category: 'utility',
  async handler(m) {
    const { text, reply, sock } = m;
    if (!text) return reply('Mujhe code to dein jiska image banana hai!');
    try {
        await reply("Aapke code ko khoobsurat bana rahi hoon... 🎨");
        const encodedCode = encodeURIComponent(text);
        const imageUrl = `https://carbonara.solopov.dev/api/cook?code=${encodedCode}&backgroundColor=rgba(171,184,195,1)`;
        
        await sock.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: "Yeh lijiye aapka code!" }, { quoted: m });
    } catch(e) {
        console.error(e);
        reply('Sorry, code ka image banane mein masla aa gaya.');
    }
  }
};
