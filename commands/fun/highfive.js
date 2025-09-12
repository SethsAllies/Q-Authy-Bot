export default {
  name: 'highfive',
  aliases: [],
  description: 'Give someone a high five',
  usage: '!highfive @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🙏 You highfive yourself! How cute!`);
    }
    
    message.reply(`🙏 **${message.author.username}** highfives **${target.username}**!`);
  }
};