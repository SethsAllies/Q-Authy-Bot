export default {
  name: 'game10',
  aliases: [],
  description: 'Game command 10',
  usage: '!game10',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game10 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};