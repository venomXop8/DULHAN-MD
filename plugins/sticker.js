/**
 * DULHAN-MD Sticker Command (API Based - Reliable Version)
 * This version uses an external API to create stickers, which is more reliable.
 */

const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  command: ['sticker', 's', 'stiker'],
  description: 'Converts image, short video, or GIF to a sticker.',
  category: 'fun',
  
  async handler(m, { sock, downloadMediaMessage }) {
    // Check if the message is a reply to an image, video, or if it contains one
    const msgType = Object.keys(m.message)[0];
    const isMedia = msgType === 'imageMessage' || msgType === 'videoMessage';
    const isQuotedMedia = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo.quotedMessage && 
                          (m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage);

    if (isMedia || isQuotedMedia) {
      await m.reply('STICKER BAN RAHA HAI, JAAN... ⏳');
      try {
        const buffer = await downloadMediaMessage(m, 'buffer');
        
        // Use an external API to process the sticker
        const stickerBuffer = await this.createSticker(buffer);

        // Send the sticker
        await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });
      } catch (error) {
        console.error('Sticker Creation Error:', error);
        m.reply(`❌ Sticker banane mein masla aa gaya. ${error.message}`);
      }
    } else {
      m.reply('Please reply to an image, GIF, or a short video with the command *.sticker*');
    }
  },

  /**
   * Function to call the external API
   * @param {Buffer} mediaBuffer - The buffer of the image/video
   * @returns {Promise<Buffer>} - A promise that resolves with the sticker buffer
   */
  async createSticker(mediaBuffer) {
    const form = new FormData();
    form.append('image', mediaBuffer, { filename: 'sticker.jpg' }); // Append buffer with a filename

    try {
      const { data } = await axios.post('https://sticker-api.openwa.dev/convert', form, {
        headers: {
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      });
      return data;
    } catch (e) {
      // Throw a more user-friendly error
      throw new Error(e.response?.data?.message || e.message || 'API is currently down.');
    }
  }
};
