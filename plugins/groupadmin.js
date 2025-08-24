module.exports = {
    command: ['promote', 'demote'],
    description: 'Promotes or demotes a user in a group.',
    category: 'group',
    async handler(m) {
        const { sock, key, body } = m;
        if (!key.remoteJid.endsWith('@g.us')) return m.reply('This command is for groups only.');

        const command = body.split(' ')[0].toLowerCase().slice(1);
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!mentionedJid) return m.reply('Please mention a user to ' + command);

        try {
            const groupMetadata = await sock.groupMetadata(key.remoteJid);
            const botIsAdmin = groupMetadata.participants.find(p => p.id === sock.user.id)?.admin;
            if (!botIsAdmin) return m.reply("Main is group mein admin nahi hoon!");
            
            const action = command === 'promote' ? 'admin' : 'member';
            await sock.groupParticipantsUpdate(key.remoteJid, [mentionedJid], action);
            m.reply(`Successfully ${command}d @${mentionedJid.split('@')[0]}.`);
        } catch (e) {
            m.reply(`Failed to ${command} user.`);
        }
    }
};
