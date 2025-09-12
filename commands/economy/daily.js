export default {
  name: 'daily',
  aliases: ['dailyreward'],
  description: 'Claim your daily reward',
  usage: '!daily',
  cooldown: 86400, // 24 hours
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0, lastDaily: 0 };
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (userData.lastDaily && now - userData.lastDaily < oneDay) {
      const timeLeft = oneDay - (now - userData.lastDaily);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      return message.reply(`⏰ You already claimed your daily reward! Come back in ${hours}h ${minutes}m`);
    }
    
    const reward = Math.floor(Math.random() * 500) + 100; // 100-600
    userData.wallet += reward;
    userData.lastDaily = now;
    
    client.economy.set(userId, userData);
    
    message.reply(`💰 You claimed your daily reward of **$${reward}**! Come back tomorrow for more!`);
  }
};