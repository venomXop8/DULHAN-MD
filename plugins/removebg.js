// plugins/removebg.js
const { RemoveBgResult, removeBackgroundFromImageBase64 } = require('remove.bg');
module.exports = {
    command: ['removebg', 'nobg'],
    description: 'Removes background from an image.',
    category: 'utility',
    async handler(m, { downloadMediaMessage }) {
        // Note: This requires a remove.bg API key. Add it to config.js if you have one.
        const removebg_key = m.config.REMOVEBG_API_KEY;
        if (!removebg_key) return m.reply("Remove.bg API key is not set in config.js.");

        const isQuotedImage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (!isQuotedImage) return m.reply('Please reply to an image.');
        
        try {
            await m.reply('Removing background...');
            const buffer = await downloadMediaMessage(m, 'buffer');
            const base64 = buffer.toString('base64');
            const result = await removeBackgroundFromImageBase64({ base64img: base64, apiKey: removebg_key });
            await m.sock.sendMessage(m.key.remoteJid, { image: Buffer.from(result.base64img, 'base64') }, { quoted: m });
        } catch (e) { m.reply(`Error: ${e.message || 'Failed to remove background.'}`); }
    }
};
```javascript
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
            const url = `https://api.screenshotone.com/take?access_key=YOUR_ACCESS_KEY&url=${encodeURIComponent(text)}&full_page=true`;
            // Note: Get your free access key from screenshotone.com
            await m.sock.sendMessage(m.key.remoteJid, { image: { url: url }, caption: `Screenshot of ${text}` }, { quoted: m });
        } catch (e) { m.reply('Sorry, could not take a screenshot.'); }
    }
};
