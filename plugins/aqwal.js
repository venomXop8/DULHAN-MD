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
```javascript
// plugins/news.js
const axios = require('axios');
module.exports = {
  command: ['news'],
  description: 'Fetches the latest news headlines from Pakistan.',
  category: 'search',
  async handler(m) {
    const { reply, config } = m;
    if (!config.NEWS_API_KEY || config.NEWS_API_KEY === "YOUR_NEWSAPI.ORG_KEY_HERE") {
        return reply("News API key is not set in config.js");
    }
    try {
        await reply("Fetching latest news headlines...");
        const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?country=pk&apiKey=${config.NEWS_API_KEY}`);
        let newsText = '*Top 5 Headlines from Pakistan:*\n\n';
        data.articles.slice(0, 5).forEach((article, i) => {
            newsText += `*${i+1}. ${article.title}*\n`;
            newsText += `*Source:* ${article.source.name}\n\n`;
        });
        reply(newsText);
    } catch(e) { reply('Sorry, news server se rabta nahi ho pa raha.'); }
  }
};
```javascript
// plugins/stylish.js
const { fancy } = require('../lib/fancy'); // Requires a helper file
module.exports = {
    command: ['stylish', 'fancy'],
    description: 'Converts text into a stylish font.',
    category: 'fun',
    async handler(m) {
        const { text, reply } = m;
        if (!text) return reply('Kis text ko stylish banana hai?');
        reply(fancy(text));
    }
};
