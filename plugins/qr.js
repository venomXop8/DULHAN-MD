/**
 * DULHAN-MD - QR Code Generator
 * Creates a QR code from any given text or URL.
 */

const QRCode = require('qrcode');

module.exports = {
  command: ['qr', 'qrcode'],
  description: 'Generates a QR code from text or a URL.',
  category: 'utility',
  
  async handler(m, { text, sock }) {
    if (!text) {
      return m.reply('Mujhe koi text ya link to dein jiska main QR code bana sakun... 🤔\n\n*Example:*\n*.qr https://github.com/arkhan998*');
    }

    try {
      // Generate the QR code as a data URL (Base64 string)
      const qrCodeDataURL = await QRCode.toDataURL(text, { scale: 8 });
      
      // Convert the data URL to a buffer that Baileys can send
      const buffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      
      // Send the QR code image with a caption
      await sock.sendMessage(m.key.remoteJid, { 
          image: buffer,
          caption: `*QR Code Generated:*\n${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("QR Code Generation Error:", error);
      m.reply('❌ QR code banane mein koi masla aa gaya. Please try again.');
    }
  }
};
