export default {
  name: 'game2',
  aliases: [],
  description: 'Game command 2',
  usage: '!game2',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game2 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};