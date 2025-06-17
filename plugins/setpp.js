const axios = require('axios');

module.exports = {
  command: ['setpp', 'dp', 'setprofile'],
  description: 'Sets the profile picture of the bot.',
  category: 'owner',
  async handler(m, { downloadMediaMessage }) {
    const { sock, config } = m; // FIX: Destructure from 'm'
    const isOwner = m.key.fromMe || m.sender === (config.OWNER_NUMBER + '@s.whatsapp.net');
    
    if (!isOwner) {
      return m.reply('Yeh command sirf mera malik (owner) istemal kar sakta hai! 😏');
    }

    const msgType = Object.keys(m.message)[0];
    const isQuotedImage = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage;

    if (!isQuotedImage) {
      return m.reply('Bot ki profile picture badalne ke liye, kisi photo ko reply karke yeh command likhein: *.setpp*');
    }
    
    try {
      await m.reply('Aapki pasand ki DP laga rahi hoon, Malik Sahab...');
      const buffer = await downloadMediaMessage(m, 'buffer');
      await sock.updateProfilePicture(sock.user.id, buffer);
      await m.reply('✅ Profile picture kamyabi se badal di gayi hai!');
    } catch (error) {
      console.error("Set Profile Picture Error:", error);
      m.reply('❌ Photo lagane mein koi masla aa gaya.');
    }
  }
};
