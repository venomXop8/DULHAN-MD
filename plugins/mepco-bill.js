/**
 * MEPCO Bill Checker Command for DULHAN-MD
 * * This command fetches electricity bill details using a reference number.
 * Note: This uses a placeholder API. You might need to find a working
 * bill checking API and adjust the code accordingly.
 */

// You might need to install node-fetch: npm install node-fetch
const fetch = require('node-fetch');

module.exports = {
  command: ['mepco', 'bill', 'bijli'],
  description: 'Checks MEPCO electricity bill from a reference number.',
  category: 'utility',
  
  /**
   * @param {object} m The message object
   * @param {object} options
   * @param {string} options.text The reference number provided by the user
   */
  async handler(m, { text }) {
    if (!text || text.length !== 14) {
      return m.reply('❌ Please provide a valid 14-digit MEPCO reference number.\n\n*Example:*\n.mepco 12345678901234');
    }

    const refNo = text.trim();
    // A placeholder API URL. You will need to find a real one.
    const apiUrl = `https://api.example.com/mepco-bill/${refNo}`;

    await m.reply(`🔍 Searching for bill details for reference number: *${refNo}*...\nPlease wait.`);

    try {
      // Fetching data from the API
      const response = await fetch(apiUrl);
      if (!response.ok) {
        // This handles cases where the API returns an error (e.g., 404 Not Found)
        throw new Error('Bill not found or API is down.');
      }
      const data = await response.json();

      // Assuming the API returns data in this format
      if (data.status === 'success') {
        const bill = data.billDetails;
        const replyText = `
✅ *MEPCO Bill Found!*

*Consumer Name:* ${bill.consumerName}
*Reference No:* ${bill.referenceNo}
*Bill Month:* ${bill.billMonth}
*Due Date:* ${bill.dueDate}

*Amount within Due Date:* Rs. ${bill.amountPayable}
*Amount after Due Date:* Rs. ${bill.lateSurcharge}

*Bill Status:* *${bill.status}*
        `;
        m.reply(replyText);
      } else {
        m.reply(`❌ *Error:* Could not find the bill. Please check the reference number.\n\n*Reason:* ${data.message}`);
      }
    } catch (error) {
      console.error('MEPCO Bill API Error:', error);
      m.reply('🤕 Sorry, the bill checking service is currently unavailable. Please try again later.');
    }
  }
};
