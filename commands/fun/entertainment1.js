export default {
  name: 'entertainment1',
  aliases: [],
  description: 'Entertainment command 1',
  usage: '!entertainment1',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement entertainment1 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};