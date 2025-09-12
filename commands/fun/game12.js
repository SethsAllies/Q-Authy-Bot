export default {
  name: 'game12',
  aliases: [],
  description: 'Game command 12',
  usage: '!game12',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game12 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};