export default {
  name: 'meme',
  aliases: [],
  description: 'Get a random meme',
  usage: '!meme',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement meme fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};