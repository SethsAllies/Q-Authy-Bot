export default {
  name: 'trade',
  aliases: [],
  description: 'Trade with someone',
  usage: '!trade',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'trade');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement trade economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'trade', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'trade', 'Trade with someone');
    
    message.reply(`💰 You earned **$${earnings}** from trade!`);
  }
};