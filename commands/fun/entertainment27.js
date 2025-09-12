export default {
  name: 'entertainment27',
  aliases: [],
  description: 'Entertainment command 27',
  usage: '!entertainment27',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement entertainment27 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};