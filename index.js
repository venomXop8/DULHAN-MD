/**
 * DULHAN-MD - Final Professional Version
 * This version uses a more robust and modular structure to prevent errors.
 */

// Core Baileys and Node.js modules
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    downloadMediaMessage,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// --- Command Loader ---
const commands = new Map();

function loadCommands() {
    const pluginDir = path.join(__dirname, 'plugins');
    try {
        const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                // Clear cache to get fresh file on restart
                delete require.cache[require.resolve(path.join(pluginDir, file))];
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
}

// --- Main Connection Logic ---
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // Let Baileys handle this initially
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    // --- Event Handlers ---
    sock.ev.on('connection.update', (update) => handleConnectionUpdate(sock, update));
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', (m) => handleMessages(sock, m));
}

// --- Event Handler Functions ---

function handleConnectionUpdate(sock, update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
        console.log("------------------------------------------------");
        console.log("QR Code Received, Please Scan!");
        qrcode.generate(qr, { small: true });
        console.log("------------------------------------------------");
    }

    if (connection === 'close') {
        const statusCode = lastDisconnect.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.error(`❌ Connection Closed. Reason: ${DisconnectReason[statusCode] || 'Unknown'}`);

        if (shouldReconnect) {
            console.log("Attempting to reconnect...");
            connectToWhatsApp();
        } else {
            console.log("Connection permanently closed. You might need to delete the 'sessions' folder and scan again.");
        }
    } else if (connection === 'open') {
        console.log(`👰‍♀️ ${config.BOT_NAME} is now online and ready!`);
    }
}

async function handleMessages(sock, m) {
    const msg = m.messages[0];
    // Ignore status updates and messages without content
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    try {
        const messageType = getContentType(msg.message);
        let body = '';

        if (messageType === 'conversation') {
            body = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage?.caption) {
            body = msg.message.imageMessage.caption;
        } else if (msg.message.videoMessage?.caption) {
            body = msg.message.videoMessage.caption;
        }

        if (!body || !body.startsWith(config.PREFIX)) {
            return;
        }

        const args = body.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commands.get(commandName);

        if (command) {
            const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info', 'namaz', 'prayer', 'salat', 'weather', 'mausam'];
            
            // This is a safer way to create the reply function
            const reply = (text) => {
                if (stylishCommands.includes(commandName)) {
                    let thumbPath = './dulhan_thumbnail.jpg';
                    return sock.sendMessage(m.key.remoteJid, {
                        text: text,
                        contextInfo: {
                            externalAdReply: {
                                title: `👰‍♀️ ${config.BOT_NAME}`,
                                body: `Owner: ${config.OWNER_NAME}`,
                                thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: config.PROFILE_PIC_URL },
                                sourceUrl: config.CHANNEL_LINK,
                                mediaUrl: config.CHANNEL_LINK
                            }
                        }
                    }, { quoted: msg });
                } else {
                    const footerText = `\n\n*Powered by ${config.BOT_NAME}*`;
                    return sock.sendMessage(m.key.remoteJid, { text: text + footerText }, { quoted: msg });
                }
            };

            const messageObject = { ...msg, reply, sock, config, startTime: Date.now() }; // Pass a fresh startTime
            await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });
        }
    } catch (e) {
        console.error("Error processing message:", e);
    }
}


// --- Initial Startup ---
loadCommands();
connectToWhatsApp().catch(err => console.error("Startup Error:", err));
