export default {
  name: 'wave',
  aliases: [],
  description: 'Wave at someone',
  usage: '!wave @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`👋 You wave yourself! How cute!`);
    }
    
    message.reply(`👋 **${message.author.username}** waves **${target.username}**!`);
  }
};