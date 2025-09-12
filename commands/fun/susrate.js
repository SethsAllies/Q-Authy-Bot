export default {
  name: 'susrate',
  aliases: ['sus', 'suspicious'],
  description: 'Rate how sus someone is',
  usage: '!susrate [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    const rate = Math.floor(Math.random() * 101);
    
    let description = '';
    let emoji = '';
    
    if (rate >= 90) {
      description = 'EXTREMELY SUS! 🚨 EMERGENCY MEETING! 🚨';
      emoji = '🔴';
    } else if (rate >= 70) {
      description = 'Very sus... I saw them vent! 👀';
      emoji = '🟠';
    } else if (rate >= 50) {
      description = 'Kinda sus ngl 🤨';
      emoji = '🟡';
    } else if (rate >= 30) {
      description = 'Slightly sus but probably safe 😐';
      emoji = '🟢';
    } else {
      description = 'Not sus at all! Totally innocent 😇';
      emoji = '🟢';
    }
    
    const embed = {
      color: rate >= 70 ? 0xff0000 : rate >= 50 ? 0xff8c00 : 0x00ff00,
      title: '📮 Sus Meter',
      description: `${emoji} **${target.username}** is **${rate}%** sus!`,
      fields: [
        { name: '🕵️ Investigation Result', value: description, inline: false }
      ],
      footer: { text: 'Based on totally scientific sus analysis 📊' }
    };
    
    message.reply({ embeds: [embed] });
  }
};