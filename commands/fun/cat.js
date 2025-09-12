export default {
  name: 'cat',
  aliases: ['kitty', 'meow'],
  description: 'Get a random cat image',
  usage: '!cat',
  cooldown: 3,
  async execute(message, args, client) {
    const catImages = [
      'https://cataas.com/cat',
      'https://placekitten.com/400/300',
      'https://placekitten.com/350/250',
      'https://placekitten.com/450/350'
    ];
    
    const randomCat = catImages[Math.floor(Math.random() * catImages.length)];
    
    const embed = {
      color: 0xff6b81,
      title: '🐱 Random Cat',
      image: { url: randomCat },
      footer: { text: 'Meow! 🐾' }
    };
    
    message.reply({ embeds: [embed] });
  }
};