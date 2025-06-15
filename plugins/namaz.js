/**
 * DULHAN-MD - Prayer Times Command
 * Fetches daily prayer times for a specified city using Al-Adhan API.
 */

const axios = require('axios');

// Function to format time from 24-hour to 12-hour AM/PM format
function formatTime(time) {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12; // Convert 0 to 12
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

module.exports = {
  command: ['namaz', 'prayer', 'salat'],
  description: 'Shows daily prayer times for a city.',
  category: 'islamic',
  
  async handler(m, { text, config }) {
    if (!text) {
      return m.reply(`Kis sheher ke namaz ke auqat chahiye? Please sheher ka naam likhein.\n\n*Example:*\n*.namaz Lahore*`);
    }

    // Default country is Pakistan, user can specify another country like "Riyadh, Saudi Arabia"
    const city = text.split(',')[0].trim();
    const country = text.split(',')[1]?.trim() || 'Pakistan';

    try {
      await m.reply(`*${city}* ke namaz ke auqat dhoond rahi hoon... 🕌`);

      // Call the Al-Adhan API
      const response = await axios.get(`http://api.aladhan.com/v1/timingsByCity`, {
        params: {
          city: city,
          country: country,
          method: 2 // University of Islamic Sciences, Karachi
        }
      });
      
      const data = response.data.data;
      const timings = data.timings;
      const date = data.date.readable;
      
      const replyText = `
*╔═══ ≪ °🕌° ≫ ═══╗*
    *NAMAZ TIMINGS*
*╚═══ ≪ °🕌° ≫ ═══╝*

*Sheher:* ${city}, ${country}
*Tareekh:* ${date}

*╭── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╮*
  *Fajr:* ${formatTime(timings.Fajr)}
  *Dhuhr:* ${formatTime(timings.Dhuhr)}
  *Asr:* ${formatTime(timings.Asr)}
  *Maghrib:* ${formatTime(timings.Maghrib)}
  *Isha:* ${formatTime(timings.Isha)}
*╰── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╯*

*〝Allah hum sabko waqt par namaz parhne ki taufeeq ata farmaye. Ameen.〞*
      `;

      // Use the stylish reply function
      m.reply(replyText);

    } catch (error) {
      console.error("Prayer Times API Error:", error);
      m.reply(`❌ Maazrat, *${city}* ke namaz ke auqat nahi mil sake. Please sheher ka naam theek se check karein.`);
    }
  }
};
