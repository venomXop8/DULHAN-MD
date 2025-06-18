const translate = require('@vitalets/google-translate-api');

module.exports = {
  command: ['translate', 'tr'],
  description: 'Translates text. Format: .tr <lang_code> <text>',
  category: 'utility',
  async handler(m, { text }) {
    const args = text.split(' ');
    if (args.length < 2) {
      return m.reply('Please provide language code and text.\n\n*Example:*\n*.tr en Hello, how are you?*');
    }
    const lang = args[0];
    const content = args.slice(1).join(' ');
    try {
      const { text: translatedText } = await translate(content, { to: lang });
      m.reply(`*Translated to ${lang}:*\n${translatedText}`);
    } catch (e) {
      m.reply("Translation failed. Make sure the language code is correct.");
    }
  }
};
