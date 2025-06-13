module.exports = {
  command: ['owner', 'creator'],
  description: 'Shows the contact of the bot owner.',
  category: 'main',
  async handler(m) {
    const ownerVCard = `BEGIN:VCARD\n`
                     + `VERSION:3.0\n` 
                     + `FN:${m.BOT_CONFIG.ownerName}\n` // Owner's name
                     + `ORG:DULHAN-MD Bot;\n`
                     + `TEL;type=CELL;type=VOICE;waid=${m.BOT_CONFIG.ownerNumber}:${m.BOT_CONFIG.ownerNumber}\n` // Owner's number
                     + `END:VCARD`;

    await m.sock.sendMessage(
        m.key.remoteJid,
        { 
            contacts: { 
                displayName: m.BOT_CONFIG.ownerName, 
                contacts: [{ vcard: ownerVCard }] 
            }
        },
        { quoted: m }
    );
  }
};
