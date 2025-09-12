export default {
  name: 'cuddle',
  aliases: [],
  description: 'Cuddle with someone',
  usage: '!cuddle @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🤗 You cuddle yourself! How cute!`);
    }
    
    message.reply(`🤗 **${message.author.username}** cuddles **${target.username}**!`);
  }
};