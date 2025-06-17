/**
 * DULHAN-MD - Safest & Simplest Version
 * This version uses the most basic logic to ensure connection and response.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    console.log("Starting DULHAN-MD...");
    
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true, // Let Baileys handle this for now
    });

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
            console.log('❌ Connection closed. Attempting to reconnect...');
            connectToWhatsApp();
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;

            const messageType = getContentType(msg.message);
            let body = '';

            if (messageType === 'conversation') body = msg.message.conversation;
            if (messageType === 'extendedTextMessage') body = msg.message.extendedTextMessage.text;
            
            // For testing, we will just reply to any message starting with a dot.
            if (body && body.startsWith('.')) {
                console.log(`Received command: ${body}`);
                await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! I am online and working.' }, { quoted: msg });
            }
        } catch (e) {
            console.error("Error in message handler:", e);
        }
    });

    // Save creds
    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp().catch(e => console.error("FATAL ERROR:", e));
