export default {
  name: 'mega14',
  aliases: [],
  description: 'Mega command 14',
  usage: '!mega14',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement mega14 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};