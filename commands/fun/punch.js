export default {
  name: 'punch',
  aliases: ['hit'],
  description: 'Punch someone (playfully)',
  usage: '!punch @user',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention someone to punch!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('🤕 Ouch! Why would you punch yourself?');
    }
    
    const punchMessages = [
      'throws a playful punch at',
      'gives a gentle punch to',
      'surprise punches',
      'dramatically punches',
      'lightly taps with a punch'
    ];
    
    const randomMessage = punchMessages[Math.floor(Math.random() * punchMessages.length)];
    
    message.reply(`👊 **${message.author.username}** ${randomMessage} **${target.username}**! *POW*`);
  }
};