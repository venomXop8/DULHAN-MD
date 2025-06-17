/**
 * DULHAN-MD - Ultimate Final Version
 * This version has a rock-solid foundation and a safe command handler.
 */

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
const pluginDir = path.join(__dirname, 'plugins');
try {
    const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try {
            delete require.cache[require.resolve(path.join(pluginDir, file))];
            const plugin = require(path.join(pluginDir, file));
            if (plugin.command && plugin.handler) {
                plugin.command.forEach(cmd => commands.set(cmd, plugin));
            }
        } catch (e) {
            console.error(`Error loading plugin ${file}:`, e);
        }
    }
    console.log("[Plugins] All plugins loaded successfully.");
} catch (e) {
    console.error("Could not read plugins directory:", e);
}


// --- Main Connection Logic ---
async function connectToWhatsApp() {
    console.log("Starting DULHAN-MD...");
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.macOS('Desktop'),
    });

    // --- Event Handlers ---
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log("QR Code available, please scan.");
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('✅ WhatsApp connection opened successfully!');
        }
        if (connection === 'close') {
            const reason = update.lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ Connection closed. Reason: ${DisconnectReason[reason] || 'Unknown'}. Reconnecting...`);
            setTimeout(connectToWhatsApp, 5000);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

            // This is a safe way to get message text
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || "";

            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);

            if (command) {
                console.log(`Executing command: ${commandName}`);
                // Safely create the message object to pass to handlers
                const messageObject = {
                    ...msg,
                    sock: sock,
                    config: config,
                    reply: (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
                };
                
                // Pass other utilities in the second argument
                const utils = {
                    text: args.join(' '),
                    commands: commands,
                    downloadMediaMessage: downloadMediaMessage
                };

                await command.handler(messageObject, utils);
            }
        } catch (e) {
            console.error("Error in message handler:", e);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
