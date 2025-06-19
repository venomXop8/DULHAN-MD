const axios = require('axios');
module.exports = {
  command: ['currency', 'convert'],
  description: 'Converts currency. Format: .currency 100 USD PKR',
  category: 'utility',
  async handler(m) {
    const { text, reply, config } = m;
    if (!config.CURRENCY_API_KEY || config.CURRENCY_API_KEY === "YOUR_CURRENCYAPI.COM_KEY_HERE") {
        return reply("Currency API key is not set in config.js");
    }
    const args = text.split(" ");
    if (args.length !== 4 || args[2].toLowerCase() !== 'to') {
        return reply('Invalid format. Use: *.currency <amount> <from> to <to>*');
    }
    const [amount, from, , to] = args;
    try {
        const { data } = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${config.CURRENCY_API_KEY}&base_currency=${from.toUpperCase()}&currencies=${to.toUpperCase()}`);
        if (!data.data[to.toUpperCase()]) throw new Error('Invalid currency code.');
        const result = (parseFloat(amount) * data.data[to.toUpperCase()].value).toFixed(2);
        reply(`*${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}*`);
    } catch(e) { reply('Conversion failed. Please check currency codes.'); }
  }
};
```javascript
// plugins/shorten.js
const axios = require('axios');
module.exports = {
  command: ['shorten', 'tinyurl'],
  description: 'Shortens a long URL.',
  category: 'utility',
  async handler(m) {
    const { text, reply } = m;
    if (!text.startsWith('http')) return reply('Please provide a valid URL to shorten.');
    try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        reply(`*Your shortened link is ready:*\n${data}`);
    } catch (e) { reply('Sorry, could not shorten this link.'); }
  }
};
