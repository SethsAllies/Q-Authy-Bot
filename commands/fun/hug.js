export default {
  name: 'hug',
  aliases: ['hugs'],
  description: 'Hug someone',
  usage: '!hug @user',
  cooldown: 3,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention someone to hug!');
    }
    
    if (target.id === message.author.id) {
      return message.reply('🤗 *hugs yourself* You need some self-love!');
    }
    
    const hugGifs = [
      'https://tenor.com/view/hug-anime-gif-9200932',
      'https://tenor.com/view/anime-hug-gif-12687187',
      'https://tenor.com/view/hug-love-gif-8158818'
    ];
    
    const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];
    
    message.reply(`🤗 **${message.author.username}** hugs **${target.username}**!`);
  }
};