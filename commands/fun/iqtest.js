export default {
  name: 'iqtest',
  aliases: ['iq', 'intelligence'],
  description: 'Test your IQ (fun simulation)',
  usage: '!iqtest [@user]',
  cooldown: 5,
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    // Generate random IQ between 70-200
    const iq = Math.floor(Math.random() * 131) + 70;
    
    let category = '';
    let emoji = '';
    
    if (iq >= 160) {
      category = 'Genius';
      emoji = '🧠';
    } else if (iq >= 140) {
      category = 'Very Superior';
      emoji = '🎓';
    } else if (iq >= 120) {
      category = 'Superior';
      emoji = '📚';
    } else if (iq >= 110) {
      category = 'High Average';
      emoji = '🤓';
    } else if (iq >= 90) {
      category = 'Average';
      emoji = '😊';
    } else if (iq >= 80) {
      category = 'Low Average';
      emoji = '😐';
    } else {
      category = 'Below Average';
      emoji = '🤔';
    }
    
    const embed = {
      color: 0xe74c3c,
      title: '🧠 IQ Test Results',
      description: `${emoji} **${target.username}**'s IQ is **${iq}**`,
      fields: [
        { name: '📊 Category', value: category, inline: true },
        { name: '🎯 Percentile', value: `${Math.floor(Math.random() * 40) + 30}%`, inline: true }
      ],
      footer: { text: 'Results are for entertainment purposes only!' }
    };
    
    message.reply({ embeds: [embed] });
  }
};