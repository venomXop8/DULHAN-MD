module.exports = {
  command: ['menu', 'help', 'list'],
  description: 'Shows the list of all available commands.',
  category: 'main',
  async handler(m, { commands }) {
    let menuText = `👰‍♀️ *DULHAN-MD MENU* 👰‍♀️\n\nHello! Main aapki personal assistant Dulhan-MD hoon. Yeh rahi meri command list:\n`;

    // Group commands by category
    const categories = {};
    const uniqueCommands = new Set();

    commands.forEach(cmd => {
        if (!uniqueCommands.has(cmd.command[0])) {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(cmd);
            uniqueCommands.add(cmd.command[0]);
        }
    });

    for (const category in categories) {
        menuText += `\n*╭───[ ${category.toUpperCase()} ]───╮*\n`;
        categories[category].forEach(cmd => {
            menuText += `│ • *.${cmd.command[0]}* - ${cmd.description}\n`;
        });
        menuText += `*╰────────────╯*\n`;
    }

    menuText += `\n*Note:* Kisi bhi command ke saath .help laga kar details dekh sakte hain.`;
    
    m.reply(menuText);
  }
};
