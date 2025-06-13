/**
 * MEPCO Bill Checker Command for DULHAN-MD
 * This command now uses web scraping to fetch live bill data from mepcoebill.pk
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch'); // node-fetch might still be needed for other things, so we keep it.

module.exports = {
  command: ['mepco', 'bill', 'bijli'],
  description: 'Checks MEPCO electricity bill from a reference number.',
  category: 'utility',
  
  async handler(m, { text }) {
    if (!text || (text.length !== 14 && text.length !== 10)) {
      return m.reply('❌ Please provide a valid 14-digit Reference Number or 10-digit Customer ID.\n\n*Example:*\n.mepco 12345678901234');
    }

    const refNo = text.trim();
    await m.reply(`🔍 Searching for bill details for: *${refNo}*...\nPlease wait, Dulhan aapke liye bill dhoond rahi hai.`);

    try {
      // Data to be sent in the POST request, mimicking a form submission.
      const formData = new URLSearchParams();
      formData.append('referenceno', refNo);
      formData.append('search_bill', 'search');

      // Making the POST request to the website's backend script
      const response = await axios.post('https://mepcoebill.pk/sql-actions.php', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);

      // Check if the bill was not found
      if ($('h5:contains("Bill Not Found")').length > 0) {
        return m.reply(`❌ *Bill Not Found.*\n\nPlease double-check the Reference Number / Customer ID and try again.`);
      }

      // Extracting data by finding the right elements
      const billDetails = {};
      $('tbody tr').each((i, elem) => {
        const key = $(elem).find('td').eq(0).text().trim().replace(':', '');
        const value = $(elem).find('td').eq(1).text().trim();
        if (key && value) {
          billDetails[key] = value;
        }
      });

      if (Object.keys(billDetails).length === 0) {
          throw new Error('Could not parse bill details. The website structure might have changed.');
      }
      
      const replyText = `
✅ *MEPCO Bill Found!*

*Consumer Name:* ${billDetails['Consumer Name'] || 'N/A'}
*Reference No:* ${billDetails['Reference No'] || refNo}
*Bill Month:* ${billDetails['Bill Month'] || 'N/A'}
*Due Date:* *${billDetails['Due Date'] || 'N/A'}*

*Amount within Due Date:* Rs. ${billDetails['Payable Amount within Due Date'] || 'N/A'}
*Amount after Due Date:* Rs. ${billDetails['Payable Amount after Due Date'] || 'N/A'}

*Bill Status:* *${billDetails['Bill Status'] || 'N/A'}*
      `;
      m.reply(replyText);

    } catch (error) {
      console.error('MEPCO Bill Scraping Error:', error);
      m.reply('🤕 Sorry, the bill checking service is currently unavailable. Website se data fetch karne mein masla aa raha hai. Please try again later.');
    }
  }
};
