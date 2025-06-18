/**
 * DULHAN-MD - Sticker Maker
 * Powered by MALIK SAHAB
 */
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
  command: ['sticker', 's'],
  description: 'Converts image or short video to a sticker.',
  category: 'fun',
  async handler(m) {
    const { downloadMediaMessage, reply } = m;
    const msgType = Object.keys(m.message)[0];
    const isMedia = msgType === 'imageMessage' || msgType === 'videoMessage';
    const isQuotedMedia = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage && 
                          (m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage);

    if (isMedia || isQuotedMedia) {
      await reply('STICKER BAN RAHA HAI, JAAN... ⏳');
      try {
        const buffer = await downloadMediaMessage(m, 'buffer');
        const sticker = new Sticker(buffer, {
            pack: 'DULHAN-MD',
            author: 'By Malik Sahab',
            type: StickerTypes.FULL,
            quality: 50
        });
        const stickerMessage = await sticker.toMessage();
        await m.sock.sendMessage(m.key.remoteJid, stickerMessage, { quoted: m });
      } catch (e) {
        console.error("Sticker Error:", e);
        reply(`❌ Sticker banane mein masla aa gaya.`);
      }
    } else {
      reply('Please reply to an image, GIF, or a short video with the command *.sticker*');
    }
  }
};
