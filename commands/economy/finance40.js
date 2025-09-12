export default {
  name: 'finance40',
  aliases: [],
  description: 'Financial command 40',
  usage: '!finance40',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'finance40');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before using this command!`);
    }
    
    // TODO: Implement finance40 economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, 'finance40', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'finance40', 'Financial command 40');
    
    message.reply(`💰 You earned **$${earnings}** from finance40!`);
  }
};