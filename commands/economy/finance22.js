export default {
  name: 'finance22',
  aliases: [],
  description: 'Financial command 22',
  usage: '!finance22',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'finance22');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement finance22 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'finance22', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'finance22', 'Financial command 22');
    
    message.reply(`💰 You earned **$${earnings}** from finance22!`);
  }
};