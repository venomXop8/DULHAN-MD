/**
 * DULHAN-MD Brain
 *
 * This file orchestrates how the different agents are used.
 * It features the "Agent Chaining" system, which creates a sequence of replies.
 */

const agents = require('./dulhan-agents');

/**
 * Creates a "chain reaction" reply by passing the message through
 * a predefined sequence of agents.
 *
 * @param {string} msg - The user's message.
 * @returns {string} A multi-line string with replies from each agent in the chain.
 */
function chainReply(msg) {
  // The order of the emotional ride: Biwi -> Saas -> Romantic
  const order = ['biwi', 'saas', 'romantic'];
  
  const replies = order.map(agentName => {
    if (agents[agentName]) {
      return agents[agentName](msg);
    }
    return `Error: Agent "${agentName}" not found.`;
  });

  // Joining the replies with a separator to create the final message
  return replies.join('\n\n💥\n\n');
}

module.exports = { chainReply };
