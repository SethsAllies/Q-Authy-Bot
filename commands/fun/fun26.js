export default {
  name: 'fun26',
  aliases: [],
  description: 'Fun command 26',
  usage: '!fun26',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement fun26 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};