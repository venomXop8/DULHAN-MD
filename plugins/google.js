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
