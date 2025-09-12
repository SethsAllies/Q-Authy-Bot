export default {
  name: 'ship',
  aliases: ['love', 'match'],
  description: 'Ship two users together',
  usage: '!ship @user1 @user2',
  cooldown: 3,
  async execute(message, args, client) {
    const users = message.mentions.users;
    
    if (users.size < 2) {
      return message.reply('❌ Please mention two users to ship!');
    }
    
    const user1 = users.first();
    const user2 = users.last();
    
    if (user1.id === user2.id) {
      return message.reply('❌ Cannot ship someone with themselves!');
    }
    
    // Generate "compatibility" percentage
    const compatibility = Math.floor(Math.random() * 101);
    
    let hearts = '';
    if (compatibility >= 90) hearts = '💕💕💕💕💕';
    else if (compatibility >= 70) hearts = '💕💕💕💕';
    else if (compatibility >= 50) hearts = '💕💕💕';
    else if (compatibility >= 30) hearts = '💕💕';
    else hearts = '💕';
    
    let description = '';
    if (compatibility >= 90) description = 'Perfect match! 💍';
    else if (compatibility >= 70) description = 'Great compatibility! 💖';
    else if (compatibility >= 50) description = 'Good potential! 💗';
    else if (compatibility >= 30) description = 'Could work... 💛';
    else description = 'Not looking good... 💔';
    
    const embed = {
      color: 0xff69b4,
      title: '💝 Love Calculator',
      description: `**${user1.username}** 💕 **${user2.username}**`,
      fields: [
        { name: '💖 Compatibility', value: `${compatibility}%`, inline: true },
        { name: '💕 Rating', value: hearts, inline: true },
        { name: '📝 Result', value: description, inline: false }
      ]
    };
    
    message.reply({ embeds: [embed] });
  }
};