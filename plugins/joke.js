// plugins/joke.js
const axios = require('axios');
module.exports = {
  command: ['joke', 'lateefa'],
  description: 'Tells a random joke.',
  category: 'fun',
  async handler(m) {
    try {
        const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        m.reply(`*Here's a joke for you:*\n\n${data.joke}`);
    } catch (e) { m.reply('Sorry, abhi koi joke yaad nahi aa raha.'); }
  }
};
```javascript
// plugins/meme.js
const axios = require('axios');
module.exports = {
  command: ['meme'],
  description: 'Sends a random meme.',
  category: 'fun',
  async handler(m) {
    try {
        const { data } = await axios.get('[https://meme-api.com/gimme](https://meme-api.com/gimme)');
        await m.sock.sendMessage(m.key.remoteJid, { image: { url: data.url }, caption: `*${data.title}*`}, { quoted: m });
    } catch (e) { m.reply('Sorry, memes ka server down hai.'); }
  }
};
