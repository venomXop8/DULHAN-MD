/**
 * DULHAN-MD - Set Profile Picture Command
 * This command allows the bot owner to change the bot's profile picture.
 */
const axios = require('axios');

module.exports = {
  command: ['setpp', 'dp', 'setprofile'],
  description: 'Sets the profile picture of the bot.',
  category: 'owner',
  
  /**
   * @param {object} m The message object
   * @param {object} options
   * @param {object} options.sock The socket instance
   * @param {object} options.config The bot configuration
   * @param {function} options.downloadMediaMessage The function to download media
   */
  async handler(m, { sock, config, downloadMediaMessage }) {
    // Sabse pehle check karein ke command istemal karne wala owner hai ya nahi
    const isOwner = m.sender === (config.OWNER_NUMBER + '@s.whatsapp.net');
    
    if (!isOwner) {
      return m.reply('Yeh command sirf mera malik (owner) istemal kar sakta hai. Aap nahi! 😏');
    }

    // Check karein ke user ne kisi image ko reply kiya hai ya nahi
    const msgType = Object.keys(m.message)[0];
    const isQuotedImage = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage;

    if (!isQuotedImage) {
      return m.reply('Bot ki profile picture badalne ke liye, kisi photo ko reply karke yeh command likhein: *.setpp*');
    }
    
    try {
      await m.reply('Aapki pasand ki DP laga rahi hoon, Malik Sahab...');
      
      // Quoted message se image download karein
      const buffer = await downloadMediaMessage(m, 'buffer');

      // Profile picture update karein
      await sock.updateProfilePicture(sock.user.id, buffer);

      await m.reply('✅ Profile picture kamyabi se badal di gayi hai!');

    } catch (error) {
      console.error("Set Profile Picture Error:", error);
      m.reply('❌ Photo lagane mein koi masla aa gaya. Please try again.');
    }
  }
};
