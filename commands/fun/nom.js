export default {
  name: 'nom',
  aliases: [],
  description: 'Nom on someone',
  usage: '!nom @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`😋 You nom yourself! How cute!`);
    }
    
    message.reply(`😋 **${message.author.username}** noms **${target.username}**!`);
  }
};