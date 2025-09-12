export default {
  name: 'music1',
  aliases: [],
  description: 'Music-related fun command 1',
  usage: '!music1',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement music1 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};