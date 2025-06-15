/**
 * DULHAN-MD - Tag All Group Members
 */

module.exports = {
  command: ['sabko-bulao', 'tagall', 'attention'],
  description: 'Mentions all members in a group.',
  category: 'group',
  
  async handler(m, { text, sock }) {
    if (!m.key.remoteJid.endsWith('@g.us')) {
        return m.reply('Yeh command sirf groups mein kaam karta hai, Shehzade!');
    }

    try {
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;

        let tagMessage = `*╔═══ ≪ °📢° ≫ ═══╗*\n  *ATTENTION EVERYONE*\n*╚═══ ≪ °📢° ≫ ═══╝*\n\n`;
        
        // Add a custom message if provided by the user
        if (text) {
            tagMessage += `*Message from Admin:* ${text}\n\n`;
        } else {
            tagMessage += `Sab log yahan haazir hon, admin ne bulaya hai!\n\n`;
        }
        
        const mentions = [];
        for (let participant of participants) {
            tagMessage += `⦿ @${participant.id.split('@')[0]}\n`;
            mentions.push(participant.id);
        }

        // Send the message with mentions
        await sock.sendMessage(m.key.remoteJid, {
            text: tagMessage,
            mentions: mentions
        }, { quoted: m });

    } catch (error) {
        console.error("Tag All Error:", error);
        m.reply("Sab ko tag karne mein masla aa gaya. Shayad main is group mein admin nahi hoon.");
    }
  }
};
