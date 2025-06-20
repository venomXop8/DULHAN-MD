/**
 * DULHAN-MD - Ultimate Final Version
 * This version has a rock-solid foundation and passes context safely to all commands.
 * Powered by MALIK SAHAB
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    downloadMediaMessage,
    getContentType,
    proto
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
        printQRInTerminal: false, // We will handle QR code manually
        browser: Browsers.macOS('Desktop'),
    });

    // --- Event Handlers ---
    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("------------------------------------------------");
            console.log("QR Code Received, Please Scan!");
            qrcode.generate(qr, { small: true });
            console.log("------------------------------------------------");
        }
        if (connection === 'open') {
            console.log('✅ WhatsApp connection opened successfully!');
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
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
            if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) return;

            // Store message for Anti-Delete
            messageStore.set(msg.key.id, msg);

            // Auto-Seen Status
            if (msg.key.remoteJid === 'status@broadcast' && config.AUTO_SEEN_STATUS) {
                await sock.readMessages([msg.key]);
                console.log(`[Status Seen] Seen status from ${msg.pushName}`);
            }
        
            // Anti-View-Once
            if ((msg.message.viewOnceMessage || msg.message.viewOnceMessageV2) && config.ANTI_VIEW_ONCE) {
                const viewOnceMsg = msg.message.viewOnceMessage || msg.message.viewOnceMessageV2;
                const type = Object.keys(viewOnceMsg.message)[0];
                delete viewOnceMsg.message[type].viewOnce;
                const caption = viewOnceMsg.message[type].caption || "";
                await sock.sendMessage(m.key.remoteJid, {
                    ...viewOnceMsg.message,
                    caption: `*Anti-View-Once by DULHAN-MD*\n\n${caption}`
                }, { quoted: msg });
            }

            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || "";

            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);

            if (command) {
                console.log(`Executing command: ${commandName}`);
                
                // Attach all necessary context directly to the message object 'msg'
                msg.sock = sock;
                msg.config = config;
                msg.text = args.join(' ');
                msg.commands = commands;
                msg.downloadMediaMessage = downloadMediaMessage;
                msg.reply = (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

                await command.handler(msg);
            }
        } catch (e) {
            console.error("Error in message handler:", e);
        }
    });

    // Anti-Delete Handler
    const messageStore = new Map();
    sock.ev.on('messages.update', async (updates) => {
        if (!config.ANTI_DELETE) return;
        for (const { key, update } of updates) {
            if (update.messageStubType === proto.WebMessageInfo.MessageStubType.REVOKE && update.messageStubParameters) {
                const originalMsg = messageStore.get(key.id);
                if (originalMsg) {
                    await sock.sendMessage(key.remoteJid, {
                        text: `*Anti-Delete by DULHAN-MD* 😠\n\nUser @${key.participant.split('@')[0]} ne yeh message delete kiya tha:`,
                        mentions: [key.participant]
                    }, { quoted: originalMsg });
                }
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
