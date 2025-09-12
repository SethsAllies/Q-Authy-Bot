export default {
  name: 'balance',
  aliases: ['bal', 'wallet', 'money'],
  description: 'Check your balance',
  usage: '!balance [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    
    // Simple economy system - normally would use database
    if (!client.economy) client.economy = new Map();
    
    const userId = user.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    
    if (!client.economy.has(userId)) {
      client.economy.set(userId, userData);
    }
    
    const embed = {
      color: 0x00ff00,
      title: `💰 ${user.username}'s Balance`,
      fields: [
        { name: '💳 Wallet', value: `$${userData.wallet.toLocaleString()}`, inline: true },
        { name: '🏦 Bank', value: `$${userData.bank.toLocaleString()}`, inline: true },
        { name: '💎 Total', value: `$${(userData.wallet + userData.bank).toLocaleString()}`, inline: true }
      ],
      thumbnail: { url: user.displayAvatarURL() }
    };
    
    message.reply({ embeds: [embed] });
  }
};