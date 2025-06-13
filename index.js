/**
 * DULHAN-MD - Final Version
 * Includes: Pairing Code, Auto Profile Picture, Channel Footer, Voice Note, and Menu Support
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { readdirSync, existsSync } = require('fs');
const path =require('path');
const readline = require('readline');

// --- BOT CONFIGURATION ---
const BOT_CONFIG = {
    channelLink: 'https://whatsapp.com/channel/0029VaN8WMOHFxP0SLAKKu0P',
    audioReplyPath: 'dulhan_audio.mp3', 
    botName: 'DULHAN-MD',
    profilePictureUrl: 'https://files.catbox.moe/wz96cv.jpg',
    ownerNumber: 923322964709', // Apna number yahan likhein
    ownerName: 'ᯓᬊ᭄𝙈ͥ𝙖ͫ𝙡𝙞𝙠༽⃝𝐒̹𝐚̏𝐡֦𝐚͗𝐛͗ᬊᬁ' // Apna naam yahan likhein
};

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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// To track bot's uptime
const startTime = Date.now();

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Please enter your WhatsApp number (e.g., 923001234567): ');
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`Your pairing code is: ${code}`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${BOT_CONFIG.botName} is now online!`);
            try {
                await sock.updateProfilePicture(sock.user.id, { url: BOT_CONFIG.profilePictureUrl });
                console.log('Profile picture updated!');
            } catch (e) {
                console.error('Failed to update profile picture:', e);
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageType = Object.keys(msg.message)[0];
        const body = (messageType === 'conversation') ? msg.message.conversation :
                     (messageType === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                     (messageType === 'imageMessage') ? msg.message.imageMessage.caption :
                     (messageType === 'videoMessage') ? msg.message.videoMessage.caption : '';

        const prefix = '.';
        if (!body || !body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commands.get(commandName);

        if (command) {
            try {
                const advancedReply = async (text) => {
                    const footerText = `\n\n*Powered by ${BOT_CONFIG.botName}*\n${BOT_CONFIG.channelLink}`;
                    await sock.sendMessage(msg.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    if (existsSync(BOT_CONFIG.audioReplyPath)) {
                        await sock.sendMessage(msg.key.remoteJid, { audio: { url: BOT_CONFIG.audioReplyPath }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
                    }
                };
                
                // Pass all necessary info to the handler
                const messageObject = { ...msg, reply: advancedReply, sock, BOT_CONFIG, startTime };
                await command.handler(messageObject, { text: args.join(' '), commands, downloadMediaMessage });

            } catch (e) {
                console.error(`Error in command ${commandName}:`, e);
                msg.reply('Oops! Kuch gadbad ho gayi 😢');
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => console.log("Unexpected error: " + err));
