/**
 * DULHAN-MD - Main Bot File (Profile Picture & QR Fix)
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const axios = require('axios'); // Hum axios ka istemal karenge photo download karne ke liye
const { readdirSync, existsSync } = require('fs');
const path = require('path');
const config = require('./config');

// --- Dynamic Command Handler ---
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');
const files = readdirSync(pluginDir).filter(file => file.endsWith('.js'));
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

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("------------------------------------------------");
            console.log("QR code generate ho gaya hai, please scan karein:");
            qrcode.generate(qr, { small: true });
            console.log("------------------------------------------------");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online!`);
            
            // --- NAYI PROFILE PICTURE LOGIC ---
            try {
                console.log('Updating profile picture...');
                // Pehle URL se image download karein
                const response = await axios.get(config.PROFILE_PIC_URL, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data, 'binary');
                
                // Phir buffer se picture update karein
                await sock.updateProfilePicture(sock.user.id, imageBuffer);
                console.log('✅ Profile picture updated successfully!');
            } catch (e) {
                console.error('❌ Failed to update profile picture:', e.message);
            }
            // --- END OF NEW LOGIC ---
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        // ... (Message handling logic poori wesi hi rahegi)
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

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
                const advancedReply = async (text) => {
                    const footerText = `\n\n*Powered by ${config.BOT_NAME}*\n${config.CHANNEL_LINK}`;
                    await sock.sendMessage(msg.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    if (existsSync(config.AUDIO_REPLY_PATH)) {
                        await sock.sendMessage(msg.key.remoteJid, { audio: { url: config.AUDIO_REPLY_PATH }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
                    }
                };
                
                const messageObject = { ...msg, reply: advancedReply, sock, BOT_CONFIG: config, startTime };
                await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });

            } catch (e) {
                console.error(`Error in command ${commandName}:`, e);
                 await sock.sendMessage(msg.key.remoteJid, {text: 'Oops! Kuch gadbad ho gayi 😢'}, {quoted: m.messages[0]});
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("Unexpected error: " + err));
