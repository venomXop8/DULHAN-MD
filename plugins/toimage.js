module.exports = {
  command: ['toimage', 'toimg'],
  description: 'Converts a sticker to an image.',
  category: 'utility',
  async handler(m, { downloadMediaMessage }) {
    const msgType = Object.keys(m.message)[0];
    const isQuotedSticker = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.stickerMessage;

    if (!isQuotedSticker) {
      return m.reply('Please reply to a sticker to convert it to an image.');
    }
    
    try {
      await m.reply('Sticker ko photo bana rahi hoon...');
      const buffer = await downloadMediaMessage(m, 'buffer');
      await m.sock.sendMessage(m.key.remoteJid, { image: buffer }, { quoted: m });
    } catch (e) {
      m.reply('Sorry, is sticker ko convert nahi kar saki.');
    }
  }
};
