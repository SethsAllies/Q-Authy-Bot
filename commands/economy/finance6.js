export default {
  name: 'finance6',
  aliases: [],
  description: 'Financial command 6',
  usage: '!finance6',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'finance6');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement finance6 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'finance6', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'finance6', 'Financial command 6');
    
    message.reply(`💰 You earned **$${earnings}** from finance6!`);
  }
};