export default {
  name: 'kindrate',
  aliases: [],
  description: 'Rate how kind someone is',
  usage: '!kindrate [@user]',
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
    
    message.reply(`😇 **${target.username}**'s kind rating is **${rating}%** (${ratingText})!`);
  }
};