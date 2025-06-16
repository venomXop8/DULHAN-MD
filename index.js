/**
 * DULHAN-MD - Final & Safest Main Bot File
 * This version includes robust message parsing and error handling.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// --- Dynamic Command Handler ---
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');
try {
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
} catch (e) {
    console.error("Could not read plugins directory:", e);
}


const startTime = Date.now();
const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info', 'namaz', 'prayer', 'salat', 'weather', 'mausam'];

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // We will let this be true and handle it in connection.update
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    // --- Connection Handling ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("------------------------------------------------");
            console.log("QR Code Received, Please Scan!");
            qrcode.generate(qr, { small: true });
            console.log("------------------------------------------------");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed, reconnecting...");
                connectToWhatsApp();
            } else {
                console.log("Connection Closed. You have been logged out.");
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online and ready!`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);

    // --- Message Handling ---
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        
        // Allows self-testing
        // if (msg.key.fromMe) return; 

        try {
            const messageType = getContentType(msg.message);
            const body = (messageType === 'conversation') ? msg.message.conversation :
                         (messageType === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                         (msg.message.imageMessage?.caption) || (msg.message.videoMessage?.caption) || '';

            if (!body || !body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            const command = commands.get(commandName);

            if (command) {
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
            }
        } catch (e) {
            console.error("Error in messages.upsert event:", e);
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("An unexpected error occurred:", err));
