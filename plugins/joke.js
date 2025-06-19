const axios = require('axios');
module.exports = {
  command: ['joke', 'lateefa'],
  description: 'Tells a random joke.',
  category: 'fun',
  async handler(m) {
    const { reply } = m;
    try {
        const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single&safe-mode');
        reply(`*Here's a joke for you:*\n\n${data.joke}`);
    } catch (e) {
        console.error("Joke API Error:", e);
        reply('Sorry, abhi koi joke yaad nahi aa raha.');
    }
  }
};
