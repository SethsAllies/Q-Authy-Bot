export default {
  name: 'feed',
  aliases: [],
  description: 'Feed someone',
  usage: '!feed @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🍎 You feed yourself! How cute!`);
    }
    
    message.reply(`🍎 **${message.author.username}** feeds **${target.username}**!`);
  }
};