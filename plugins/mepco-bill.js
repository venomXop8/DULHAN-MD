/**
 * DULHAN-MD - MEPCO Bill Checker (Optimized Version)
 * Fetches bill data directly from the official PITC portal with improved speed and reliability.
 * Powered by MALIK SAHAB
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to find data from the table cleanly
function findValue($, label) {
    // Find the table cell with the label, then get the text of the next cell
    const value = $(`td:contains("${label}")`).next('td').text().trim();
    return value || 'N/A';
}

module.exports = {
  command: ['mepco', 'bill', 'bijli'],
  description: 'Checks MEPCO electricity bill from a reference number.',
  category: 'utility',
  
  async handler(m) {
    const { text, reply } = m; // Get text and reply function from the message object

    if (!text || (text.length !== 14 && text.length !== 10)) {
      return reply('❌ Please provide a valid 14-digit Reference Number or 10-digit Customer ID.\n\n*Example:*\n*.mepco 12345678901234*');
    }

    const refNo = text.trim();
    await reply(`🔍 Searching for bill details for: *${refNo}*...\nPlease wait, Dulhan aapke liye bill dhoond rahi hai.`);

    try {
      // Make a GET request to the official PITC portal with a timeout
      const response = await axios.get(`http://bill.pitc.com.pk/mepcobill/search?refno=${refNo}`, {
          timeout: 15000, // 15-second timeout
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
          }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);

      // Check for the "Consumer does not exist" alert in the HTML
      if (html.includes("alert('Consumer does not exist');")) {
        return reply(`❌ *Consumer Not Found.*\n\nPlease double-check the Reference Number / Customer ID and try again.`);
      }

      // Extract details using the helper function
      const consumerName = findValue($, 'Consumer Name');
      const billMonth = findValue($, 'Bill Month');
      const dueDate = findValue($, 'Due Date');
      const amountWithinDueDate = findValue($, 'Amount Payable within Due Date');
      const amountAfterDueDate = findValue($, 'Amount Payable after Due Date');
      const billStatus = findValue($, 'Bill Status');
      
      // If a key detail is missing, the page might have failed to load correctly
      if (consumerName === 'N/A') {
          throw new Error('Could not parse bill details. The PITC website might be temporarily down or has changed its structure.');
      }
      
      const replyText = `
*╔═══ ≪ °💡° ≫ ═══╗*
    *MEPCO BILL DETAILS*
*╚═══ ≪ °💡° ≫ ═══╝*

*👤 Consumer Name:* ${consumerName}
*📅 Bill Month:* ${billMonth}

*┌─── ∘°❉°∘ ───┐*
  *Due Date:* *${dueDate}*
  *Status:* *${billStatus}*
*└─── °∘❉∘° ───┘*

*Amount within Due Date:*
\`\`\`Rs. ${amountWithinDueDate}\`\`\`

*Amount after Due Date:*
\`\`\`Rs. ${amountAfterDueDate}\`\`\`

*© Powered by MALIK SAHAB*
      `;
      
      await reply(replyText);

    } catch (error) {
      console.error("MEPCO Bill Fetching Error:", error.message);
      if(error.code === 'ECONNABORTED'){
           reply('🤕 Sorry, PITC ki website bohot slow response de rahi hai. Thori der baad try karein.');
      } else {
           reply('🤕 Sorry, is waqt bill check karne mein masla aa raha hai. Ho sakta hai PITC ki website down ho.');
      }
    }
  }
};
