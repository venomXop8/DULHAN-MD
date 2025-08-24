// plugins/autoseen.js
let autoSeenEnabled = true; // This should be moved to a central config later
module.exports = {
    command: ['autoseen'],
    description: 'Enables or disables auto-seeing status updates.',
    category: 'owner',
    async handler(m, { text }) {
        if (!m.key.fromMe) return m.reply("This is an owner command.");
        const action = text.toLowerCase().trim();
        if (action === 'on') {
            autoSeenEnabled = true;
            m.reply("Auto-Seen feature is now ON.");
        } else if (action === 'off') {
            autoSeenEnabled = false;
            m.reply("Auto-Seen feature is now OFF.");
        } else {
            m.reply("Please use `.autoseen on` or `.autoseen off`.");
        }
    }
};
