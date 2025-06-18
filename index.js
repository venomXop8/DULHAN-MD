/**
 * DULHAN-MD - Final & Rock-Solid Architecture
 * This version uses a professional, stable structure to prevent all errors.
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
    console.log(`[Plugins] ${commands.size} commands loaded successfully.`);
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
            const reasonText = DisconnectReason[reason] || 'Unknown';
            console.log(`❌ Connection closed. Reason: ${reasonText}.`);
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Attempting to reconnect in 5 seconds...");
                setTimeout(connectToWhatsApp, 5000);
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
            if (msg.key.fromMe) return; // Ignore messages from self by default

            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || "";

            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);

            if (command) {
                console.log(`Executing command: ${commandName}`);
                
                // --- THE ULTIMATE FIX ---
                // We attach all necessary context directly to the message object 'msg'
                msg.sock = sock;
                msg.config = config;
                msg.text = args.join(' ');
                msg.commands = commands;
                msg.downloadMediaMessage = downloadMediaMessage;
                msg.reply = (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

                // Execute the command handler with a single, complete object
                await command.handler(msg);
            }
        } catch (e) {
            console.error("Error in message handler:", e);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
