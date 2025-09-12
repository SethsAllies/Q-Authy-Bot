export default {
  name: 'balance',
  aliases: ['bal', 'wallet', 'money'],
  description: 'Check your balance',
  usage: '!balance [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    
    const userId = user.id;
    const balance = await client.database.getUserBalance(userId);
    
    const embed = {
      color: 0x00ff00,
      title: `💰 ${user.username}'s Balance`,
      fields: [
        { name: '💳 Wallet', value: `$${balance.wallet.toLocaleString()}`, inline: true },
        { name: '🏦 Bank', value: `$${balance.bank.toLocaleString()}`, inline: true },
        { name: '💎 Total', value: `$${(balance.wallet + balance.bank).toLocaleString()}`, inline: true }
      ],
      thumbnail: { url: user.displayAvatarURL() }
    };
    
    message.reply({ embeds: [embed] });
  }
};