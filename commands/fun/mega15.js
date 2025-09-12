export default {
  name: 'mega15',
  aliases: [],
  description: 'Mega command 15',
  usage: '!mega15',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement mega15 fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};