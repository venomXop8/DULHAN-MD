/**
 * DULHAN-MD - Alive Command
 * Powered by MALIK SAHAB
 */
const os = require('os');

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  command: ['alive', 'ping'],
  description: 'Checks if the bot is online and shows uptime.',
  category: 'main',
  async handler(m) {
    const { config } = m;
    const uptime = formatUptime(process.uptime());
    
    const aliveText = `
*╔═══ ≪ °❈° ≫ ═══╗*
  *DULHAN-MD IS ALIVE*
*╚═══ ≪ °❈° ≫ ═══╝*

*〝Main bilkul theek aur aapki khidmat ke liye taiyar hoon!〞*

*┌─── ∘°❉°∘ ───┐*
  *Uptime:* ${uptime}
  *Owner:* ${config.OWNER_NAME}
*└─── °∘❉∘° ───┘*
    `;
    
    await m.reply(aliveText);
  }
};
