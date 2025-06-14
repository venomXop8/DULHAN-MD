/**
 * DULHAN-MD - Main Bot File (with Stylish Channel Mention)
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
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

// List of commands that will use the new stylish reply
const stylishCommands = ['menu', 'owner', 'alive', 'ping', 'info'];

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
            qrcode.generate(qr, { small: true });
            console.log("------------------------------------------------");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log(`👰‍♀️ ${config.BOT_NAME} is now online!`);
            try {
                const response = await axios.get(config.PROFILE_PIC_URL, { responseType: 'arraybuffer' });
                await sock.updateProfilePicture(sock.user.id, Buffer.from(response.data, 'binary'));
                console.log('✅ Profile picture updated!');
            } catch (e) {
                console.error('❌ Failed to update profile picture:', e.message);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return; // Removed fromMe check for self-testing

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
                let replyFunction;

                // Decide which reply style to use
                if (stylishCommands.includes(commandName)) {
                    // --- STYLISH REPLY FUNCTION ---
                    replyFunction = (text, options = {}) => {
                        return sock.sendMessage(m.key.remoteJid, {
                            text: text,
                            contextInfo: {
                                externalAdReply: {
                                    title: `👰‍♀️ ${config.BOT_NAME}`,
                                    body: config.OWNER_NAME,
                                    thumbnail: options.thumbnail || fs.readFileSync('./dulhan_thumbnail.jpg'), // Requires a thumbnail image
                                    sourceUrl: config.CHANNEL_LINK,
                                    mediaUrl: config.CHANNEL_LINK,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true,
                                }
                            }
                        }, { quoted: msg });
                    };
                } else {
                    // --- REGULAR REPLY FUNCTION ---
                    replyFunction = (text) => {
                        const footerText = `\n\n*Powered by ${config.BOT_NAME}*\n${config.CHANNEL_LINK}`;
                        return sock.sendMessage(m.key.remoteJid, { text: text + footerText }, { quoted: msg });
                    };
                }
                
                const messageObject = { ...msg, reply: replyFunction, sock, config, startTime };
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
