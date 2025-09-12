export default {
  name: 'hotrate',
  aliases: ['hot', 'hotness'],
  description: 'Rate how hot someone is',
  usage: '!hotrate [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    const rate = Math.floor(Math.random() * 101);
    
    let description = '';
    let emoji = '';
    
    if (rate >= 90) {
      description = 'Absolutely smoking hot! 🔥🔥🔥';
      emoji = '🔥';
    } else if (rate >= 70) {
      description = 'Very hot! 🔥🔥';
      emoji = '🔥';
    } else if (rate >= 50) {
      description = 'Pretty attractive! 😍';
      emoji = '😍';
    } else if (rate >= 30) {
      description = 'Decent looking 😊';
      emoji = '😊';
    } else {
      description = 'Beauty is in the eye of the beholder 👀';
      emoji = '👀';
    }
    
    const embed = {
      color: 0xff4757,
      title: '🔥 Hotness Meter',
      description: `${emoji} **${target.username}** is **${rate}%** hot!`,
      fields: [
        { name: '🌡️ Rating', value: description, inline: false }
      ]
    };
    
    message.reply({ embeds: [embed] });
  }
};