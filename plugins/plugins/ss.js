// plugins/ss.js (Website Screenshot)
const axios = require('axios');
module.exports = {
    command: ['ss', 'screenshot'],
    description: 'Takes a screenshot of a website.',
    category: 'utility',
    async handler(m, { text }) {
        if (!text || !text.startsWith('http')) return m.reply('Please provide a valid website URL.');
        try {
            await m.reply(`Taking screenshot of ${text}...`);
            // Note: Get your free access key from screenshotone.com and replace YOUR_ACCESS_KEY
            const url = `https://api.screenshotone.com/take?access_key=YOUR_ACCESS_KEY&url=${encodeURIComponent(text)}&full_page=true`;
            await m.sock.sendMessage(m.key.remoteJid, { image: { url: url }, caption: `Screenshot of ${text}` }, { quoted: m });
        } catch (e) { m.reply('Sorry, could not take a screenshot.'); }
    }
};
