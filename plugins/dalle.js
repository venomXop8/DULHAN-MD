// plugins/dalle.js
const axios = require('axios');
module.exports = {
  command: ['dalle', 'imagine'],
  description: 'Generates an image from text using DALL-E.',
  category: 'ai',
  async handler(m, { text }) {
    if (!text) return m.reply('Mujhe bataein to sahi, kaisi photo banani hai?');
    try {
      await m.reply('Aapke khayalon ko tasveer mein badal rahi hoon... 🎨');
      const response = await axios.get(`https://api.lolhuman.xyz/api/dall-e?apikey=GataDios&text=${encodeURIComponent(text)}`);
      await m.sock.sendMessage(m.key.remoteJid, { image: { url: response.data.result } }, { quoted: m });
    } catch (e) { m.reply('Sorry, is waqt drawing ka mood nahi hai.'); }
  }
};
```javascript
// plugins/remini.js
const axios = require('axios');
module.exports = {
  command: ['remini', 'hd', 'enhance'],
  description: 'Enhances the quality of an image.',
  category: 'ai',
  async handler(m, { downloadMediaMessage }) {
    const isQuotedImage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    if (!isQuotedImage) return m.reply('Kisi photo ko reply karein to usko HD banaun!');
    try {
      await m.reply('Photo ko chamka rahi hoon, wait karein... ✨');
      const buffer = await downloadMediaMessage(m, 'buffer');
      const base64 = buffer.toString('base64');
      const { data } = await axios.post('[https://api.itsrose.life/image/unblur](https://api.itsrose.life/image/unblur)', { "init_image": base64 }, { headers: { 'Authorization': '76FAD44B0975383563A2' } });
      await m.sock.sendMessage(m.key.remoteJid, { image: { url: data.result.image } }, { quoted: m });
    } catch (e) { m.reply('Sorry, is photo ko enhance nahi kar saki.'); }
  }
};
 
