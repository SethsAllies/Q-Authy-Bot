export default {
  name: 'pay',
  aliases: ['give', 'transfer'],
  description: 'Pay money to another user',
  usage: '!pay @user [amount]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to pay!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('❌ You cannot pay yourself!');
    }
    
    const amount = parseInt(args[1]);
    if (!amount || amount <= 0) {
      return message.reply('❌ Please specify a valid amount!');
    }
    
    const userId = message.author.id;
    const targetId = target.id;
    
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    const targetData = client.economy.get(targetId) || { wallet: 1000, bank: 0 };
    
    if (userData.wallet < amount) {
      return message.reply('❌ You don\'t have enough money!');
    }
    
    userData.wallet -= amount;
    targetData.wallet += amount;
    
    client.economy.set(userId, userData);
    client.economy.set(targetId, targetData);
    
    message.reply(`💸 You paid **$${amount}** to **${target.username}**!`);
  }
};