export default {
  name: 'kiss',
  aliases: ['smooch'],
  description: 'Kiss someone',
  usage: '!kiss @user',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention someone to kiss!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('😘 *blows a kiss to yourself* Self-love!');
    }
    
    message.reply(`😘 **${message.author.username}** gives **${target.username}** a sweet kiss! 💕`);
  }
};