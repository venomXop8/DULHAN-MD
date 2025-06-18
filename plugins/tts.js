// plugins/tts.js (Text to Speech)
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['tts', 'say', 'speak'],
  description: 'Converts text to speech.',
  category: 'utility',
  async handler(m, { text }) {
    if (!text) return m.reply('Kuch likhein to sahi jisko main bol sakun!');
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

        await m.sock.sendMessage(m.key.remoteJid, { audio: { url: outputFile }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        fs.unlinkSync(outputFile); // Clean up the file
    } catch (e) {
        m.reply("Sorry, aawaz nikalne mein koi masla aa gaya.");
    }
  }
};
```javascript
// plugins/savestatus.js
module.exports = {
  command: ['savestatus', 'getstatus'],
  description: 'Saves a replied status update.',
  category: 'downloader',
  async handler(m, { downloadMediaMessage }) {
    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return m.reply('Please reply to a status update to save it.');

    try {
        await m.reply("Status download kar rahi hoon...");
        const buffer = await downloadMediaMessage(m, 'buffer');
        const type = Object.keys(quotedMsg)[0];
        
        if (type === 'imageMessage') {
            await m.sock.sendMessage(m.key.remoteJid, { image: buffer, caption: "Here's the status image!" }, { quoted: m });
        } else if (type === 'videoMessage') {
            await m.sock.sendMessage(m.key.remoteJid, { video: buffer, caption: "Here's the status video!" }, { quoted: m });
        }
    } catch (e) {
        m.reply('Sorry, yeh status download nahi ho saka.');
    }
  }
};
