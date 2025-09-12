export default {
  name: 'dog',
  aliases: ['doggo', 'woof', 'puppy'],
  description: 'Get a random dog image',
  usage: '!dog',
  cooldown: 3,
  async execute(message, args, client) {
    const dogImages = [
      'https://place-puppy.com/400x300',
      'https://place-puppy.com/350x250',
      'https://place-puppy.com/450x350',
      'https://place-puppy.com/500x400'
    ];
    
    const randomDog = dogImages[Math.floor(Math.random() * dogImages.length)];
    
    const embed = {
      color: 0xffa726,
      title: '🐶 Random Dog',
      image: { url: randomDog },
      footer: { text: 'Woof! 🐾' }
    };
    
    message.reply({ embeds: [embed] });
  }
};