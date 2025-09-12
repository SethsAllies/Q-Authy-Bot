export default {
  name: 'pay',
  aliases: ['give', 'transfer'],
  description: 'Pay money to another user',
  usage: '!pay @user [amount]',
  cooldown: 3,
  async execute(message, args, client) {
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
    
    const balance = await client.database.getUserBalance(userId);
    
    if (balance.wallet < amount) {
      return message.reply('❌ You don\'t have enough money!');
    }
    
    try {
      await client.database.transferMoney(userId, targetId, amount);
      message.reply(`💸 You paid **$${amount}** to **${target.username}**!`);
    } catch (error) {
      message.reply('❌ Transfer failed! Please try again.');
    }
  }
};