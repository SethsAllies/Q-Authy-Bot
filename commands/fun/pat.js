export default {
  name: 'pat',
  aliases: ['headpat'],
  description: 'Pat someone on the head',
  usage: '!pat @user',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention someone to pat!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('😊 *pats yourself* Self-care is important!');
    }
    
    message.reply(`😊 **${message.author.username}** gently pats **${target.username}** on the head! *pat pat*`);
  }
};