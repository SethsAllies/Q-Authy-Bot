export default {
  name: 'game21',
  aliases: [],
  description: 'Game command 21',
  usage: '!game21',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game21 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};