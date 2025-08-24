// plugins/antidelete.js
let antiDeleteEnabled = true; 
module.exports = {
    command: ['antidelete'],
    description: 'Enables or disables the anti-delete feature.',
    category: 'owner',
    async handler(m, { text }) {
        if (!m.key.fromMe) return m.reply("This is an owner command.");
        const action = text.toLowerCase().trim();
        if (action === 'on') {
            antiDeleteEnabled = true;
            m.reply("Anti-Delete feature is now ON.");
        } else if (action === 'off') {
            antiDeleteEnabled = false;
            m.reply("Anti-Delete feature is now OFF.");
        } else {
            m.reply("Please use `.antidelete on` or `.antidelete off`.");
        }
    }
};
