export default {
  name: 'dance',
  aliases: [],
  description: 'Dance with someone',
  usage: '!dance @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`💃 You dance yourself! How cute!`);
    }
    
    message.reply(`💃 **${message.author.username}** dances **${target.username}**!`);
  }
};