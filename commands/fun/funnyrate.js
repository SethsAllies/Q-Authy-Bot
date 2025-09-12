export default {
  name: 'funnyrate',
  aliases: [],
  description: 'Rate how funny someone is',
  usage: '!funnyrate [@user]',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const rating = Math.floor(Math.random() * 101);
    
    let ratingText = '';
    if (rating < 20) ratingText = 'Very Low';
    else if (rating < 40) ratingText = 'Low';
    else if (rating < 60) ratingText = 'Medium';
    else if (rating < 80) ratingText = 'High';
    else ratingText = 'Very High';
    
    message.reply(`😂 **${target.username}**'s funny rating is **${rating}%** (${ratingText})!`);
  }
};