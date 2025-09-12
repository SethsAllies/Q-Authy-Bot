export default {
  name: 'game5',
  aliases: [],
  description: 'Game command 5',
  usage: '!game5',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game5 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};