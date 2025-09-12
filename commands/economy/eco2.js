export default {
  name: 'eco2',
  aliases: [],
  description: 'Economy command 2',
  usage: '!eco2',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'eco2');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement eco2 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'eco2', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'eco2', 'Economy command 2');
    
    message.reply(`💰 You earned **$${earnings}** from eco2!`);
  }
};