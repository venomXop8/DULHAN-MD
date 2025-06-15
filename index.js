/**
 * DULHAN-MD - Final & Complete Main Bot File
 * This version includes all features and the final error fix.
 */

// Core Baileys and Node.js modules
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage, BufferJSON, proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs'); // <--- YEH MISSING LINE ADD KAR DI GAYI HAI
const path = require('path');
const axios = require('axios');

// Bot configuration file
const config = require('./config');

// --- Dynamic Command Handler ---
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');
// ab 'fs.readdirSync' kaam karega
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

// To track bot's uptime
const startTime = Date.now();

// List of commands that will use the new stylish reply
const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info', 'namaz', 'prayer', 'salat', 'weather', 'mausam'];

async function connectToWhatsApp() {
    // --- Session ID Login Logic ---
    let sessionId = config.SESSION_ID;

    if (!sessionId) {
        console.error('❌ Error: SESSION_ID is not set in config.js.');
        console.log('Please generate a Session ID and add it to your config.js file.');
        return;
    }

    if (sessionId.includes('~')) {
        sessionId = sessionId.split('~')[1];
    }
    
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    try {
        const creds = JSON.parse(Buffer.from(sessionId, 'base64').toString('utf-8'));
        state.creds = creds;
    } catch (e) {
        console.error('❌ Failed to decode Session ID. It seems to be corrupted or invalid.');
        console.log('Please generate a new, valid Session ID.');
        return;
    }
    // --- End of Session ID Logic ---

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    // --- Connection Handling ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed, attempting to reconnect...");
                connectToWhatsApp();
            } else {
                 console.log("Connection Closed. You may need a new Session ID if you were logged out.");
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online and ready!`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);

    // --- Message Handling ---
    sock.ev.on('messages.upsert', async (m) => {
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
                    replyFunction = (text, options = {}) => {
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
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true,
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
                await sock.sendMessage(m.key.remoteJid, {text: 'Oops! Is command mein kuch gadbad ho gayi 😢'}, {quoted: msg});
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("An unexpected error occurred during connection: " + err));
