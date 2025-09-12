export default {
  name: 'slap',
  aliases: ['smack'],
  description: 'Slap someone (playfully)',
  usage: '!slap @user',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention someone to slap!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('🤦 Why would you slap yourself?!');
    }
    
    const slapMessages = [
      'gives a gentle slap to',
      'playfully slaps',
      'dramatically slaps',
      'surprise slaps',
      'boops with a tiny slap'
    ];
    
    const randomMessage = slapMessages[Math.floor(Math.random() * slapMessages.length)];
    
    message.reply(`👋 **${message.author.username}** ${randomMessage} **${target.username}**! *SLAP*`);
  }
};