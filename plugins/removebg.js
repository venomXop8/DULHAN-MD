// plugins/removebg.js
const { removeBackgroundFromImageBase64 } = require('remove.bg');
module.exports = {
    command: ['removebg', 'nobg'],
    description: 'Removes background from an image.',
    category: 'utility',
    async handler(m, { downloadMediaMessage }) {
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
