/**
 * DULHAN-MD - Final Version using Session ID
 * This version reads the Session ID from config.js and connects directly.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage, BufferJSON, proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const { readdirSync, existsSync } = require('fs');
const path = require('path');
const config = require('./config'); // config.js ko import kiya

// --- Dynamic Command Handler ---
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');
const files = readdirSync(pluginDir).filter(file => file.endsWith('.js'));
for (const file of files) {
    try {
        const plugin = require(path.join(pluginDir, file));
        if (plugin.command && plugin.handler) {
            plugin.command.forEach(cmd => commands.set(cmd, plugin));
            console.log(`[Plugin Loaded] ${file}`);
        }
    } catch (e) {
        console.error(`Error loading plugin ${file}:`, e);
    }
}

const startTime = Date.now();

async function connectToWhatsApp() {
    // --- NAYI SESSION ID LOGIC ---
    let sessionId = config.SESSION_ID;

    if (!sessionId) {
        console.error('❌ Error: SESSION_ID is not set in config.js.');
        console.log('Please generate a Session ID and add it to your config.js file.');
        return;
    }

    // Agar custom prefix wali ID hai, to usko aalag karein
    if (sessionId.startsWith("DULHAN-MD~")) {
        sessionId = sessionId.split('~')[1];
    }

    // Temporary auth state banayein
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    try {
        // Session ID ko decode karke state mein daalein
        const creds = JSON.parse(Buffer.from(sessionId, 'base64').toString('utf-8'));
        state.creds = creds;
    } catch (e) {
        console.error('❌ Failed to decode Session ID. It seems to be corrupted or invalid.');
        console.log('Please generate a new, valid Session ID.');
        return;
    }
    // --- END OF NEW LOGIC ---

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // QR ki ab zaroorat nahi
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                 console.log("Connection Closed, Not Reconnecting. You may need a new Session ID.");
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online!`);
            try {
                const response = await axios.get(config.PROFILE_PIC_URL, { responseType: 'arraybuffer' });
                await sock.updateProfilePicture(sock.user.id, Buffer.from(response.data, 'binary'));
                console.log('✅ Profile picture updated!');
            } catch (e) {
                console.error('❌ Failed to update profile picture:', e.message);
            }
        }
    });
    
    // Yahan creds.update wala listener lagana zaroori hai
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        // ... (Message handling logic poori wesi hi rahegi, koi tabdeeli nahi)
        const msg = m.messages[0];
        if (!msg.message) return;

        const messageType = Object.keys(msg.message)[0];
        const body = (messageType === 'conversation') ? msg.message.conversation :
                     (messageType === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                     (messageType === 'imageMessage') ? msg.message.imageMessage.caption :
                     (messageType === 'videoMessage') ? msg.message.videoMessage.caption : '';

        const prefix = config.PREFIX;
        if (!body || !body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commands.get(commandName);

        if (command) {
            try {
                let replyFunction;
                const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info'];

                if (stylishCommands.includes(commandName)) {
                    replyFunction = (text, options = {}) => {
                         let thumbPath = './dulhan_thumbnail.jpg';
                         if (!existsSync(thumbPath)) thumbPath = config.PROFILE_PIC_URL; // Fallback
                        return sock.sendMessage(m.key.remoteJid, {
                            text: text,
                            contextInfo: {
                                externalAdReply: {
                                    title: `👰‍♀️ ${config.BOT_NAME}`,
                                    body: config.OWNER_NAME,
                                    thumbnail: existsSync(thumbPath) ? fs.readFileSync(thumbPath) : {url: thumbPath},
                                    sourceUrl: config.CHANNEL_LINK,
                                    mediaUrl: config.CHANNEL_LINK,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true,
                                }
                            }
                        }, { quoted: msg });
                    };
                } else {
                    replyFunction = (text) => {
                        const footerText = `\n\n*Powered by ${config.BOT_NAME}*\n${config.CHANNEL_LINK}`;
                        return sock.sendMessage(m.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    };
                }
                
                const messageObject = { ...msg, reply: replyFunction, sock, config, startTime };
                await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });

            } catch (e) {
                console.error(`Error in command ${commandName}:`, e);
                 await sock.sendMessage(m.key.remoteJid, {text: 'Oops! Kuch gadbad ho gayi 😢'}, {quoted: m.messages[0]});
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("Unexpected error: " + err));
