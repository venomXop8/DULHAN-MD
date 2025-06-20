/**
 * DULHAN-MD - Ultimate Stylish List Menu
 * This version uses a List Message for a professional and clickable experience.
 * Powered by MALIK SAHAB
 */
const os = require('os');
const fs = require('fs');

// Helper function to format uptime in a readable way
function formatUptime(seconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    const hours = Math.floor(seconds / (60*60));
    const minutes = Math.floor(seconds % (60*60) / 60);
    const secs = Math.floor(seconds % 60);

    return `${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`;
}

module.exports = {
  command: ['menu', 'help', 'list'],
  description: 'Shows all available commands in a stylish, interactive list.',
  category: 'main',
  async handler(m) {
    const { sock, config, pushName, commands } = m;
    
    // Get bot's profile picture URL
    let profilePicUrl;
    try {
        profilePicUrl = await sock.profilePictureUrl(sock.user.id, 'image');
    } catch {
        profilePicUrl = config.PROFILE_PIC_URL; // Fallback to config URL if fetching fails
    }

    // Prepare header text with branding and system info
    const uptime = formatUptime(process.uptime());
    const headerText = `
Hello, *${pushName || 'Jaan'}*! 
Main aapki personal assistant, *${config.BOT_NAME}* 👰‍♀️
*Owner:* ${config.OWNER_NAME}
*Uptime:* ${uptime}
*Platform:* ${os.platform()}

Neeche di gayi list se command chunein.
    `;

    // Group commands by category
    const categories = {};
    const uniqueCommands = new Set();
    commands.forEach(cmd => {
        if (cmd && cmd.command && !uniqueCommands.has(cmd.command[0])) {
            const category = cmd.category ? cmd.category.toUpperCase() : 'MISC';
            if (!categories[category]) categories[category] = [];
            categories[category].push(cmd);
            uniqueCommands.add(cmd.command[0]);
        }
    });

    // Create sections for the list message
    const sections = [];
    // Define a professional order for categories
    const categoryOrder = ['MAIN', 'AI', 'DOWNLOADER', 'SEARCH', 'UTILITY', 'GROUP', 'FUN', 'OWNER', 'MISC'];
    
    for (const category of categoryOrder) {
        if (categories[category]) {
            sections.push({
                title: `*╭───┤ ${category} ├────╮*`,
                rows: categories[category].map(cmd => ({
                    title: `${config.PREFIX}${cmd.command[0]}`,
                    rowId: `${config.PREFIX}${cmd.command[0]}`, // User can click this to run the command
                    description: cmd.description || ''
                }))
            });
        }
    }

    const listMessage = {
      image: { url: profilePicUrl },
      caption: headerText,
      footer: `© Powered by MALIK SAHAB`,
      title: `*╔═.✾. ${config.BOT_NAME} .✾.═╗*`,
      buttonText: "COMMAND MENU",
      sections
    };

    await sock.sendMessage(m.key.remoteJid, listMessage, { quoted: m });
  }
};
