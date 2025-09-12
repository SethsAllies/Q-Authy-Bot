export default {
  name: 'game25',
  aliases: [],
  description: 'Game command 25',
  usage: '!game25',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game25 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};