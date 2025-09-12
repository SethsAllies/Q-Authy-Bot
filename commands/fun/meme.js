export default {
  name: 'meme',
  aliases: ['memes', 'funnymeme'],
  description: 'Get a random meme',
  usage: '!meme',
  cooldown: 5,
  async execute(message, args, client) {
    const memes = [
      'https://i.imgur.com/dVDJiez.jpg',
      'https://i.imgur.com/t7aAkzB.jpg',
      'https://i.imgur.com/wqsJ8Tf.jpg',
      'https://i.imgur.com/fJRm4Vk.jpg',
      'https://i.imgur.com/7UZgr7n.jpg',
      'https://i.imgur.com/Kuo7AO3.jpg',
      'https://i.imgur.com/N6WcqXW.jpg',
      'https://i.imgur.com/8WGgzCQ.jpg',
      'https://i.imgur.com/RHsb8M9.jpg',
      'https://i.imgur.com/P5JbKxU.jpg'
    ];
    
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    
    const embed = {
      color: 0xff6b6b,
      title: '😂 Random Meme',
      image: { url: randomMeme },
      footer: { text: 'Powered by Mega Discord Bot' }
    };
    
    message.reply({ embeds: [embed] });
  }
};