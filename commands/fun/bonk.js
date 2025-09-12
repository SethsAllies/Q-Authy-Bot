export default {
  name: 'bonk',
  aliases: [],
  description: 'Bonk someone',
  usage: '!bonk @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`🔨 You bonk yourself! How cute!`);
    }
    
    message.reply(`🔨 **${message.author.username}** bonks **${target.username}**!`);
  }
};