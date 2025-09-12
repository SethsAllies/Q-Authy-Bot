export default {
  name: 'tackle',
  aliases: [],
  description: 'Tackle someone',
  usage: '!tackle @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🤼 You tackle yourself! How cute!`);
    }
    
    message.reply(`🤼 **${message.author.username}** tackles **${target.username}**!`);
  }
};