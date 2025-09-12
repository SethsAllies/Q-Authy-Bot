export default {
  name: 'bite',
  aliases: [],
  description: 'Bite someone playfully',
  usage: '!bite @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🦷 You bite yourself! How cute!`);
    }
    
    message.reply(`🦷 **${message.author.username}** bites **${target.username}**!`);
  }
};