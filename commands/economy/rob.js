export default {
  name: 'rob',
  aliases: ['steal'],
  description: 'Rob another user (risky!)',
  usage: '!rob @user',
  cooldown: 300,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention someone to rob!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('❌ You cannot rob yourself!');
    }
    
    const userId = message.author.id;
    const targetId = target.id;
    
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    const targetData = client.economy.get(targetId) || { wallet: 1000, bank: 0 };
    
    if (targetData.wallet < 100) {
      return message.reply('❌ Target doesn\'t have enough money to rob!');
    }
    
    const success = Math.random() > 0.5; // 50% success rate
    
    if (success) {
      const stolen = Math.floor(targetData.wallet * 0.1); // Steal 10%
      userData.wallet += stolen;
      targetData.wallet -= stolen;
      
      client.economy.set(userId, userData);
      client.economy.set(targetId, targetData);
      
      message.reply(`💰 You successfully robbed **$${stolen}** from ${target.username}!`);
    } else {
      const fine = Math.floor(userData.wallet * 0.05); // 5% fine
      userData.wallet -= fine;
      
      client.economy.set(userId, userData);
      
      message.reply(`🚨 You got caught! You were fined **$${fine}**!`);
    }
  }
};