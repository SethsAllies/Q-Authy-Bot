export default {
  name: 'fun3',
  aliases: [],
  description: 'Fun command 3',
  usage: '!fun3',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement fun3 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};