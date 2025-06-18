/**
 * DULHAN-MD - Text to Speech
 * Powered by MALIK SAHAB
 */
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['tts', 'say', 'speak'],
  description: 'Converts text to speech.',
  category: 'utility',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text) return reply('Kuch likhein to sahi jisko main bol sakun!');
    try {
        const lang = 'ur'; // Urdu/Hindi voice
        const outputFile = path.join(__dirname, `../temp_tts_${Date.now()}.mp3`);
        
        const speech = new gtts(text, lang);
        await new Promise((resolve, reject) => {
            speech.save(outputFile, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        await sock.sendMessage(m.key.remoteJid, { audio: { url: outputFile }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        fs.unlinkSync(outputFile);
    } catch (e) {
        console.error("TTS Error:", e);
        reply("Sorry, aawaz nikalne mein koi masla aa gaya.");
    }
  }
};
