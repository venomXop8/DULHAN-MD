/**
 * DULHAN-MD - Main Bot File (Using QR Code)
 * This version prints a QR code in the terminal for linking.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { readdirSync, existsSync } = require('fs');
const path = require('path');
const config = require('./config'); // Assuming you are using the config file

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

// To track bot's uptime
const startTime = Date.now();

async function connectToWhatsApp() {
    // We use a folder named 'sessions' to store authentication data
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // This is the magic line that enables QR code
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("------------------------------------------------");
            console.log("QR code received, please scan with WhatsApp!");
            console.log("------------------------------------------------");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online!`);
            try {
                await sock.updateProfilePicture(sock.user.id, { url: config.PROFILE_PIC_URL });
                console.log('Profile picture updated!');
            } catch (e) {
                console.error('Failed to update profile picture:', e);
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        // ... (The message handling logic remains exactly the same)
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

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
                const advancedReply = async (text) => {
                    const footerText = `\n\n*Powered by ${config.BOT_NAME}*\n${config.CHANNEL_LINK}`;
                    await sock.sendMessage(msg.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    if (existsSync(config.AUDIO_REPLY_PATH)) {
                        await sock.sendMessage(msg.key.remoteJid, { audio: { url: config.AUDIO_REPLY_PATH }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
                    }
                };
                
                const messageObject = { ...msg, reply: advancedReply, sock, BOT_CONFIG: config, startTime };
                await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });

            } catch (e) {
                console.error(`Error in command ${commandName}:`, e);
                 await sock.sendMessage(msg.key.remoteJid, {text: 'Oops! Kuch gadbad ho gayi 😢'}, {quoted: m.messages[0]});
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("Unexpected error: " + err));
