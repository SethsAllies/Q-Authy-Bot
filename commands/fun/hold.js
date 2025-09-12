export default {
  name: 'hold',
  aliases: [],
  description: 'Hold someone hand',
  usage: '!hold @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🤝 You hold yourself! How cute!`);
    }
    
    message.reply(`🤝 **${message.author.username}** holds **${target.username}**!`);
  }
};