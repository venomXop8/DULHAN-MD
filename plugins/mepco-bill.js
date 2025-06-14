/**
 * MEPCO Bill Checker Command for DULHAN-MD (Final & Robust Version)
 * This command now uses a reliable method to fetch live bill data from the official PITC system.
 */

const axios = require('axios');
const cheerio =require('cheerio');

// Helper function to find data from the table
function findValue($, label) {
    // Find the cell with the label, then get the text of the next cell in the same row
    const value = $(`td:contains("${label}")`).next('td').text().trim();
    return value || 'N/A';
}

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
      // We will make a POST request to the official PITC portal
      const response = await axios.get(`http://bill.pitc.com.pk/mepcobill/search?refno=${refNo}`);
      
      const html = response.data;
      const $ = cheerio.load(html);

      // Check if the bill was not found. The official site shows an alert.
      if (html.includes("alert('Consumer does not exist');")) {
        return m.reply(`❌ *Consumer Not Found.*\n\nPlease double-check the Reference Number / Customer ID and try again.`);
      }

      // Extracting all details from the table
      const consumerName = findValue($, 'Consumer Name');
      const billMonth = findValue($, 'Bill Month');
      const dueDate = findValue($, 'Due Date');
      const amountWithinDueDate = findValue($, 'Amount Payable within Due Date');
      const amountAfterDueDate = findValue($, 'Amount Payable after Due Date');
      const billStatus = findValue($, 'Bill Status');
      
      if (consumerName === 'N/A') {
          throw new Error('Could not parse bill details. The website structure might have changed.');
      }
      
      const replyText = `
*╔═══ ≪ °💡° ≫ ═══╗*
    *MEPCO BILL DETAILS*
*╚═══ ≪ °💡° ≫ ═══╝*

*Consumer Name:* ${consumerName}
*Bill Month:* ${billMonth}

*┌─── ∘°❉°∘ ───┐*
  *Due Date:* *${dueDate}*
  *Bill Status:* *${billStatus}*
*└─── °∘❉∘° ───┘*

*Amount within Due Date:*
*Rs. ${amountWithinDueDate}*

*Amount after Due Date:*
*Rs. ${amountAfterDueDate}*
      `;
      m.reply(replyText);

    } catch (error) {
      console.error('MEPCO Bill Fetching Error:', error.message);
      m.reply('🤕 Sorry, is waqt bill check karne mein masla aa raha hai. Ho sakta hai PITC ki website down ho. Please thori der baad try karein.');
    }
  }
};
