export default {
  name: 'game22',
  aliases: [],
  description: 'Game command 22',
  usage: '!game22',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement game22 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};