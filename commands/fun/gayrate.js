export default {
  name: 'gayrate',
  aliases: ['gay'],
  description: 'Rate how gay someone is (for fun)',
  usage: '!gayrate [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    const rate = Math.floor(Math.random() * 101);
    
    let description = '';
    if (rate >= 90) description = '🌈🌈🌈 Super gay! 🌈🌈🌈';
    else if (rate >= 70) description = '🌈🌈 Very gay! 🌈🌈';
    else if (rate >= 50) description = '🌈 Pretty gay! 🌈';
    else if (rate >= 30) description = '🏳️ A little gay 🏳️';
    else description = '👫 Straight as an arrow! 👫';
    
    const embed = {
      color: 0xff6b81,
      title: '🌈 Gay Rate Meter',
      description: `**${target.username}** is **${rate}%** gay!`,
      fields: [
        { name: '📊 Rating', value: description, inline: false }
      ],
      footer: { text: 'This is just for fun! Love is love! 💕' }
    };
    
    message.reply({ embeds: [embed] });
  }
};