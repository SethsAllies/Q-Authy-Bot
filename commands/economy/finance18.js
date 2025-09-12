export default {
  name: 'finance18',
  aliases: [],
  description: 'Financial command 18',
  usage: '!finance18',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'finance18');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement finance18 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'finance18', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'finance18', 'Financial command 18');
    
    message.reply(`💰 You earned **$${earnings}** from finance18!`);
  }
};