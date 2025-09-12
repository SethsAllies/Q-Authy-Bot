export default {
  name: 'lick',
  aliases: [],
  description: 'Lick someone (weird but ok)',
  usage: '!lick @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`👅 You lick yourself! How cute!`);
    }
    
    message.reply(`👅 **${message.author.username}** licks **${target.username}**!`);
  }
};