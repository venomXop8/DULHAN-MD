// plugins/google.js
const google = require('google-it');
module.exports = {
  command: ['google', 'search'],
  description: 'Searches on Google.',
  category: 'search',
  async handler(m, { text }) {
    if (!text) return m.reply('Kya search karna hai, bataein to sahi?');
    try {
        await m.reply(`Google par "${text}" dhoond rahi hoon...`);
        const results = await google({ query: text });
        let reply = `*Google Search Results for: ${text}*\n\n`;
        results.forEach((res, index) => {
            if(index < 5) { // Show top 5 results
                reply += `*${index+1}. ${res.title}*\n`;
                reply += `_${res.snippet}_\n`;
                reply += `*Link:* ${res.link}\n\n`;
            }
        });
        m.reply(reply);
    } catch (e) { m.reply('Sorry, Google par kuch nahi mila.'); }
  }
};
```javascript
// plugins/pinterest.js
const axios = require('axios');
module.exports = {
  command: ['pinterest', 'pin'],
  description: 'Searches for images on Pinterest.',
  category: 'search',
  async handler(m, { text }) {
    if (!text) return m.reply('Pinterest par kaisi photo chahiye?');
    try {
        await m.reply(`Pinterest par "${text}" ki photos dhoond rahi hoon...`);
        const { data } = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=GataDios&query=${text}`);
        await m.sock.sendMessage(m.key.remoteJid, { image: { url: data.result } }, { quoted: m });
    } catch (e) { m.reply('Sorry, Pinterest par aisi koi photo nahi mili.'); }
  }
};
