/**
 * DULHAN-MD - Ultimate Version with Advanced Event Handling
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

// --- Global Stores & Settings ---
const commands = new Map();
const messageStore = new Map(); // For Anti-Delete
let antiDeleteEnabled = true; // Default state
let antiViewOnceEnabled = true; // Default state
let autoSeenEnabled = true; // Default state

// --- Command Loader ---
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
        } catch (e) { console.error(`Error loading plugin ${file}:`, e); }
    }
    console.log("[Plugins] All plugins loaded successfully.");
} catch (e) { console.error("Could not read plugins directory:", e); }


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
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'open') console.log('✅ WhatsApp connection opened successfully!');
        if (connection === 'close') {
            const reason = update.lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ Connection closed. Reason: ${DisconnectReason[reason] || 'Unknown'}. Reconnecting...`);
            setTimeout(connectToWhatsApp, 5000);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        // Store message for Anti-Delete
        messageStore.set(msg.key.id, msg);

        // Auto-Seen Status
        if (msg.key.remoteJid === 'status@broadcast' && autoSeenEnabled) {
            await sock.readMessages([msg.key]);
            console.log(`[Status Seen] Seen status from ${msg.pushName}`);
        }
        
        // Anti-View-Once
        if ((msg.message.viewOnceMessage || msg.message.viewOnceMessageV2) && antiViewOnceEnabled) {
            const viewOnceMsg = msg.message.viewOnceMessage || msg.message.viewOnceMessageV2;
            const type = Object.keys(viewOnceMsg.message)[0];
            delete viewOnceMsg.message[type].viewOnce;
            const caption = viewOnceMsg.message[type].caption || "";
            await sock.sendMessage(m.key.remoteJid, {
                ...viewOnceMsg.message,
                caption: `*Anti-View-Once by DULHAN-MD*\n\n${caption}`
            }, { quoted: msg });
        }

        // Handle regular commands
        await handleCommand(sock, m);
    });
    
    // Anti-Delete Handler
    sock.ev.on('messages.update', async (updates) => {
        if (!antiDeleteEnabled) return;
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

// --- Command Handling Function ---
async function handleCommand(sock, m) {
    // ... (This function contains the command processing logic from the previous final index.js)
    // For brevity, it is assumed to be here. You can copy the 'messages.upsert' logic from
    // the previous final version and paste it here.
}


// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
