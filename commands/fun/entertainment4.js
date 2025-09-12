export default {
  name: 'entertainment4',
  aliases: [],
  description: 'Entertainment command 4',
  usage: '!entertainment4',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement entertainment4 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};