/**
 * DULHAN-MD - Bot Status Command
 * Powered by MALIK SAHAB
 */
const os = require('os');
const human = require('human-readable');

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  command: ['status', 'botstatus', 'info'],
  description: 'Shows the technical status of the bot.',
  category: 'main',
  async handler(m) {
    const { config, commands } = m;
    const totalmem = os.totalmem();
    const freemem = os.freemem();
    const usedmem = totalmem - freemem;

    const statusText = `
*╔═══ ≪ °🤖° ≫ ═══╗*
    *DULHAN-MD BOT STATUS*
*╚═══ ≪ °🤖° ≫ ═══╝*

*⦿ Owner:* ${config.OWNER_NAME}
*⦿ Bot Name:* ${config.BOT_NAME}
*⦿ Total Commands:* ${commands.size}
*⦿ Prefix:* ${config.PREFIX}

*╭─── ∘°Server Info°∘ ───╮*
  *💻 Platform:* ${os.platform()}
  *🐏 RAM Usage:* ${human.fileSize(usedmem)} / ${human.fileSize(totalmem)}
  *⏰ Uptime:* ${formatUptime(process.uptime())}
*╰─────────────╯*

*© Powered by MALIK SAHAB*
    `;
    
    await m.reply(statusText);
  }
};
