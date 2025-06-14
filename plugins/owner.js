module.exports = {
  command: ['owner', 'creator'],
  description: 'Shows the contact of the bot owner.',
  category: 'main',
  async handler(m, { sock, config }) {
    const ownerVCard = `BEGIN:VCARD\n`
                     + `VERSION:3.0\n` 
                     + `FN:${config.OWNER_NAME}\n` 
                     + `ORG:${config.BOT_NAME};\n`
                     + `TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}\n`
                     + `END:VCARD`;

    await sock.sendMessage(
        m.key.remoteJid,
        { 
            contacts: { 
                displayName: config.OWNER_NAME, 
                contacts: [{ vcard: ownerVCard }] 
            },
            contextInfo: { // Yahan bhi channel ka zikr kar dete hain
                externalAdReply: {
                    title: `👰‍♀️ ${config.BOT_NAME}`,
                    body: `Owner: ${config.OWNER_NAME}`,
                    thumbnail: fs.readFileSync('./dulhan_thumbnail.jpg'),
                    sourceUrl: config.CHANNEL_LINK,
                    mediaUrl: config.CHANNEL_LINK,
                }
            }
        },
        { quoted: m }
    );
  }
};
