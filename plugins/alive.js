const { existsSync } = require('fs');

function formatUptime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    seconds %= 60; minutes %= 60; hours %= 24;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  command: ['alive', 'ping'],
  description: 'Checks if the bot is online and shows uptime.',
  category: 'main',
  async handler(m) {
    const { sock, config, startTime } = m; // FIX: Destructure from 'm'
    const uptime = formatUptime(Date.now() - startTime);
    const aliveText = `
*╔═══ ≪ °❈° ≫ ═══╗*
  *DULHAN-MD IS ALIVE*
*╚═══ ≪ °❈° ≫ ═══╝*

*〝Don't worry, main yahin hoon. Aapke liye hamesha online...〞*

*┌─── ∘°❉°∘ ───┐*
  *Uptime: ${uptime}*
  *Owner: ${config.OWNER_NAME}*
*└─── °∘❉∘° ───┘*
    `;
    
    await m.reply(aliveText);
    
    if (existsSync(config.AUDIO_REPLY_PATH)) {
        await sock.sendMessage(m.key.remoteJid, {
            audio: { url: config.AUDIO_REPLY_PATH },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: m });
    }
  }
};
