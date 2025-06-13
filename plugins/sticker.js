const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
  command: ['sticker', 's', 'stiker'],
  description: 'Converts image or short video to a sticker.',
  category: 'fun',
  async handler(m, { sock, downloadMediaMessage }) {
    const msgType = Object.keys(m.message)[0];
    const isQuotedImage = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    const isQuotedVideo = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;

    if (m.message.imageMessage || isQuotedImage) {
        const buffer = await downloadMediaMessage(m, 'buffer');
        const sticker = new Sticker(buffer, {
            pack: 'DULHAN-MD',
            author: 'By My Jaan',
            type: StickerTypes.FULL,
            quality: 50
        });
        const stickerMessage = await sticker.toMessage();
        sock.sendMessage(m.key.remoteJid, stickerMessage, { quoted: m });
    } else if (m.message.videoMessage || isQuotedVideo) {
        const buffer = await downloadMediaMessage(m, 'buffer');
        // Note: Sticker maker may require ffmpeg to be installed on your system
        const sticker = new Sticker(buffer, {
            pack: 'DULHAN-MD',
            author: 'By My King',
            type: StickerTypes.FULL,
            quality: 40
        });
        const stickerMessage = await sticker.toMessage();
        sock.sendMessage(m.key.remoteJid, stickerMessage, { quoted: m });
    } else {
      m.reply('Please reply to an image or a short video to create a sticker.');
    }
  }
};
