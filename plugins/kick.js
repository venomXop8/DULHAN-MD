// plugins/kick.js
module.exports = {
    command: ['kick', 'remove'],
    description: 'Removes a user from the group.',
    category: 'group',
    async handler(m) {
        if (!m.key.remoteJid.endsWith('@g.us')) return m.reply('This is a group command.');
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) return m.reply('Please mention a user to kick.');
        try {
            await m.sock.groupParticipantsUpdate(m.key.remoteJid, [mentionedJid], 'remove');
            m.reply(`Successfully kicked @${mentionedJid.split('@')[0]}.`);
        } catch (e) { m.reply("Failed to kick user. Am I an admin?"); }
    }
};
