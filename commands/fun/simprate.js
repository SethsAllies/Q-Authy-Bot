export default {
  name: 'simprate',
  aliases: ['simp'],
  description: 'Rate how much of a simp someone is',
  usage: '!simprate [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    const rate = Math.floor(Math.random() * 101);
    
    let description = '';
    if (rate >= 90) description = 'Ultimate simp! 💸💸💸';
    else if (rate >= 70) description = 'Major simp! 💸💸';
    else if (rate >= 50) description = 'Moderate simp 💸';
    else if (rate >= 30) description = 'Minor simp tendencies 💰';
    else description = 'Not a simp! 😎';
    
    const embed = {
      color: 0xff69b4,
      title: '💸 Simp Rate Meter',
      description: `**${target.username}** is **${rate}%** simp!`,
      fields: [
        { name: '📊 Rating', value: description, inline: false }
      ]
    };
    
    message.reply({ embeds: [embed] });
  }
};