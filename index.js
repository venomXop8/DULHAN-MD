/**
 * DULHAN-MD - Final Version with Dual Login (Session ID & QR Code)
 * This version will use Session ID if available, otherwise it will show a QR code.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// --- Dynamic Command Handler ---
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');
const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
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
const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info', 'namaz', 'prayer', 'salat', 'weather', 'mausam'];

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    let sock;

    // --- DUAL LOGIN LOGIC ---
    if (config.SESSION_ID) {
        console.log('Attempting to connect with Session ID...');
        let sessionId = config.SESSION_ID;
        if (sessionId.includes('~')) {
            sessionId = sessionId.split('~')[1];
        }
        try {
            const creds = JSON.parse(Buffer.from(sessionId, 'base64').toString('utf-8'));
            state.creds = creds;
        } catch (e) {
            console.error('❌ Failed to decode Session ID. It seems to be corrupted. Starting with QR Code instead.');
            // Fallback to QR code if session is invalid
            sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state, browser: Browsers.macOS('Desktop') });
        }
    }
    
    // If sock is not created yet (i.e., no valid session), create it for QR
    if (!sock) {
        console.log('No valid Session ID found. Starting with QR Code...');
        sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state, browser: Browsers.macOS('Desktop') });
    }
    // --- END OF DUAL LOGIN LOGIC ---

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("------------------------------------------------");
            console.log("Please scan this QR code with your WhatsApp.");
            qrcode.generate(qr, { small: true });
            console.log("------------------------------------------------");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed, reconnecting...");
                connectToWhatsApp();
            } else {
                console.log("Connection Closed. If you were using a Session ID, it might have expired. Please generate a new one or scan the QR code.");
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online and ready!`);
            // Upon successful connection, save the new session details
            await saveCreds(); 
        }
    });
    
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        // ... (Message handling logic poori wesi hi rahegi)
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
                if (stylishCommands.includes(commandName)) {
                    replyFunction = (text) => {
                         let thumbPath = './dulhan_thumbnail.jpg';
                        return sock.sendMessage(m.key.remoteJid, {
                            text: text,
                            contextInfo: {
                                externalAdReply: {
                                    title: `👰‍♀️ ${config.BOT_NAME}`,
                                    body: `Owner: ${config.OWNER_NAME}`,
                                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : {url: config.PROFILE_PIC_URL},
                                    sourceUrl: config.CHANNEL_LINK,
                                    mediaUrl: config.CHANNEL_LINK,
                                }
                            }
                        }, { quoted: msg });
                    };
                } else {
                    replyFunction = (text) => {
                        const footerText = `\n\n*Powered by ${config.BOT_NAME}*`;
                        return sock.sendMessage(m.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    };
                }
                
                const messageObject = { ...msg, reply: replyFunction, sock, config, startTime };
                await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });

            } catch (e) {
                console.error(`Error in command '${commandName}':`, e);
                await sock.sendMessage(m.key.remoteJid, {text: 'Oops! Is command mein kuch gadbad ho gayi 😢'}, {quoted: m.messages[0]});
            }
        }
    });
}

connectToWhatsApp().catch(err => console.log("Unexpected error:", err));
