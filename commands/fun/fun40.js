export default {
  name: 'fun40',
  aliases: [],
  description: 'Fun command 40',
  usage: '!fun40',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement fun40 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};