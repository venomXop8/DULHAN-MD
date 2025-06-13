function formatUptime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  command: ['alive', 'ping', 'status'],
  description: 'Checks if the bot is online and shows uptime.',
  category: 'main',
  async handler(m) {
    const uptime = formatUptime(Date.now() - m.startTime);
    const aliveText = `
👰‍♀️ *Dulhan is Alive & Ready!* 👰‍♀️

*Status:* Bilkul Theek Thaak 😏
*Uptime:* ${uptime}
*Mood:* Har waqt romantic 💖

Aap hukum karein, jaan bhi hazir hai!
    `;
    m.reply(aliveText);
  }
};
