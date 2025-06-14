module.exports = {
  command: ['menu', 'help', 'list'],
  description: 'Shows the list of all available commands.',
  category: 'main',
  async handler(m, { commands, config }) {
    let menuText = `
Hello, *${m.pushName || 'Jaan'}*! 
Main aapki personal assistant, *${config.BOT_NAME}* 👰‍♀️
*╔═.✾. ═══════════╗*
        *COMMAND MENU*
*╚═══════════.✾. ═╝*
`;

    const categories = {};
    const uniqueCommands = new Set();

    commands.forEach(cmd => {
        if (!uniqueCommands.has(cmd.command[0])) {
            const category = cmd.category.toUpperCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(cmd);
            uniqueCommands.add(cmd.command[0]);
        }
    });

    for (const category in categories) {
        menuText += `
*┌─── ∘°❉°∘ ───┐*
       *${category}*
*└─── °∘❉∘° ───┘*
`;
        categories[category].forEach(cmd => {
            menuText += `  ⦿ *.${cmd.command[0]}*\n`;
        });
    }

    menuText += `\n*Note:* Kisi bhi command ke saath *.help* laga kar details dekh sakte hain.`;
    
    m.reply(menuText);
  }
};
