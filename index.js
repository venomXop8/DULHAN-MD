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
const readline = require('readline');

// --- Configuration ---
const mode = "pair"; // Change to "qr" for QR code mode, "pair" for pairing code mode
const bot_number = "919719313814"; // Replace with your bot number
const PORT = process.env.PORT || 5000; // For Render deployment

// Create readline interface for pairing code input if needed
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

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
    console.log(`Mode: ${mode}`);
    
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false, // We will handle QR code manually
        browser: Browsers.macOS('Desktop'),
    });

    // --- Event Handlers ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;
        
        if (qr) {
            if (mode.toLowerCase() === "qr") {
                console.log("------------------------------------------------");
                console.log("QR Code Received, Please Scan!");
                qrcode.generate(qr, { small: true });
                console.log("------------------------------------------------");
            } else if (mode.toLowerCase() === "pair") {
                console.log("Pairing code received, requesting pairing...");
                
                try {
                    // Request pairing code for the hardcoded bot number
                    const code = await sock.requestPairingCode(bot_number);
                    console.log("------------------------------------------------");
                    console.log(`Pairing Code: ${code}`);
                    console.log("------------------------------------------------");
                    
                    // If you want to send the code to the number (optional)
                    // Note: This requires the bot to already be connected to WhatsApp
                    try {
                        await sock.sendMessage(`${bot_number}@s.whatsapp.net`, { 
                            text: `Your pairing code is: ${code}` 
                        });
                        console.log("Pairing code sent to bot number");
                    } catch (sendError) {
                        console.log("Could not send pairing code via message (not connected yet)");
                    }
                } catch (error) {
                    console.error("Error requesting pairing code:", error);
                }
            }
        }
        
        if (connection === 'open') {
            console.log('✅ WhatsApp connection opened successfully!');
            rl.close(); // Close readline interface if open
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

    sock.ev.on('creds.update', saveCreds);
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
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));    }
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

    sock.ev.on('creds.update', saveCreds);
}

// --- Initial Startup ---
connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
