/**
 * DULHAN-MD - Set Profile Picture Command
 * Powered by MALIK SAHAB
 */
module.exports = {
  command: ['dp', 'setpp'],
  description: "Sets the bot's profile picture. (Owner only)",
  category: 'owner',
  async handler(m) {
    const { sock, config, downloadMediaMessage, reply } = m;
    
    // Owner check
    const isOwner = m.key.fromMe || m.sender.startsWith(config.OWNER_NUMBER);
    if (!isOwner) return reply('Yeh command sirf mera malik (owner) istemal kar sakta hai! 😏');

    const msgType = Object.keys(m.message)[0];
    const isQuotedImage = msgType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage;

    if (!isQuotedImage) {
      return reply('Bot ki profile picture badalne ke liye, kisi photo ko reply karke yeh command likhein: *.dp*');
    }
    
    try {
      await reply('Aapki pasand ki DP laga rahi hoon, Malik Sahab...');
      const buffer = await downloadMediaMessage(m, 'buffer');
      await sock.updateProfilePicture(sock.user.id, buffer);
      await reply('✅ Profile picture kamyabi se badal di gayi hai!');
    } catch (e) {
      console.error("Set DP Error:", e);
      reply('❌ Photo lagane mein koi masla aa gaya.');
    }
  }
};
