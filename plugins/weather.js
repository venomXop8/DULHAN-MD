/**
 * DULHAN-MD - Weather Agent
 * Fetches and displays detailed weather information for a specified city.
 */

const axios = require('axios');

// Helper function to get a weather-appropriate emoji
const getWeatherEmoji = (main) => {
    const emojiMap = {
        'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
        'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Haze': '🌫️',
        'Smoke': '💨', 'Fog': '🌁'
    };
    return emojiMap[main] || '🌍';
};

// Helper function to convert UNIX timestamp to readable time
const formatTime = (timestamp, timezone) => {
    return new Date((timestamp + timezone) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
};

module.exports = {
  command: ['weather', 'mausam'],
  description: 'Gets the current weather information for a city.',
  category: 'utility',
  
  async handler(m, { text, config }) {
    if (!config.WEATHER_API_KEY || config.WEATHER_API_KEY === "YOUR_WEATHER_API_KEY_HERE") {
        return m.reply("❌ Weather API key is not set. Please add your API key from openweathermap.org to the config.js file.");
    }
      
    if (!text) {
      return m.reply(`Kis sheher ka mausam janna hai, bataein to sahi... 🌦️\n\n*Example:*\n*.weather Lahore*`);
    }

    const city = text.trim();

    try {
      await m.reply(`*${city}* ka mausam check kar rahi hoon...`);

      // Call the OpenWeatherMap API
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: config.WEATHER_API_KEY,
          units: 'metric' // For temperature in Celsius
        }
      });
      
      const data = response.data;
      const weather = data.weather[0];

      const replyText = `
*╭── ⋅ ⋅ ── 🌤️ ── ⋅ ⋅ ──╮*
    *Weather in ${data.name}, ${data.sys.country}*
*╰── ⋅ ⋅ ── 🌤️ ── ⋅ ⋅ ──╯*

*${getWeatherEmoji(weather.main)} ${weather.description.replace(/\b\w/g, l => l.toUpperCase())}*

🌡️ *Temp:* ${Math.round(data.main.temp)}°C
*Feels Like:* ${Math.round(data.main.feels_like)}°C
*Min/Max:* ${Math.round(data.main.temp_min)}°C / ${Math.round(data.main.temp_max)}°C

💧 *Humidity:* ${data.main.humidity}%
📊 *Pressure:* ${data.main.pressure} hPa
☁️ *Cloud Cover:* ${data.clouds.all}%
👀 *Visibility:* ${(data.visibility / 1000).toFixed(1)} km

💨 *Wind:* ${(data.wind.speed * 3.6).toFixed(1)} km/h

🌅 *Sunrise:* ${formatTime(data.sys.sunrise, data.timezone)}
🌇 *Sunset:* ${formatTime(data.sys.sunset, data.timezone)}

*〝Mausam jaisa bhi ho, aapka mood hamesha acha rehna chahiye!〞*
      `;

      // Use the stylish reply function
      m.reply(replyText);

    } catch (error) {
      console.error("Weather API Error:", error.response?.data?.message || error.message);
      if (error.response && error.response.status === 404) {
          m.reply(`Maazrat, mujhe *${city}* naam ka koi sheher nahi mila. Spelling check karein?`);
      } else {
          m.reply('❌ Mausam ki maloomat hasil karne mein masla aa raha hai. Thori der baad try karein.');
      }
    }
  }
};
