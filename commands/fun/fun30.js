export default {
  name: 'fun30',
  aliases: [],
  description: 'Fun command 30',
  usage: '!fun30',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement fun30 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};