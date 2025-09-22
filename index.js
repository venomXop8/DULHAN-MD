/** 
 * DULHAN-MD - Ultimate Final Version 
 * This version has a rock-solid foundation and passes context safely to all commands.
 * Powered by MALIK SAHAB
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// --- Configuration ---
const mode = "pair"; // Change to "qr" for QR code mode, "pair" for pairing code mode
const bot_number = "919719313814"; // Replace with your bot number (without +)
const PORT = process.env.PORT || 5000; // For Render deployment
const MAX_RECONNECT_ATTEMPTS = 3;

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

// --- Session Management ---
function hasExistingSession() {
    const sessionsDir = path.join(__dirname, 'sessions');
    try {
        if (fs.existsSync(sessionsDir)) {
            const files = fs.readdirSync(sessionsDir);
            const sessionFiles = files.filter(file => 
                file.endsWith('.json') && !file.endsWith('creds.json')
            );
            return sessionFiles.length > 0;
        }
    } catch (e) {
        console.error("Error checking session directory:", e);
    }
    return false;
}

// --- Main Connection Logic ---
let reconnectAttempts = 0;
let sock = null;

async function connectToWhatsApp() {
    console.log("Starting DULHAN-MD...");
    
    // Check if we have an existing session
    const hasSession = hasExistingSession();
    console.log(`Session status: ${hasSession ? 'Found existing session' : 'No session found'}`);
    console.log(`Mode: ${mode}`);
    
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    try {
        sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: {
                creds: state.creds,
                keys: state.keys,
            },
            printQRInTerminal: false, // We will handle QR code manually
            browser: Browsers.macOS('Desktop'),
            shouldIgnoreJid: jid => jid === 'status@broadcast',
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
        });

        // --- Event Handlers ---
        sock.ev.on('connection.update', async (update) => {
            const { connection, qr, lastDisconnect } = update;
            
            console.log('Connection update:', connection);
            
            if (qr) {
                console.log("QR/pairing code received");
                if (mode.toLowerCase() === "qr") {
                    console.log("------------------------------------------------");
                    console.log("QR Code Received, Please Scan!");
                    qrcode.generate(qr, { small: true });
                    console.log("------------------------------------------------");
                } else if (mode.toLowerCase() === "pair") {
                    console.log("Requesting pairing code...");
                    
                    try {
                        // Request pairing code for the hardcoded bot number
                        const code = await sock.requestPairingCode(bot_number.replace(/[^0-9]/g, ''));
                        console.log("------------------------------------------------");
                        console.log(`Pairing Code: ${code}`);
                        console.log("------------------------------------------------");
                        console.log(`Please enter this code in your WhatsApp linked devices section`);
                        console.log("------------------------------------------------");
                    } catch (error) {
                        console.error("Error requesting pairing code:", error);
                        console.log("Falling back to QR code mode...");
                        console.log("------------------------------------------------");
                        console.log("QR Code Received, Please Scan!");
                        qrcode.generate(qr, { small: true });
                        console.log("------------------------------------------------");
                    }
                }
            }
            
            if (connection === 'open') {
                console.log('✅ WhatsApp connection opened successfully!');
                reconnectAttempts = 0; // Reset reconnect counter on successful connection
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
                const reason = lastDisconnect.error?.output?.statusCode;
                const reasonText = DisconnectReason[reason] || 'Unknown';
                
                console.log(`❌ Connection closed. Reason: ${reasonText} (${reason}).`);
                
                if (reason === DisconnectReason.loggedOut) {
                    console.log('Session logged out. Please scan again.');
                    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Force QR/pairing mode
                    
                    // Clean up session files if logged out
                    try {
                        const sessionsDir = path.join(__dirname, 'sessions');
                        if (fs.existsSync(sessionsDir)) {
                            const files = fs.readdirSync(sessionsDir);
                            for (const file of files) {
                                fs.unlinkSync(path.join(sessionsDir, file));
                            }
                            console.log('Cleared session files due to logout.');
                        }
                    } catch (e) {
                        console.error('Error clearing session files:', e);
                    }
                }
                
                // Reconnect if it's not a logout and we haven't exceeded max attempts
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in 3 seconds...`);
                    setTimeout(connectToWhatsApp, 3000);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !hasSession) {
                    console.log("Max reconnection attempts reached. Restarting connection process...");
                    reconnectAttempts = 0;
                    setTimeout(connectToWhatsApp, 3000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Handle messages
        sock.ev.on('messages.upsert', async (m) => {
            try {
                const msg = m.messages[0];
                if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) return;
                
                const body = msg.message?.conversation || 
                             msg.message?.extendedTextMessage?.text || 
                             msg.message?.imageMessage?.caption || 
                             msg.message?.videoMessage?.caption || "";
                
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
        
    } catch (error) {
        console.error('Error creating socket:', error);
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect after error (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in 3 seconds...`);
            setTimeout(connectToWhatsApp, 3000);
        }
    }
}

// --- Keep Alive Server for Render ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('DULHAN-MD WhatsApp Bot is running!\n');
});

server.listen(PORT, () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
