/**
 * DULHAN-MD - QR Code Generator
 * Powered by MALIK SAHAB
 */
const QRCode = require('qrcode');

module.exports = {
  command: ['qr', 'qrcode'],
  description: 'Generates a QR code from text or a URL.',
  category: 'utility',
  async handler(m) {
    const { text, sock, reply } = m;
    if (!text) return reply('Mujhe koi text ya link to dein jiska main QR code bana sakun... 🤔');
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, { scale: 8 });
      const buffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      await sock.sendMessage(m.key.remoteJid, { 
          image: buffer,
          caption: `*QR Code Generated for:*\n${text}`
      }, { quoted: m });
    } catch (e) {
      console.error("QR Gen Error:", e);
      reply('❌ QR code banane mein koi masla aa gaya.');
    }
  }
};
