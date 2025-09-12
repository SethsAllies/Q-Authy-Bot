export default {
  name: 'daily',
  aliases: ['dailyreward'],
  description: 'Claim your daily reward',
  usage: '!daily',
  cooldown: 86400, // 24 hours
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'daily');
    if (cooldownMs > 0) {
      const hours = Math.floor(cooldownMs / (60 * 60 * 1000));
      const minutes = Math.floor((cooldownMs % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(`⏰ You already claimed your daily reward! Come back in ${hours}h ${minutes}m`);
    }
    
    const reward = Math.floor(Math.random() * 500) + 100; // 100-600
    const balance = await client.database.getUserBalance(userId);
    
    // Update balance and set cooldown
    await client.database.updateBalance(userId, balance.wallet + reward, null);
    await client.database.setCooldown(userId, 'daily', 24 * 60 * 60 * 1000); // 24 hours
    await client.database.addTransaction(userId, reward, 'daily', 'Daily reward');
    
    message.reply(`💰 You claimed your daily reward of **$${reward}**! Come back tomorrow for more!`);
  }
};