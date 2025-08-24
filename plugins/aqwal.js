// plugins/aqwal.js
const axios = require('axios');
module.exports = {
  command: ['aqwal', 'quote'],
  description: 'Sends a random wise quote.',
  category: 'fun',
  async handler(m) {
    const { reply } = m;
    try {
        const { data } = await axios.get('https://api.quotable.io/random');
        reply(`*〝${data.content}〞*\n\n— *${data.author}*`);
    } catch(e) { reply('Sorry, abhi koi achi baat zehen mein nahi aa rahi.'); }
  }
};
