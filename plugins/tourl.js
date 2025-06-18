const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadToTelegraph(buffer) {
    const form = new FormData();
    form.append('file', buffer, { filename: 'temp.jpg' });
    const { data } = await axios.post('https://telegra.ph/upload', form, {
        headers: form.getHeaders(),
    });
    return `https://telegra.ph${data[0].src}`;
}

module.exports = {
  command: ['tourl', 'upload'],
  description: 'Uploads an image/video and provides a public link.',
  category: 'utility',
  async handler(m, { downloadMediaMessage }) {
    const msgType = Object.keys(m.message)[0];
    const isMedia = msgType === 'imageMessage' || msgType === 'videoMessage';
    const isQuotedMedia = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage &&
                          (m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage);

    if (!isMedia && !isQuotedMedia) {
      return m.reply('Please send or reply to an image/video to upload.');
    }

    try {
      await m.reply('Uploading media...');
      const buffer = await downloadMediaMessage(m, 'buffer');
      const url = await uploadToTelegraph(buffer);
      await m.reply(`*Your public link is ready:*\n${url}`);
    } catch (e) {
      m.reply('Sorry, media upload karne mein masla aa gaya.');
    }
  }
};
