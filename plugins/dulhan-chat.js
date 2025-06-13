const { chainReply } = require('../lib/dulhan-brain');

module.exports = {
  command: ['dulhan', 'shaadi', 'biwi'],
  description: 'Talk to your Dulhan 👰',
  category: 'fun',
  async handler(m, { text, commands }) {
    const userText = text || 'Kya haal hai Dulhan ji?';
    const reply = chainReply(userText);
    
    // Reply bhejny ke baad, menu bhi dikhayein
    await m.reply(reply);
    
    // Menu command ko call karein
    const menuCmd = commands.get('menu');
    if (menuCmd) {
        // We pass 'm' and 'commands' to the menu handler
        await menuCmd.handler(m, { commands });
    }
  }
};
