export default {
  name: 'tickle',
  aliases: [],
  description: 'Tickle someone',
  usage: '!tickle @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🤗 You tickle yourself! How cute!`);
    }
    
    message.reply(`🤗 **${message.author.username}** tickles **${target.username}**!`);
  }
};