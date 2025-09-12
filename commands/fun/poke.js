export default {
  name: 'poke',
  aliases: [],
  description: 'Poke someone',
  usage: '!poke @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(`👉 You poke yourself! How cute!`);
    }
    
    message.reply(`👉 **${message.author.username}** pokes **${target.username}**!`);
  }
};