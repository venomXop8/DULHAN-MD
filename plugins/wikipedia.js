const wiki = require('wikipedia');

module.exports = {
  command: ['wiki', 'wikipedia'],
  description: 'Searches for information on Wikipedia.',
  category: 'search',
  async handler(m, { text }) {
    if (!text) return m.reply('Kya dhoondna hai Wikipedia par?');
    try {
      await m.reply(`Searching for "${text}" on Wikipedia...`);
      const summary = await wiki.summary(text);
      let reply = `*Wikipedia Search: ${summary.title}*\n\n`;
      reply += `${summary.extract}\n\n`;
      reply += `*Link:* ${summary.content_urls.desktop.page}`;
      m.reply(reply);
    } catch (e) {
      m.reply("Sorry, iske baare mein Wikipedia par kuch nahi mila.");
    }
  }
};
