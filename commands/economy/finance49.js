export default {
  name: 'finance49',
  aliases: [],
  description: 'Financial command 49',
  usage: '!finance49',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'finance49');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement finance49 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'finance49', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'finance49', 'Financial command 49');
    
    message.reply(`💰 You earned **$${earnings}** from finance49!`);
  }
};